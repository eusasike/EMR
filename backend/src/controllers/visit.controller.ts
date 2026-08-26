import {
  Controller,
  Route,
  Post,
  Put,
  Get,
  Body,
  Path,
  Request,
  SuccessResponse,
  Response,
  Security,
  Tags,
} from "tsoa";
import { VisitService } from "../service/visit/visit.service";
import {
  CreateVisitDTO,
  UpdateVisitDTO,
  VisitResponseDTO,
  CheckInVisitZodSchema,
  UpdateVisitZodSchema,
} from "../models/visit/visit.model";
import { VisitPriority, VisitStatus, VisitType } from "@prisma/client";

export interface ErrorResponseDTO {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

@Tags("Patient Visits")
@Route("api/v1/visits")
@Security("jwt", ["NURSE", "ADMIN", "DOCTOR"])
export class VisitController extends Controller {
  private visitService: VisitService;

  constructor() {
    super();
    this.visitService = new VisitService();
  }

  /**
   * Check in a patient for a visit.
   * `attendingId` and `facilityId` are extracted automatically from the authenticated user context.
   */
  @Post()
  @SuccessResponse("201", "Created")
  @Response("400", "Validation or Business Logic Error")
  @Response("401", "Unauthorized")
  @Response("404", "Patient Not Found")
  public async createVisit(
    @Request() req: any,
    @Body() requestBody: CreateVisitDTO,
  ): Promise<VisitResponseDTO | ErrorResponseDTO> {
    // 1. Guard against undefined/null requestBody (e.g., body parser issues)
    const body = requestBody || ({} as Partial<CreateVisitDTO>);

    // 2. Extract attending ID from JWT user context or body safely
    const attendingId = req.user?.id || body.attendingId;

    // 3. Extract facility ID from JWT user context or request header
    const facilityId =
      req.user?.facilityId ||
      requestBody.facilityId ||
      req.user?.facilityIds?.[0] ||
      (req.headers?.["x-facility-id"] as string);

    // 4. Ensure both authentication and facility context exist
    if (!attendingId) {
      this.setStatus(401);
      return {
        success: false,
        message: "Unauthorized: Missing attending user authentication context",
      };
    }

    if (!facilityId) {
      this.setStatus(400);
      return {
        success: false,
        message: "Bad Request: Missing facility context assignment",
      };
    }

    // 5. Inject extracted attendingId prior to Zod validation
    const payloadToValidate = {
      ...body,
      attendingId: body.attendingId || attendingId,
    };

    const validation = CheckInVisitZodSchema.safeParse(payloadToValidate);
    if (!validation.success) {
      this.setStatus(400);
      return {
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    try {
      const visitPayload: CreateVisitDTO = {
        ...validation.data,
        visitType: validation.data.visitType as VisitType,
        priority: validation.data.priority as VisitPriority,
        status:
          (validation.data.status as VisitStatus) || VisitStatus.IN_PROGRESS,
        attendingId,
        facilityId,
      };

      const visit = await this.visitService.createVisit(visitPayload);
      this.setStatus(201);
      return {
        success: true,
        message: "Patient visit opened successfully",
        data: visit,
      };
    } catch (error: any) {
      this.setStatus(error.statusCode || error.status || 400);
      return { success: false, message: error.message };
    }
  }

  /**
   * Update clinical encounter details or status on an active visit.
   */
  @Put("{id}")
  @Response("400", "Validation Error")
  @Response("404", "Visit Not Found")
  public async updateVisit(
    @Path() id: string,
    @Body() requestBody: UpdateVisitDTO,
  ): Promise<VisitResponseDTO | ErrorResponseDTO> {
    const body = requestBody || {};
    const validation = UpdateVisitZodSchema.safeParse(body);
    if (!validation.success) {
      this.setStatus(400);
      return {
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    try {
      const updatePayload: UpdateVisitDTO = {
        ...validation.data,
        ...(validation.data.status && {
          status: validation.data.status as VisitStatus,
        }),
        ...(validation.data.priority && {
          priority: validation.data.priority as VisitPriority,
        }),
      };

      const updatedVisit = await this.visitService.updateVisit(
        id,
        updatePayload,
      );
      return {
        success: true,
        message: "Visit record updated successfully",
        data: updatedVisit,
      };
    } catch (error: any) {
      this.setStatus(error.statusCode || error.status || 404);
      return { success: false, message: error.message };
    }
  }

  /**
   * Retrieve visit details by visit ID.
   */
  @Get("{id}")
  @Response("404", "Visit Not Found")
  public async getVisitById(@Path() id: string) {
    try {
      const visit = await this.visitService.getVisitById(id);
      return { success: true, data: visit };
    } catch (error: any) {
      this.setStatus(error.statusCode || error.status || 404);
      return { success: false, message: error.message || "Visit not found" };
    }
  }

  /**
   * Retrieve all visit records for a patient by MRN.
   */
  @Get("patient/{mrn}")
  @Response("404", "Patient Not Found")
  public async getVisitsByPatient(@Request() req: any, @Path() mrn: string) {
    try {
      const facilityId =
        req.user?.facilityId ||
        req.user?.facilityIds?.[0] ||
        (req.headers?.["x-facility-id"] as string);

      const visits = await this.visitService.getVisitsByMrn(mrn, facilityId);
      return { success: true, count: visits.length, data: visits };
    } catch (error: any) {
      this.setStatus(error.statusCode || error.status || 404);
      return {
        success: false,
        message: error.message || "Patient visits not found",
      };
    }
  }
  //update completion of the visit
  @Put("{id}/complete")
  @Response("404", "Visit Not Found")
  public async completeVisit(@Path() id: string) {
    try {
      const completedVisit = await this.visitService.updateVisitStatus(
        id,
        VisitStatus.COMPLETED,
      );
      return {
        success: true,
        message: "Visit record updated successfully",
        data: completedVisit,
      };
    } catch (error: any) {
      this.setStatus(error.statusCode || error.status || 404);
      return { success: false, message: error.message };
    }
  }
}
