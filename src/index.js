import app from "./app.js"
import { config } from "dotenv";
config({
  path: "./.env",
});
import { connectDB } from "./utils/database.js";


app.listen(process.env.PORT, async () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
  await connectDB();
});
