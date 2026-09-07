import {
  Controller,
  Route,
  Tags,
  Get,
  Query,
  SuccessResponse,
  Response,
  Security,
  Request,
} from "tsoa";
import express from "express";
import { ReportService } from "../service/report/report";
import { UnauthorizedError } from "../util/custom-error";

interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    role: string;
    facilityId?: string;
  };
}

@Route("api/v1/reports")
@Tags("Reports")
export class ReportController extends Controller {
  private reportService = new ReportService();

  /**
   * Retrieve daily billing, patient services, and revenue reports by date and facility
   */
  @Security("jwt")
  @SuccessResponse("200", "Success")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Get("daily")
  public async getDailyReport(
    @Request() request: AuthenticatedRequest,
    @Query() date: string,
  ): Promise<any> {
    const facilityId =
      (request.headers["x-facility-id"] as string) || request.user?.facilityId;

    if (!facilityId) {
      throw new UnauthorizedError("USER_FACILITY_NOT_FOUND_IN_SESSION");
    }

    if (!date) {
      this.setStatus(400);
      return {
        success: false,
        message: "Date query parameter is required in format YYYY-MM-DD",
        data: [],
      };
    }

    this.setStatus(200);
    return await this.reportService.getDailyReport(facilityId, date);
  }

  /**
   * Retrieve billing, patient services, and revenue reports by custom date range and facility
   */
  @Security("jwt")
  @SuccessResponse("200", "Success")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Get("range")
  public async getReportByDateRange(
    @Request() request: AuthenticatedRequest,
    @Query() startDate: string,
    @Query() endDate: string,
  ): Promise<any> {
    const facilityId =
      (request.headers["x-facility-id"] as string) || request.user?.facilityId;

    if (!facilityId) {
      throw new UnauthorizedError("USER_FACILITY_NOT_FOUND_IN_SESSION");
    }

    if (!startDate || !endDate) {
      this.setStatus(400);
      return {
        success: false,
        message:
          "Both startDate and endDate query parameters are required in format YYYY-MM-DD",
        data: [],
      };
    }

    this.setStatus(200);
    return await this.reportService.getReportByDateRange(
      facilityId,
      startDate,
      endDate,
    );
  }
}
