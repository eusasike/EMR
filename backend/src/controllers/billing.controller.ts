// controllers/billing/billing.controller.ts
import {
  Controller,
  Route,
  Tags,
  Get,
  Post,
  Path,
  Body,
  SuccessResponse,
  Response,
  Security,
  Request,
} from "tsoa";
import express from "express";
import { BillingService } from "../service/billing/billing.service";
import {
  CreateInvoiceDTO,
  CreatePaymentDTO,
  createInvoiceSchema,
  recordPaymentSchema,
  InvoiceResponseDTO,
} from "../models/billing/billing.model";
import { UnauthorizedError } from "../util/custom-error";

interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    role: string;
    facilityId?: string;
  };
}

@Route("api/v1/invoices")
@Tags("Billing")
export class BillingController extends Controller {
  private billingService = new BillingService();

  /**
   * Create a new itemized invoice
   */
  @Security("jwt")
  @SuccessResponse("201", "Created")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Post("")
  public async createInvoice(
    @Request() request: AuthenticatedRequest,
    @Body() requestBody: CreateInvoiceDTO,
  ): Promise<any> {
    const facilityId =
      (request.headers["x-facility-id"] as string) || request.user?.facilityId;

    if (!facilityId) {
      throw new UnauthorizedError("USER_FACILITY_NOT_FOUND_IN_SESSION");
    }

    const payloadToValidate = {
      ...requestBody,
      facilityId,
    };

    const validation = createInvoiceSchema.safeParse(payloadToValidate);
    if (!validation.success) {
      this.setStatus(400);
      return {
        success: false,
        message: `Validation failed: ${validation.error.issues
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join("; ")}`,
        data: null as any,
      };
    }

    this.setStatus(201);
    return await this.billingService.createInvoice(facilityId, validation.data);
  }

  /**
   * Retrieve invoice details by ID, including line items and payment history
   */
  @Get("{invoiceId}")
  @Security("jwt")
  @Response("404", "Invoice Not Found")
  public async getInvoiceById(
    @Path() invoiceId: string,
  ): Promise<InvoiceResponseDTO> {
    return await this.billingService.getInvoiceById(invoiceId);
  }

  /**
   * Process a payment against an outstanding invoice using the authenticated user's ID
   */
  @Security("jwt")
  @SuccessResponse("201", "Created")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("404", "Invoice Not Found")
  @Post("{invoiceId}/payments")
  public async recordPayment(
    @Request() request: AuthenticatedRequest,
    @Path() invoiceId: string,
    @Body() requestBody: Omit<CreatePaymentDTO, "receivedById">,
  ): Promise<InvoiceResponseDTO | any> {
    const receivedById = request.user?.id;

    if (!receivedById) {
      throw new UnauthorizedError("AUTHENTICATION_REQUIRED");
    }

    const payloadToValidate = {
      ...requestBody,
      invoiceId,
      receivedById,
    };

    const validation = recordPaymentSchema.safeParse(payloadToValidate);
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
    return await this.billingService.processPayment(
      invoiceId,
      validation.data,
      receivedById,
    );
  }
  /**
   * Get all invoices for a patient using their MRN
   */
  @Get("patient/mrn/{mrn}")
  @Security("jwt")
  @SuccessResponse(200, "Invoices retrieved by MRN")
  public async getInvoicesByMrn(
    @Path() mrn: string,
  ): Promise<InvoiceResponseDTO[]> {
    return await this.billingService.getInvoicesByMrn(mrn);
  }
}
