import {
  Controller,
  Route,
  Post,
  Get,
  Path,
  Body,
  SuccessResponse,
  Response,
  Security,
  Tags,
} from "tsoa";
import { PaymentService } from "../service/billing/payment.service";
import {
  ProcessPaymentDTO,
  ProcessPaymentZodSchema,
  PaymentResponseData,
  PaymentDTO,
} from "../models/billing/payment.model";
import { ApiResponse, ApiListResponse } from "../util/apiResponse";

@Tags("Payments & Cashier")
@Route("api/payments")
export class PaymentController extends Controller {
  private paymentService: PaymentService;

  constructor() {
    super();
    this.paymentService = new PaymentService();
  }

  /**
   * Record a payment (Cash, Mobile Money, Insurance) against an invoice
   */
  @Security("jwt")
  @SuccessResponse("201", "Payment processed successfully")
  @Response("400", "Validation failed or amount exceeds balance")
  @Response("404", "Invoice or Cashier not found")
  @Post()
  public async processPayment(
    @Body() requestBody: ProcessPaymentDTO,
  ): Promise<ApiResponse<PaymentResponseData>> {
    ProcessPaymentZodSchema.parse(requestBody);
    const data = await this.paymentService.processPayment(requestBody);

    this.setStatus(201);
    return {
      success: true,
      message: "Payment recorded and invoice balance updated successfully",
      data,
    };
  }

  /**
   * Get payment history for a specific invoice
   */
  @Security("jwt")
  @SuccessResponse("200", "Payments retrieved successfully")
  @Get("invoice/{invoiceId}")
  public async getPaymentsByInvoice(
    @Path() invoiceId: string,
  ): Promise<ApiListResponse<PaymentDTO>> {
    const data = await this.paymentService.getPaymentsByInvoiceId(invoiceId);
    return {
      success: true,
      count: data.length,
      data,
    };
  }
}
