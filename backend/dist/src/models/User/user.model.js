"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserZodSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const phoneRegex = /^\+?[1-9]\d{8,14}$/;
// Zod Schema used inside the controller for runtime validation
exports.RegisterUserZodSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, "First name must be at least 2 characters"),
    lastName: zod_1.z.string().min(2, "Last name must be at least 2 characters"),
    middleName: zod_1.z.string().optional(),
    email: zod_1.z.string().email("Invalid email address"),
    phone: zod_1.z.string().optional().or(zod_1.z.literal("")),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    role: zod_1.z.nativeEnum(client_1.Role, {
        message: "Invalid staff role specified",
    }),
    facilityId: zod_1.z.string().optional(),
});
