import { z } from "zod";
import { Gender, Patient } from "@prisma/client";
import { ApiResponse, PaginatedResponse } from "../../util/apiResponse";

// ==========================================
// 2. PATIENT DOMAIN DTOs
// ==========================================

export interface RegisterPatientDTO {
  facilityId?: string; // Optional in DTO if derived directly from JWT session in controller
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: Gender;
  dateOfBirth: string; // ISO 8601 String e.g. "1998-04-12"
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  regionId?: string;
  districtId?: string;
}

/**
 * Standard Patient entity projection matching Prisma return types exactly.
 * Prisma returns `null` for optional database fields, not `undefined`.
 */
export interface PatientDTO {
  id: string;
  mrn: string;
  facilityId: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  gender: Gender;
  dateOfBirth: Date;
  phone: string | null;
  address: string | null; // 👈 Fixed from optional string to match Prisma nullability
  regionId: string | null;
  districtId: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientListResponse {
  success: boolean;
  count: number;
  data: Patient[];
  message?: string;
}

/**
 * Query parameters for paginated patient search/filtering.
 */
export interface PatientQueryDTO {
  page?: number;
  limit?: number;
  search?: string; // Query against MRN, names, or phone numbers
  gender?: Gender;
  sortBy?: "createdAt" | "lastName" | "mrn";
  sortOrder?: "asc" | "desc";
}

//update
export interface UpdatePatientDTO {
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: Gender;
  dateOfBirth: string; // ISO 8601 String e.g. "1998-04-12"
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  regionId?: string;
  districtId?: string;
}

// Convenient TSOA Return Types
export type PatientResponseDTO = ApiResponse<PatientDTO>;
export type PaginatedPatientsResponseDTO = PaginatedResponse<PatientDTO>;

// ==========================================
// 3. HARDENED ZOD VALIDATION SCHEMAS
// ==========================================

// International E.164 phone number format validation
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const RegisterPatientZodSchema = z.object({
  facilityId: z.string().uuid("Invalid Facility ID format").optional(), // Validated if provided in request body
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters"),
  middleName: z.string().trim().max(50).optional(),
  gender: z.nativeEnum(Gender, { message: "Invalid gender value" }),
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format. Expected ISO date string",
    })
    .refine((val) => new Date(val) <= new Date(), {
      message: "Date of birth cannot be in the future",
    })
    .refine(
      (val) => {
        const ageInYears =
          (Date.now() - new Date(val).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25);
        return ageInYears <= 125;
      },
      { message: "Date of birth exceeds maximum valid age (125 years)" },
    ),
  phone: z
    .string()
    .trim()
    .regex(
      phoneRegex,
      "Invalid phone number format (use E.164 standard, e.g., +255700000000)",
    )
    .optional(),
  emergencyContactName: z.string().trim().max(100).optional(),
  emergencyContactPhone: z
    .string()
    .trim()
    .regex(phoneRegex, "Invalid emergency contact phone number format")
    .optional(),
  address: z.string().trim().max(100).optional(),
  regionId: z.string().uuid("Invalid Region ID").optional(),
  districtId: z.string().uuid("Invalid District ID").optional(),
});

export const PatientQueryZodSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100, "Maximum page limit is 100")
    .default(20),
  search: z.string().trim().optional(),
  gender: z.nativeEnum(Gender).optional(),
  sortBy: z.enum(["createdAt", "lastName", "mrn"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
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
