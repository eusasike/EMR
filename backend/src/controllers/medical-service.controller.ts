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
  createMedicalServiceSchema,
  updateMedicalServiceSchema,
  CreatePrescriptionInput,
  createPrescriptionSchema,
} from "../models/clinical/medical-service.model";
import { UnauthorizedError } from "../util/custom-error";

interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    role: string;
    facilityId?: string;
  };
}

@Route("api/v1/medical-services")
@Tags("Medical Services")
export class MedicalServiceController extends Controller {
  private medicalServiceService = new MedicalServiceService();

  /**
   * Create a new medical service definition (Admin only) - Automatically scoped to admin's facility
   */
  @Security("jwt", ["ADMIN"])
  @SuccessResponse("201", "Created")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("409", "Service Already Exists")
  @Post("")
  public async createService(
    @Request() request: AuthenticatedRequest,
    @Body() requestBody: Omit<CreateMedicalServiceInput, "facilityId">,
  ) {
    const facilityId =
      (request.headers["x-facility-id"] as string) || request.user?.facilityId;

    if (!facilityId) {
      throw new UnauthorizedError("USER_FACILITY_NOT_FOUND_IN_SESSION");
    }

    const payloadToValidate = {
      ...requestBody,
      facilityId,
    };

    if (!createMedicalServiceSchema) {
      throw new Error(
        "CRITICAL: createMedicalServiceSchema is undefined. Check your file imports.",
      );
    }

    const validation = createMedicalServiceSchema.safeParse(payloadToValidate);
    if (!validation.success) {
      this.setStatus(400);
      return {
        success: false,
        message: `Validation failed: ${validation.error.issues
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join("; ")}`,
        data: null as any,
      };
    }

    this.setStatus(201);
    return await this.medicalServiceService.create(validation.data);
  }

  /**
   * Retrieve a paginated and searchable list of medical services for the user's facility
   */
  @Get("")
  @Security("jwt")
  public async getServices(
    @Request() request: AuthenticatedRequest,
    @Query() page?: number,
    @Query() limit?: number,
    @Query() category?: string,
    @Query() search?: string,
  ) {
    const facilityId = request.user?.facilityId;

    const query: MedicalServiceQueryInput = {
      facilityId,
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
  @Security("jwt")
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
    @Request() request: AuthenticatedRequest,
    @Path() id: string,
    @Body() requestBody: UpdateMedicalServiceInput,
  ) {
    const incomingData =
      requestBody && Object.keys(requestBody).length > 0
        ? requestBody
        : request.body;

    if (
      !incomingData ||
      typeof incomingData !== "object" ||
      Object.keys(incomingData).length === 0
    ) {
      this.setStatus(400);
      return {
        success: false,
        message: "Request body is missing or invalid JSON format.",
        data: null,
      };
    }

    const validation = updateMedicalServiceSchema.safeParse(incomingData);
    if (!validation.success) {
      this.setStatus(400);
      return {
        success: false,
        message: `Validation failed: ${validation.error.issues
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join("; ")}`,
        data: null,
      };
    }

    const facilityId =
      (request.headers["x-facility-id"] as string) || request.user?.facilityId;

    if (!facilityId) {
      throw new UnauthorizedError("USER_FACILITY_NOT_FOUND_IN_SESSION");
    }

    const payload = {
      ...validation.data,
      facilityId,
    };

    return await this.medicalServiceService.update(id, payload);
  }

  /**
   * Record a medical service provided to a patient visit
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
   * Update an existing provided service item
   */
  @Security("jwt")
  @Response("401", "Unauthorized")
  @Response("404", "Provided Service Not Found")
  @Put("provide/{id}")
  public async updateProvidedService(
    @Request() request: AuthenticatedRequest,
    @Path() id: string,
    @Body() requestBody: Partial<ProvideServiceInput>,
  ) {
    const providedById = request.user?.id;

    if (!providedById) {
      throw new UnauthorizedError("AUTHENTICATION_REQUIRED");
    }

    const payload = {
      ...requestBody,
      providedById,
    };

    return await this.medicalServiceService.updateProvidedService(id, payload);
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
   * Get the latest active visit and its provided services by MRN
   */
  @Get("visit/latest/mrn/{mrn}")
  @Security("jwt")
  @SuccessResponse(200, "Latest active visit retrieved by MRN")
  public async getLatestVisitByMrn(@Path() mrn: string) {
    return await this.medicalServiceService.getLatestVisitByMrn(mrn);
  }
  // 2. Update your Controller method to use the validated input
  @Security("jwt")
  @SuccessResponse("201", "Created")
  @Post("prescriptions")
  public async createPrescription(
    @Request() request: AuthenticatedRequest,
    @Body() requestBody: CreatePrescriptionInput,
  ) {
    const prescribedById = request.user?.id;
    if (!prescribedById) {
      throw new UnauthorizedError("AUTHENTICATION_REQUIRED");
    }

    const validation = createPrescriptionSchema.safeParse(requestBody);
    if (!validation.success) {
      this.setStatus(400);
      return {
        success: false,
        message: `Validation failed: ${validation.error.issues
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join("; ")}`,
        data: null,
      };
    }

    this.setStatus(201);
    return await this.medicalServiceService.createPrescription(
      prescribedById,
      validation.data,
    );
  }
}
