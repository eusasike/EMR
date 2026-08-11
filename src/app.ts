import express, { Express, Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import { ValidateError } from "tsoa";
import { RegisterRoutes } from "./generated/routes";

export const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Swagger UI documentation from generated OpenAPI spec
try {
  const swaggerDocument = require("./generated/swagger.json");
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn(
    "Swagger spec not loaded. Run `npx tsoa spec-and-routes` first.",
  );
}

// Register all tsoa routes auto-generated in src/generated/routes.ts
RegisterRoutes(app);

// Global Error Handler
app.use(
  (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ): Response | void => {
    if (err instanceof ValidateError) {
      return res.status(422).json({
        message: "Validation Failed",
        details: err.fields,
      });
    }

    if (err instanceof Error) {
      return res.status(500).json({
        message: err.message || "Internal Server Error",
      });
    }

    next();
  },
);
