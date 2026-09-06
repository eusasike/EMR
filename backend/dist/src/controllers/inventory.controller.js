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
exports.PharmacyController = void 0;
const tsoa_1 = require("tsoa");
const inventory_service_1 = require("../service/phamarcy/inventory.service");
const inventory_model_1 = require("../models/phamarcy/inventory.model");
const custom_error_1 = require("../util/custom-error");
let PharmacyController = class PharmacyController extends tsoa_1.Controller {
    pharmacyService;
    constructor() {
        super();
        this.pharmacyService = new inventory_service_1.PharmacyService();
    }
    // ==========================================
    // Product Endpoints
    // ==========================================
    async createProduct(request, requestBody) {
        const facilityId = request.user?.facilityId ||
            request.headers?.["x-facility-id"];
        if (!facilityId) {
            throw new custom_error_1.UnauthorizedError("USER_FACILITY_NOT_FOUND_IN_SESSION");
        }
        const validatedData = inventory_model_1.createProductSchema.parse(requestBody);
        this.setStatus(201);
        return await this.pharmacyService.createProduct(facilityId, validatedData);
    }
    async getAllProducts(request, page, limit, category, search) {
        const facilityId = request.user?.facilityId ||
            request.headers?.["x-facility-id"];
        if (!facilityId) {
            this.setStatus(400);
            return {
                success: false,
                message: "Facility ID missing from token session or headers",
                data: null,
            };
        }
        return await this.pharmacyService.getAllProducts(facilityId);
    }
    async getProductById(id) {
        return await this.pharmacyService.getProductById(id);
    }
    async updateProduct(id, requestBody, request) {
        const facilityId = request.user?.facilityId ||
            request.headers?.["x-facility-id"];
        if (!facilityId) {
            this.setStatus(400);
            return {
                success: false,
                message: "Facility ID missing from token session or headers",
            };
        }
        const validatedData = inventory_model_1.updateProductSchema.parse(requestBody);
        return await this.pharmacyService.updateProduct(id, facilityId, validatedData);
    }
    // ==========================================
    // Product Batch Endpoints
    // ==========================================
    async createBatch(requestBody, request) {
        const facilityId = request.user?.facilityId ||
            request.headers?.["x-facility-id"];
        if (!facilityId) {
            this.setStatus(400);
            return {
                success: false,
                message: "Facility ID missing from token session or headers",
            };
        }
        const validatedData = inventory_model_1.createBatchSchema.parse(requestBody);
        this.setStatus(201);
        return await this.pharmacyService.createBatch(facilityId, validatedData);
    }
    // ==========================================
    // Dispense & Stock Deductions
    // ==========================================
    async dispenseProducts(requestBody, request) {
        const userId = request.user?.id;
        const facilityId = request.user?.facilityId ||
            request.headers?.["x-facility-id"];
        if (!userId || !facilityId) {
            this.setStatus(401);
            return {
                success: false,
                message: "Unauthorized or missing facility scope",
                data: null,
            };
        }
        const validatedData = inventory_model_1.createDispenseRecordSchema.parse(requestBody);
        this.setStatus(201);
        return await this.pharmacyService.dispenseProducts(facilityId, validatedData, userId);
    }
    // ==========================================
    // Prescription Dispensing Endpoints
    // ==========================================
    async getPendingPrescriptions(request, facilityId) {
        const activeFacilityId = facilityId ||
            request.user?.facilityId ||
            request.headers?.["x-facility-id"];
        return await this.pharmacyService.getPendingPrescriptions(activeFacilityId);
    }
    async getPrescriptionsByMrn(mrn, request, facilityId) {
        const activeFacilityId = facilityId ||
            request.user?.facilityId ||
            request.headers?.["x-facility-id"];
        return await this.pharmacyService.getPrescriptionsByMrn(mrn, activeFacilityId);
    }
    async updatePrescriptionStatus(id, requestBody, request) {
        const facilityId = request.user?.facilityId ||
            request.headers?.["x-facility-id"];
        if (!facilityId) {
            this.setStatus(400);
            return {
                success: false,
                message: "Facility ID missing from token session or headers",
            };
        }
        if (!requestBody.status) {
            this.setStatus(400);
            return {
                success: false,
                message: "Status field is required in request body",
            };
        }
        // Assuming you implement updatePrescriptionStatus in your PharmacyService:
        return await this.pharmacyService.updatePrescriptionStatus(id, requestBody.status, facilityId);
    }
};
exports.PharmacyController = PharmacyController;
__decorate([
    (0, tsoa_1.Security)("jwt", ["ADMIN"]),
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Response)("400", "Bad Request"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    (0, tsoa_1.Response)("409", "Product Already Exists"),
    (0, tsoa_1.Post)("products"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PharmacyController.prototype, "createProduct", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("products"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], PharmacyController.prototype, "getAllProducts", null);
__decorate([
    (0, tsoa_1.Get)("products/{id}"),
    (0, tsoa_1.Response)(404, "Product Not Found"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PharmacyController.prototype, "getProductById", null);
__decorate([
    (0, tsoa_1.Put)("products/{id}"),
    (0, tsoa_1.Response)(400, "Bad Request - Validation Error"),
    (0, tsoa_1.Response)(404, "Product Not Found"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PharmacyController.prototype, "updateProduct", null);
__decorate([
    (0, tsoa_1.Post)("batches"),
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Response)(400, "Bad Request - Validation Error"),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PharmacyController.prototype, "createBatch", null);
__decorate([
    (0, tsoa_1.Post)("dispense"),
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Response)(400, "Bad Request - Insufficient Stock or Invalid Input"),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PharmacyController.prototype, "dispenseProducts", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("dispense/prescriptions"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PharmacyController.prototype, "getPendingPrescriptions", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("dispense/prescriptions/mrn/{mrn}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], PharmacyController.prototype, "getPrescriptionsByMrn", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Patch)("prescriptions/{id}/status"),
    (0, tsoa_1.Response)(400, "Bad Request - Invalid Status"),
    (0, tsoa_1.Response)(404, "Prescription Not Found"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PharmacyController.prototype, "updatePrescriptionStatus", null);
exports.PharmacyController = PharmacyController = __decorate([
    (0, tsoa_1.Tags)("Pharmacy"),
    (0, tsoa_1.Route)("api/v1/pharmacy"),
    (0, tsoa_1.Security)("jwt"),
    __metadata("design:paramtypes", [])
], PharmacyController);
