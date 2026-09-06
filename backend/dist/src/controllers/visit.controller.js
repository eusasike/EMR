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
exports.VisitController = void 0;
const tsoa_1 = require("tsoa");
const visit_service_1 = require("../service/visit/visit.service");
const visit_model_1 = require("../models/visit/visit.model");
const client_1 = require("@prisma/client");
let VisitController = class VisitController extends tsoa_1.Controller {
    visitService;
    constructor() {
        super();
        this.visitService = new visit_service_1.VisitService();
    }
    /**
     * Check in a patient for a visit.
     * `attendingId` and `facilityId` are extracted automatically from the authenticated user context.
     */
    async createVisit(req, requestBody) {
        // 1. Guard against undefined/null requestBody (e.g., body parser issues)
        const body = requestBody || {};
        // 2. Extract attending ID from JWT user context or body safely
        const attendingId = req.user?.id || body.attendingId;
        // 3. Extract facility ID from JWT user context or request header
        const facilityId = req.user?.facilityId ||
            requestBody.facilityId ||
            req.user?.facilityIds?.[0] ||
            req.headers?.["x-facility-id"];
        // 4. Ensure both authentication and facility context exist
        if (!attendingId) {
            this.setStatus(401);
            return {
                success: false,
                message: "Unauthorized: Missing attending user authentication context",
            };
        }
        if (!facilityId) {
            this.setStatus(400);
            return {
                success: false,
                message: "Bad Request: Missing facility context assignment",
            };
        }
        // 5. Inject extracted attendingId prior to Zod validation
        const payloadToValidate = {
            ...body,
            attendingId: body.attendingId || attendingId,
        };
        const validation = visit_model_1.CheckInVisitZodSchema.safeParse(payloadToValidate);
        if (!validation.success) {
            this.setStatus(400);
            return {
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors,
            };
        }
        try {
            const visitPayload = {
                ...validation.data,
                visitType: validation.data.visitType,
                priority: validation.data.priority,
                status: validation.data.status || client_1.VisitStatus.IN_PROGRESS,
                attendingId,
                facilityId,
            };
            const visit = await this.visitService.createVisit(visitPayload);
            this.setStatus(201);
            return {
                success: true,
                message: "Patient visit opened successfully",
                data: visit,
            };
        }
        catch (error) {
            this.setStatus(error.statusCode || error.status || 400);
            return { success: false, message: error.message };
        }
    }
    /**
     * Update clinical encounter details or status on an active visit.
     */
    async updateVisit(id, requestBody) {
        const body = requestBody || {};
        const validation = visit_model_1.UpdateVisitZodSchema.safeParse(body);
        if (!validation.success) {
            this.setStatus(400);
            return {
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors,
            };
        }
        try {
            const updatePayload = {
                ...validation.data,
                ...(validation.data.status && {
                    status: validation.data.status,
                }),
                ...(validation.data.priority && {
                    priority: validation.data.priority,
                }),
            };
            const updatedVisit = await this.visitService.updateVisit(id, updatePayload);
            return {
                success: true,
                message: "Visit record updated successfully",
                data: updatedVisit,
            };
        }
        catch (error) {
            this.setStatus(error.statusCode || error.status || 404);
            return { success: false, message: error.message };
        }
    }
    /**
     * Retrieve visit details by visit ID.
     */
    async getVisitById(id) {
        try {
            const visit = await this.visitService.getVisitById(id);
            return { success: true, data: visit };
        }
        catch (error) {
            this.setStatus(error.statusCode || error.status || 404);
            return { success: false, message: error.message || "Visit not found" };
        }
    }
    /**
     * Retrieve all visit records for a patient by MRN.
     */
    async getVisitsByPatient(req, mrn) {
        try {
            const facilityId = req.user?.facilityId ||
                req.user?.facilityIds?.[0] ||
                req.headers?.["x-facility-id"];
            const visits = await this.visitService.getVisitsByMrn(mrn, facilityId);
            return { success: true, count: visits.length, data: visits };
        }
        catch (error) {
            this.setStatus(error.statusCode || error.status || 404);
            return {
                success: false,
                message: error.message || "Patient visits not found",
            };
        }
    }
    //update completion of the visit
    async completeVisit(id) {
        try {
            const completedVisit = await this.visitService.updateVisitStatus(id, client_1.VisitStatus.COMPLETED);
            return {
                success: true,
                message: "Visit record updated successfully",
                data: completedVisit,
            };
        }
        catch (error) {
            this.setStatus(error.statusCode || error.status || 404);
            return { success: false, message: error.message };
        }
    }
};
exports.VisitController = VisitController;
__decorate([
    (0, tsoa_1.Post)(),
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Response)("400", "Validation or Business Logic Error"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    (0, tsoa_1.Response)("404", "Patient Not Found"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VisitController.prototype, "createVisit", null);
__decorate([
    (0, tsoa_1.Put)("{id}"),
    (0, tsoa_1.Response)("400", "Validation Error"),
    (0, tsoa_1.Response)("404", "Visit Not Found"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VisitController.prototype, "updateVisit", null);
__decorate([
    (0, tsoa_1.Get)("{id}"),
    (0, tsoa_1.Response)("404", "Visit Not Found"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VisitController.prototype, "getVisitById", null);
__decorate([
    (0, tsoa_1.Get)("patient/{mrn}"),
    (0, tsoa_1.Response)("404", "Patient Not Found"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VisitController.prototype, "getVisitsByPatient", null);
__decorate([
    (0, tsoa_1.Put)("{id}/complete"),
    (0, tsoa_1.Response)("404", "Visit Not Found"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VisitController.prototype, "completeVisit", null);
exports.VisitController = VisitController = __decorate([
    (0, tsoa_1.Tags)("Patient Visits"),
    (0, tsoa_1.Route)("api/v1/visits"),
    (0, tsoa_1.Security)("jwt", ["NURSE", "ADMIN", "DOCTOR"]),
    __metadata("design:paramtypes", [])
], VisitController);
