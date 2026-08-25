/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { VitalSignsController } from './../controllers/vital-sign.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { VisitController } from './../controllers/visit.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserController } from './../controllers/register.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PrescriptionController } from './../controllers/prescription.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PatientController } from './../controllers/patient.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MedicalServiceController } from './../controllers/medical-service.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LocationAdminController } from './../controllers/location.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LabController } from './../controllers/lab.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PharmacyController } from './../controllers/inventory.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { InsuranceController } from './../controllers/insuarance.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { HealthController } from './../controllers/health.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { FacilityController } from './../controllers/facility.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { BillingController } from './../controllers/billing.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../controllers/auth.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AdmissionController } from './../controllers/admission.controller';
import { expressAuthentication } from './../middlewares/authenticate';
// @ts-ignore - no great way to install types from subpackage
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';

const expressAuthenticationRecasted = expressAuthentication as (req: ExRequest, securityName: string, scopes?: string[], res?: ExResponse) => Promise<any>;


// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "Decimal": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.TriagePriority": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["RED"]},{"dataType":"enum","enums":["YELLOW"]},{"dataType":"enum","enums":["GREEN"]},{"dataType":"enum","enums":["BLACK"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DefaultSelection_Prisma._36_VitalSignsPayload_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"updatedAt":{"dataType":"datetime","required":true},"createdAt":{"dataType":"datetime","required":true},"recordedById":{"dataType":"string","required":true},"notes":{"dataType":"string","required":true},"priority":{"ref":"_36_Enums.TriagePriority","required":true},"bmi":{"ref":"Decimal","required":true},"height":{"ref":"Decimal","required":true},"weight":{"ref":"Decimal","required":true},"spo2":{"dataType":"double","required":true},"respiratoryRate":{"dataType":"double","required":true},"pulseRate":{"dataType":"double","required":true},"diastolicBP":{"dataType":"double","required":true},"systolicBP":{"dataType":"double","required":true},"temperature":{"ref":"Decimal","required":true},"visitId":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VitalSigns": {
        "dataType": "refAlias",
        "type": {"ref":"DefaultSelection_Prisma._36_VitalSignsPayload_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TriagePriority": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.TriagePriority","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateVitalSignsInput": {
        "dataType": "refObject",
        "properties": {
            "visitId": {"dataType":"string","required":true},
            "temperature": {"dataType":"double","required":true},
            "systolicBP": {"dataType":"double","required":true},
            "diastolicBP": {"dataType":"double","required":true},
            "pulseRate": {"dataType":"double","required":true},
            "respiratoryRate": {"dataType":"double","required":true},
            "spo2": {"dataType":"double","required":true},
            "weight": {"dataType":"double","required":true},
            "height": {"dataType":"double","required":true},
            "priority": {"ref":"TriagePriority"},
            "notes": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Omit_CreateVitalSignsInput.visitId__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"temperature":{"dataType":"double"},"systolicBP":{"dataType":"double"},"diastolicBP":{"dataType":"double"},"pulseRate":{"dataType":"double"},"respiratoryRate":{"dataType":"double"},"spo2":{"dataType":"double"},"weight":{"dataType":"double"},"height":{"dataType":"double"},"priority":{"ref":"_36_Enums.TriagePriority"},"notes":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateVitalSignsInput": {
        "dataType": "refAlias",
        "type": {"ref":"Partial_Omit_CreateVitalSignsInput.visitId__","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.VisitType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["OPD"]},{"dataType":"enum","enums":["EMERGENCY"]},{"dataType":"enum","enums":["REFERRAL"]},{"dataType":"enum","enums":["FOLLOW_UP"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VisitType": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.VisitType","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.VisitPriority": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["NORMAL"]},{"dataType":"enum","enums":["URGENT"]},{"dataType":"enum","enums":["CRITICAL"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VisitPriority": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.VisitPriority","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VisitResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"attending":{"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string"},"lastName":{"dataType":"string"},"firstName":{"dataType":"string"},"id":{"dataType":"string","required":true}}},"createdAt":{"dataType":"datetime","required":true},"priority":{"ref":"VisitPriority","required":true},"visitType":{"ref":"VisitType","required":true},"symptoms":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"icdCode":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"diagnosis":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"attendingId":{"dataType":"string","required":true},"patientId":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_string.string-Array_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"array","array":{"dataType":"string"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ErrorResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "errors": {"ref":"Record_string.string-Array_"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateVisitDTO": {
        "dataType": "refObject",
        "properties": {
            "patientId": {"dataType":"string","required":true},
            "attendingId": {"dataType":"string","required":true},
            "symptoms": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "diagnosis": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "icdCode": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "visitType": {"ref":"VisitType"},
            "priority": {"ref":"VisitPriority"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateVisitDTO": {
        "dataType": "refObject",
        "properties": {
            "diagnosis": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "icdCode": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "symptoms": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "priority": {"ref":"VisitPriority"},
            "attendingId": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.Role": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ADMIN"]},{"dataType":"enum","enums":["MANAGER"]},{"dataType":"enum","enums":["GUEST"]},{"dataType":"enum","enums":["NURSE"]},{"dataType":"enum","enums":["DOCTOR"]},{"dataType":"enum","enums":["CASHIER"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Role": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.Role","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RegisterUserDTO": {
        "dataType": "refObject",
        "properties": {
            "firstName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "middleName": {"dataType":"string"},
            "email": {"dataType":"string","required":true},
            "phone": {"dataType":"string"},
            "password": {"dataType":"string","required":true},
            "role": {"ref":"Role","required":true},
            "facilityId": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.PrescriptionStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["PENDING"]},{"dataType":"enum","enums":["CANCELLED"]},{"dataType":"enum","enums":["PARTIALLY_DISPENSED"]},{"dataType":"enum","enums":["COMPLETED"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePrescriptionItemDTO": {
        "dataType": "refObject",
        "properties": {
            "productId": {"dataType":"string","required":true},
            "dosage": {"dataType":"string","required":true},
            "frequency": {"dataType":"string","required":true},
            "durationDays": {"dataType":"double","required":true},
            "quantityOrdered": {"dataType":"double","required":true},
            "route": {"dataType":"string"},
            "instructions": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePrescriptionDTO": {
        "dataType": "refObject",
        "properties": {
            "visitId": {"dataType":"string","required":true},
            "notes": {"dataType":"string"},
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"CreatePrescriptionItemDTO"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.Gender": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["MALE"]},{"dataType":"enum","enums":["FEMALE"]},{"dataType":"enum","enums":["OTHER"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Gender": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.Gender","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PatientDTO": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "mrn": {"dataType":"string","required":true},
            "facilityId": {"dataType":"string","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "middleName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "gender": {"ref":"Gender","required":true},
            "dateOfBirth": {"dataType":"datetime","required":true},
            "phone": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "address": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "regionId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "districtId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "emergencyContactName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "emergencyContactPhone": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse_PatientDTO_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string"},
            "data": {"ref":"PatientDTO","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PatientResponseDTO": {
        "dataType": "refAlias",
        "type": {"ref":"ApiResponse_PatientDTO_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RegisterPatientDTO": {
        "dataType": "refObject",
        "properties": {
            "facilityId": {"dataType":"string"},
            "firstName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "middleName": {"dataType":"string"},
            "gender": {"ref":"Gender","required":true},
            "dateOfBirth": {"dataType":"string","required":true},
            "phone": {"dataType":"string"},
            "emergencyContactName": {"dataType":"string"},
            "emergencyContactPhone": {"dataType":"string"},
            "address": {"dataType":"string"},
            "regionId": {"dataType":"string"},
            "districtId": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DefaultSelection_Prisma._36_PatientPayload_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"emergencyContactPhone":{"dataType":"string","required":true},"emergencyContactName":{"dataType":"string","required":true},"address":{"dataType":"string","required":true},"phone":{"dataType":"string","required":true},"dateOfBirth":{"dataType":"datetime","required":true},"gender":{"ref":"_36_Enums.Gender","required":true},"middleName":{"dataType":"string","required":true},"lastName":{"dataType":"string","required":true},"firstName":{"dataType":"string","required":true},"facilityId":{"dataType":"string","required":true},"mrn":{"dataType":"string","required":true},"districtId":{"dataType":"string","required":true},"regionId":{"dataType":"string","required":true},"updatedAt":{"dataType":"datetime","required":true},"createdAt":{"dataType":"datetime","required":true},"id":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Patient": {
        "dataType": "refAlias",
        "type": {"ref":"DefaultSelection_Prisma._36_PatientPayload_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PatientListResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "count": {"dataType":"double","required":true},
            "data": {"dataType":"array","array":{"dataType":"refAlias","ref":"Patient"},"required":true},
            "message": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginationMeta": {
        "dataType": "refObject",
        "properties": {
            "total": {"dataType":"double","required":true},
            "page": {"dataType":"double","required":true},
            "limit": {"dataType":"double","required":true},
            "totalPages": {"dataType":"double","required":true},
            "hasNextPage": {"dataType":"boolean","required":true},
            "hasPrevPage": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedResponse_PatientDTO_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "data": {"dataType":"array","array":{"dataType":"refObject","ref":"PatientDTO"},"required":true},
            "pagination": {"ref":"PaginationMeta","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaginatedPatientsResponseDTO": {
        "dataType": "refAlias",
        "type": {"ref":"PaginatedResponse_PatientDTO_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateMedicalServiceInput": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "category": {"dataType":"string","required":true},
            "price": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_CreateMedicalServiceInput_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"name":{"dataType":"string"},"category":{"dataType":"string"},"price":{"dataType":"double"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateMedicalServiceInput": {
        "dataType": "refAlias",
        "type": {"ref":"Partial_CreateMedicalServiceInput_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_ProvideServiceInput.Exclude_keyofProvideServiceInput.providedById__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"visitId":{"dataType":"string","required":true},"notes":{"dataType":"string"},"serviceId":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Omit_ProvideServiceInput.providedById_": {
        "dataType": "refAlias",
        "type": {"ref":"Pick_ProvideServiceInput.Exclude_keyofProvideServiceInput.providedById__","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DefaultSelection_Prisma._36_RegionPayload_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"code":{"dataType":"string","required":true},"updatedAt":{"dataType":"datetime","required":true},"createdAt":{"dataType":"datetime","required":true},"id":{"dataType":"string","required":true},"name":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Region": {
        "dataType": "refAlias",
        "type": {"ref":"DefaultSelection_Prisma._36_RegionPayload_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateRegionDTO": {
        "dataType": "refObject",
        "properties": {
            "code": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateRegionDTO": {
        "dataType": "refObject",
        "properties": {
            "code": {"dataType":"string"},
            "name": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DefaultSelection_Prisma._36_DistrictPayload_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"regionId":{"dataType":"string","required":true},"code":{"dataType":"string","required":true},"updatedAt":{"dataType":"datetime","required":true},"createdAt":{"dataType":"datetime","required":true},"id":{"dataType":"string","required":true},"name":{"dataType":"string","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "District": {
        "dataType": "refAlias",
        "type": {"ref":"DefaultSelection_Prisma._36_DistrictPayload_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateDistrictDTO": {
        "dataType": "refObject",
        "properties": {
            "code": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateDistrictDTO": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.LabStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["CANCELLED"]},{"dataType":"enum","enums":["COMPLETED"]},{"dataType":"enum","enums":["ORDERED"]},{"dataType":"enum","enums":["SAMPLE_COLLECTED"]},{"dataType":"enum","enums":["IN_PROGRESS"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrderLabServiceDTO": {
        "dataType": "refObject",
        "properties": {
            "providedServiceId": {"dataType":"string","required":true},
            "visitId": {"dataType":"string","required":true},
            "specimenType": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LabStatus": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.LabStatus","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecordLabResultDTO": {
        "dataType": "refObject",
        "properties": {
            "resultValue": {"dataType":"string"},
            "unit": {"dataType":"string"},
            "referenceRange": {"dataType":"string"},
            "findings": {"dataType":"string"},
            "specimenType": {"dataType":"string"},
            "status": {"ref":"LabStatus"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateProductDTO": {
        "dataType": "refObject",
        "properties": {
            "code": {"dataType":"string"},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "category": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["MEDICINE"]},{"dataType":"enum","enums":["EQUIPMENT"]},{"dataType":"enum","enums":["CONSUMABLE"]},{"dataType":"enum","enums":["SUPPLEMENT"]}]},
            "unitPrice": {"dataType":"double","required":true},
            "reorderLevel": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_CreateProductDTO_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"code":{"dataType":"string"},"name":{"dataType":"string"},"description":{"dataType":"string"},"category":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["MEDICINE"]},{"dataType":"enum","enums":["EQUIPMENT"]},{"dataType":"enum","enums":["CONSUMABLE"]},{"dataType":"enum","enums":["SUPPLEMENT"]}]},"unitPrice":{"dataType":"double"},"reorderLevel":{"dataType":"double"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateProductDTO": {
        "dataType": "refAlias",
        "type": {"ref":"Partial_CreateProductDTO_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateBatchDTO": {
        "dataType": "refObject",
        "properties": {
            "productId": {"dataType":"string","required":true},
            "batchNumber": {"dataType":"string","required":true},
            "quantity": {"dataType":"double","required":true},
            "costPrice": {"dataType":"double"},
            "expiryDate": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DispenseItemInputDTO": {
        "dataType": "refObject",
        "properties": {
            "productId": {"dataType":"string","required":true},
            "batchId": {"dataType":"string","required":true},
            "quantity": {"dataType":"double","required":true},
            "unitPrice": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateDispenseRecordDTO": {
        "dataType": "refObject",
        "properties": {
            "visitId": {"dataType":"string"},
            "dispensedById": {"dataType":"string"},
            "prescriptionId": {"dataType":"string"},
            "notes": {"dataType":"string"},
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"DispenseItemInputDTO"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.InsuranceStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["ACTIVE"]},{"dataType":"enum","enums":["INACTIVE"]},{"dataType":"enum","enums":["EXPIRED"]},{"dataType":"enum","enums":["EXHAUSTED"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePatientInsuranceDTO": {
        "dataType": "refObject",
        "properties": {
            "patientId": {"dataType":"string","required":true},
            "providerName": {"dataType":"string","required":true},
            "policyNumber": {"dataType":"string","required":true},
            "cardNumber": {"dataType":"string","required":true},
            "principalName": {"dataType":"string"},
            "relationship": {"dataType":"string"},
            "coverageLimit": {"dataType":"double"},
            "expiryDate": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.ClaimStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["PAID"]},{"dataType":"enum","enums":["CANCELLED"]},{"dataType":"enum","enums":["PENDING_PRE_AUTH"]},{"dataType":"enum","enums":["PRE_AUTHORIZED"]},{"dataType":"enum","enums":["SUBMITTED"]},{"dataType":"enum","enums":["APPROVED"]},{"dataType":"enum","enums":["PARTIALLY_APPROVED"]},{"dataType":"enum","enums":["REJECTED"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateInsuranceClaimDTO": {
        "dataType": "refObject",
        "properties": {
            "visitId": {"dataType":"string","required":true},
            "invoiceId": {"dataType":"string"},
            "patientInsuranceId": {"dataType":"string","required":true},
            "requestedAmount": {"dataType":"double","required":true},
            "preAuthCode": {"dataType":"string"},
            "notes": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProcessInsuranceClaimDTO": {
        "dataType": "refObject",
        "properties": {
            "approvedAmount": {"dataType":"double","required":true},
            "coPayAmount": {"dataType":"double","required":true},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["APPROVED"]},{"dataType":"enum","enums":["REJECTED"]},{"dataType":"enum","enums":["PARTIALLY_APPROVED"]}],"required":true},
            "rejectionReason": {"dataType":"string"},
            "notes": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentStatus": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["UP"]},{"dataType":"enum","enums":["DOWN"]}],"required":true},
            "latencyMs": {"dataType":"double"},
            "error": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HealthResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["UP"]},{"dataType":"enum","enums":["DOWN"]},{"dataType":"enum","enums":["DEGRADED"]}],"required":true},
            "timestamp": {"dataType":"string","required":true},
            "uptimeSeconds": {"dataType":"double","required":true},
            "services": {"dataType":"nestedObjectLiteral","nestedProperties":{"redis":{"ref":"ComponentStatus","required":true},"postgres":{"ref":"ComponentStatus","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FacilityDTO": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "code": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "regionId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "districtId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "isActive": {"dataType":"boolean","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.InvoiceStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["PENDING"]},{"dataType":"enum","enums":["PAID"]},{"dataType":"enum","enums":["CANCELLED"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceStatus": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.InvoiceStatus","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.ChargeType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["CONSULTATION"]},{"dataType":"enum","enums":["LABORATORY"]},{"dataType":"enum","enums":["PHARMACY"]},{"dataType":"enum","enums":["PROCEDURE"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChargeType": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.ChargeType","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceItemResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "invoiceId": {"dataType":"string","required":true},
            "chargeType": {"ref":"ChargeType","required":true},
            "referenceId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "description": {"dataType":"string","required":true},
            "quantity": {"dataType":"double","required":true},
            "unitPrice": {"dataType":"double","required":true},
            "totalPrice": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.PaymentMethod": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["CASH"]},{"dataType":"enum","enums":["MOBILE_MONEY"]},{"dataType":"enum","enums":["INSURANCE"]},{"dataType":"enum","enums":["CARD"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentMethod": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.PaymentMethod","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.PaymentStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["PENDING"]},{"dataType":"enum","enums":["PARTIALLY_PAID"]},{"dataType":"enum","enums":["PAID"]},{"dataType":"enum","enums":["CANCELLED"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentStatus": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.PaymentStatus","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PaymentResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "receiptNumber": {"dataType":"string","required":true},
            "invoiceId": {"dataType":"string","required":true},
            "amount": {"dataType":"double","required":true},
            "paymentMethod": {"ref":"PaymentMethod","required":true},
            "status": {"ref":"PaymentStatus","required":true},
            "transactionRef": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "receivedById": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InvoiceResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "invoiceNumber": {"dataType":"string","required":true},
            "visitId": {"dataType":"string","required":true},
            "patientId": {"dataType":"string","required":true},
            "subtotal": {"dataType":"double","required":true},
            "tax": {"dataType":"double","required":true},
            "discount": {"dataType":"double","required":true},
            "insurancePay": {"dataType":"double","required":true},
            "patientPay": {"dataType":"double","required":true},
            "totalAmount": {"dataType":"double","required":true},
            "amountPaid": {"dataType":"double","required":true},
            "balanceDue": {"dataType":"double","required":true},
            "status": {"ref":"InvoiceStatus","required":true},
            "notes": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"InvoiceItemResponseDTO"}},
            "payments": {"dataType":"array","array":{"dataType":"refObject","ref":"PaymentResponseDTO"}},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecordPaymentDTO": {
        "dataType": "refObject",
        "properties": {
            "invoiceId": {"dataType":"string","required":true},
            "amount": {"dataType":"double","required":true},
            "paymentMethod": {"ref":"PaymentMethod","required":true},
            "transactionRef": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "receivedById": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePaymentDTO": {
        "dataType": "refAlias",
        "type": {"ref":"RecordPaymentDTO","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthFacilityData": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "code": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthUserData": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "role": {"dataType":"string","required":true},
            "facilities": {"dataType":"array","array":{"dataType":"refObject","ref":"AuthFacilityData"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"refreshToken":{"dataType":"string","required":true},"accessToken":{"dataType":"string","required":true},"user":{"ref":"AuthUserData","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginDTO": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LogoutResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LogoutDTO": {
        "dataType": "refObject",
        "properties": {
            "refreshToken": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RefreshTokenResponseDTO": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "data": {"dataType":"nestedObjectLiteral","nestedProperties":{"refreshToken":{"dataType":"string","required":true},"accessToken":{"dataType":"string","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "_36_Enums.WardType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["MALE"]},{"dataType":"enum","enums":["FEMALE"]},{"dataType":"enum","enums":["GENERAL"]},{"dataType":"enum","enums":["PEDIATRIC"]},{"dataType":"enum","enums":["ICU"]},{"dataType":"enum","enums":["HDUK"]},{"dataType":"enum","enums":["MATERNITY"]},{"dataType":"enum","enums":["SURGICAL"]},{"dataType":"enum","enums":["ISOLATION"]},{"dataType":"enum","enums":["PRIVATE"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "WardType": {
        "dataType": "refAlias",
        "type": {"ref":"_36_Enums.WardType","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateWardDTO": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "code": {"dataType":"string"},
            "type": {"ref":"WardType"},
            "capacity": {"dataType":"double"},
            "dailyRate": {"dataType":"double","required":true},
            "description": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateBedDTO": {
        "dataType": "refObject",
        "properties": {
            "wardId": {"dataType":"string","required":true},
            "bedNumber": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AdmitPatientDTO": {
        "dataType": "refObject",
        "properties": {
            "visitId": {"dataType":"string","required":true},
            "patientId": {"dataType":"string","required":true},
            "bedId": {"dataType":"string","required":true},
            "admittedById": {"dataType":"string","required":true},
            "admissionNotes": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DischargePatientDTO": {
        "dataType": "refObject",
        "properties": {
            "dischargedById": {"dataType":"string","required":true},
            "dischargeNotes": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsVitalSignsController_create: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateVitalSignsInput"},
        };
        app.post('/api/v1/vital-signs',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(VitalSignsController)),
            ...(fetchMiddlewares<RequestHandler>(VitalSignsController.prototype.create)),

            async function VitalSignsController_create(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsVitalSignsController_create, request, response });

                const controller = new VitalSignsController();

              await templateService.apiHandler({
                methodName: 'create',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsVitalSignsController_getByVisitId: Record<string, TsoaRoute.ParameterSchema> = {
                visitId: {"in":"path","name":"visitId","required":true,"dataType":"string"},
        };
        app.get('/api/v1/vital-signs/visit/:visitId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(VitalSignsController)),
            ...(fetchMiddlewares<RequestHandler>(VitalSignsController.prototype.getByVisitId)),

            async function VitalSignsController_getByVisitId(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsVitalSignsController_getByVisitId, request, response });

                const controller = new VitalSignsController();

              await templateService.apiHandler({
                methodName: 'getByVisitId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsVitalSignsController_update: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateVitalSignsInput"},
        };
        app.put('/api/v1/vital-signs/:id',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(VitalSignsController)),
            ...(fetchMiddlewares<RequestHandler>(VitalSignsController.prototype.update)),

            async function VitalSignsController_update(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsVitalSignsController_update, request, response });

                const controller = new VitalSignsController();

              await templateService.apiHandler({
                methodName: 'update',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsVitalSignsController_getAll: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":20,"in":"query","name":"limit","dataType":"double"},
                patientId: {"in":"query","name":"patientId","dataType":"string"},
                priority: {"in":"query","name":"priority","ref":"TriagePriority"},
                startDate: {"in":"query","name":"startDate","dataType":"datetime"},
                endDate: {"in":"query","name":"endDate","dataType":"datetime"},
        };
        app.get('/api/v1/vital-signs',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(VitalSignsController)),
            ...(fetchMiddlewares<RequestHandler>(VitalSignsController.prototype.getAll)),

            async function VitalSignsController_getAll(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsVitalSignsController_getAll, request, response });

                const controller = new VitalSignsController();

              await templateService.apiHandler({
                methodName: 'getAll',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsVisitController_createVisit: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateVisitDTO"},
        };
        app.post('/api/v1/visits',
            authenticateMiddleware([{"jwt":["NURSE","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(VisitController)),
            ...(fetchMiddlewares<RequestHandler>(VisitController.prototype.createVisit)),

            async function VisitController_createVisit(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsVisitController_createVisit, request, response });

                const controller = new VisitController();

              await templateService.apiHandler({
                methodName: 'createVisit',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsVisitController_updateVisit: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateVisitDTO"},
        };
        app.put('/api/v1/visits/:id',
            authenticateMiddleware([{"jwt":["NURSE","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(VisitController)),
            ...(fetchMiddlewares<RequestHandler>(VisitController.prototype.updateVisit)),

            async function VisitController_updateVisit(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsVisitController_updateVisit, request, response });

                const controller = new VisitController();

              await templateService.apiHandler({
                methodName: 'updateVisit',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsVisitController_getVisitById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/api/v1/visits/:id',
            authenticateMiddleware([{"jwt":["NURSE","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(VisitController)),
            ...(fetchMiddlewares<RequestHandler>(VisitController.prototype.getVisitById)),

            async function VisitController_getVisitById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsVisitController_getVisitById, request, response });

                const controller = new VisitController();

              await templateService.apiHandler({
                methodName: 'getVisitById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsVisitController_getVisitsByPatient: Record<string, TsoaRoute.ParameterSchema> = {
                mrn: {"in":"path","name":"mrn","required":true,"dataType":"string"},
        };
        app.get('/api/v1/visits/patient/:mrn',
            authenticateMiddleware([{"jwt":["NURSE","ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(VisitController)),
            ...(fetchMiddlewares<RequestHandler>(VisitController.prototype.getVisitsByPatient)),

            async function VisitController_getVisitsByPatient(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsVisitController_getVisitsByPatient, request, response });

                const controller = new VisitController();

              await templateService.apiHandler({
                methodName: 'getVisitsByPatient',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_register: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"RegisterUserDTO"},
        };
        app.post('/api/v1/users/register',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.register)),

            async function UserController_register(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_register, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'register',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_view: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/v1/users/view',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.view)),

            async function UserController_view(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_view, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'view',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_viewByEmail: Record<string, TsoaRoute.ParameterSchema> = {
                email: {"in":"path","name":"email","required":true,"dataType":"string"},
        };
        app.post('/api/v1/users/view/:email',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.viewByEmail)),

            async function UserController_viewByEmail(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_viewByEmail, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'viewByEmail',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPrescriptionController_createPrescription: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreatePrescriptionDTO"},
        };
        app.post('/api/v1/prescriptions',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PrescriptionController)),
            ...(fetchMiddlewares<RequestHandler>(PrescriptionController.prototype.createPrescription)),

            async function PrescriptionController_createPrescription(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPrescriptionController_createPrescription, request, response });

                const controller = new PrescriptionController();

              await templateService.apiHandler({
                methodName: 'createPrescription',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPrescriptionController_getPendingPrescriptions: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/v1/prescriptions/pending',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PrescriptionController)),
            ...(fetchMiddlewares<RequestHandler>(PrescriptionController.prototype.getPendingPrescriptions)),

            async function PrescriptionController_getPendingPrescriptions(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPrescriptionController_getPendingPrescriptions, request, response });

                const controller = new PrescriptionController();

              await templateService.apiHandler({
                methodName: 'getPendingPrescriptions',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPatientController_registerPatient: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"RegisterPatientDTO"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/api/v1/patients/register',
            authenticateMiddleware([{"jwt":["NURSE","ADMIN","DOCTOR"]}]),
            ...(fetchMiddlewares<RequestHandler>(PatientController)),
            ...(fetchMiddlewares<RequestHandler>(PatientController.prototype.registerPatient)),

            async function PatientController_registerPatient(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPatientController_registerPatient, request, response });

                const controller = new PatientController();

              await templateService.apiHandler({
                methodName: 'registerPatient',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPatientController_lookupPatients: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                mrn: {"in":"query","name":"mrn","dataType":"string"},
                firstName: {"in":"query","name":"firstName","dataType":"string"},
                lastName: {"in":"query","name":"lastName","dataType":"string"},
        };
        app.get('/api/v1/patients/lookup',
            authenticateMiddleware([{"jwt":["NURSE","ADMIN","DOCTOR"]}]),
            ...(fetchMiddlewares<RequestHandler>(PatientController)),
            ...(fetchMiddlewares<RequestHandler>(PatientController.prototype.lookupPatients)),

            async function PatientController_lookupPatients(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPatientController_lookupPatients, request, response });

                const controller = new PatientController();

              await templateService.apiHandler({
                methodName: 'lookupPatients',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPatientController_getPatients: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                page: {"in":"query","name":"page","dataType":"double"},
                limit: {"in":"query","name":"limit","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
                gender: {"in":"query","name":"gender","dataType":"union","subSchemas":[{"dataType":"enum","enums":["MALE"]},{"dataType":"enum","enums":["FEMALE"]},{"dataType":"enum","enums":["OTHER"]}]},
                sortBy: {"in":"query","name":"sortBy","dataType":"union","subSchemas":[{"dataType":"enum","enums":["createdAt"]},{"dataType":"enum","enums":["lastName"]},{"dataType":"enum","enums":["mrn"]}]},
                sortOrder: {"in":"query","name":"sortOrder","dataType":"union","subSchemas":[{"dataType":"enum","enums":["asc"]},{"dataType":"enum","enums":["desc"]}]},
        };
        app.get('/api/v1/patients',
            authenticateMiddleware([{"jwt":["NURSE","ADMIN","DOCTOR"]}]),
            ...(fetchMiddlewares<RequestHandler>(PatientController)),
            ...(fetchMiddlewares<RequestHandler>(PatientController.prototype.getPatients)),

            async function PatientController_getPatients(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPatientController_getPatients, request, response });

                const controller = new PatientController();

              await templateService.apiHandler({
                methodName: 'getPatients',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMedicalServiceController_createService: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateMedicalServiceInput"},
        };
        app.post('/api/v1/medical-services',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(MedicalServiceController)),
            ...(fetchMiddlewares<RequestHandler>(MedicalServiceController.prototype.createService)),

            async function MedicalServiceController_createService(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_createService, request, response });

                const controller = new MedicalServiceController();

              await templateService.apiHandler({
                methodName: 'createService',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMedicalServiceController_getServices: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"in":"query","name":"page","dataType":"double"},
                limit: {"in":"query","name":"limit","dataType":"double"},
                category: {"in":"query","name":"category","dataType":"string"},
                search: {"in":"query","name":"search","dataType":"string"},
        };
        app.get('/api/v1/medical-services',
            ...(fetchMiddlewares<RequestHandler>(MedicalServiceController)),
            ...(fetchMiddlewares<RequestHandler>(MedicalServiceController.prototype.getServices)),

            async function MedicalServiceController_getServices(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_getServices, request, response });

                const controller = new MedicalServiceController();

              await templateService.apiHandler({
                methodName: 'getServices',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMedicalServiceController_getServiceById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/api/v1/medical-services/:id',
            ...(fetchMiddlewares<RequestHandler>(MedicalServiceController)),
            ...(fetchMiddlewares<RequestHandler>(MedicalServiceController.prototype.getServiceById)),

            async function MedicalServiceController_getServiceById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_getServiceById, request, response });

                const controller = new MedicalServiceController();

              await templateService.apiHandler({
                methodName: 'getServiceById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMedicalServiceController_updateService: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateMedicalServiceInput"},
        };
        app.put('/api/v1/medical-services/:id',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(MedicalServiceController)),
            ...(fetchMiddlewares<RequestHandler>(MedicalServiceController.prototype.updateService)),

            async function MedicalServiceController_updateService(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_updateService, request, response });

                const controller = new MedicalServiceController();

              await templateService.apiHandler({
                methodName: 'updateService',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMedicalServiceController_provideService: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"Omit_ProvideServiceInput.providedById_"},
        };
        app.post('/api/v1/medical-services/provide',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MedicalServiceController)),
            ...(fetchMiddlewares<RequestHandler>(MedicalServiceController.prototype.provideService)),

            async function MedicalServiceController_provideService(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_provideService, request, response });

                const controller = new MedicalServiceController();

              await templateService.apiHandler({
                methodName: 'provideService',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMedicalServiceController_getByMrn: Record<string, TsoaRoute.ParameterSchema> = {
                mrn: {"in":"path","name":"mrn","required":true,"dataType":"string"},
        };
        app.get('/api/v1/medical-services/patient/mrn/:mrn',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MedicalServiceController)),
            ...(fetchMiddlewares<RequestHandler>(MedicalServiceController.prototype.getByMrn)),

            async function MedicalServiceController_getByMrn(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_getByMrn, request, response });

                const controller = new MedicalServiceController();

              await templateService.apiHandler({
                methodName: 'getByMrn',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMedicalServiceController_getLatestVisitByMrn: Record<string, TsoaRoute.ParameterSchema> = {
                mrn: {"in":"path","name":"mrn","required":true,"dataType":"string"},
        };
        app.get('/api/v1/medical-services/visit/latest/mrn/:mrn',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MedicalServiceController)),
            ...(fetchMiddlewares<RequestHandler>(MedicalServiceController.prototype.getLatestVisitByMrn)),

            async function MedicalServiceController_getLatestVisitByMrn(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMedicalServiceController_getLatestVisitByMrn, request, response });

                const controller = new MedicalServiceController();

              await templateService.apiHandler({
                methodName: 'getLatestVisitByMrn',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLocationAdminController_createRegion: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateRegionDTO"},
        };
        app.post('/api/v1/admin/locations/regions',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController)),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController.prototype.createRegion)),

            async function LocationAdminController_createRegion(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_createRegion, request, response });

                const controller = new LocationAdminController();

              await templateService.apiHandler({
                methodName: 'createRegion',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLocationAdminController_updateRegion: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateRegionDTO"},
        };
        app.put('/api/v1/admin/locations/regions/:id',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController)),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController.prototype.updateRegion)),

            async function LocationAdminController_updateRegion(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_updateRegion, request, response });

                const controller = new LocationAdminController();

              await templateService.apiHandler({
                methodName: 'updateRegion',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLocationAdminController_deleteRegion: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/api/v1/admin/locations/regions/:id',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController)),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController.prototype.deleteRegion)),

            async function LocationAdminController_deleteRegion(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_deleteRegion, request, response });

                const controller = new LocationAdminController();

              await templateService.apiHandler({
                methodName: 'deleteRegion',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLocationAdminController_createDistrict: Record<string, TsoaRoute.ParameterSchema> = {
                regionId: {"in":"path","name":"regionId","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateDistrictDTO"},
        };
        app.post('/api/v1/admin/locations/regions/:regionId/districts',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController)),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController.prototype.createDistrict)),

            async function LocationAdminController_createDistrict(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_createDistrict, request, response });

                const controller = new LocationAdminController();

              await templateService.apiHandler({
                methodName: 'createDistrict',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLocationAdminController_updateDistrict: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateDistrictDTO"},
        };
        app.put('/api/v1/admin/locations/districts/:id',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController)),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController.prototype.updateDistrict)),

            async function LocationAdminController_updateDistrict(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_updateDistrict, request, response });

                const controller = new LocationAdminController();

              await templateService.apiHandler({
                methodName: 'updateDistrict',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLocationAdminController_deleteDistrict: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/api/v1/admin/locations/districts/:id',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController)),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController.prototype.deleteDistrict)),

            async function LocationAdminController_deleteDistrict(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_deleteDistrict, request, response });

                const controller = new LocationAdminController();

              await templateService.apiHandler({
                methodName: 'deleteDistrict',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLocationAdminController_getRegionByName: Record<string, TsoaRoute.ParameterSchema> = {
                name: {"in":"query","name":"name","required":true,"dataType":"string"},
        };
        app.get('/api/v1/admin/locations/regions/search',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController)),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController.prototype.getRegionByName)),

            async function LocationAdminController_getRegionByName(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_getRegionByName, request, response });

                const controller = new LocationAdminController();

              await templateService.apiHandler({
                methodName: 'getRegionByName',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLocationAdminController_getDistrictByName: Record<string, TsoaRoute.ParameterSchema> = {
                name: {"in":"query","name":"name","required":true,"dataType":"string"},
                regionId: {"in":"query","name":"regionId","dataType":"string"},
        };
        app.get('/api/v1/admin/locations/districts/search',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController)),
            ...(fetchMiddlewares<RequestHandler>(LocationAdminController.prototype.getDistrictByName)),

            async function LocationAdminController_getDistrictByName(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLocationAdminController_getDistrictByName, request, response });

                const controller = new LocationAdminController();

              await templateService.apiHandler({
                methodName: 'getDistrictByName',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLabController_orderLab: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"OrderLabServiceDTO"},
        };
        app.post('/api/v1/labs/order',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(LabController)),
            ...(fetchMiddlewares<RequestHandler>(LabController.prototype.orderLab)),

            async function LabController_orderLab(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLabController_orderLab, request, response });

                const controller = new LabController();

              await templateService.apiHandler({
                methodName: 'orderLab',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLabController_recordResult: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"RecordLabResultDTO"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.put('/api/v1/labs/:id/results',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(LabController)),
            ...(fetchMiddlewares<RequestHandler>(LabController.prototype.recordResult)),

            async function LabController_recordResult(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLabController_recordResult, request, response });

                const controller = new LabController();

              await templateService.apiHandler({
                methodName: 'recordResult',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLabController_verifyResult: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"findings":{"dataType":"string"}}},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.put('/api/v1/labs/:id/verify',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(LabController)),
            ...(fetchMiddlewares<RequestHandler>(LabController.prototype.verifyResult)),

            async function LabController_verifyResult(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLabController_verifyResult, request, response });

                const controller = new LabController();

              await templateService.apiHandler({
                methodName: 'verifyResult',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLabController_getByVisit: Record<string, TsoaRoute.ParameterSchema> = {
                visitId: {"in":"path","name":"visitId","required":true,"dataType":"string"},
        };
        app.get('/api/v1/labs/visit/:visitId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(LabController)),
            ...(fetchMiddlewares<RequestHandler>(LabController.prototype.getByVisit)),

            async function LabController_getByVisit(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLabController_getByVisit, request, response });

                const controller = new LabController();

              await templateService.apiHandler({
                methodName: 'getByVisit',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPharmacyController_createProduct: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateProductDTO"},
        };
        app.post('/api/v1/pharmacy/products',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(PharmacyController)),
            ...(fetchMiddlewares<RequestHandler>(PharmacyController.prototype.createProduct)),

            async function PharmacyController_createProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_createProduct, request, response });

                const controller = new PharmacyController();

              await templateService.apiHandler({
                methodName: 'createProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPharmacyController_getAllProducts: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/v1/pharmacy/products',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(PharmacyController)),
            ...(fetchMiddlewares<RequestHandler>(PharmacyController.prototype.getAllProducts)),

            async function PharmacyController_getAllProducts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_getAllProducts, request, response });

                const controller = new PharmacyController();

              await templateService.apiHandler({
                methodName: 'getAllProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPharmacyController_getProductById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/api/v1/pharmacy/products/:id',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(PharmacyController)),
            ...(fetchMiddlewares<RequestHandler>(PharmacyController.prototype.getProductById)),

            async function PharmacyController_getProductById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_getProductById, request, response });

                const controller = new PharmacyController();

              await templateService.apiHandler({
                methodName: 'getProductById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPharmacyController_updateProduct: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateProductDTO"},
        };
        app.put('/api/v1/pharmacy/products/:id',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(PharmacyController)),
            ...(fetchMiddlewares<RequestHandler>(PharmacyController.prototype.updateProduct)),

            async function PharmacyController_updateProduct(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_updateProduct, request, response });

                const controller = new PharmacyController();

              await templateService.apiHandler({
                methodName: 'updateProduct',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPharmacyController_createBatch: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateBatchDTO"},
        };
        app.post('/api/v1/pharmacy/batches',
            authenticateMiddleware([{"jwt":["ADMIN"]}]),
            ...(fetchMiddlewares<RequestHandler>(PharmacyController)),
            ...(fetchMiddlewares<RequestHandler>(PharmacyController.prototype.createBatch)),

            async function PharmacyController_createBatch(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_createBatch, request, response });

                const controller = new PharmacyController();

              await templateService.apiHandler({
                methodName: 'createBatch',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPharmacyController_dispenseProducts: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateDispenseRecordDTO"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/api/v1/pharmacy/dispense',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PharmacyController)),
            ...(fetchMiddlewares<RequestHandler>(PharmacyController.prototype.dispenseProducts)),

            async function PharmacyController_dispenseProducts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPharmacyController_dispenseProducts, request, response });

                const controller = new PharmacyController();

              await templateService.apiHandler({
                methodName: 'dispenseProducts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsInsuranceController_registerInsurance: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreatePatientInsuranceDTO"},
        };
        app.post('/api/v1/billing/insurance',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(InsuranceController)),
            ...(fetchMiddlewares<RequestHandler>(InsuranceController.prototype.registerInsurance)),

            async function InsuranceController_registerInsurance(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsInsuranceController_registerInsurance, request, response });

                const controller = new InsuranceController();

              await templateService.apiHandler({
                methodName: 'registerInsurance',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsInsuranceController_getPatientInsurances: Record<string, TsoaRoute.ParameterSchema> = {
                patientId: {"in":"path","name":"patientId","required":true,"dataType":"string"},
        };
        app.get('/api/v1/billing/insurance/patient/:patientId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(InsuranceController)),
            ...(fetchMiddlewares<RequestHandler>(InsuranceController.prototype.getPatientInsurances)),

            async function InsuranceController_getPatientInsurances(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsInsuranceController_getPatientInsurances, request, response });

                const controller = new InsuranceController();

              await templateService.apiHandler({
                methodName: 'getPatientInsurances',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsInsuranceController_createClaim: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateInsuranceClaimDTO"},
        };
        app.post('/api/v1/billing/claims',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(InsuranceController)),
            ...(fetchMiddlewares<RequestHandler>(InsuranceController.prototype.createClaim)),

            async function InsuranceController_createClaim(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsInsuranceController_createClaim, request, response });

                const controller = new InsuranceController();

              await templateService.apiHandler({
                methodName: 'createClaim',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsInsuranceController_processClaim: Record<string, TsoaRoute.ParameterSchema> = {
                claimId: {"in":"path","name":"claimId","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"ProcessInsuranceClaimDTO"},
        };
        app.patch('/api/v1/billing/claims/:claimId/process',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(InsuranceController)),
            ...(fetchMiddlewares<RequestHandler>(InsuranceController.prototype.processClaim)),

            async function InsuranceController_processClaim(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsInsuranceController_processClaim, request, response });

                const controller = new InsuranceController();

              await templateService.apiHandler({
                methodName: 'processClaim',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsHealthController_checkHealth: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/v1/health',
            ...(fetchMiddlewares<RequestHandler>(HealthController)),
            ...(fetchMiddlewares<RequestHandler>(HealthController.prototype.checkHealth)),

            async function HealthController_checkHealth(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsHealthController_checkHealth, request, response });

                const controller = new HealthController();

              await templateService.apiHandler({
                methodName: 'checkHealth',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFacilityController_getFacilityByCode: Record<string, TsoaRoute.ParameterSchema> = {
                code: {"in":"query","name":"code","required":true,"dataType":"string"},
        };
        app.get('/api/v1/facilities/by-code',
            ...(fetchMiddlewares<RequestHandler>(FacilityController)),
            ...(fetchMiddlewares<RequestHandler>(FacilityController.prototype.getFacilityByCode)),

            async function FacilityController_getFacilityByCode(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFacilityController_getFacilityByCode, request, response });

                const controller = new FacilityController();

              await templateService.apiHandler({
                methodName: 'getFacilityByCode',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFacilityController_searchFacilitiesByName: Record<string, TsoaRoute.ParameterSchema> = {
                name: {"in":"query","name":"name","required":true,"dataType":"string"},
        };
        app.get('/api/v1/facilities/search',
            ...(fetchMiddlewares<RequestHandler>(FacilityController)),
            ...(fetchMiddlewares<RequestHandler>(FacilityController.prototype.searchFacilitiesByName)),

            async function FacilityController_searchFacilitiesByName(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFacilityController_searchFacilitiesByName, request, response });

                const controller = new FacilityController();

              await templateService.apiHandler({
                methodName: 'searchFacilitiesByName',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBillingController_getInvoice: Record<string, TsoaRoute.ParameterSchema> = {
                invoiceId: {"in":"path","name":"invoiceId","required":true,"dataType":"string"},
        };
        app.get('/api/v1/invoices/:invoiceId',
            ...(fetchMiddlewares<RequestHandler>(BillingController)),
            ...(fetchMiddlewares<RequestHandler>(BillingController.prototype.getInvoice)),

            async function BillingController_getInvoice(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBillingController_getInvoice, request, response });

                const controller = new BillingController();

              await templateService.apiHandler({
                methodName: 'getInvoice',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBillingController_recordPayment: Record<string, TsoaRoute.ParameterSchema> = {
                invoiceId: {"in":"path","name":"invoiceId","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreatePaymentDTO"},
        };
        app.post('/api/v1/invoices/:invoiceId/payments',
            ...(fetchMiddlewares<RequestHandler>(BillingController)),
            ...(fetchMiddlewares<RequestHandler>(BillingController.prototype.recordPayment)),

            async function BillingController_recordPayment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBillingController_recordPayment, request, response });

                const controller = new BillingController();

              await templateService.apiHandler({
                methodName: 'recordPayment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_login: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"LoginDTO"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/api/v1/auth/login',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.login)),

            async function AuthController_login(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_login, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_logout: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"LogoutDTO"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/api/v1/auth/logout',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.logout)),

            async function AuthController_logout(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_logout, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'logout',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_refresh: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/api/v1/auth/refresh',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.refresh)),

            async function AuthController_refresh(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_refresh, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'refresh',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdmissionController_createWard: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateWardDTO"},
        };
        app.post('/api/v1/admissions/wards',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AdmissionController)),
            ...(fetchMiddlewares<RequestHandler>(AdmissionController.prototype.createWard)),

            async function AdmissionController_createWard(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdmissionController_createWard, request, response });

                const controller = new AdmissionController();

              await templateService.apiHandler({
                methodName: 'createWard',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdmissionController_getAllWards: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/v1/admissions/wards',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AdmissionController)),
            ...(fetchMiddlewares<RequestHandler>(AdmissionController.prototype.getAllWards)),

            async function AdmissionController_getAllWards(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdmissionController_getAllWards, request, response });

                const controller = new AdmissionController();

              await templateService.apiHandler({
                methodName: 'getAllWards',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdmissionController_createBed: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateBedDTO"},
        };
        app.post('/api/v1/admissions/beds',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AdmissionController)),
            ...(fetchMiddlewares<RequestHandler>(AdmissionController.prototype.createBed)),

            async function AdmissionController_createBed(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdmissionController_createBed, request, response });

                const controller = new AdmissionController();

              await templateService.apiHandler({
                methodName: 'createBed',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdmissionController_admitPatient: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"AdmitPatientDTO"},
        };
        app.post('/api/v1/admissions/admit',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AdmissionController)),
            ...(fetchMiddlewares<RequestHandler>(AdmissionController.prototype.admitPatient)),

            async function AdmissionController_admitPatient(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdmissionController_admitPatient, request, response });

                const controller = new AdmissionController();

              await templateService.apiHandler({
                methodName: 'admitPatient',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdmissionController_dischargePatient: Record<string, TsoaRoute.ParameterSchema> = {
                admissionId: {"in":"path","name":"admissionId","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"DischargePatientDTO"},
        };
        app.put('/api/v1/admissions/:admissionId/discharge',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AdmissionController)),
            ...(fetchMiddlewares<RequestHandler>(AdmissionController.prototype.dischargePatient)),

            async function AdmissionController_dischargePatient(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdmissionController_dischargePatient, request, response });

                const controller = new AdmissionController();

              await templateService.apiHandler({
                methodName: 'dischargePatient',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
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
            catch(err) {
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
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
