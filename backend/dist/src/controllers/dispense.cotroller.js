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
exports.DispenseController = void 0;
// src/controllers/phamarcy/dispense.controller.ts
const tsoa_1 = require("tsoa");
const dispense_service_1 = require("../service/phamarcy/dispense.service");
const dispense_model_1 = require("../models/phamarcy/dispense.model");
const dispenseService = new dispense_service_1.DispenseService();
let DispenseController = class DispenseController extends tsoa_1.Controller {
    async getPendingPrescriptions(request, facilityId) {
        const resolvedFacilityId = facilityId ||
            request.user?.facilityId ||
            request.headers?.["x-facility-id"];
        return await dispenseService.getPendingPrescriptions(resolvedFacilityId);
    }
    async getDispenseRecordById(id) {
        const record = await dispenseService.getDispenseRecordById(id);
        if (!record) {
            this.setStatus(404);
            throw new Error("Dispense record not found");
        }
        return record;
    }
    async dispenseItems(request, requestBody) {
        const facilityId = request.user?.facilityId ||
            request.headers?.["x-facility-id"] ||
            requestBody.facilityId;
        if (!facilityId) {
            this.setStatus(400);
            throw new Error("USER_FACILITY_NOT_FOUND_IN_SESSION");
        }
        const userId = request.user?.id || requestBody.dispensedById;
        if (!userId) {
            this.setStatus(401);
            throw new Error("UNAUTHORIZED_USER_ID_MISSING");
        }
        const validatedData = dispense_model_1.CreateDispenseRecordDtoSchema.parse({
            ...requestBody,
            facilityId,
            dispensedById: userId,
        });
        this.setStatus(201);
        return await dispenseService.dispensePrescription(validatedData);
    }
    // src/controllers/phamarcy/dispense.controller.ts
    async getPrescriptionsByMrn(request, mrn, facilityId) {
        const resolvedFacilityId = facilityId ||
            request.user?.facilityId ||
            request.headers?.["x-facility-id"];
        return await dispenseService.getPrescriptionsByMrn(mrn, resolvedFacilityId);
    }
};
exports.DispenseController = DispenseController;
__decorate([
    (0, tsoa_1.Get)("prescriptions"),
    (0, tsoa_1.Security)("JWT"),
    (0, tsoa_1.SuccessResponse)("200", "Success"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DispenseController.prototype, "getPendingPrescriptions", null);
__decorate([
    (0, tsoa_1.Get)("{id}"),
    (0, tsoa_1.Security)("JWT"),
    (0, tsoa_1.SuccessResponse)("200", "Success"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    (0, tsoa_1.Response)("404", "Not Found"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DispenseController.prototype, "getDispenseRecordById", null);
__decorate([
    (0, tsoa_1.Security)("JWT", ["ADMIN", "PHARMACIST"]),
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Response)("400", "Bad Request"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    (0, tsoa_1.Post)(),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DispenseController.prototype, "dispenseItems", null);
__decorate([
    (0, tsoa_1.Get)("prescriptions/mrn/{mrn}"),
    (0, tsoa_1.Security)("JWT"),
    (0, tsoa_1.SuccessResponse)("200", "Success"),
    (0, tsoa_1.Response)("404", "Not Found"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DispenseController.prototype, "getPrescriptionsByMrn", null);
exports.DispenseController = DispenseController = __decorate([
    (0, tsoa_1.Route)("api/pharmacy/dispense"),
    (0, tsoa_1.Tags)("Pharmacy Dispense")
], DispenseController);
