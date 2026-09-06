"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutZodSchema = exports.RefreshTokenZodSchema = exports.LoginZodSchema = void 0;
const zod_1 = require("zod");
// Zod Schema for runtime validation
exports.LoginZodSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
// Zod Runtime Validation
exports.RefreshTokenZodSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "Refresh token is required"),
});
// Zod Runtime Validation
exports.LogoutZodSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "Refresh token is required"),
});
