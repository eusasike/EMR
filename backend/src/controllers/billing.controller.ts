import {
  Controller,
  Get,
  Post,
  Route,
  Path,
  Body,
  Request,
  Tags,
  Response,
  SuccessResponse,
} from "tsoa";
import { BillingService } from "../service/billing/billing.service";
import {
  CreateInvoiceDTO,
  CreatePaymentDTO,
  InvoiceResponseDTO,
} from "../models/billing/billing.model";

interface AuthenticatedRequest extends Express.Request {
  headers: any;
  user?: {
    facilityId?: string;
  };
}

@Route("api/v1/invoices")
@Tags("Billing & Invoices")
export class BillingController extends Controller {
  private billingService = new BillingService();

  /**
   * Create a new itemized invoice for medical services or pharmacy items
   */
  @Post()
  @SuccessResponse(201, "Invoice Created Successfully")
  @Response(400, "Invalid invoice payload")
  public async createInvoice(
    @Request() request: AuthenticatedRequest,
    @Body() requestBody: CreateInvoiceDTO,
  ): Promise<InvoiceResponseDTO> {
    const facilityId =
      (request.headers["x-facility-id"] as string) || request.user?.facilityId;

    if (!facilityId) {
      this.setStatus(401);
      throw new Error("USER_FACILITY_NOT_FOUND_IN_SESSION");
    }

    this.setStatus(201);
    return this.billingService.createInvoice(facilityId, requestBody);
  }

  /**
   * Get invoice details by ID, including line items and payment history
   */
  @Get("{invoiceId}")
  @Response(404, "Invoice not found")
  public async getInvoice(
    @Path() invoiceId: string,
  ): Promise<InvoiceResponseDTO> {
    return this.billingService.getInvoiceById(invoiceId);
  }

  /**
   * Process a payment against an outstanding invoice
   */
  @Post("{invoiceId}/payments")
  @SuccessResponse(201, "Payment Processed Successfully")
  @Response(400, "Invalid payment amount or invoice already paid")
  @Response(404, "Invoice not found")
  public async recordPayment(
    @Path() invoiceId: string,
    @Body() requestBody: CreatePaymentDTO,
  ): Promise<InvoiceResponseDTO> {
    this.setStatus(201);
    return this.billingService.processPayment(invoiceId, requestBody);
  }

  /**
   * Get all invoices for a patient using their MRN
   */
  @Get("patient/mrn/{mrn}")
  @Response(404, "Invoices not found")
  public async getInvoicesByMrn(
    @Path() mrn: string,
  ): Promise<InvoiceResponseDTO[]> {
    return this.billingService.getInvoicesByMrn(mrn);
  }
}
