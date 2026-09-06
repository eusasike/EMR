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
exports.LabController = void 0;
// src/controllers/lab.controller.ts
const tsoa_1 = require("tsoa");
const lab_service_1 = require("../service/lab/lab.service");
const lab_model_1 = require("../models/lab/lab.model");
let LabController = class LabController extends tsoa_1.Controller {
    labService = new lab_service_1.LabService();
    /**
     * Order a new lab service for a patient visit.
     */
    async orderLab(requestBody) {
        const validatedData = lab_model_1.orderLabServiceSchema.parse(requestBody);
        this.setStatus(201);
        return await this.labService.orderLabService(validatedData);
    }
    /**
     * Record findings, result values, and transition status to COMPLETED.
     */
    async recordResult(id, requestBody, req) {
        // Safely extract the authenticated user ID executing this action
        const userId = req.user?.id || req.user?.userId || req.user?.sub;
        if (!userId) {
            throw new Error("Unauthorized: User ID missing from request context");
        }
        const validatedData = lab_model_1.recordLabResultSchema.parse(requestBody);
        return await this.labService.recordResults(id, validatedData, userId);
    }
    /**
     * Final verification of a lab result by a senior technician or doctor.
     * Transitions status to VERIFIED.
     */
    async verifyResult(id, requestBody, req) {
        // Safely extract the authenticated user ID executing this action
        const userId = req.user?.id || req.user?.userId || req.user?.sub;
        if (!userId) {
            throw new Error("Unauthorized: User ID missing from request context");
        }
        const validatedData = lab_model_1.verifyLabResultSchema.parse(requestBody);
        return await this.labService.verifyResult(id, userId, validatedData.findings);
    }
    /**
     * Retrieve the complete lab history for a specific patient visit.
     */
    async getByVisit(visitId) {
        return await this.labService.getResultsByVisit(visitId);
    }
    // 1. Add this endpoint to src/controllers/lab.controller.ts so lab personnel can search by MRN
    /**
     * Fetch lab orders and results for a patient using their MRN
     */
    async getLabResultsByMrn(mrn, req) {
        const facilityId = req.user?.facilityId;
        return await this.labService.getLabResultsByMrn(mrn, facilityId);
    }
};
exports.LabController = LabController;
__decorate([
    (0, tsoa_1.Post)("order"),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)(201, "Lab Service Ordered"),
    (0, tsoa_1.Response)(400, "Validation Error or Invalid Input"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LabController.prototype, "orderLab", null);
__decorate([
    (0, tsoa_1.Put)("{id}/results"),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)(200, "Lab Result Recorded Successfully"),
    (0, tsoa_1.Response)(400, "Validation Error or Invalid Status Transition"),
    (0, tsoa_1.Response)(404, "Lab Result Not Found"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LabController.prototype, "recordResult", null);
__decorate([
    (0, tsoa_1.Put)("{id}/verify"),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)(200, "Lab Result Verified Successfully"),
    (0, tsoa_1.Response)(404, "Lab Result Not Found"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __param(2, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LabController.prototype, "verifyResult", null);
__decorate([
    (0, tsoa_1.Get)("visit/{visitId}"),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)(200, "Lab Results Retrieved"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LabController.prototype, "getByVisit", null);
__decorate([
    (0, tsoa_1.Get)("patient/mrn/{mrn}"),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)(200, "Lab results retrieved by MRN successfully"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LabController.prototype, "getLabResultsByMrn", null);
exports.LabController = LabController = __decorate([
    (0, tsoa_1.Tags)("Lab Results"),
    (0, tsoa_1.Route)("api/v1/labs")
], LabController);
