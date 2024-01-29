import {
  createSuccessResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from '../utils/api.response.js';
import TaskModel from '../models/task.model.js';

export const createTask = async (req, res) => {
  try {
    let { name, description, parent_task_id } = req.body;

    if (parent_task_id != null) {
      let findTaskById = await TaskModel.findByPk(parent_task_id);
      if (!findTaskById) return notFoundResponse('id', parent_task_id, 'Task');
    }

    let task = await TaskModel.create({
      name,
      description,
      parent_task_id
    });

    return createSuccessResponse('Task created successfully', task, res);
  } catch (error) {
    return serverErrorResponse(error, res);
  }
};

export const getTaskById = async (req, res) => {
  try {
    let { id } = req.params;

    const task = await TaskModel.findByPk(id, {
      include: [
        {
          model: TaskModel,
          as: 'subTasks'
        },
      ],
    });
    if (!task) return notFoundResponse('id', id, 'Task',res);
    const returnObj = {
      id: task.get('id'),
      name: task.get('name'),
      description: task.get('description'),
      status: task.get('status'),
      sub_tasks: task.get('subTasks')
    };


    return successResponse('Task', returnObj, res);
  } catch (ex) {
    return serverErrorResponse(ex, res);
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.findAll({
      where: {
        parent_task_id: null,
      },
      include: [
        {
          model: TaskModel,
          as: 'subTasks',
          attributes: ['id', 'name', 'description', 'status'],
        },
      ],
    });

    const returnArray = tasks.map((task) => ({
      id: task.id,
      name: task.name,
      description: task.description,
      status: task.status,
      sub_tasks: task.subTasks,
    }));

    return successResponse('Tasks', returnArray, res);
  } catch (ex) {
    return serverErrorResponse(ex, res);
  }
};

export const changeTaskStatus = async (req, res) => {
  let { id, status } = req.params;
  let findTaskById = await TaskModel.findByPk(id);
  if (!findTaskById) return notFoundResponse('id', id, 'Task');

  if (status != 'PENDING' && status != 'COMPLETED')
    return errorResponse(
      `Invalid status: ${status} supplied! You should provide either PENDING or COMPLETED`,
      res
    );

  await TaskModel.update(
    {
      status: status,
    },
    { where: { id: id } }
  );

  return successResponse('Task status updated', null, res);
};
