// controllers/pharmacy.controller.ts
import {
  Controller,
  Route,
  Get,
  Post,
  Put,
  Body,
  Path,
  SuccessResponse,
  Response,
  Tags,
  Security,
  Request,
  Query,
} from "tsoa";
import { PharmacyService } from "../service/phamarcy/inventory.service";
import express from "express";

import {
  createProductSchema,
  updateProductSchema,
  createBatchSchema,
  createDispenseRecordSchema,
  CreateProductDTO,
  UpdateProductDTO,
  CreateBatchDTO,
  CreateDispenseRecordDTO,
} from "../models/phamarcy/inventory.model";
import { UnauthorizedError } from "../util/custom-error";

interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    role: string;
    facilityId?: string;
  };
}

@Tags("Pharmacy")
@Route("api/v1/pharmacy")
@Security("jwt")
export class PharmacyController extends Controller {
  private pharmacyService: PharmacyService;

  constructor() {
    super();
    this.pharmacyService = new PharmacyService();
  }

  // ==========================================
  // Product Endpoints
  // ==========================================

  @Security("jwt", ["ADMIN"])
  @SuccessResponse("201", "Created")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("409", "Product Already Exists")
  @Post("products")
  public async createProduct(
    @Request() request: AuthenticatedRequest,
    @Body() requestBody: CreateProductDTO,
  ) {
    const facilityId =
      request.user?.facilityId ||
      (request.headers?.["x-facility-id"] as string);

    if (!facilityId) {
      throw new UnauthorizedError("USER_FACILITY_NOT_FOUND_IN_SESSION");
    }

    const validatedData = createProductSchema.parse(requestBody);

    this.setStatus(201);
    return await this.pharmacyService.createProduct(facilityId, validatedData);
  }

  @Security("jwt")
  @Get("products")
  public async getAllProducts(
    @Request() request: AuthenticatedRequest,
    @Query() page?: number,
    @Query() limit?: number,
    @Query() category?: string,
    @Query() search?: string,
  ) {
    const facilityId =
      request.user?.facilityId ||
      (request.headers?.["x-facility-id"] as string);

    if (!facilityId) {
      this.setStatus(400);
      return {
        success: false,
        message: "Facility ID missing from token session or headers",
        data: null,
      };
    }

    return await this.pharmacyService.getAllProducts(facilityId);
  }

  @Get("products/{id}")
  @Response(404, "Product Not Found")
  public async getProductById(@Path() id: string) {
    return await this.pharmacyService.getProductById(id);
  }

  @Put("products/{id}")
  @Response(400, "Bad Request - Validation Error")
  @Response(404, "Product Not Found")
  public async updateProduct(
    @Path() id: string,
    @Body() requestBody: UpdateProductDTO,
    @Request() request: AuthenticatedRequest,
  ) {
    const facilityId =
      request.user?.facilityId ||
      (request.headers?.["x-facility-id"] as string);

    if (!facilityId) {
      this.setStatus(400);
      return {
        success: false,
        message: "Facility ID missing from token session or headers",
      };
    }

    const validatedData = updateProductSchema.parse(requestBody);
    return await this.pharmacyService.updateProduct(
      id,
      facilityId,
      validatedData,
    );
  }

  // ==========================================
  // Product Batch Endpoints
  // ==========================================

  @Post("batches")
  @SuccessResponse("201", "Created")
  @Response(400, "Bad Request - Validation Error")
  public async createBatch(
    @Body() requestBody: CreateBatchDTO,
    @Request() request: AuthenticatedRequest,
  ) {
    const facilityId =
      request.user?.facilityId ||
      (request.headers?.["x-facility-id"] as string);

    if (!facilityId) {
      this.setStatus(400);
      return {
        success: false,
        message: "Facility ID missing from token session or headers",
      };
    }

    const validatedData = createBatchSchema.parse(requestBody);
    this.setStatus(201);
    return await this.pharmacyService.createBatch(facilityId, validatedData);
  }

  // ==========================================
  // Dispense & Stock Deductions
  // ==========================================

  @Post("dispense")
  @SuccessResponse("201", "Created")
  @Response(400, "Bad Request - Insufficient Stock or Invalid Input")
  public async dispenseProducts(
    @Body() requestBody: CreateDispenseRecordDTO,
    @Request() request: AuthenticatedRequest,
  ) {
    const userId = request.user?.id;
    const facilityId =
      request.user?.facilityId ||
      (request.headers?.["x-facility-id"] as string);

    if (!userId || !facilityId) {
      this.setStatus(401);
      return {
        success: false,
        message: "Unauthorized or missing facility scope",
        data: null,
      };
    }

    const validatedData = createDispenseRecordSchema.parse(requestBody);
    this.setStatus(201);
    return await this.pharmacyService.dispenseProducts(
      facilityId,
      validatedData,
      userId,
    );
  }
  // ==========================================
  // Prescription Dispensing Endpoints
  // ==========================================

  @Security("jwt")
  @Get("dispense/prescriptions")
  public async getPendingPrescriptions(
    @Request() request: AuthenticatedRequest,
    @Query() facilityId?: string,
  ) {
    const activeFacilityId =
      facilityId ||
      request.user?.facilityId ||
      (request.headers?.["x-facility-id"] as string);

    return await this.pharmacyService.getPendingPrescriptions(activeFacilityId);
  }

  @Security("jwt")
  @Get("dispense/prescriptions/mrn/{mrn}")
  public async getPrescriptionsByMrn(
    @Path() mrn: string,
    @Request() request: AuthenticatedRequest,
    @Query() facilityId?: string,
  ) {
    const activeFacilityId =
      facilityId ||
      request.user?.facilityId ||
      (request.headers?.["x-facility-id"] as string);

    return await this.pharmacyService.getPrescriptionsByMrn(
      mrn,
      activeFacilityId,
    );
  }
}
