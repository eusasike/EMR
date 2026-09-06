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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionController = void 0;
const tsoa_1 = require("tsoa");
const express_1 = __importDefault(require("express"));
const prescription_model_1 = require("../models/prescription/prescription.model");
const prescription_service_1 = require("../service/clinical/prescription.service");
let PrescriptionController = class PrescriptionController extends tsoa_1.Controller {
    prescriptionService = new prescription_service_1.PrescriptionService();
    async createPrescription(request, requestBody) {
        const validatedData = prescription_model_1.createPrescriptionSchema.parse(requestBody);
        const prescribedById = request.user.id; // From JWT middleware
        this.setStatus(201);
        return await this.prescriptionService.createPrescription(validatedData, prescribedById);
    }
    async getPendingPrescriptions() {
        return await this.prescriptionService.getPendingPrescriptions();
    }
};
exports.PrescriptionController = PrescriptionController;
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Post)(),
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Response)(400, "Bad Request - Validation Error"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "createPrescription", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Get)("pending"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "getPendingPrescriptions", null);
exports.PrescriptionController = PrescriptionController = __decorate([
    (0, tsoa_1.Tags)("Prescriptions"),
    (0, tsoa_1.Route)("api/v1/prescriptions")
], PrescriptionController);
