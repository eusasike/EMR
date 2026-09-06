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
exports.FacilityController = void 0;
const tsoa_1 = require("tsoa");
const facility_service_1 = require("../service/location/facility.service");
let FacilityController = class FacilityController extends tsoa_1.Controller {
    facilityService;
    constructor() {
        super();
        this.facilityService = new facility_service_1.FacilityService();
    }
    /**
     * Search a facility by exact code (e.g. /api/v1/facilities/by-code?code=FAC-001)
     */
    async getFacilityByCode(code) {
        if (!code || !code.trim()) {
            this.setStatus(400);
            throw new Error("Query parameter 'code' is required.");
        }
        const facility = await this.facilityService.getFacilityByCode(code);
        if (!facility) {
            this.setStatus(404);
            throw new Error(`Facility with code '${code}' not found.`);
        }
        return facility;
    }
    /**
     * Search facilities by name query (e.g. /api/v1/facilities/search?name=Kibongoto)
     */
    async searchFacilitiesByName(name) {
        if (!name || !name.trim()) {
            this.setStatus(400);
            throw new Error("Query parameter 'name' is required.");
        }
        return this.facilityService.searchFacilitiesByName(name);
    }
};
exports.FacilityController = FacilityController;
__decorate([
    (0, tsoa_1.Get)("by-code"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    (0, tsoa_1.Response)("400", "Missing required code parameter"),
    (0, tsoa_1.Response)("404", "Facility not found"),
    __param(0, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FacilityController.prototype, "getFacilityByCode", null);
__decorate([
    (0, tsoa_1.Get)("search"),
    (0, tsoa_1.SuccessResponse)("200", "OK"),
    (0, tsoa_1.Response)("400", "Missing required name parameter"),
    __param(0, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FacilityController.prototype, "searchFacilitiesByName", null);
exports.FacilityController = FacilityController = __decorate([
    (0, tsoa_1.Route)("api/v1/facilities"),
    (0, tsoa_1.Tags)("Facility Services"),
    __metadata("design:paramtypes", [])
], FacilityController);
