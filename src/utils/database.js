import { Sequelize, DataTypes } from "sequelize";
import { db_host, db_name, db_user, db_password, db_port } from "./config.js";

const environment = process.env.NODE_ENV || "DEV";


const sequelize = new Sequelize({
  dialect: "postgresql",
  host: db_host,
  database: db_name,
  username: db_user,
  password: db_password,
  port: db_port,
  logging: environment !== "TEST"
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connection has been established successfully.");

  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}


export async function closeConnection() {
  try {
    await sequelize.close();
    console.log("✅ Sequelize connection closed.");
  } catch (error) {
    console.error("Error closing Sequelize connection:", error);
  }
}

export { sequelize, DataTypes };

export default sequelize;
