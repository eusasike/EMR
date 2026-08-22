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
import { InvoiceService } from "../service/billing/invoice.service";
import {
  GenerateInvoiceDTO,
  GenerateInvoiceZodSchema,
  InvoiceDTO,
} from "../models/billing/invoice.model";
import { ApiResponse } from "../util/apiResponse";

@Tags("Billing & Invoices")
@Route("api/invoices")
export class InvoiceController extends Controller {
  private invoiceService: InvoiceService;

  constructor() {
    super();
    this.invoiceService = new InvoiceService();
  }

  /**
   * Consolidate Services & Medications into an Invoice
   */
  @Security("jwt")
  @SuccessResponse("201", "Invoice generated / updated successfully")
  @Response("400", "Validation failed")
  @Response("404", "Patient visit not found")
  @Post("generate")
  public async generateInvoice(
    @Body() requestBody: GenerateInvoiceDTO,
  ): Promise<ApiResponse<InvoiceDTO>> {
    GenerateInvoiceZodSchema.parse(requestBody);
    const data = await this.invoiceService.generateOrUpdateInvoice(
      requestBody.visitId,
    );

    this.setStatus(201);
    return {
      success: true,
      message:
        "Invoice compiled successfully from services and pharmacy records",
      data,
    };
  }

  /**
   * Retrieve compiled Invoice by Visit ID
   */
  @Security("jwt")
  @SuccessResponse("200", "Invoice retrieved successfully")
  @Response("404", "Invoice not found")
  @Get("visit/{visitId}")
  public async getInvoiceByVisit(
    @Path() visitId: string,
  ): Promise<ApiResponse<InvoiceDTO>> {
    const data = await this.invoiceService.getInvoiceByVisitId(visitId);

    return {
      success: true,
      data,
    };
  }
}
