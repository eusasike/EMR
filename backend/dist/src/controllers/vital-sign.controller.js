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
exports.VitalSignsController = void 0;
const tsoa_1 = require("tsoa");
const client_1 = require("@prisma/client");
const vital_sign_service_1 = require("../service/visit/vital-sign.service");
const vital_sign_model_1 = require("../models/visit/vital-sign.model");
let VitalSignsController = class VitalSignsController extends tsoa_1.Controller {
    vitalSignsService;
    constructor() {
        super();
        this.vitalSignsService = new vital_sign_service_1.VitalSignsService();
    }
    async create(req, requestBody) {
        const validatedInput = vital_sign_model_1.createVitalSignsSchema.parse(requestBody);
        const currentuser = req.user;
        const result = await this.vitalSignsService.create(currentuser.id, validatedInput);
        this.setStatus(201);
        return {
            success: true,
            message: "Vital signs recorded successfully",
            data: result,
        };
    }
    async getByVisitId(visitId) {
        const result = await this.vitalSignsService.findByVisitId(visitId);
        return {
            success: true,
            data: result,
        };
    }
    async update(id, requestBody) {
        const validatedInput = vital_sign_model_1.updateVitalSignsSchema.parse(requestBody);
        const result = await this.vitalSignsService.update(id, validatedInput);
        return {
            success: true,
            message: "Vital signs updated successfully",
            data: result,
        };
    }
    async getAll(page = 1, limit = 20, patientId, priority, startDate, endDate) {
        const result = await this.vitalSignsService.findMany({
            page,
            limit,
            patientId,
            priority,
            startDate,
            endDate,
        });
        return {
            success: true,
            data: result.data,
            meta: result.meta,
        };
    }
};
exports.VitalSignsController = VitalSignsController;
__decorate([
    (0, tsoa_1.Post)("/"),
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Response)("400", "Bad Request"),
    (0, tsoa_1.Response)("404", "Patient Visit Not Found"),
    (0, tsoa_1.Response)("409", "Vital Signs Already Recorded"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VitalSignsController.prototype, "create", null);
__decorate([
    (0, tsoa_1.Get)("visit/{visitId}"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    (0, tsoa_1.Response)("404", "Vital Signs Not Found"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VitalSignsController.prototype, "getByVisitId", null);
__decorate([
    (0, tsoa_1.Put)("{id}"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    (0, tsoa_1.Response)("404", "Vital Signs Record Not Found"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VitalSignsController.prototype, "update", null);
__decorate([
    (0, tsoa_1.Get)("/"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __param(5, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], VitalSignsController.prototype, "getAll", null);
exports.VitalSignsController = VitalSignsController = __decorate([
    (0, tsoa_1.Tags)("Vital Signs"),
    (0, tsoa_1.Route)("api/v1/vital-signs"),
    (0, tsoa_1.Security)("jwt"),
    __metadata("design:paramtypes", [])
], VitalSignsController);
