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
exports.BillingController = void 0;
// controllers/billing/billing.controller.ts
const tsoa_1 = require("tsoa");
const billing_service_1 = require("../service/billing/billing.service");
const billing_model_1 = require("../models/billing/billing.model");
const custom_error_1 = require("../util/custom-error");
let BillingController = class BillingController extends tsoa_1.Controller {
    billingService = new billing_service_1.BillingService();
    /**
     * Create a new itemized invoice
     */
    async createInvoice(request, requestBody) {
        const facilityId = request.headers["x-facility-id"] || request.user?.facilityId;
        if (!facilityId) {
            throw new custom_error_1.UnauthorizedError("USER_FACILITY_NOT_FOUND_IN_SESSION");
        }
        const payloadToValidate = {
            ...requestBody,
            facilityId,
        };
        const validation = billing_model_1.createInvoiceSchema.safeParse(payloadToValidate);
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
        return await this.billingService.createInvoice(facilityId, validation.data);
    }
    /**
     * Retrieve invoice details by ID, including line items and payment history
     */
    async getInvoiceById(invoiceId) {
        return await this.billingService.getInvoiceById(invoiceId);
    }
    /**
     * Process a payment against an outstanding invoice using the authenticated user's ID
     */
    async recordPayment(request, invoiceId, requestBody) {
        const receivedById = request.user?.id;
        if (!receivedById) {
            throw new custom_error_1.UnauthorizedError("AUTHENTICATION_REQUIRED");
        }
        const payloadToValidate = {
            ...requestBody,
            invoiceId,
            receivedById,
        };
        const validation = billing_model_1.recordPaymentSchema.safeParse(payloadToValidate);
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
        return await this.billingService.processPayment(invoiceId, validation.data, receivedById);
    }
    /**
     * Get all invoices for a patient using their MRN
     */
    async getInvoicesByMrn(mrn) {
        return await this.billingService.getInvoicesByMrn(mrn);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Response)("400", "Bad Request"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    (0, tsoa_1.Post)(""),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createInvoice", null);
__decorate([
    (0, tsoa_1.Get)("{invoiceId}"),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.Response)("404", "Invoice Not Found"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInvoiceById", null);
__decorate([
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)("201", "Created"),
    (0, tsoa_1.Response)("400", "Bad Request"),
    (0, tsoa_1.Response)("401", "Unauthorized"),
    (0, tsoa_1.Response)("404", "Invoice Not Found"),
    (0, tsoa_1.Post)("{invoiceId}/payments"),
    __param(0, (0, tsoa_1.Request)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "recordPayment", null);
__decorate([
    (0, tsoa_1.Get)("patient/mrn/{mrn}"),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)(200, "Invoices retrieved by MRN"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInvoicesByMrn", null);
exports.BillingController = BillingController = __decorate([
    (0, tsoa_1.Route)("api/v1/invoices"),
    (0, tsoa_1.Tags)("Billing")
], BillingController);
