// src/controllers/billing/insurance.controller.ts

import {
  Controller,
  Route,
  Post,
  Patch,
  Get,
  Body,
  Path,
  Tags,
  Security,
  Response,
} from "tsoa";
import { InsuranceService } from "../service/billing/insuarance.service";
import {
  CreatePatientInsuranceDTO,
  CreateInsuranceClaimDTO,
  ProcessInsuranceClaimDTO,
} from "../models/billing/insuarance.model";

@Tags("Insurance & Claims")
@Route("api/billing")
export class InsuranceController extends Controller {
  private insuranceService = new InsuranceService();

  /**
   * Register insurance details for a patient
   */
  @Security("jwt")
  @Post("insurance")
  @Response(201, "Insurance Registered Successfully")
  public async registerInsurance(
    @Body() requestBody: CreatePatientInsuranceDTO,
  ) {
    this.setStatus(201);
    return await this.insuranceService.registerInsurance(requestBody);
  }

  /**
   * Retrieve active insurance policies for a patient (Cached in Redis)
   */
  @Security("jwt")
  @Get("insurance/patient/{patientId}")
  public async getPatientInsurances(@Path() patientId: string) {
    return await this.insuranceService.getPatientInsurances(patientId);
  }

  /**
   * Submit an insurance claim for pre-authorization or payout
   */
  @Security("jwt")
  @Post("claims")
  @Response(201, "Claim Submitted Successfully")
  public async createClaim(@Body() requestBody: CreateInsuranceClaimDTO) {
    this.setStatus(201);
    return await this.insuranceService.createClaim(requestBody);
  }

  /**
   * Approve, partially approve, or reject an insurance claim
   */
  @Security("jwt")
  @Patch("claims/{claimId}/process")
  @Response(200, "Claim Processed Successfully")
  public async processClaim(
    @Path() claimId: string,
    @Body() requestBody: ProcessInsuranceClaimDTO,
  ) {
    return await this.insuranceService.processClaim(claimId, requestBody);
  }
}
