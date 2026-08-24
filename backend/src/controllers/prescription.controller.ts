import {
  Controller,
  Route,
  Post,
  Get,
  Body,
  SuccessResponse,
  Response,
  Tags,
  Request,
  Security,
} from "tsoa";
import express from "express";
import {
  CreatePrescriptionDTO,
  createPrescriptionSchema,
} from "../models/prescription/prescription.model";
import { PrescriptionService } from "../service/clinical/prescription.service";

@Tags("Prescriptions")
@Route("api/v1/prescriptions")
export class PrescriptionController extends Controller {
  private prescriptionService = new PrescriptionService();

  @Security("jwt")
  @Post()
  @SuccessResponse("201", "Created")
  @Response(400, "Bad Request - Validation Error")
  public async createPrescription(
    @Request() request: express.Request,
    @Body() requestBody: CreatePrescriptionDTO,
  ) {
    const validatedData = createPrescriptionSchema.parse(requestBody);
    const prescribedById = (request as any).user.id; // From JWT middleware

    this.setStatus(201);
    return await this.prescriptionService.createPrescription(
      validatedData,
      prescribedById,
    );
  }

  @Security("jwt")
  @Get("pending")
  @SuccessResponse("200", "OK")
  public async getPendingPrescriptions() {
    return await this.prescriptionService.getPendingPrescriptions();
  }
}
