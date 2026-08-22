// src/controllers/billing.controller.ts

import {
  Controller,
  Get,
  Post,
  Route,
  Path,
  Body,
  Tags,
  Response,
  SuccessResponse,
} from "tsoa";
import { BillingService } from "../service/billing/billing.service";
import {
  CreatePaymentDTO,
  InvoiceResponseDTO,
} from "../models/billing/billing.model";

@Route("api/invoices")
@Tags("Billing & Invoices")
export class BillingController extends Controller {
  private billingService = new BillingService();

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
}
