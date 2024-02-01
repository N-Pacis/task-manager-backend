import express, { json } from "express";
import cors from "cors";
import { corsFunction } from "./utils/cors.js";
import { createRequire } from "module";
import swaggerUi from "swagger-ui-express";
import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js";
import authenticate from "./middlewares/auth.middleware.js";
import * as prometheus from "prom-client";
import http from "http";
import url from "url";

const require = createRequire(import.meta.url);
const swaggerJson = require("../swagger.json");
export const app = express();

const register = new prometheus.Registry();

register.setDefaultLabels({
  app: "task-management-backend",
});

prometheus.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in microseconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

register.registerMetric(httpRequestDurationMicroseconds);

// Runs before each request
app.use((req, res, next) => {
  res.locals.startEpoch = Date.now();
  next();
});

app.get("/metrics", async (req, res) => {
  try {
    console.log("Metrics checking");
    res.set("Content-Type", register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error("Error generating metrics:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.use(cors());
app.use(corsFunction);
app.use(json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJson));
app.use("/users", userRoutes);
app.use("/tasks", authenticate, taskRoutes);

// Runs after each request
app.use((req, res, next) => {
  const responseTimeInMs = Date.now() - res.locals.startEpoch;

  httpRequestDurationMicroseconds
    .labels(req.method, null, res.statusCode.toString())
    .observe(responseTimeInMs);

  next();
});

export default app;
