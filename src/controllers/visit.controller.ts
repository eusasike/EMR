import {
  Controller,
  Route,
  Post,
  Put,
  Get,
  Body,
  Path,
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

export interface ErrorResponseDTO {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

@Tags("Patient Visits")
@Route("api/v1/visits")
@Security("jwt", ["NURSE", "ADMIN"])
export class VisitController extends Controller {
  private visitService: VisitService;

  constructor() {
    super();
    this.visitService = new VisitService();
  }

  @Post()
  @SuccessResponse("201", "Created")
  @Response("400", "Validation or Business Logic Error")
  @Response("404", "Patient or Staff Not Found")
  public async createVisit(
    @Body() requestBody: CreateVisitDTO,
  ): Promise<VisitResponseDTO | ErrorResponseDTO> {
    const validation = CheckInVisitZodSchema.safeParse(requestBody);
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
      const visit = await this.visitService.createVisit(validation.data);
      this.setStatus(201);
      return {
        success: true,
        message: "Patient visit opened successfully",
        data: visit,
      };
    } catch (error: any) {
      this.setStatus(error.status || 400);
      return { success: false, message: error.message };
    }
  }

  @Put("{id}")
  @Response("400", "Validation Error")
  @Response("404", "Visit Not Found")
  public async updateVisit(
    @Path() id: string,
    @Body() requestBody: UpdateVisitDTO,
  ): Promise<VisitResponseDTO | ErrorResponseDTO> {
    const validation = UpdateVisitZodSchema.safeParse(requestBody);
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
      const updatedVisit = await this.visitService.updateVisit(
        id,
        validation.data,
      );
      return {
        success: true,
        message: "Visit record updated successfully",
        data: updatedVisit,
      };
    } catch (error: any) {
      this.setStatus(error.status || 404);
      return { success: false, message: error.message };
    }
  }

  @Get("{id}")
  @Response("404", "Visit Not Found")
  public async getVisitById(@Path() id: string) {
    try {
      const visit = await this.visitService.getVisitById(id);
      return { success: true, data: visit };
    } catch (error: any) {
      this.setStatus(404);
      return { success: false, message: "Visit not found" };
    }
  }

  @Get("patient/{mrn}")
  public async getVisitsByPatient(@Path() mrn: string) {
    const visits = await this.visitService.getVisitsByMrn(mrn);
    return { success: true, count: visits.length, data: visits };
  }
}
