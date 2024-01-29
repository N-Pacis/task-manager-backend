import supertest from 'supertest';
import app from '../../src/app';
import UserModel from '../../src/models/user.model';
import { closeConnection, connectDB } from '../../src/utils/database';
import TaskModel from '../../src/models/task.model';

const request = supertest(app);

describe('Task module test', () => {
  let auth_token;
  beforeAll(async () => {
    await connectDB();

    let userToCreate = {
      username: 'test_login',
      password: 'test123',
    };
    await request.post('/users/register').send(userToCreate);
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
