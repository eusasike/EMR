// controllers/clinical/medical-service.controller.ts
import {
  Controller,
  Route,
  Tags,
  Get,
  Post,
  Put,
  Path,
  Query,
  Body,
  SuccessResponse,
  Response,
  Security,
  Request,
} from "tsoa";
import express from "express";
import { MedicalServiceService } from "../service/clinical/medical-service.service";
import {
  CreateMedicalServiceInput,
  UpdateMedicalServiceInput,
  ProvideServiceInput,
  MedicalServiceQueryInput,
} from "../models/clinical/medical-service.model";
import { UnauthorizedError } from "../util/custom-error";

interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    role: string;
  };
}

@Route("api/v1/medical-services")
@Tags("Medical Services")
export class MedicalServiceController extends Controller {
  private medicalServiceService = new MedicalServiceService();

  /**
   * Create a new medical service definition (Admin only)
   */
  @Security("jwt", ["ADMIN"])
  @SuccessResponse("201", "Created")
  @Response("400", "Bad Request")
  @Response("409", "Service Already Exists")
  @Post("")
  public async createService(@Body() requestBody: CreateMedicalServiceInput) {
    this.setStatus(201);
    return await this.medicalServiceService.create(requestBody);
  }

  /**
   * Retrieve a paginated and searchable list of medical services
   */
  @Get("")
  public async getServices(
    @Query() page?: number,
    @Query() limit?: number,
    @Query() category?: string,
    @Query() search?: string,
  ) {
    const query: MedicalServiceQueryInput = {
      page,
      limit,
      category,
      search,
    };
    return await this.medicalServiceService.findMany(query);
  }

  /**
   * Retrieve a single medical service by ID
   */
  @Response("404", "Medical Service Not Found")
  @Get("{id}")
  public async getServiceById(@Path() id: string) {
    return await this.medicalServiceService.findById(id);
  }

  /**
   * Update medical service details (Admin only)
   */
  @Security("jwt", ["ADMIN"])
  @Response("404", "Medical Service Not Found")
  @Put("{id}")
  public async updateService(
    @Path() id: string,
    @Body() requestBody: UpdateMedicalServiceInput,
  ) {
    return await this.medicalServiceService.update(id, requestBody);
  }

  /**
   * Record a service provided to a patient visit
   */
  @Security("jwt")
  @SuccessResponse("201", "Created")
  @Response("401", "Unauthorized")
  @Response("404", "Patient Visit or Medical Service Not Found")
  @Post("provide")
  public async provideService(
    @Request() request: AuthenticatedRequest,
    @Body() requestBody: Omit<ProvideServiceInput, "providedById">,
  ) {
    const providedById = request.user?.id;

    if (!providedById) {
      throw new UnauthorizedError("AUTHENTICATION_REQUIRED");
    }

    const payload: ProvideServiceInput = {
      ...requestBody,
      providedById,
    };

    this.setStatus(201);
    return await this.medicalServiceService.provideService(
      providedById,
      payload,
    );
  }

  /**
   * Get all provided services for a patient using their MRN
   */
  @Get("patient/mrn/{mrn}")
  @Security("jwt")
  @SuccessResponse(200, "Provided services retrieved by MRN")
  public async getByMrn(@Path() mrn: string) {
    return await this.medicalServiceService.getProvidedServicesByMrn(mrn);
  }

  /**
   * Get the latest visit and its provided services by MRN
   */
  @Get("visit/latest/mrn/{mrn}")
  @Security("jwt")
  @SuccessResponse(200, "Latest visit retrieved by MRN")
  public async getLatestVisitByMrn(@Path() mrn: string) {
    return await this.medicalServiceService.getLatestVisitByMrn(mrn);
  }
}
