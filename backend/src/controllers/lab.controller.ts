// src/controllers/lab.controller.ts
import {
  Controller,
  Route,
  Post,
  Put,
  Get,
  Body,
  Path,
  Request,
  Security,
  Tags,
  SuccessResponse,
  Response,
} from "tsoa";
import { LabService } from "../service/lab/lab.service";
import {
  OrderLabServiceDTO,
  RecordLabResultDTO,
  orderLabServiceSchema,
  recordLabResultSchema,
  verifyLabResultSchema,
} from "../models/lab/lab.model";

@Tags("Lab Results")
@Route("api/v1/labs")
export class LabController extends Controller {
  private labService = new LabService();

  /**
   * Order a new lab service for a patient visit.
   */
  @Post("order")
  @Security("jwt")
  @SuccessResponse(201, "Lab Service Ordered")
  @Response(400, "Validation Error or Invalid Input")
  public async orderLab(@Body() requestBody: OrderLabServiceDTO) {
    const validatedData = orderLabServiceSchema.parse(requestBody);
    this.setStatus(201);
    return await this.labService.orderLabService(validatedData);
  }

  /**
   * Record findings, result values, and transition status to COMPLETED.
   */
  @Put("{id}/results")
  @Security("jwt")
  @SuccessResponse(200, "Lab Result Recorded Successfully")
  @Response(400, "Validation Error or Invalid Status Transition")
  @Response(404, "Lab Result Not Found")
  public async recordResult(
    @Path() id: string,
    @Body() requestBody: RecordLabResultDTO,
    @Request() req: any,
  ) {
    // Safely extract the authenticated user ID executing this action
    const userId = req.user?.id || req.user?.userId || req.user?.sub;

    if (!userId) {
      throw new Error("Unauthorized: User ID missing from request context");
    }

    const validatedData = recordLabResultSchema.parse(requestBody);
    return await this.labService.recordResults(id, validatedData, userId);
  }

  /**
   * Final verification of a lab result by a senior technician or doctor.
   * Transitions status to VERIFIED.
   */
  @Put("{id}/verify")
  @Security("jwt")
  @SuccessResponse(200, "Lab Result Verified Successfully")
  @Response(404, "Lab Result Not Found")
  public async verifyResult(
    @Path() id: string,
    @Body() requestBody: { findings?: string },
    @Request() req: any,
  ) {
    // Safely extract the authenticated user ID executing this action
    const userId = req.user?.id || req.user?.userId || req.user?.sub;

    if (!userId) {
      throw new Error("Unauthorized: User ID missing from request context");
    }

    const validatedData = verifyLabResultSchema.parse(requestBody);
    return await this.labService.verifyResult(
      id,
      userId,
      validatedData.findings,
    );
  }

  /**
   * Retrieve the complete lab history for a specific patient visit.
   */
  @Get("visit/{visitId}")
  @Security("jwt")
  @SuccessResponse(200, "Lab Results Retrieved")
  public async getByVisit(@Path() visitId: string) {
    return await this.labService.getResultsByVisit(visitId);
  }
  // 1. Add this endpoint to src/controllers/lab.controller.ts so lab personnel can search by MRN
  /**
   * Fetch lab orders and results for a patient using their MRN
   */
  @Get("patient/mrn/{mrn}")
  @Security("jwt")
  @SuccessResponse(200, "Lab results retrieved by MRN successfully")
  public async getLabResultsByMrn(@Path() mrn: string, @Request() req: any) {
    const facilityId = req.user?.facilityId;
    return await this.labService.getLabResultsByMrn(mrn, facilityId);
  }
}
