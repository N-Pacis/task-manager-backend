import {
  connectDB,
  closeConnection,
  sequelize,
} from "../../../src/utils/database";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeConnection();
});

describe("Database Utility Functions", () => {
  describe("connect to database", () => {
    test("should connect to the database", async () => {
      expect(sequelize).toBeDefined();

    });
  });
});
