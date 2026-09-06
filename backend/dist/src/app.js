"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const pino_http_1 = __importDefault(require("pino-http"));
const express_prom_bundle_1 = __importDefault(require("express-prom-bundle"));
const zod_1 = require("zod");
const logger_1 = require("./config/logger");
const metrics_1 = require("./config/metrics");
const routes_1 = require("./generated/routes");
const patient_worker_1 = require("./message/worker/patient.worker");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
exports.app = (0, express_1.default)();
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
//CRSF Middleware
exports.app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:4000"],
    credentials: true,
    allowedHeaders: "*", // Accepts custom headers (X-Facility-Code, etc.)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
}));
exports.app.options(/(.*)/, (0, cors_1.default)());
exports.app.use((0, cookie_parser_1.default)());
// Body Parser Middleware
exports.app.use(express_1.default.json());
// Pino HTTP Request Logging
exports.app.use((0, pino_http_1.default)({ logger: logger_1.logger }));
async function rabbitmq() {
    try {
        // Start RabbitMQ Consumers & Setup Topology
        await (0, patient_worker_1.initializePatientWorkers)();
    }
    catch (error) {
        console.error("❌ Bootstrap error:", error);
    }
}
rabbitmq();
// Prometheus Metrics Middleware
const metricsMiddleware = (0, express_prom_bundle_1.default)({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    promClient: {
        collectDefaultMetrics: {},
    },
});
exports.app.use(metricsMiddleware);
// Custom Metric Counter for finished HTTP requests
exports.app.use((req, res, next) => {
    res.on("finish", () => {
        metrics_1.httpRequestsTotal.inc({
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
    const localSpecPath = path_1.default.join(__dirname, "generated", "swagger.json");
    const fallbackSpecPath = path_1.default.join(__dirname, "..", "src", "generated", "swagger.json");
    if (fs_1.default.existsSync(localSpecPath)) {
        swaggerDocument = JSON.parse(fs_1.default.readFileSync(localSpecPath, "utf8"));
    }
    else {
        swaggerDocument = JSON.parse(fs_1.default.readFileSync(fallbackSpecPath, "utf8"));
    }
    exports.app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
}
catch {
    logger_1.logger.warn('Swagger spec not found. Run "npm run tsoa:gen" to generate.');
}
// Register TSOA Generated Routes
(0, routes_1.RegisterRoutes)(exports.app);
// Global Error Handler
exports.app.use((err, req, res, _next) => {
    // 1. Zod Validation Error Handler
    if (err instanceof zod_1.ZodError) {
        logger_1.logger.warn({ path: req.path, errors: err.issues }, "Zod Validation Error");
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
        logger_1.logger.warn({ path: req.path, fields: err.fields }, "TSOA Request Validation Error");
        return res.status(400).json({
            message: "Invalid request payload",
            errors: err.fields,
        });
    }
    // 3. Application Custom Errors (AppError) or standard HTTP status errors
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    logger_1.logger.error({ err, path: req.path, method: req.method }, "Unhandled Request Error");
    return res.status(status).json({
        success: false,
        message,
    });
});
