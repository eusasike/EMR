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
exports.LocationAdminController = void 0;
const tsoa_1 = require("tsoa");
const location_service_1 = require("../service/location/location.service");
const location_model_1 = require("../models/location/location.model");
let LocationAdminController = class LocationAdminController extends tsoa_1.Controller {
    locationService;
    constructor() {
        super();
        this.locationService = new location_service_1.LocationService();
    }
    async createRegion(requestBody) {
        const validation = location_model_1.CreateRegionZodSchema.safeParse(requestBody);
        if (!validation.success) {
            this.setStatus(400);
            throw new Error(`Validation failed: ${validation.error.issues.map((i) => i.message).join("; ")}`);
        }
        this.setStatus(201);
        return this.locationService.createRegion(validation.data);
    }
    async updateRegion(id, requestBody) {
        const validation = location_model_1.UpdateRegionZodSchema.safeParse(requestBody);
        if (!validation.success) {
            this.setStatus(400);
            throw new Error(`Validation failed: ${validation.error.issues.map((i) => i.message).join("; ")}`);
        }
        return this.locationService.updateRegion(id, validation.data);
    }
    async deleteRegion(id) {
        await this.locationService.deleteRegion(id);
        this.setStatus(204);
    }
    async createDistrict(regionId, requestBody) {
        const validation = location_model_1.CreateDistrictZodSchema.safeParse(requestBody);
        if (!validation.success) {
            this.setStatus(400);
            throw new Error(`Validation failed: ${validation.error.issues.map((i) => i.message).join("; ")}`);
        }
        this.setStatus(201);
        return this.locationService.createDistrict(regionId, validation.data);
    }
    async updateDistrict(id, requestBody) {
        const validation = location_model_1.UpdateDistrictZodSchema.safeParse(requestBody);
        if (!validation.success) {
            this.setStatus(400);
            throw new Error(`Validation failed: ${validation.error.issues.map((i) => i.message).join("; ")}`);
        }
        return this.locationService.updateDistrict(id, validation.data);
    }
    async deleteDistrict(id) {
        await this.locationService.deleteDistrict(id);
        this.setStatus(204);
    }
    /**
     * Find Region details (including ID) by Region Name
     */
    async getRegionByName(name) {
        if (!name || !name.trim()) {
            this.setStatus(400);
            throw new Error("Query parameter 'name' is required.");
        }
        const region = await this.locationService.getRegionByName(name);
        if (!region) {
            this.setStatus(404);
            throw new Error(`Region with name '${name}' not found.`);
        }
        return region;
    }
    /**
     * Find District details (including ID) by District Name (and optional regionId filter)
     */
    async getDistrictByName(name, regionId) {
        if (!name || !name.trim()) {
            this.setStatus(400);
            throw new Error("Query parameter 'name' is required.");
        }
        const district = await this.locationService.getDistrictByName(name, regionId);
        if (!district) {
            this.setStatus(404);
            throw new Error(`District with name '${name}' not found.`);
        }
        return district;
    }
};
exports.LocationAdminController = LocationAdminController;
__decorate([
    (0, tsoa_1.Post)("regions"),
    (0, tsoa_1.SuccessResponse)("201", "Region Created"),
    (0, tsoa_1.Response)("400", "Validation Error / Duplicate Entry"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LocationAdminController.prototype, "createRegion", null);
__decorate([
    (0, tsoa_1.Put)("regions/{id}"),
    (0, tsoa_1.SuccessResponse)("200", "Region Updated"),
    (0, tsoa_1.Response)("400", "Validation Error"),
    (0, tsoa_1.Response)("404", "Region Not Found"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LocationAdminController.prototype, "updateRegion", null);
__decorate([
    (0, tsoa_1.Delete)("regions/{id}"),
    (0, tsoa_1.SuccessResponse)("204", "Region Deleted"),
    (0, tsoa_1.Response)("404", "Region Not Found"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationAdminController.prototype, "deleteRegion", null);
__decorate([
    (0, tsoa_1.Post)("regions/{regionId}/districts"),
    (0, tsoa_1.SuccessResponse)("201", "District Created"),
    (0, tsoa_1.Response)("400", "Validation Error"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LocationAdminController.prototype, "createDistrict", null);
__decorate([
    (0, tsoa_1.Put)("districts/{id}"),
    (0, tsoa_1.SuccessResponse)("200", "District Updated"),
    (0, tsoa_1.Response)("400", "Validation Error"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LocationAdminController.prototype, "updateDistrict", null);
__decorate([
    (0, tsoa_1.Delete)("districts/{id}"),
    (0, tsoa_1.SuccessResponse)("204", "District Deleted"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationAdminController.prototype, "deleteDistrict", null);
__decorate([
    (0, tsoa_1.Get)("regions/search"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    (0, tsoa_1.Response)("400", "Missing name query parameter"),
    (0, tsoa_1.Response)("404", "Region not found"),
    __param(0, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationAdminController.prototype, "getRegionByName", null);
__decorate([
    (0, tsoa_1.Get)("districts/search"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    (0, tsoa_1.Response)("400", "Missing name query parameter"),
    (0, tsoa_1.Response)("404", "District not found"),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocationAdminController.prototype, "getDistrictByName", null);
exports.LocationAdminController = LocationAdminController = __decorate([
    (0, tsoa_1.Route)("api/v1/admin/locations"),
    (0, tsoa_1.Tags)("Administrative Location Management"),
    (0, tsoa_1.Security)("jwt", ["ADMIN"]),
    __metadata("design:paramtypes", [])
], LocationAdminController);
