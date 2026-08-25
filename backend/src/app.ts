import express, { Express, Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import pinoHttp from "pino-http";
import promBundle from "express-prom-bundle";
import { ZodError } from "zod";
import { logger } from "./config/logger";
import { httpRequestsTotal } from "./config/metrics";
import { RegisterRoutes } from "./generated/routes";
import { initializePatientWorkers } from "./message/worker/patient.worker";
import cors from "cors";
import cookieParser from "cookie-parser";
export const app: Express = express();

//CRSF Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4000"],
    credentials: true,
    allowedHeaders: "*", // Accepts custom headers (X-Facility-Code, etc.)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  }),
);

app.options(/(.*)/, cors());
app.use(cookieParser());

// Body Parser Middleware
app.use(express.json());

// Pino HTTP Request Logging
app.use(pinoHttp({ logger }));

async function rabbitmq() {
  try {
    // Start RabbitMQ Consumers & Setup Topology
    await initializePatientWorkers();
  } catch (error) {
    console.error("❌ Bootstrap error:", error);
  }
}

rabbitmq();

// Prometheus Metrics Middleware
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  promClient: {
    collectDefaultMetrics: {},
  },
});
app.use(metricsMiddleware as unknown as express.RequestHandler);

// Custom Metric Counter for finished HTTP requests
app.use((req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode.toString(),
    });
  });
  next();
});

// Swagger Documentation
try {
  const swaggerDocument = require("./generated/swagger.json");
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch {
  logger.warn('Swagger spec not found. Run "npm run tsoa:gen" to generate.');
}

// Register TSOA Generated Routes
RegisterRoutes(app);

// Global Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  // 1. Zod Validation Error Handler
  if (err instanceof ZodError) {
    logger.warn({ path: req.path, errors: err.issues }, "Zod Validation Error");
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // 2. TSOA Request Validation Error Handler
  if (err?.status === 400 && err?.fields) {
    logger.warn(
      { path: req.path, fields: err.fields },
      "TSOA Request Validation Error",
    );
    return res.status(400).json({
      message: "Invalid request payload",
      errors: err.fields,
    });
  }

  // 3. Application Custom Errors (AppError) or standard HTTP status errors
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(
    { err, path: req.path, method: req.method },
    "Unhandled Request Error",
  );

  return res.status(status).json({
    success: false,
    message,
  });
});
