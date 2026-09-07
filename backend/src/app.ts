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
import path from "path";
import fs from "fs";

export const app: Express = express();

// ============================================================================
// CORS Configuration
// ============================================================================

// 1. Explicitly declare permitted origin targets
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4000",
  "https://emr-psi-two.vercel.app",
];

// 2. Standard CORS Layer Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-facility-id",
      "x-facility-code",
    ],
  }),
);

// 3. Robust Global Preflight OPTIONS Handler (Replaces app.options regex)
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-facility-id, x-facility-code",
    );
  }

  // Instantly return 200 OK for browser preflight checks without passing to routes
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

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
  // const swaggerDocument = require("./generated/swagger.json");
  let swaggerDocument;
  const localSpecPath = path.join(__dirname, "generated", "swagger.json");
  const fallbackSpecPath = path.join(
    __dirname,
    "..",
    "src",
    "generated",
    "swagger.json",
  );

  if (fs.existsSync(localSpecPath)) {
    swaggerDocument = JSON.parse(fs.readFileSync(localSpecPath, "utf8"));
  } else {
    swaggerDocument = JSON.parse(fs.readFileSync(fallbackSpecPath, "utf8"));
  }
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
