"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRoutes = RegisterRoutes;
const runtime_1 = require("@tsoa/runtime");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const vital_sign_controller_1 = require("./../controllers/vital-sign.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const visit_controller_1 = require("./../controllers/visit.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const register_controller_1 = require("./../controllers/register.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const prescription_controller_1 = require("./../controllers/prescription.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const patient_controller_1 = require("./../controllers/patient.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const medical_service_controller_1 = require("./../controllers/medical-service.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const location_controller_1 = require("./../controllers/location.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const lab_controller_1 = require("./../controllers/lab.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const inventory_controller_1 = require("./../controllers/inventory.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const health_controller_1 = require("./../controllers/health.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const facility_controller_1 = require("./../controllers/facility.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const dashboard_controller_1 = require("./../controllers/dashboard.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const billing_controller_1 = require("./../controllers/billing.controller");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const auth_controller_1 = require("./../controllers/auth.controller");
const authenticate_1 = require("./../middlewares/authenticate");
const expressAuthenticationRecasted = authenticate_1.expressAuthentication;
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const models = {
    "Decimal": {
        "dataType": "refAlias",
        "type": { "dataType": "string", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.TriagePriority": {
        "dataType": "refAlias",
        "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["RED"] }, { "dataType": "enum", "enums": ["YELLOW"] }, { "dataType": "enum", "enums": ["GREEN"] }, { "dataType": "enum", "enums": ["BLACK"] }], "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DefaultSelection_Prisma._36_VitalSignsPayload_": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "updatedAt": { "dataType": "datetime", "required": true }, "createdAt": { "dataType": "datetime", "required": true }, "recordedById": { "dataType": "string", "required": true }, "notes": { "dataType": "string", "required": true }, "priority": { "ref": "_36_Enums.TriagePriority", "required": true }, "bmi": { "ref": "Decimal", "required": true }, "height": { "ref": "Decimal", "required": true }, "weight": { "ref": "Decimal", "required": true }, "spo2": { "dataType": "double", "required": true }, "respiratoryRate": { "dataType": "double", "required": true }, "pulseRate": { "dataType": "double", "required": true }, "diastolicBP": { "dataType": "double", "required": true }, "systolicBP": { "dataType": "double", "required": true }, "temperature": { "ref": "Decimal", "required": true }, "visitId": { "dataType": "string", "required": true }, "id": { "dataType": "string", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VitalSigns": {
        "dataType": "refAlias",
        "type": { "ref": "DefaultSelection_Prisma._36_VitalSignsPayload_", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TriagePriority": {
        "dataType": "refAlias",
        "type": { "ref": "_36_Enums.TriagePriority", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateVitalSignsInput": {
        "dataType": "refObject",
        "properties": {
            "visitId": { "dataType": "string", "required": true },
            "temperature": { "dataType": "double" },
            "systolicBP": { "dataType": "double" },
            "diastolicBP": { "dataType": "double" },
            "pulseRate": { "dataType": "double" },
            "respiratoryRate": { "dataType": "double" },
            "spo2": { "dataType": "double" },
            "weight": { "dataType": "double", "required": true },
            "height": { "dataType": "double" },
            "priority": { "ref": "TriagePriority" },
            "notes": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Omit_CreateVitalSignsInput.visitId__": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "temperature": { "dataType": "double" }, "systolicBP": { "dataType": "double" }, "diastolicBP": { "dataType": "double" }, "pulseRate": { "dataType": "double" }, "respiratoryRate": { "dataType": "double" }, "spo2": { "dataType": "double" }, "weight": { "dataType": "double" }, "height": { "dataType": "double" }, "priority": { "ref": "_36_Enums.TriagePriority" }, "notes": { "dataType": "string" } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateVitalSignsInput": {
        "dataType": "refAlias",
        "type": { "ref": "Partial_Omit_CreateVitalSignsInput.visitId__", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.VisitType": {
        "dataType": "refAlias",
        "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["OPD"] }, { "dataType": "enum", "enums": ["EMERGENCY"] }, { "dataType": "enum", "enums": ["REFERRAL"] }, { "dataType": "enum", "enums": ["FOLLOW_UP"] }, { "dataType": "enum", "enums": ["IPD"] }], "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VisitType": {
        "dataType": "refAlias",
        "type": { "ref": "_36_Enums.VisitType", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.VisitPriority": {
        "dataType": "refAlias",
        "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["NORMAL"] }, { "dataType": "enum", "enums": ["URGENT"] }, { "dataType": "enum", "enums": ["CRITICAL"] }], "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VisitPriority": {
        "dataType": "refAlias",
        "type": { "ref": "_36_Enums.VisitPriority", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.VisitStatus": {
        "dataType": "refAlias",
        "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["NOT_STARTED"] }, { "dataType": "enum", "enums": ["IN_PROGRESS"] }, { "dataType": "enum", "enums": ["COMPLETED"] }, { "dataType": "enum", "enums": ["CANCELLED"] }], "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VisitStatus": {
        "dataType": "refAlias",
        "type": { "ref": "_36_Enums.VisitStatus", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VisitDataPayload": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "patientId": { "dataType": "string", "required": true },
            "attendingId": { "dataType": "string", "required": true },
            "facilityId": { "dataType": "string", "required": true },
            "visitType": { "ref": "VisitType", "required": true },
            "priority": { "ref": "VisitPriority", "required": true },
            "status": { "ref": "VisitStatus", "required": true },
            "symptoms": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "diagnosis": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "icdCode": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "createdAt": { "dataType": "union", "subSchemas": [{ "dataType": "datetime" }, { "dataType": "string" }] },
            "updatedAt": { "dataType": "union", "subSchemas": [{ "dataType": "datetime" }, { "dataType": "string" }] },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_string.string-Array_": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": {}, "additionalProperties": { "dataType": "array", "array": { "dataType": "string" } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VisitResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "success": { "dataType": "boolean", "required": true },
            "message": { "dataType": "string", "required": true },
            "errors": { "ref": "Record_string.string-Array_" },
            "data": { "ref": "VisitDataPayload" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ErrorResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "success": { "dataType": "boolean", "required": true },
            "message": { "dataType": "string", "required": true },
            "errors": { "ref": "Record_string.string-Array_" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateVisitDTO": {
        "dataType": "refObject",
        "properties": {
            "facilityId": { "dataType": "string", "required": true },
            "attendingId": { "dataType": "string", "required": true },
            "patientId": { "dataType": "string", "required": true },
            "symptoms": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "diagnosis": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "icdCode": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "visitType": { "ref": "VisitType" },
            "priority": { "ref": "VisitPriority" },
            "status": { "ref": "VisitStatus" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateVisitDTO": {
        "dataType": "refObject",
        "properties": {
            "diagnosis": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "icdCode": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "symptoms": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "priority": { "ref": "VisitPriority" },
            "status": { "ref": "VisitStatus" },
            "attendingId": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.Role": {
        "dataType": "refAlias",
        "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["ADMIN"] }, { "dataType": "enum", "enums": ["MANAGER"] }, { "dataType": "enum", "enums": ["GUEST"] }, { "dataType": "enum", "enums": ["NURSE"] }, { "dataType": "enum", "enums": ["DOCTOR"] }, { "dataType": "enum", "enums": ["CASHIER"] }], "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Role": {
        "dataType": "refAlias",
        "type": { "ref": "_36_Enums.Role", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RegisterUserDTO": {
        "dataType": "refObject",
        "properties": {
            "firstName": { "dataType": "string", "required": true },
            "lastName": { "dataType": "string", "required": true },
            "middleName": { "dataType": "string" },
            "email": { "dataType": "string", "required": true },
            "phone": { "dataType": "string" },
            "password": { "dataType": "string", "required": true },
            "role": { "ref": "Role", "required": true },
            "facilityId": { "dataType": "string" },
            "isActive": { "dataType": "boolean" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.PrescriptionStatus": {
        "dataType": "refAlias",
        "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["COMPLETED"] }, { "dataType": "enum", "enums": ["CANCELLED"] }, { "dataType": "enum", "enums": ["PENDING"] }, { "dataType": "enum", "enums": ["PARTIALLY_DISPENSED"] }, { "dataType": "enum", "enums": ["DISPENSED"] }], "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePrescriptionItemDTO": {
        "dataType": "refObject",
        "properties": {
            "productId": { "dataType": "string", "required": true },
            "dosage": { "dataType": "string", "required": true },
            "frequency": { "dataType": "string", "required": true },
            "durationDays": { "dataType": "double", "required": true },
            "quantityOrdered": { "dataType": "double", "required": true },
            "route": { "dataType": "string" },
            "instructions": { "dataType": "string" },
            "unitPrice": { "dataType": "double", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePrescriptionDTO": {
        "dataType": "refObject",
        "properties": {
            "facilityId": { "dataType": "string", "required": true },
            "visitId": { "dataType": "string", "required": true },
            "notes": { "dataType": "string" },
            "items": { "dataType": "array", "array": { "dataType": "refObject", "ref": "CreatePrescriptionItemDTO" }, "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.Gender": {
        "dataType": "refAlias",
        "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["MALE"] }, { "dataType": "enum", "enums": ["FEMALE"] }, { "dataType": "enum", "enums": ["OTHER"] }], "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Gender": {
        "dataType": "refAlias",
        "type": { "ref": "_36_Enums.Gender", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PatientDTO": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "mrn": { "dataType": "string", "required": true },
            "facilityId": { "dataType": "string", "required": true },
            "firstName": { "dataType": "string", "required": true },
            "lastName": { "dataType": "string", "required": true },
            "middleName": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true },
            "gender": { "ref": "Gender", "required": true },
            "dateOfBirth": { "dataType": "datetime", "required": true },
            "phone": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true },
            "address": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true },
            "regionId": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true },
            "districtId": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true },
            "emergencyContactName": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true },
            "emergencyContactPhone": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true },
            "createdAt": { "dataType": "datetime", "required": true },
            "updatedAt": { "dataType": "datetime", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_PatientDTO_": {
        "dataType": "refObject",
        "properties": {
            "success": { "dataType": "boolean", "required": true },
            "message": { "dataType": "string" },
            "data": { "ref": "PatientDTO", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PatientResponseDTO": {
        "dataType": "refAlias",
        "type": { "ref": "ApiResponse_PatientDTO_", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RegisterPatientDTO": {
        "dataType": "refObject",
        "properties": {
            "facilityId": { "dataType": "string" },
            "firstName": { "dataType": "string", "required": true },
            "lastName": { "dataType": "string", "required": true },
            "middleName": { "dataType": "string" },
            "gender": { "ref": "Gender", "required": true },
            "dateOfBirth": { "dataType": "string", "required": true },
            "phone": { "dataType": "string" },
            "emergencyContactName": { "dataType": "string" },
            "emergencyContactPhone": { "dataType": "string" },
            "address": { "dataType": "string" },
            "regionId": { "dataType": "string" },
            "districtId": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DefaultSelection_Prisma._36_PatientPayload_": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "emergencyContactPhone": { "dataType": "string", "required": true }, "emergencyContactName": { "dataType": "string", "required": true }, "address": { "dataType": "string", "required": true }, "phone": { "dataType": "string", "required": true }, "dateOfBirth": { "dataType": "datetime", "required": true }, "gender": { "ref": "_36_Enums.Gender", "required": true }, "middleName": { "dataType": "string", "required": true }, "lastName": { "dataType": "string", "required": true }, "firstName": { "dataType": "string", "required": true }, "facilityId": { "dataType": "string", "required": true }, "mrn": { "dataType": "string", "required": true }, "districtId": { "dataType": "string", "required": true }, "regionId": { "dataType": "string", "required": true }, "updatedAt": { "dataType": "datetime", "required": true }, "createdAt": { "dataType": "datetime", "required": true }, "id": { "dataType": "string", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Patient": {
        "dataType": "refAlias",
        "type": { "ref": "DefaultSelection_Prisma._36_PatientPayload_", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PatientListResponse": {
        "dataType": "refObject",
        "properties": {
            "success": { "dataType": "boolean", "required": true },
            "count": { "dataType": "double", "required": true },
            "data": { "dataType": "array", "array": { "dataType": "refAlias", "ref": "Patient" }, "required": true },
            "message": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginationMeta": {
        "dataType": "refObject",
        "properties": {
            "total": { "dataType": "double", "required": true },
            "page": { "dataType": "double", "required": true },
            "limit": { "dataType": "double", "required": true },
            "totalPages": { "dataType": "double", "required": true },
            "hasNextPage": { "dataType": "boolean", "required": true },
            "hasPrevPage": { "dataType": "boolean", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedResponse_PatientDTO_": {
        "dataType": "refObject",
        "properties": {
            "success": { "dataType": "boolean", "required": true },
            "data": { "dataType": "array", "array": { "dataType": "refObject", "ref": "PatientDTO" }, "required": true },
            "pagination": { "ref": "PaginationMeta", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedPatientsResponseDTO": {
        "dataType": "refAlias",
        "type": { "ref": "PaginatedResponse_PatientDTO_", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdatePatientDTO": {
        "dataType": "refObject",
        "properties": {
            "firstName": { "dataType": "string", "required": true },
            "lastName": { "dataType": "string", "required": true },
            "middleName": { "dataType": "string" },
            "gender": { "ref": "Gender", "required": true },
            "dateOfBirth": { "dataType": "string", "required": true },
            "phone": { "dataType": "string" },
            "emergencyContactName": { "dataType": "string" },
            "emergencyContactPhone": { "dataType": "string" },
            "address": { "dataType": "string" },
            "regionId": { "dataType": "string" },
            "districtId": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_CreateMedicalServiceInput.Exclude_keyofCreateMedicalServiceInput.facilityId__": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "name": { "dataType": "string", "required": true }, "isActive": { "dataType": "boolean" }, "category": { "dataType": "string", "required": true }, "price": { "dataType": "double", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Omit_CreateMedicalServiceInput.facilityId_": {
        "dataType": "refAlias",
        "type": { "ref": "Pick_CreateMedicalServiceInput.Exclude_keyofCreateMedicalServiceInput.facilityId__", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_CreateMedicalServiceInput_": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "facilityId": { "dataType": "string" }, "name": { "dataType": "string" }, "category": { "dataType": "string" }, "price": { "dataType": "double" }, "isActive": { "dataType": "boolean" } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateMedicalServiceInput": {
        "dataType": "refAlias",
        "type": { "ref": "Partial_CreateMedicalServiceInput_", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_ProvideServiceInput.Exclude_keyofProvideServiceInput.providedById__": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "visitId": { "dataType": "string", "required": true }, "notes": { "dataType": "string" }, "serviceId": { "dataType": "string", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Omit_ProvideServiceInput.providedById_": {
        "dataType": "refAlias",
        "type": { "ref": "Pick_ProvideServiceInput.Exclude_keyofProvideServiceInput.providedById__", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_ProvideServiceInput_": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "visitId": { "dataType": "string" }, "serviceId": { "dataType": "string" }, "providedById": { "dataType": "string" }, "notes": { "dataType": "string" } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.LabStatus": {
        "dataType": "refAlias",
        "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["IN_PROGRESS"] }, { "dataType": "enum", "enums": ["COMPLETED"] }, { "dataType": "enum", "enums": ["CANCELLED"] }, { "dataType": "enum", "enums": ["ORDERED"] }, { "dataType": "enum", "enums": ["SAMPLE_COLLECTED"] }, { "dataType": "enum", "enums": ["VERIFIED"] }], "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePrescriptionInput": {
        "dataType": "refObject",
        "properties": {
            "visitId": { "dataType": "string", "required": true },
            "notes": { "dataType": "string" },
            "items": { "dataType": "array", "array": { "dataType": "nestedObjectLiteral", "nestedProperties": { "duration": { "dataType": "string" }, "dosage": { "dataType": "string" }, "unitPrice": { "dataType": "double", "required": true }, "quantity": { "dataType": "double", "required": true }, "productId": { "dataType": "string", "required": true } } }, "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DefaultSelection_Prisma._36_RegionPayload_": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "code": { "dataType": "string", "required": true }, "updatedAt": { "dataType": "datetime", "required": true }, "createdAt": { "dataType": "datetime", "required": true }, "id": { "dataType": "string", "required": true }, "name": { "dataType": "string", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Region": {
        "dataType": "refAlias",
        "type": { "ref": "DefaultSelection_Prisma._36_RegionPayload_", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateRegionDTO": {
        "dataType": "refObject",
        "properties": {
            "code": { "dataType": "string", "required": true },
            "name": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateRegionDTO": {
        "dataType": "refObject",
        "properties": {
            "code": { "dataType": "string" },
            "name": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DefaultSelection_Prisma._36_DistrictPayload_": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "regionId": { "dataType": "string", "required": true }, "code": { "dataType": "string", "required": true }, "updatedAt": { "dataType": "datetime", "required": true }, "createdAt": { "dataType": "datetime", "required": true }, "id": { "dataType": "string", "required": true }, "name": { "dataType": "string", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "District": {
        "dataType": "refAlias",
        "type": { "ref": "DefaultSelection_Prisma._36_DistrictPayload_", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateDistrictDTO": {
        "dataType": "refObject",
        "properties": {
            "code": { "dataType": "string", "required": true },
            "name": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateDistrictDTO": {
        "dataType": "refObject",
        "properties": {
            "name": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrderLabServiceDTO": {
        "dataType": "refObject",
        "properties": {
            "providedServiceId": { "dataType": "string", "required": true },
            "visitId": { "dataType": "string", "required": true },
            "specimenType": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LabStatus": {
        "dataType": "refAlias",
        "type": { "ref": "_36_Enums.LabStatus", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecordLabResultDTO": {
        "dataType": "refObject",
        "properties": {
            "resultValue": { "dataType": "string" },
            "unit": { "dataType": "string" },
            "referenceRange": { "dataType": "string" },
            "findings": { "dataType": "string" },
            "specimenType": { "dataType": "string" },
            "status": { "ref": "LabStatus" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateProductDTO": {
        "dataType": "refObject",
        "properties": {
            "code": { "dataType": "string" },
            "name": { "dataType": "string", "required": true },
            "description": { "dataType": "string" },
            "category": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["PILLS"] }, { "dataType": "enum", "enums": ["SYRINGES"] }, { "dataType": "enum", "enums": ["CAPSULE"] }, { "dataType": "enum", "enums": ["SYRUP"] }] },
            "unitPrice": { "dataType": "double", "required": true },
            "reorderLevel": { "dataType": "double" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_CreateProductDTO_": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "code": { "dataType": "string" }, "name": { "dataType": "string" }, "description": { "dataType": "string" }, "category": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["PILLS"] }, { "dataType": "enum", "enums": ["SYRINGES"] }, { "dataType": "enum", "enums": ["CAPSULE"] }, { "dataType": "enum", "enums": ["SYRUP"] }] }, "unitPrice": { "dataType": "double" }, "reorderLevel": { "dataType": "double" } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateProductDTO": {
        "dataType": "refAlias",
        "type": { "ref": "Partial_CreateProductDTO_", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateBatchDTO": {
        "dataType": "refObject",
        "properties": {
            "productId": { "dataType": "string", "required": true },
            "batchNumber": { "dataType": "string", "required": true },
            "quantity": { "dataType": "double", "required": true },
            "costPrice": { "dataType": "double" },
            "expiryDate": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DispenseItemInputDTO": {
        "dataType": "refObject",
        "properties": {
            "productId": { "dataType": "string", "required": true },
            "batchId": { "dataType": "string", "required": true },
            "quantity": { "dataType": "double", "required": true },
            "unitPrice": { "dataType": "double", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateDispenseRecordDTO": {
        "dataType": "refObject",
        "properties": {
            "visitId": { "dataType": "string" },
            "dispensedById": { "dataType": "string" },
            "prescriptionId": { "dataType": "string" },
            "notes": { "dataType": "string" },
            "items": { "dataType": "array", "array": { "dataType": "refObject", "ref": "DispenseItemInputDTO" }, "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentStatus": {
        "dataType": "refObject",
        "properties": {
            "status": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["UP"] }, { "dataType": "enum", "enums": ["DOWN"] }], "required": true },
            "latencyMs": { "dataType": "double" },
            "error": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HealthResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "status": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["UP"] }, { "dataType": "enum", "enums": ["DOWN"] }, { "dataType": "enum", "enums": ["DEGRADED"] }], "required": true },
            "timestamp": { "dataType": "string", "required": true },
            "uptimeSeconds": { "dataType": "double", "required": true },
            "services": { "dataType": "nestedObjectLiteral", "nestedProperties": { "redis": { "ref": "ComponentStatus", "required": true }, "postgres": { "ref": "ComponentStatus", "required": true } }, "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FacilityDTO": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "code": { "dataType": "string", "required": true },
            "name": { "dataType": "string", "required": true },
            "type": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "regionId": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "districtId": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "isActive": { "dataType": "boolean", "required": true },
            "createdAt": { "dataType": "datetime", "required": true },
            "updatedAt": { "dataType": "datetime", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.ChargeType": {
        "dataType": "refAlias",
        "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["CONSULTATION"] }, { "dataType": "enum", "enums": ["LABORATORY"] }, { "dataType": "enum", "enums": ["PHARMACY"] }, { "dataType": "enum", "enums": ["PROCEDURE"] }], "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChargeType": {
        "dataType": "refAlias",
        "type": { "ref": "_36_Enums.ChargeType", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateInvoiceItemDTO": {
        "dataType": "refObject",
        "properties": {
            "chargeType": { "ref": "ChargeType", "required": true },
            "referenceId": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "description": { "dataType": "string", "required": true },
            "quantity": { "dataType": "double" },
            "unitPrice": { "dataType": "double", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateInvoiceDTO": {
        "dataType": "refObject",
        "properties": {
            "visitId": { "dataType": "string", "required": true },
            "facilityId": { "dataType": "string", "required": true },
            "notes": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "items": { "dataType": "array", "array": { "dataType": "refObject", "ref": "CreateInvoiceItemDTO" } },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.InvoiceStatus": {
        "dataType": "refAlias",
        "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["CANCELLED"] }, { "dataType": "enum", "enums": ["PENDING"] }, { "dataType": "enum", "enums": ["PAID"] }], "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceStatus": {
        "dataType": "refAlias",
        "type": { "ref": "_36_Enums.InvoiceStatus", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceItemResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "invoiceId": { "dataType": "string", "required": true },
            "chargeType": { "ref": "ChargeType", "required": true },
            "referenceId": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }], "required": true },
            "description": { "dataType": "string", "required": true },
            "quantity": { "dataType": "double", "required": true },
            "unitPrice": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }], "required": true },
            "totalPrice": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }], "required": true },
            "createdAt": { "dataType": "datetime", "required": true },
            "updatedAt": { "dataType": "datetime", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.PaymentMethod": {
        "dataType": "refAlias",
        "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["CASH"] }, { "dataType": "enum", "enums": ["MOBILE_MONEY"] }, { "dataType": "enum", "enums": ["INSURANCE"] }, { "dataType": "enum", "enums": ["CARD"] }], "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentMethod": {
        "dataType": "refAlias",
        "type": { "ref": "_36_Enums.PaymentMethod", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.PaymentStatus": {
        "dataType": "refAlias",
        "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["CANCELLED"] }, { "dataType": "enum", "enums": ["PENDING"] }, { "dataType": "enum", "enums": ["PAID"] }, { "dataType": "enum", "enums": ["PARTIALLY_PAID"] }], "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentStatus": {
        "dataType": "refAlias",
        "type": { "ref": "_36_Enums.PaymentStatus", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "receiptNumber": { "dataType": "string" },
            "invoiceId": { "dataType": "string" },
            "amount": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }], "required": true },
            "paymentMethod": { "ref": "PaymentMethod", "required": true },
            "status": { "ref": "PaymentStatus" },
            "createdAt": { "dataType": "datetime", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PatientSummaryDTO": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "mrn": { "dataType": "string", "required": true },
            "firstName": { "dataType": "string", "required": true },
            "lastName": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VisitSummaryDTO": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "visitDate": { "dataType": "datetime", "required": true },
            "patient": { "dataType": "union", "subSchemas": [{ "ref": "PatientSummaryDTO" }, { "dataType": "enum", "enums": [null] }], "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "invoiceNumber": { "dataType": "string", "required": true },
            "visitId": { "dataType": "string" },
            "serviceTotal": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }], "required": true },
            "medicationTotal": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }], "required": true },
            "grandTotal": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }], "required": true },
            "amountPaid": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }], "required": true },
            "balance": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "double" }], "required": true },
            "status": { "ref": "InvoiceStatus", "required": true },
            "type": { "dataType": "string", "required": true },
            "notes": { "dataType": "union", "subSchemas": [{ "dataType": "string" }, { "dataType": "enum", "enums": [null] }] },
            "items": { "dataType": "array", "array": { "dataType": "refObject", "ref": "InvoiceItemResponseDTO" } },
            "payments": { "dataType": "array", "array": { "dataType": "refObject", "ref": "PaymentResponseDTO" } },
            "visit": { "dataType": "union", "subSchemas": [{ "ref": "VisitSummaryDTO" }, { "dataType": "enum", "enums": [null] }] },
            "createdAt": { "dataType": "datetime", "required": true },
            "updatedAt": { "dataType": "datetime" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_CreatePaymentDTO.Exclude_keyofCreatePaymentDTO.receivedById__": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "invoiceId": { "dataType": "string", "required": true }, "amount": { "dataType": "double", "required": true }, "paymentMethod": { "ref": "_36_Enums.PaymentMethod", "required": true } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Omit_CreatePaymentDTO.receivedById_": {
        "dataType": "refAlias",
        "type": { "ref": "Pick_CreatePaymentDTO.Exclude_keyofCreatePaymentDTO.receivedById__", "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthFacilityData": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "code": { "dataType": "string", "required": true },
            "name": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthUserData": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "firstName": { "dataType": "string", "required": true },
            "lastName": { "dataType": "string", "required": true },
            "email": { "dataType": "string", "required": true },
            "role": { "dataType": "string", "required": true },
            "facilities": { "dataType": "array", "array": { "dataType": "refObject", "ref": "AuthFacilityData" }, "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "success": { "dataType": "boolean", "required": true },
            "message": { "dataType": "string", "required": true },
            "data": { "dataType": "nestedObjectLiteral", "nestedProperties": { "refreshToken": { "dataType": "string", "required": true }, "accessToken": { "dataType": "string", "required": true }, "user": { "ref": "AuthUserData", "required": true } }, "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginDTO": {
        "dataType": "refObject",
        "properties": {
            "email": { "dataType": "string", "required": true },
            "password": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LogoutResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "success": { "dataType": "boolean", "required": true },
            "message": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LogoutDTO": {
        "dataType": "refObject",
        "properties": {
            "refreshToken": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RefreshTokenResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "success": { "dataType": "boolean", "required": true },
            "message": { "dataType": "string", "required": true },
            "data": { "dataType": "nestedObjectLiteral", "nestedProperties": { "refreshToken": { "dataType": "string", "required": true }, "accessToken": { "dataType": "string", "required": true } }, "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new runtime_1.ExpressTemplateService(models, { "noImplicitAdditionalProperties": "throw-on-extras", "bodyCoercion": true });
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
function RegisterRoutes(app) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
    const argsVitalSignsController_create = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "CreateVitalSignsInput" },
    };
    app.post('/api/v1/vital-signs', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(vital_sign_controller_1.VitalSignsController)), ...((0, runtime_1.fetchMiddlewares)(vital_sign_controller_1.VitalSignsController.prototype.create)), async function VitalSignsController_create(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsVitalSignsController_create, request, response });
            const controller = new vital_sign_controller_1.VitalSignsController();
            await templateService.apiHandler({
                methodName: 'create',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsVitalSignsController_getByVisitId = {
        visitId: { "in": "path", "name": "visitId", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/vital-signs/visit/:visitId', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(vital_sign_controller_1.VitalSignsController)), ...((0, runtime_1.fetchMiddlewares)(vital_sign_controller_1.VitalSignsController.prototype.getByVisitId)), async function VitalSignsController_getByVisitId(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsVitalSignsController_getByVisitId, request, response });
            const controller = new vital_sign_controller_1.VitalSignsController();
            await templateService.apiHandler({
                methodName: 'getByVisitId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsVitalSignsController_update = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "UpdateVitalSignsInput" },
    };
    app.put('/api/v1/vital-signs/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(vital_sign_controller_1.VitalSignsController)), ...((0, runtime_1.fetchMiddlewares)(vital_sign_controller_1.VitalSignsController.prototype.update)), async function VitalSignsController_update(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsVitalSignsController_update, request, response });
            const controller = new vital_sign_controller_1.VitalSignsController();
            await templateService.apiHandler({
                methodName: 'update',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsVitalSignsController_getAll = {
        page: { "default": 1, "in": "query", "name": "page", "dataType": "double" },
        limit: { "default": 20, "in": "query", "name": "limit", "dataType": "double" },
        patientId: { "in": "query", "name": "patientId", "dataType": "string" },
        priority: { "in": "query", "name": "priority", "ref": "TriagePriority" },
        startDate: { "in": "query", "name": "startDate", "dataType": "datetime" },
        endDate: { "in": "query", "name": "endDate", "dataType": "datetime" },
    };
    app.get('/api/v1/vital-signs', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(vital_sign_controller_1.VitalSignsController)), ...((0, runtime_1.fetchMiddlewares)(vital_sign_controller_1.VitalSignsController.prototype.getAll)), async function VitalSignsController_getAll(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsVitalSignsController_getAll, request, response });
            const controller = new vital_sign_controller_1.VitalSignsController();
            await templateService.apiHandler({
                methodName: 'getAll',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsVisitController_createVisit = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "CreateVisitDTO" },
    };
    app.post('/api/v1/visits', authenticateMiddleware([{ "jwt": ["NURSE", "ADMIN", "DOCTOR"] }]), ...((0, runtime_1.fetchMiddlewares)(visit_controller_1.VisitController)), ...((0, runtime_1.fetchMiddlewares)(visit_controller_1.VisitController.prototype.createVisit)), async function VisitController_createVisit(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsVisitController_createVisit, request, response });
            const controller = new visit_controller_1.VisitController();
            await templateService.apiHandler({
                methodName: 'createVisit',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsVisitController_updateVisit = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "UpdateVisitDTO" },
    };
    app.put('/api/v1/visits/:id', authenticateMiddleware([{ "jwt": ["NURSE", "ADMIN", "DOCTOR"] }]), ...((0, runtime_1.fetchMiddlewares)(visit_controller_1.VisitController)), ...((0, runtime_1.fetchMiddlewares)(visit_controller_1.VisitController.prototype.updateVisit)), async function VisitController_updateVisit(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsVisitController_updateVisit, request, response });
            const controller = new visit_controller_1.VisitController();
            await templateService.apiHandler({
                methodName: 'updateVisit',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsVisitController_getVisitById = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/visits/:id', authenticateMiddleware([{ "jwt": ["NURSE", "ADMIN", "DOCTOR"] }]), ...((0, runtime_1.fetchMiddlewares)(visit_controller_1.VisitController)), ...((0, runtime_1.fetchMiddlewares)(visit_controller_1.VisitController.prototype.getVisitById)), async function VisitController_getVisitById(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsVisitController_getVisitById, request, response });
            const controller = new visit_controller_1.VisitController();
            await templateService.apiHandler({
                methodName: 'getVisitById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsVisitController_getVisitsByPatient = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        mrn: { "in": "path", "name": "mrn", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/visits/patient/:mrn', authenticateMiddleware([{ "jwt": ["NURSE", "ADMIN", "DOCTOR"] }]), ...((0, runtime_1.fetchMiddlewares)(visit_controller_1.VisitController)), ...((0, runtime_1.fetchMiddlewares)(visit_controller_1.VisitController.prototype.getVisitsByPatient)), async function VisitController_getVisitsByPatient(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsVisitController_getVisitsByPatient, request, response });
            const controller = new visit_controller_1.VisitController();
            await templateService.apiHandler({
                methodName: 'getVisitsByPatient',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsVisitController_completeVisit = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.put('/api/v1/visits/:id/complete', authenticateMiddleware([{ "jwt": ["NURSE", "ADMIN", "DOCTOR"] }]), ...((0, runtime_1.fetchMiddlewares)(visit_controller_1.VisitController)), ...((0, runtime_1.fetchMiddlewares)(visit_controller_1.VisitController.prototype.completeVisit)), async function VisitController_completeVisit(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsVisitController_completeVisit, request, response });
            const controller = new visit_controller_1.VisitController();
            await templateService.apiHandler({
                methodName: 'completeVisit',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUserController_register = {
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "RegisterUserDTO" },
    };
    app.post('/api/v1/users/register', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(register_controller_1.UserController)), ...((0, runtime_1.fetchMiddlewares)(register_controller_1.UserController.prototype.register)), async function UserController_register(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUserController_register, request, response });
            const controller = new register_controller_1.UserController();
            await templateService.apiHandler({
                methodName: 'register',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUserController_view = {};
    app.get('/api/v1/users/view', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(register_controller_1.UserController)), ...((0, runtime_1.fetchMiddlewares)(register_controller_1.UserController.prototype.view)), async function UserController_view(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUserController_view, request, response });
            const controller = new register_controller_1.UserController();
            await templateService.apiHandler({
                methodName: 'view',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUserController_viewByEmail = {
        email: { "in": "path", "name": "email", "required": true, "dataType": "string" },
    };
    app.post('/api/v1/users/view/:email', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(register_controller_1.UserController)), ...((0, runtime_1.fetchMiddlewares)(register_controller_1.UserController.prototype.viewByEmail)), async function UserController_viewByEmail(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUserController_viewByEmail, request, response });
            const controller = new register_controller_1.UserController();
            await templateService.apiHandler({
                methodName: 'viewByEmail',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUserController_update = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        input: { "in": "body", "name": "input", "required": true, "ref": "RegisterUserDTO" },
    };
    app.put('/api/v1/users/update/:id', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(register_controller_1.UserController)), ...((0, runtime_1.fetchMiddlewares)(register_controller_1.UserController.prototype.update)), async function UserController_update(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUserController_update, request, response });
            const controller = new register_controller_1.UserController();
            await templateService.apiHandler({
                methodName: 'update',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPrescriptionController_createPrescription = {
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "CreatePrescriptionDTO" },
    };
    app.post('/api/v1/prescriptions', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(prescription_controller_1.PrescriptionController)), ...((0, runtime_1.fetchMiddlewares)(prescription_controller_1.PrescriptionController.prototype.createPrescription)), async function PrescriptionController_createPrescription(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPrescriptionController_createPrescription, request, response });
            const controller = new prescription_controller_1.PrescriptionController();
            await templateService.apiHandler({
                methodName: 'createPrescription',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPrescriptionController_getPendingPrescriptions = {};
    app.get('/api/v1/prescriptions/pending', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(prescription_controller_1.PrescriptionController)), ...((0, runtime_1.fetchMiddlewares)(prescription_controller_1.PrescriptionController.prototype.getPendingPrescriptions)), async function PrescriptionController_getPendingPrescriptions(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPrescriptionController_getPendingPrescriptions, request, response });
            const controller = new prescription_controller_1.PrescriptionController();
            await templateService.apiHandler({
                methodName: 'getPendingPrescriptions',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPatientController_registerPatient = {
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "RegisterPatientDTO" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.post('/api/v1/patients/register', authenticateMiddleware([{ "jwt": ["NURSE", "ADMIN", "DOCTOR"] }]), ...((0, runtime_1.fetchMiddlewares)(patient_controller_1.PatientController)), ...((0, runtime_1.fetchMiddlewares)(patient_controller_1.PatientController.prototype.registerPatient)), async function PatientController_registerPatient(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPatientController_registerPatient, request, response });
            const controller = new patient_controller_1.PatientController();
            await templateService.apiHandler({
                methodName: 'registerPatient',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPatientController_lookupPatients = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        mrn: { "in": "query", "name": "mrn", "dataType": "string" },
        firstName: { "in": "query", "name": "firstName", "dataType": "string" },
        lastName: { "in": "query", "name": "lastName", "dataType": "string" },
    };
    app.get('/api/v1/patients/lookup', authenticateMiddleware([{ "jwt": ["NURSE", "ADMIN", "DOCTOR"] }]), ...((0, runtime_1.fetchMiddlewares)(patient_controller_1.PatientController)), ...((0, runtime_1.fetchMiddlewares)(patient_controller_1.PatientController.prototype.lookupPatients)), async function PatientController_lookupPatients(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPatientController_lookupPatients, request, response });
            const controller = new patient_controller_1.PatientController();
            await templateService.apiHandler({
                methodName: 'lookupPatients',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPatientController_getPatients = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        page: { "in": "query", "name": "page", "dataType": "double" },
        limit: { "in": "query", "name": "limit", "dataType": "double" },
        search: { "in": "query", "name": "search", "dataType": "string" },
        gender: { "in": "query", "name": "gender", "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["MALE"] }, { "dataType": "enum", "enums": ["FEMALE"] }, { "dataType": "enum", "enums": ["OTHER"] }] },
        sortBy: { "in": "query", "name": "sortBy", "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["createdAt"] }, { "dataType": "enum", "enums": ["lastName"] }, { "dataType": "enum", "enums": ["mrn"] }] },
        sortOrder: { "in": "query", "name": "sortOrder", "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["asc"] }, { "dataType": "enum", "enums": ["desc"] }] },
    };
    app.get('/api/v1/patients', authenticateMiddleware([{ "jwt": ["NURSE", "ADMIN", "DOCTOR"] }]), ...((0, runtime_1.fetchMiddlewares)(patient_controller_1.PatientController)), ...((0, runtime_1.fetchMiddlewares)(patient_controller_1.PatientController.prototype.getPatients)), async function PatientController_getPatients(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPatientController_getPatients, request, response });
            const controller = new patient_controller_1.PatientController();
            await templateService.apiHandler({
                methodName: 'getPatients',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPatientController_updatePatient = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "UpdatePatientDTO" },
    };
    app.put('/api/v1/patients/:id', authenticateMiddleware([{ "jwt": ["NURSE", "ADMIN", "DOCTOR"] }]), ...((0, runtime_1.fetchMiddlewares)(patient_controller_1.PatientController)), ...((0, runtime_1.fetchMiddlewares)(patient_controller_1.PatientController.prototype.updatePatient)), async function PatientController_updatePatient(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPatientController_updatePatient, request, response });
            const controller = new patient_controller_1.PatientController();
            await templateService.apiHandler({
                methodName: 'updatePatient',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMedicalServiceController_createService = {
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "Omit_CreateMedicalServiceInput.facilityId_" },
    };
    app.post('/api/v1/medical-services', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController)), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController.prototype.createService)), async function MedicalServiceController_createService(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_createService, request, response });
            const controller = new medical_service_controller_1.MedicalServiceController();
            await templateService.apiHandler({
                methodName: 'createService',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMedicalServiceController_getServices = {
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        page: { "in": "query", "name": "page", "dataType": "double" },
        limit: { "in": "query", "name": "limit", "dataType": "double" },
        category: { "in": "query", "name": "category", "dataType": "string" },
        search: { "in": "query", "name": "search", "dataType": "string" },
    };
    app.get('/api/v1/medical-services', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController)), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController.prototype.getServices)), async function MedicalServiceController_getServices(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_getServices, request, response });
            const controller = new medical_service_controller_1.MedicalServiceController();
            await templateService.apiHandler({
                methodName: 'getServices',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMedicalServiceController_getServiceById = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/medical-services/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController)), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController.prototype.getServiceById)), async function MedicalServiceController_getServiceById(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_getServiceById, request, response });
            const controller = new medical_service_controller_1.MedicalServiceController();
            await templateService.apiHandler({
                methodName: 'getServiceById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMedicalServiceController_updateService = {
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "UpdateMedicalServiceInput" },
    };
    app.put('/api/v1/medical-services/:id', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController)), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController.prototype.updateService)), async function MedicalServiceController_updateService(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_updateService, request, response });
            const controller = new medical_service_controller_1.MedicalServiceController();
            await templateService.apiHandler({
                methodName: 'updateService',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMedicalServiceController_provideService = {
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "Omit_ProvideServiceInput.providedById_" },
    };
    app.post('/api/v1/medical-services/provide', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController)), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController.prototype.provideService)), async function MedicalServiceController_provideService(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_provideService, request, response });
            const controller = new medical_service_controller_1.MedicalServiceController();
            await templateService.apiHandler({
                methodName: 'provideService',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMedicalServiceController_updateProvidedService = {
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "Partial_ProvideServiceInput_" },
    };
    app.put('/api/v1/medical-services/provide/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController)), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController.prototype.updateProvidedService)), async function MedicalServiceController_updateProvidedService(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_updateProvidedService, request, response });
            const controller = new medical_service_controller_1.MedicalServiceController();
            await templateService.apiHandler({
                methodName: 'updateProvidedService',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMedicalServiceController_getByMrn = {
        mrn: { "in": "path", "name": "mrn", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/medical-services/patient/mrn/:mrn', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController)), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController.prototype.getByMrn)), async function MedicalServiceController_getByMrn(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_getByMrn, request, response });
            const controller = new medical_service_controller_1.MedicalServiceController();
            await templateService.apiHandler({
                methodName: 'getByMrn',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMedicalServiceController_getLatestVisitByMrn = {
        mrn: { "in": "path", "name": "mrn", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/medical-services/visit/latest/mrn/:mrn', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController)), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController.prototype.getLatestVisitByMrn)), async function MedicalServiceController_getLatestVisitByMrn(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_getLatestVisitByMrn, request, response });
            const controller = new medical_service_controller_1.MedicalServiceController();
            await templateService.apiHandler({
                methodName: 'getLatestVisitByMrn',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMedicalServiceController_createPrescription = {
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "CreatePrescriptionInput" },
    };
    app.post('/api/v1/medical-services/prescriptions', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController)), ...((0, runtime_1.fetchMiddlewares)(medical_service_controller_1.MedicalServiceController.prototype.createPrescription)), async function MedicalServiceController_createPrescription(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_createPrescription, request, response });
            const controller = new medical_service_controller_1.MedicalServiceController();
            await templateService.apiHandler({
                methodName: 'createPrescription',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLocationAdminController_createRegion = {
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "CreateRegionDTO" },
    };
    app.post('/api/v1/admin/locations/regions', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController)), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController.prototype.createRegion)), async function LocationAdminController_createRegion(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_createRegion, request, response });
            const controller = new location_controller_1.LocationAdminController();
            await templateService.apiHandler({
                methodName: 'createRegion',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLocationAdminController_updateRegion = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "UpdateRegionDTO" },
    };
    app.put('/api/v1/admin/locations/regions/:id', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController)), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController.prototype.updateRegion)), async function LocationAdminController_updateRegion(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_updateRegion, request, response });
            const controller = new location_controller_1.LocationAdminController();
            await templateService.apiHandler({
                methodName: 'updateRegion',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLocationAdminController_deleteRegion = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.delete('/api/v1/admin/locations/regions/:id', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController)), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController.prototype.deleteRegion)), async function LocationAdminController_deleteRegion(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_deleteRegion, request, response });
            const controller = new location_controller_1.LocationAdminController();
            await templateService.apiHandler({
                methodName: 'deleteRegion',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLocationAdminController_createDistrict = {
        regionId: { "in": "path", "name": "regionId", "required": true, "dataType": "string" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "CreateDistrictDTO" },
    };
    app.post('/api/v1/admin/locations/regions/:regionId/districts', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController)), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController.prototype.createDistrict)), async function LocationAdminController_createDistrict(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_createDistrict, request, response });
            const controller = new location_controller_1.LocationAdminController();
            await templateService.apiHandler({
                methodName: 'createDistrict',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLocationAdminController_updateDistrict = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "UpdateDistrictDTO" },
    };
    app.put('/api/v1/admin/locations/districts/:id', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController)), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController.prototype.updateDistrict)), async function LocationAdminController_updateDistrict(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_updateDistrict, request, response });
            const controller = new location_controller_1.LocationAdminController();
            await templateService.apiHandler({
                methodName: 'updateDistrict',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLocationAdminController_deleteDistrict = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.delete('/api/v1/admin/locations/districts/:id', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController)), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController.prototype.deleteDistrict)), async function LocationAdminController_deleteDistrict(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_deleteDistrict, request, response });
            const controller = new location_controller_1.LocationAdminController();
            await templateService.apiHandler({
                methodName: 'deleteDistrict',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLocationAdminController_getRegionByName = {
        name: { "in": "query", "name": "name", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/admin/locations/regions/search', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController)), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController.prototype.getRegionByName)), async function LocationAdminController_getRegionByName(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_getRegionByName, request, response });
            const controller = new location_controller_1.LocationAdminController();
            await templateService.apiHandler({
                methodName: 'getRegionByName',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLocationAdminController_getDistrictByName = {
        name: { "in": "query", "name": "name", "required": true, "dataType": "string" },
        regionId: { "in": "query", "name": "regionId", "dataType": "string" },
    };
    app.get('/api/v1/admin/locations/districts/search', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController)), ...((0, runtime_1.fetchMiddlewares)(location_controller_1.LocationAdminController.prototype.getDistrictByName)), async function LocationAdminController_getDistrictByName(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_getDistrictByName, request, response });
            const controller = new location_controller_1.LocationAdminController();
            await templateService.apiHandler({
                methodName: 'getDistrictByName',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLabController_orderLab = {
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "OrderLabServiceDTO" },
    };
    app.post('/api/v1/labs/order', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(lab_controller_1.LabController)), ...((0, runtime_1.fetchMiddlewares)(lab_controller_1.LabController.prototype.orderLab)), async function LabController_orderLab(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLabController_orderLab, request, response });
            const controller = new lab_controller_1.LabController();
            await templateService.apiHandler({
                methodName: 'orderLab',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLabController_recordResult = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "RecordLabResultDTO" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.put('/api/v1/labs/:id/results', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(lab_controller_1.LabController)), ...((0, runtime_1.fetchMiddlewares)(lab_controller_1.LabController.prototype.recordResult)), async function LabController_recordResult(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLabController_recordResult, request, response });
            const controller = new lab_controller_1.LabController();
            await templateService.apiHandler({
                methodName: 'recordResult',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLabController_verifyResult = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "findings": { "dataType": "string" } } },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.put('/api/v1/labs/:id/verify', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(lab_controller_1.LabController)), ...((0, runtime_1.fetchMiddlewares)(lab_controller_1.LabController.prototype.verifyResult)), async function LabController_verifyResult(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLabController_verifyResult, request, response });
            const controller = new lab_controller_1.LabController();
            await templateService.apiHandler({
                methodName: 'verifyResult',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLabController_getByVisit = {
        visitId: { "in": "path", "name": "visitId", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/labs/visit/:visitId', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(lab_controller_1.LabController)), ...((0, runtime_1.fetchMiddlewares)(lab_controller_1.LabController.prototype.getByVisit)), async function LabController_getByVisit(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLabController_getByVisit, request, response });
            const controller = new lab_controller_1.LabController();
            await templateService.apiHandler({
                methodName: 'getByVisit',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsLabController_getLabResultsByMrn = {
        mrn: { "in": "path", "name": "mrn", "required": true, "dataType": "string" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.get('/api/v1/labs/patient/mrn/:mrn', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(lab_controller_1.LabController)), ...((0, runtime_1.fetchMiddlewares)(lab_controller_1.LabController.prototype.getLabResultsByMrn)), async function LabController_getLabResultsByMrn(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsLabController_getLabResultsByMrn, request, response });
            const controller = new lab_controller_1.LabController();
            await templateService.apiHandler({
                methodName: 'getLabResultsByMrn',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPharmacyController_createProduct = {
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "CreateProductDTO" },
    };
    app.post('/api/v1/pharmacy/products', authenticateMiddleware([{ "jwt": ["ADMIN"] }]), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController)), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController.prototype.createProduct)), async function PharmacyController_createProduct(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_createProduct, request, response });
            const controller = new inventory_controller_1.PharmacyController();
            await templateService.apiHandler({
                methodName: 'createProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPharmacyController_getAllProducts = {
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        page: { "in": "query", "name": "page", "dataType": "double" },
        limit: { "in": "query", "name": "limit", "dataType": "double" },
        category: { "in": "query", "name": "category", "dataType": "string" },
        search: { "in": "query", "name": "search", "dataType": "string" },
    };
    app.get('/api/v1/pharmacy/products', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController)), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController.prototype.getAllProducts)), async function PharmacyController_getAllProducts(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_getAllProducts, request, response });
            const controller = new inventory_controller_1.PharmacyController();
            await templateService.apiHandler({
                methodName: 'getAllProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPharmacyController_getProductById = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/pharmacy/products/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController)), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController.prototype.getProductById)), async function PharmacyController_getProductById(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_getProductById, request, response });
            const controller = new inventory_controller_1.PharmacyController();
            await templateService.apiHandler({
                methodName: 'getProductById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPharmacyController_updateProduct = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "UpdateProductDTO" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
    };
    app.put('/api/v1/pharmacy/products/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController)), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController.prototype.updateProduct)), async function PharmacyController_updateProduct(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_updateProduct, request, response });
            const controller = new inventory_controller_1.PharmacyController();
            await templateService.apiHandler({
                methodName: 'updateProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPharmacyController_createBatch = {
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "CreateBatchDTO" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
    };
    app.post('/api/v1/pharmacy/batches', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController)), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController.prototype.createBatch)), async function PharmacyController_createBatch(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_createBatch, request, response });
            const controller = new inventory_controller_1.PharmacyController();
            await templateService.apiHandler({
                methodName: 'createBatch',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPharmacyController_dispenseProducts = {
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "CreateDispenseRecordDTO" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
    };
    app.post('/api/v1/pharmacy/dispense', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController)), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController.prototype.dispenseProducts)), async function PharmacyController_dispenseProducts(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_dispenseProducts, request, response });
            const controller = new inventory_controller_1.PharmacyController();
            await templateService.apiHandler({
                methodName: 'dispenseProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPharmacyController_getPendingPrescriptions = {
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        facilityId: { "in": "query", "name": "facilityId", "dataType": "string" },
    };
    app.get('/api/v1/pharmacy/dispense/prescriptions', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController)), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController.prototype.getPendingPrescriptions)), async function PharmacyController_getPendingPrescriptions(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_getPendingPrescriptions, request, response });
            const controller = new inventory_controller_1.PharmacyController();
            await templateService.apiHandler({
                methodName: 'getPendingPrescriptions',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPharmacyController_getPrescriptionsByMrn = {
        mrn: { "in": "path", "name": "mrn", "required": true, "dataType": "string" },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        facilityId: { "in": "query", "name": "facilityId", "dataType": "string" },
    };
    app.get('/api/v1/pharmacy/dispense/prescriptions/mrn/:mrn', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController)), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController.prototype.getPrescriptionsByMrn)), async function PharmacyController_getPrescriptionsByMrn(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_getPrescriptionsByMrn, request, response });
            const controller = new inventory_controller_1.PharmacyController();
            await templateService.apiHandler({
                methodName: 'getPrescriptionsByMrn',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPharmacyController_updatePrescriptionStatus = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "status": { "dataType": "string", "required": true } } },
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
    };
    app.patch('/api/v1/pharmacy/prescriptions/:id/status', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController)), ...((0, runtime_1.fetchMiddlewares)(inventory_controller_1.PharmacyController.prototype.updatePrescriptionStatus)), async function PharmacyController_updatePrescriptionStatus(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_updatePrescriptionStatus, request, response });
            const controller = new inventory_controller_1.PharmacyController();
            await templateService.apiHandler({
                methodName: 'updatePrescriptionStatus',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsHealthController_checkHealth = {};
    app.get('/api/v1/health', ...((0, runtime_1.fetchMiddlewares)(health_controller_1.HealthController)), ...((0, runtime_1.fetchMiddlewares)(health_controller_1.HealthController.prototype.checkHealth)), async function HealthController_checkHealth(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsHealthController_checkHealth, request, response });
            const controller = new health_controller_1.HealthController();
            await templateService.apiHandler({
                methodName: 'checkHealth',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsFacilityController_getFacilityByCode = {
        code: { "in": "query", "name": "code", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/facilities/by-code', ...((0, runtime_1.fetchMiddlewares)(facility_controller_1.FacilityController)), ...((0, runtime_1.fetchMiddlewares)(facility_controller_1.FacilityController.prototype.getFacilityByCode)), async function FacilityController_getFacilityByCode(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsFacilityController_getFacilityByCode, request, response });
            const controller = new facility_controller_1.FacilityController();
            await templateService.apiHandler({
                methodName: 'getFacilityByCode',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsFacilityController_searchFacilitiesByName = {
        name: { "in": "query", "name": "name", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/facilities/search', ...((0, runtime_1.fetchMiddlewares)(facility_controller_1.FacilityController)), ...((0, runtime_1.fetchMiddlewares)(facility_controller_1.FacilityController.prototype.searchFacilitiesByName)), async function FacilityController_searchFacilitiesByName(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsFacilityController_searchFacilitiesByName, request, response });
            const controller = new facility_controller_1.FacilityController();
            await templateService.apiHandler({
                methodName: 'searchFacilitiesByName',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsDashboardController_getDashboardOverview = {
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
    };
    app.get('/api/v1/dashboard/overview', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(dashboard_controller_1.DashboardController)), ...((0, runtime_1.fetchMiddlewares)(dashboard_controller_1.DashboardController.prototype.getDashboardOverview)), async function DashboardController_getDashboardOverview(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsDashboardController_getDashboardOverview, request, response });
            const controller = new dashboard_controller_1.DashboardController();
            await templateService.apiHandler({
                methodName: 'getDashboardOverview',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsBillingController_createInvoice = {
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "CreateInvoiceDTO" },
    };
    app.post('/api/v1/invoices', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(billing_controller_1.BillingController)), ...((0, runtime_1.fetchMiddlewares)(billing_controller_1.BillingController.prototype.createInvoice)), async function BillingController_createInvoice(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsBillingController_createInvoice, request, response });
            const controller = new billing_controller_1.BillingController();
            await templateService.apiHandler({
                methodName: 'createInvoice',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsBillingController_getInvoiceById = {
        invoiceId: { "in": "path", "name": "invoiceId", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/invoices/:invoiceId', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(billing_controller_1.BillingController)), ...((0, runtime_1.fetchMiddlewares)(billing_controller_1.BillingController.prototype.getInvoiceById)), async function BillingController_getInvoiceById(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsBillingController_getInvoiceById, request, response });
            const controller = new billing_controller_1.BillingController();
            await templateService.apiHandler({
                methodName: 'getInvoiceById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsBillingController_recordPayment = {
        request: { "in": "request", "name": "request", "required": true, "dataType": "object" },
        invoiceId: { "in": "path", "name": "invoiceId", "required": true, "dataType": "string" },
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "Omit_CreatePaymentDTO.receivedById_" },
    };
    app.post('/api/v1/invoices/:invoiceId/payments', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(billing_controller_1.BillingController)), ...((0, runtime_1.fetchMiddlewares)(billing_controller_1.BillingController.prototype.recordPayment)), async function BillingController_recordPayment(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsBillingController_recordPayment, request, response });
            const controller = new billing_controller_1.BillingController();
            await templateService.apiHandler({
                methodName: 'recordPayment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsBillingController_getInvoicesByMrn = {
        mrn: { "in": "path", "name": "mrn", "required": true, "dataType": "string" },
    };
    app.get('/api/v1/invoices/patient/mrn/:mrn', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(billing_controller_1.BillingController)), ...((0, runtime_1.fetchMiddlewares)(billing_controller_1.BillingController.prototype.getInvoicesByMrn)), async function BillingController_getInvoicesByMrn(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsBillingController_getInvoicesByMrn, request, response });
            const controller = new billing_controller_1.BillingController();
            await templateService.apiHandler({
                methodName: 'getInvoicesByMrn',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsAuthController_login = {
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "LoginDTO" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.post('/api/v1/auth/login', ...((0, runtime_1.fetchMiddlewares)(auth_controller_1.AuthController)), ...((0, runtime_1.fetchMiddlewares)(auth_controller_1.AuthController.prototype.login)), async function AuthController_login(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_login, request, response });
            const controller = new auth_controller_1.AuthController();
            await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsAuthController_logout = {
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "LogoutDTO" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.post('/api/v1/auth/logout', ...((0, runtime_1.fetchMiddlewares)(auth_controller_1.AuthController)), ...((0, runtime_1.fetchMiddlewares)(auth_controller_1.AuthController.prototype.logout)), async function AuthController_logout(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_logout, request, response });
            const controller = new auth_controller_1.AuthController();
            await templateService.apiHandler({
                methodName: 'logout',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsAuthController_refresh = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.post('/api/v1/auth/refresh', ...((0, runtime_1.fetchMiddlewares)(auth_controller_1.AuthController)), ...((0, runtime_1.fetchMiddlewares)(auth_controller_1.AuthController.prototype.refresh)), async function AuthController_refresh(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_refresh, request, response });
            const controller = new auth_controller_1.AuthController();
            await templateService.apiHandler({
                methodName: 'refresh',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    function authenticateMiddleware(security = []) {
        return async function runAuthenticationMiddleware(request, response, next) {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts = [];
            const pushAndRethrow = (error) => {
                failedAttempts.push(error);
                throw error;
            };
            const secMethodOrPromises = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises = [];
                    for (const name in secMethod) {
                        secMethodAndPromises.push(expressAuthenticationRecasted(request, name, secMethod[name], response)
                            .catch(pushAndRethrow));
                    }
                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                }
                else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(expressAuthenticationRecasted(request, name, secMethod[name], response)
                            .catch(pushAndRethrow));
                    }
                }
            }
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            try {
                request['user'] = await Promise.any(secMethodOrPromises);
                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next();
            }
            catch (err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;
                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        };
    }
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
