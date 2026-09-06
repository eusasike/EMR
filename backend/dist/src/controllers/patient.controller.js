"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientController = void 0;
const tsoa_1 = require("tsoa");
const patient_model_1 = require("../models/patient/patient.model");
const patient_service_1 = require("../service/patient/patient.service");
let PatientController = class PatientController extends tsoa_1.Controller {
    patientService;
    constructor() {
        super();
        this.patientService = new patient_service_1.PatientService();
    }
    async registerPatient(requestBody, req) {
        // 1. Extract and validate user session & facility context from JWT
        const currentUser = req.user;
        if (!currentUser || !currentUser.facilityIds) {
            this.setStatus(401);
            return {
                success: false,
                message: "Unauthorized: Missing active facility context in session",
                data: null,
            };
        }
        // 2. Runtime validation
        const validationResult = patient_model_1.RegisterPatientZodSchema.safeParse(requestBody);
        if (!validationResult.success) {
            this.setStatus(400);
            const errorMessages = validationResult.error.issues
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("; ");
            return {
                success: false,
                message: `Validation failed: ${errorMessages}`,
                data: null,
            };
        }
        // 3. Delegate execution with facility scope
        const patient = await this.patientService.registerPatient(validationResult.data, currentUser.id, currentUser.facilityIds[0]);
        this.setStatus(201);
        return {
            success: true,
            message: "Patient registered successfully",
            data: patient,
        };
    }
    async lookupPatients(req, mrn, firstName, lastName) {
        const currentUser = req.user;
        if (!currentUser || !currentUser.facilityIds) {
            this.setStatus(401);
            return {
                success: false,
                count: 0,
                data: [],
                message: "Unauthorized: Missing facility context",
            };
        }
        if (!mrn && !firstName && !lastName) {
            this.setStatus(400);
            return {
                success: false,
                count: 0,
                data: [],
                message: "At least one parameter (mrn, firstName, or lastName) must be provided.",
            };
        }
        const patients = await this.patientService.searchPatients({
            mrn,
            firstName,
            lastName,
            facilityId: currentUser.facilityIds[0],
        });
        return {
            success: true,
            count: patients.length,
            data: patients,
        };
    }
    async getPatients(req, page, limit, search, gender, sortBy, sortOrder) {
        const currentUser = req.user;
        if (!currentUser || !currentUser.facilityIds) {
            this.setStatus(401);
            throw new Error("Unauthorized: Missing facility context");
        }
        const queryValidation = patient_model_1.PatientQueryZodSchema.safeParse({
            page,
            limit,
            search,
            gender,
            sortBy,
            sortOrder,
        });
        if (!queryValidation.success) {
            this.setStatus(400);
            throw new Error(`Invalid query filters: ${queryValidation.error.issues.map((e) => e.message).join(", ")}`);
        }
        const result = await this.patientService.getPatients(queryValidation.data, currentUser.facilityIds[0]);
        this.setStatus(200);
        return result;
    }
    //update patient
    async updatePatient(id, requestBody) {
        // Runtime validation
        const validationResult = patient_model_1.RegisterPatientZodSchema.safeParse(requestBody);
        if (!validationResult.success) {
            this.setStatus(400);
            return {
                success: false,
                message: `Validation failed: ${validationResult.error.issues
                    .map((err) => `${err.path.join(".")}: ${err.message}`)
                    .join("; ")}`,
                data: null,
            };
        }
        // 3. Delegate execution with facility scope
        const patient = await this.patientService.updatePatient(id, validationResult.data);
        this.setStatus(200);
        return {
            success: true,
            message: "Patient updated successfully",
            data: patient,
        };
    }
};
exports.PatientController = PatientController;
__decorate([
    (0, tsoa_1.Post)("register"),
    (0, tsoa_1.SuccessResponse)("201", "Patient Registered Successfully"),
    (0, tsoa_1.Response)("400", "Bad Request / Validation Error"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    (0, tsoa_1.Response)("500", "Internal Server Error"),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "registerPatient", null);
__decorate([
    (0, tsoa_1.Get)("lookup"),
    (0, tsoa_1.SuccessResponse)("200", "Patients Fetched Successfully"),
    (0, tsoa_1.Response)("400", "Bad Request - Missing query parameters"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "lookupPatients", null);
__decorate([
    (0, tsoa_1.Get)(""),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    (0, tsoa_1.Response)("400", "Invalid Query Parameters"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __param(5, (0, tsoa_1.Query)()),
    __param(6, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "getPatients", null);
__decorate([
    (0, tsoa_1.Put)(":id"),
    (0, tsoa_1.SuccessResponse)("200", "Patient Updated Successfully"),
    (0, tsoa_1.Response)("400", "Bad Request / Validation Error"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    (0, tsoa_1.Response)("500", "Internal Server Error"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "updatePatient", null);
exports.PatientController = PatientController = __decorate([
    (0, tsoa_1.Route)("api/v1/patients"),
    (0, tsoa_1.Tags)("Patient Management"),
    (0, tsoa_1.Security)("jwt", ["NURSE", "ADMIN", "DOCTOR"]),
    __metadata("design:paramtypes", [])
], PatientController);
