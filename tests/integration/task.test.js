import supertest from 'supertest';
import app from '../../src/app';
import UserModel from '../../src/models/user.model';
import { closeConnection, connectDB } from '../../src/utils/database';
import TaskModel from '../../src/models/task.model';

const request = supertest(app);

describe('Task module test', () => {
  let auth_token;
  let user_id;
  beforeAll(async () => {
    await connectDB();

    let userToCreate = {
      username: 'test_login',
      password: 'test123',
    };
    const userCreationResponse = await request.post('/users/register').send(userToCreate);
    user_id = userCreationResponse.body.data.id;
    console.log("USER ID",user_id);

    const response = await request.post('/users/login').send(userToCreate);
    auth_token = response.body.data.access_token;
  });

  describe('Task creation feature test', () => {
    test('Should return 201 creation success response code when all data is valid', async () => {
      const taskToCreate = {
        name: 'Task 1',
        description: 'Description for Task 1',
      };

      const response = await request
        .post('/tasks/create')
        .send(taskToCreate)
        .set('auth-token', `Bearer ${auth_token}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', taskToCreate.name);
      expect(response.body.data).toHaveProperty(
        'description',
        taskToCreate.description
      );
      expect(response.body.data).toHaveProperty('status', 'PENDING');
      expect(response.body.data.created_by).toBe(user_id);
    });

    test('Should return 400 error response code when creating a task with invalid data', async () => {
      const invalidTask = {
        description: 'Invalid Task without name',
      };

      const response = await request
        .post('/tasks/create')
        .send(invalidTask)
        .set('auth-token', `Bearer ${auth_token}`);

      expect(response.status).toBe(400);
    });

    test('Should return 404 not found response code when trying to create a subtask for a non-existing parent task', async () => {
      const subTaskToCreate = {
        name: 'Subtask 1',
        description: 'Description for Subtask 1',
        parent_task_id: 999,
      };

      const response = await request
        .post('/tasks')
        .send(subTaskToCreate)
        .set('auth-token', `Bearer ${auth_token}`);

      expect(response.status).toBe(404);
    });
  });

  describe("Task retrieval feature test", () => {
    test("Should return 200 success response code and task data by ID", async () => {
      const taskToRetrieve = {
        name: "Task to retrieve",
        description: "Description for the task to retrieve",
      };

      const createdTaskResponse = await request
      .post("/tasks/create")
      .send(taskToRetrieve)
      .set('auth-token', `Bearer ${auth_token}`);

      const taskId = createdTaskResponse.body.data.id;

      const response = await request
      .get(`/tasks/by-id/${taskId}`)
      .set('auth-token', `Bearer ${auth_token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id", taskId);
    });

    test("Should return 404 not found response code when trying to retrieve a non-existing task by ID", async () => {
      const nonExistingTaskId = 999;

      const response = await request
      .get(`/tasks/by-id/${nonExistingTaskId}`)
      .set('auth-token', `Bearer ${auth_token}`);

      expect(response.status).toBe(404);
    });

    test("Should return 200 success response code and list of tasks with their subtasks", async () => {
      const taskWithSubtasks = {
        name: "Task with Subtasks",
        description: "Description for Task with Subtasks",
      };

      const createdTaskResponse = await request
      .post("/tasks/create")
      .send(taskWithSubtasks)
      .set('auth-token', `Bearer ${auth_token}`);
      const taskId = createdTaskResponse.body.data.id;

      const subTask = {
        name: "SubTask",
        description: "SubTask Description",
        parent_task_id: taskId
      }

      await request
      .post(`/tasks/create`)
      .send(subTask)
      .set('auth-token', `Bearer ${auth_token}`);

      const response = await request
      .get(`/tasks`)
      .set('auth-token', `Bearer ${auth_token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);

      const retrievedTask = response.body.data.find((task) => task.id === taskId);
      expect(retrievedTask).toBeDefined();
      expect(retrievedTask).toHaveProperty("sub_tasks");
      expect(retrievedTask.sub_tasks).toBeInstanceOf(Array);
      expect(retrievedTask.sub_tasks.length).toBe(1);
    });

    test("Should return 401 unauthorized response code when trying to retrieve tasks without authentication token", async () => {
      const response = await request
      .get("/tasks");

      expect(response.status).toBe(401);
    });
  });

  describe('Task status update feature test', () => {
    test('Should update task status to COMPLETED', async () => {
      const taskToCreate = {
        name: 'Task to update status',
        description: 'Description for Task to update status',
      };

      const createdTaskResponse = await request
        .post('/tasks/create')
        .send(taskToCreate)
        .set('auth-token', `Bearer ${auth_token}`);

      const taskId = createdTaskResponse.body.data.id;

      const response = await request
        .put(`/tasks/change-status/${taskId}/COMPLETED`)
        .set('auth-token', `Bearer ${auth_token}`);

      expect(response.status).toBe(200);

      const updatedTaskResponse = await request
        .get(`/tasks/by-id/${taskId}`)
        .set('auth-token', `Bearer ${auth_token}`);

      expect(updatedTaskResponse.status).toBe(200);
      expect(updatedTaskResponse.body.data).toHaveProperty('status', 'COMPLETED');
    });

    test('Should return 400 error response code when updating task status with invalid status', async () => {
      const taskToCreate = {
        name: 'Task to update status',
        description: 'Description for Task to update status',
      };

      const createdTaskResponse = await request
        .post('/tasks/create')
        .send(taskToCreate)
        .set('auth-token', `Bearer ${auth_token}`);

      const taskId = createdTaskResponse.body.data.id;

      const response = await request
        .put(`/tasks/change-status/${taskId}/INVALID_STATUS`)
        .set('auth-token', `Bearer ${auth_token}`);

      expect(response.status).toBe(400);
    });

    test('Should update task status and propagate changes to parent task', async () => {
      const parentTaskToCreate = {
        name: 'Parent Task',
        description: 'Description for Parent Task',
      };

      const parentTaskResponse = await request
        .post('/tasks/create')
        .send(parentTaskToCreate)
        .set('auth-token', `Bearer ${auth_token}`);

      const parentTaskId = parentTaskResponse.body.data.id;

      const childTaskToCreate = {
        name: 'Child Task',
        description: 'Description for Child Task',
        parent_task_id: parentTaskId,
      };

      const childTaskResponse = await request
        .post('/tasks/create')
        .send(childTaskToCreate)
        .set('auth-token', `Bearer ${auth_token}`);

      const childTaskId = childTaskResponse.body.data.id;

      const markChildTaskResponse = await request
        .put(`/tasks/change-status/${childTaskId}/COMPLETED`)
        .set('auth-token', `Bearer ${auth_token}`);

      expect(markChildTaskResponse.status).toBe(200);

      const updatedParentTaskResponse = await request
        .get(`/tasks/by-id/${parentTaskId}`)
        .set('auth-token', `Bearer ${auth_token}`);

      expect(updatedParentTaskResponse.status).toBe(200);
      expect(updatedParentTaskResponse.body.data).toHaveProperty('status', 'COMPLETED');
    });

    test('Should update task status and propagate changes to child tasks', async () => {
      const parentTaskToCreate = {
        name: 'Parent Task',
        description: 'Description for Parent Task',
      };

      const parentTaskResponse = await request
        .post('/tasks/create')
        .send(parentTaskToCreate)
        .set('auth-token', `Bearer ${auth_token}`);

      const parentTaskId = parentTaskResponse.body.data.id;

      const childTaskToCreate = {
        name: 'Child Task',
        description: 'Description for Child Task',
        parent_task_id: parentTaskId,
      };

      const childTaskResponse = await request
        .post('/tasks/create')
        .send(childTaskToCreate)
        .set('auth-token', `Bearer ${auth_token}`);

      const childTaskId = childTaskResponse.body.data.id;

      const markParentTaskResponse = await request
        .put(`/tasks/change-status/${parentTaskId}/COMPLETED`)
        .set('auth-token', `Bearer ${auth_token}`);

      expect(markParentTaskResponse.status).toBe(200);

      const updatedParentTaskResponse = await request
        .get(`/tasks/by-id/${childTaskId}`)
        .set('auth-token', `Bearer ${auth_token}`);

      expect(updatedParentTaskResponse.status).toBe(200);
      expect(updatedParentTaskResponse.body.data).toHaveProperty('status', 'COMPLETED');
    });
  });

  describe('Task completion summary feature test', () => {
    test('Should return completion summary for a valid date', async () => {
      await TaskModel.destroy({
        where: {},
        truncate: true,
        cascade: true,
      });
      
      const taskToCreate = {
        name: 'Task for completion summary',
        description: 'Description for completion summary',
      };
  
      const createdTaskResponse = await request
        .post('/tasks/create')
        .send(taskToCreate)
        .set('auth-token', `Bearer ${auth_token}`);
  
      const taskId = createdTaskResponse.body.data.id;
  
      await request
        .put(`/tasks/change-status/${taskId}/COMPLETED`)
        .set('auth-token', `Bearer ${auth_token}`);
  
      const today = new Date().toISOString().split('T')[0];
  
      const response = await request
        .get(`/tasks/completion-summary/by-day/${today}`)
        .set('auth-token', `Bearer ${auth_token}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('date', today);
      expect(response.body.data).toHaveProperty('totalCompletedTasks', 1);
    });
  
    test('Should return error for invalid date format', async () => {
      const invalidDate = '20-01-4020'; 
  
      const response = await request
        .get(`/tasks/completion-summary/by-day/${invalidDate}`)
        .set('auth-token', `Bearer ${auth_token}`);
  
      expect(response.status).toBe(400);
    });

  });

  describe('Task updating feature test', () => {
    test('Should update task details', async () => {
      const taskToCreate = {
        name: 'Task to update',
        description: 'Description for Task to update',
      };
  
      const createdTaskResponse = await request
        .post('/tasks/create')
        .send(taskToCreate)
        .set('auth-token', `Bearer ${auth_token}`);
  
      const taskId = createdTaskResponse.body.data.id;
  
      const updatedTaskDetails = {
        name: 'Updated Task',
        description: 'Updated description for the task',
      };
  
      const updateResponse = await request
        .put(`/tasks/edit/${taskId}`)
        .send(updatedTaskDetails)
        .set('auth-token', `Bearer ${auth_token}`);
  
      expect(updateResponse.status).toBe(200);
    });
  
    test('Should return 404 not found when updating a non-existing task', async () => {
      const nonExistingTaskId = 999;
  
      const updatedTaskDetails = {
        name: 'Updated Task',
        description: 'Updated description for the task',
      };
  
      const updateResponse = await request
        .put(`/tasks/edit/${nonExistingTaskId}`)
        .send(updatedTaskDetails)
        .set('auth-token', `Bearer ${auth_token}`);
  
      expect(updateResponse.status).toBe(404);
    });
  });
  
  describe('Task deletion feature test', () => {
    test('Should delete a task and its children', async () => {
      const taskToCreate = {
        name: 'Task for deletion',
        description: 'Description for deletion',
      };
  
      const createdTaskResponse = await request
        .post('/tasks/create')
        .send(taskToCreate)
        .set('auth-token', `Bearer ${auth_token}`);
  
      const parentTaskId = createdTaskResponse.body.data.id;
  
      const childTaskToCreate = {
        name: 'Child Task',
        description: 'Description for Child Task',
        parent_task_id: parentTaskId,
      };

      await request
        .post('/tasks/create')
        .send(childTaskToCreate)
        .set('auth-token', `Bearer ${auth_token}`);
      
      const response = await request
        .delete(`/tasks/delete/${parentTaskId}`)
        .set('auth-token', `Bearer ${auth_token}`);
        
      expect(response.status).toBe(200);
    });
  
    test('Should return error for invalid date format', async () => {
      const invalidDate = '20-01-4020'; 
  
      const response = await request
        .get(`/tasks/completion-summary/by-day/${invalidDate}`)
        .set('auth-token', `Bearer ${auth_token}`);
  
      expect(response.status).toBe(400);
    });

  });
  
  afterAll(async () => {
    await UserModel.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
    await TaskModel.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
    await closeConnection();
  });
});
