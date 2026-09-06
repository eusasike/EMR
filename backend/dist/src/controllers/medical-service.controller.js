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
exports.MedicalServiceController = void 0;
// controllers/clinical/medical-service.controller.ts
const tsoa_1 = require("tsoa");
const medical_service_service_1 = require("../service/clinical/medical-service.service");
const medical_service_model_1 = require("../models/clinical/medical-service.model");
const custom_error_1 = require("../util/custom-error");
let MedicalServiceController = class MedicalServiceController extends tsoa_1.Controller {
    medicalServiceService = new medical_service_service_1.MedicalServiceService();
    /**
     * Create a new medical service definition (Admin only) - Automatically scoped to admin's facility
     */
    async createService(request, requestBody) {
        const facilityId = request.headers["x-facility-id"] || request.user?.facilityId;
        if (!facilityId) {
            throw new custom_error_1.UnauthorizedError("USER_FACILITY_NOT_FOUND_IN_SESSION");
        }
        const payloadToValidate = {
            ...requestBody,
            facilityId,
        };
        if (!medical_service_model_1.createMedicalServiceSchema) {
            throw new Error("CRITICAL: createMedicalServiceSchema is undefined. Check your file imports.");
        }
        const validation = medical_service_model_1.createMedicalServiceSchema.safeParse(payloadToValidate);
        if (!validation.success) {
            this.setStatus(400);
            return {
                success: false,
                message: `Validation failed: ${validation.error.issues
                    .map((err) => `${err.path.join(".")}: ${err.message}`)
                    .join("; ")}`,
                data: null,
            };
        }
        this.setStatus(201);
        return await this.medicalServiceService.create(validation.data);
    }
    /**
     * Retrieve a paginated and searchable list of medical services for the user's facility
     */
    async getServices(request, page, limit, category, search) {
        const facilityId = request.user?.facilityId;
        const query = {
            facilityId,
            page,
            limit,
            category,
            search,
        };
        return await this.medicalServiceService.findMany(query);
    }
    /**
     * Retrieve a single medical service by ID
     */
    async getServiceById(id) {
        return await this.medicalServiceService.findById(id);
    }
    /**
     * Update medical service details (Admin only)
     */
    async updateService(request, id, requestBody) {
        const incomingData = requestBody && Object.keys(requestBody).length > 0
            ? requestBody
            : request.body;
        if (!incomingData ||
            typeof incomingData !== "object" ||
            Object.keys(incomingData).length === 0) {
            this.setStatus(400);
            return {
                success: false,
                message: "Request body is missing or invalid JSON format.",
                data: null,
            };
        }
        const validation = medical_service_model_1.updateMedicalServiceSchema.safeParse(incomingData);
        if (!validation.success) {
            this.setStatus(400);
            return {
                success: false,
                message: `Validation failed: ${validation.error.issues
                    .map((err) => `${err.path.join(".")}: ${err.message}`)
                    .join("; ")}`,
                data: null,
            };
        }
        const facilityId = request.headers["x-facility-id"] || request.user?.facilityId;
        if (!facilityId) {
            throw new custom_error_1.UnauthorizedError("USER_FACILITY_NOT_FOUND_IN_SESSION");
        }
        const payload = {
            ...validation.data,
            facilityId,
        };
        return await this.medicalServiceService.update(id, payload);
    }
    /**
     * Record a medical service provided to a patient visit
     */
    async provideService(request, requestBody) {
        const providedById = request.user?.id;
        if (!providedById) {
            throw new custom_error_1.UnauthorizedError("AUTHENTICATION_REQUIRED");
        }
        const payload = {
            ...requestBody,
            providedById,
        };
        this.setStatus(201);
        return await this.medicalServiceService.provideService(providedById, payload);
    }
    /**
     * Update an existing provided service item
     */
    async updateProvidedService(request, id, requestBody) {
        const providedById = request.user?.id;
        if (!providedById) {
            throw new custom_error_1.UnauthorizedError("AUTHENTICATION_REQUIRED");
        }
        const payload = {
            ...requestBody,
            providedById,
        };
        return await this.medicalServiceService.updateProvidedService(id, payload);
    }
    /**
     * Get all provided services for a patient using their MRN
     */
    async getByMrn(mrn) {
        return await this.medicalServiceService.getProvidedServicesByMrn(mrn);
    }
    /**
     * Get the latest active visit and its provided services by MRN
     */
    async getLatestVisitByMrn(mrn) {
        return await this.medicalServiceService.getLatestVisitByMrn(mrn);
    }
    // 2. Update your Controller method to use the validated input
    async createPrescription(request, requestBody) {
        const prescribedById = request.user?.id;
        if (!prescribedById) {
            throw new custom_error_1.UnauthorizedError("AUTHENTICATION_REQUIRED");
        }
        const validation = medical_service_model_1.createPrescriptionSchema.safeParse(requestBody);
        if (!validation.success) {
            this.setStatus(400);
            return {
                success: false,
                message: `Validation failed: ${validation.error.issues
                    .map((err) => `${err.path.join(".")}: ${err.message}`)
                    .join("; ")}`,
                data: null,
            };
        }
        this.setStatus(201);
        return await this.medicalServiceService.createPrescription(prescribedById, validation.data);
    }
};
exports.MedicalServiceController = MedicalServiceController;
__decorate([
    (0, tsoa_1.Security)("jwt", ["ADMIN"]),
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Response)("400", "Bad Request"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    (0, tsoa_1.Response)("409", "Service Already Exists"),
    (0, tsoa_1.Post)(""),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "createService", null);
__decorate([
    (0, tsoa_1.Get)(""),
    (0, tsoa_1.Security)("jwt"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "getServices", null);
__decorate([
    (0, tsoa_1.Response)("404", "Medical Service Not Found"),
    (0, tsoa_1.Get)("{id}"),
    (0, tsoa_1.Security)("jwt"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "getServiceById", null);
__decorate([
    (0, tsoa_1.Security)("jwt", ["ADMIN"]),
    (0, tsoa_1.Response)("404", "Medical Service Not Found"),
    (0, tsoa_1.Put)("{id}"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "updateService", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    (0, tsoa_1.Response)("404", "Patient Visit or Medical Service Not Found"),
    (0, tsoa_1.Post)("provide"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "provideService", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    (0, tsoa_1.Response)("404", "Provided Service Not Found"),
    (0, tsoa_1.Put)("provide/{id}"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "updateProvidedService", null);
__decorate([
    (0, tsoa_1.Get)("patient/mrn/{mrn}"),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)(200, "Provided services retrieved by MRN"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "getByMrn", null);
__decorate([
    (0, tsoa_1.Get)("visit/latest/mrn/{mrn}"),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)(200, "Latest active visit retrieved by MRN"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "getLatestVisitByMrn", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Post)("prescriptions"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MedicalServiceController.prototype, "createPrescription", null);
exports.MedicalServiceController = MedicalServiceController = __decorate([
    (0, tsoa_1.Route)("api/v1/medical-services"),
    (0, tsoa_1.Tags)("Medical Services")
], MedicalServiceController);
