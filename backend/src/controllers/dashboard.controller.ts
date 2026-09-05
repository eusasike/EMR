import {
  Controller,
  Route,
  Tags,
  Get,
  SuccessResponse,
  Response,
  Security,
  Request,
} from "tsoa";
import express from "express";
import { FacilityDashboardService } from "../service/dashboard/dashboard.service";
import { UnauthorizedError } from "../util/custom-error";

interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    role: string;
    facilityId?: string;
  };
}

@Route("api/v1/dashboard")
@Tags("Dashboard")
export class DashboardController extends Controller {
  private dashboardService = new FacilityDashboardService();

  /**
   * Get facility-based dashboard operational metrics, stock summary, and recent visits
   */
  @Get("overview")
  @Security("jwt")
  @SuccessResponse("200", "Dashboard overview retrieved successfully")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  public async getDashboardOverview(
    @Request() request: AuthenticatedRequest,
  ): Promise<any> {
    const facilityId =
      (request.headers["x-facility-id"] as string) || request.user?.facilityId;

    if (!facilityId) {
      throw new UnauthorizedError("USER_FACILITY_NOT_FOUND_IN_SESSION");
    }

    return await this.dashboardService.getFacilityDashboard(facilityId);
  }
}
