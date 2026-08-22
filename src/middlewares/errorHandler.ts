import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ValidateError } from "tsoa";
import { Prisma } from "@prisma/client";
import { AppError } from "../util/custom-error";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isProduction = process.env.NODE_ENV === "production";

  // 1. Custom Application Errors (AppError hierarchy)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { errors: err.details }),
    });
    return;
  }

  // 2. Zod Runtime Schema Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
    return;
  }

  // 3. TSOA Controller Request Validation Errors
  if (err instanceof ValidateError) {
    res.status(400).json({
      success: false,
      message: "Validation failed on request parameters",
      errors: err.fields,
    });
    return;
  }

  // 4. Prisma Known Database Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (e.g., duplicate record)
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[])?.join(", ") || "field";
      res.status(409).json({
        success: false,
        message: `A record with this ${target} already exists.`,
      });
      return;
    }

    // Foreign key constraint failure
    if (err.code === "P2003") {
      res.status(400).json({
        success: false,
        message: "Invalid reference ID provided for related resource.",
      });
      return;
    }

    // Record not found for update/delete
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Requested record was not found in the database.",
      });
      return;
    }
  }

  // 5. Catch-all for Unhandled Exceptions (500)
  console.error("💥 [Unhandled Error]:", err);

  res.status(500).json({
    success: false,
    message: "An internal server error occurred",
    ...(!isProduction && { stack: err.stack, rawError: err.message }),
  });
};
