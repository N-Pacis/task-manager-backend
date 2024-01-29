import supertest from "supertest";
import app from "../../src/app";
import UserModel from "../../src/models/user.model";
import { closeConnection, connectDB } from "../../src/utils/database";

const request = supertest(app);

describe("User module test", () => {
  beforeAll(async () => {
    await connectDB();
  });

  describe("User registration feature test", () => {
    test("Should return 201 creation success response code when all data is valid", async () => {
      let usersToCreate = [
        {
          username: "test1",
          password: "test123",
        },
        {
          username: "test2",
          password: "test123",
        },
      ];

      for (const user of usersToCreate) {
        const response = await request.post("/users/register").send(user);
        expect(response.status).toBe(201);
      }
    });

    test("Should return 400 error response code when the username exists", async () => {
      let usersToCreate = [
        {
          username: "test1",
          password: "test123",
        },
        {
          username: "test2",
          password: "test123",
        },
      ];

      for (const user of usersToCreate) {
        const response = await request.post("/users/register").send(user);
        expect(response.status).toBe(400);
      }
    });
  });

  describe("User login feature test", () => {
    test("Should return 200 success response code and access token on successful login", async () => {
      const userToLogin = {
        username: "test1",
        password: "test123",
      };

      const response = await request.post("/users/login").send(userToLogin);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("access_token");
    });

    test("Should return 400 error response code on login with invalid password", async () => {
      const invalidPasswordUser = {
        username: "test1",
        password: "invalid_password",
      };

      const response = await request
        .post("/users/login")
        .send(invalidPasswordUser);

      expect(response.status).toBe(400);
    });
  });

  describe("User profile feature test", () => {
    test("Should return 200 success response code and user profile data", async () => {
      let userToCreate = {
        username: "test_login",
        password: "test123",
      };
      await request.post("/users/register").send(userToCreate);
      const resp = await request.post("/users/login").send(userToCreate);

      let access_token = resp.body.data.access_token;

      const response = await request
        .get("/users/profile")
        .set("auth-token", `Bearer ${access_token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("username", "test_login");
    });

    test("Should return 401 unauthorized response code without authentication token", async () => {
      const response = await request.get("/users/profile");

      expect(response.status).toBe(401);
    });
  });
  afterAll(async () => {
    await UserModel.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
    await closeConnection();
  });
});
