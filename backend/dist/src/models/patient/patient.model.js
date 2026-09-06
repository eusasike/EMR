"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientQueryZodSchema = exports.RegisterPatientZodSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// ==========================================
// 3. HARDENED ZOD VALIDATION SCHEMAS
// ==========================================
// International E.164 phone number format validation
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
exports.RegisterPatientZodSchema = zod_1.z.object({
    facilityId: zod_1.z.string().uuid("Invalid Facility ID format").optional(), // Validated if provided in request body
    firstName: zod_1.z
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name cannot exceed 50 characters"),
    lastName: zod_1.z
        .string()
        .trim()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name cannot exceed 50 characters"),
    middleName: zod_1.z.string().trim().max(50).optional(),
    gender: zod_1.z.nativeEnum(client_1.Gender, { message: "Invalid gender value" }),
    dateOfBirth: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format. Expected ISO date string",
    })
        .refine((val) => new Date(val) <= new Date(), {
        message: "Date of birth cannot be in the future",
    })
        .refine((val) => {
        const ageInYears = (Date.now() - new Date(val).getTime()) /
            (1000 * 60 * 60 * 24 * 365.25);
        return ageInYears <= 125;
    }, { message: "Date of birth exceeds maximum valid age (125 years)" }),
    phone: zod_1.z
        .string()
        .trim()
        .regex(phoneRegex, "Invalid phone number format (use E.164 standard, e.g., +255700000000)")
        .optional(),
    emergencyContactName: zod_1.z.string().trim().max(100).optional(),
    emergencyContactPhone: zod_1.z
        .string()
        .trim()
        .regex(phoneRegex, "Invalid emergency contact phone number format")
        .optional(),
    address: zod_1.z.string().trim().max(100).optional(),
    regionId: zod_1.z.string().uuid("Invalid Region ID").optional(),
    districtId: zod_1.z.string().uuid("Invalid District ID").optional(),
});
exports.PatientQueryZodSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .max(100, "Maximum page limit is 100")
        .default(20),
    search: zod_1.z.string().trim().optional(),
    gender: zod_1.z.nativeEnum(client_1.Gender).optional(),
    sortBy: zod_1.z.enum(["createdAt", "lastName", "mrn"]).default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
//update patient zod
// export const UpdatePatientZodSchema = z.object({
//   firstName: z
//     .string()
//     .trim()
//     .min(2, "First name must be at least 2 characters")
//     .max(50, "First name cannot exceed 50 characters"),
//   lastName: z
//     .string()
//     .trim()
//     .min(2, "Last name must be at least 2 characters")
//     .max(50, "Last name cannot exceed 50 characters"),
//   middleName: z.string().trim().max(50).optional(),
//   gender: z.nativeEnum(Gender, { message: "Invalid gender value" }),
//   dateOfBirth: z
//     .string()
//     .refine((val) => !isNaN(Date.parse(val)), {
//       message: "Invalid date format. Expected ISO date string",
//     })
//     .refine((val) => new Date(val) <= new Date(), {
//       message: "Date of birth cannot be in the future",
//     })
//     .refine(
//       (val) => {
//         const ageInYears =
//           (Date.now() - new Date(val).getTime()) /
//           (1000 * 60 * 60 * 24 * 365.25);
//         return ageInYears <= 125;
//       },
//       { message: "Date of birth exceeds maximum valid age (125 years)" },
//     ),
//   phone: z
//     .string()
//     .trim()
//     .regex(
//       phoneRegex,
//       "Invalid phone number format (use E.164 standard, e.g., +255700000000)",
//     )
//     .optional(),
//   emergencyContactName: z.string().trim().max(100).optional(),
//   emergencyContactPhone: z
//     .string()
//     .trim()
//     .regex(phoneRegex, "Invalid emergency contact phone number format")
//     .optional(),
//   address: z.string().trim().max(100).optional(),
//   regionId: z.string().uuid("Invalid Region ID").optional(),
//   districtId: z.string().uuid("Invalid District ID").optional(),
// });
