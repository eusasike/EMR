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
exports.DashboardController = void 0;
const tsoa_1 = require("tsoa");
const dashboard_service_1 = require("../service/dashboard/dashboard.service");
const custom_error_1 = require("../util/custom-error");
let DashboardController = class DashboardController extends tsoa_1.Controller {
    dashboardService = new dashboard_service_1.FacilityDashboardService();
    /**
     * Get facility-based dashboard operational metrics, stock summary, and recent visits
     */
    async getDashboardOverview(request) {
        const facilityId = request.headers["x-facility-id"] || request.user?.facilityId;
        if (!facilityId) {
            throw new custom_error_1.UnauthorizedError("USER_FACILITY_NOT_FOUND_IN_SESSION");
        }
        return await this.dashboardService.getFacilityDashboard(facilityId);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, tsoa_1.Get)("overview"),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)("200", "Dashboard overview retrieved successfully"),
    (0, tsoa_1.Response)("400", "Bad Request"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDashboardOverview", null);
exports.DashboardController = DashboardController = __decorate([
    (0, tsoa_1.Route)("api/v1/dashboard"),
    (0, tsoa_1.Tags)("Dashboard")
], DashboardController);
