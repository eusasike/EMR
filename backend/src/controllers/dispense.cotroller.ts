// src/controllers/phamarcy/dispense.controller.ts
import {
  Controller,
  Route,
  Tags,
  Get,
  Post,
  Body,
  Security,
  Request,
  Path,
  Query,
  SuccessResponse,
  Response,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { DispenseService } from "../service/phamarcy/dispense.service";
import {
  CreateDispenseRecordDtoSchema,
  type CreateDispenseRecordDTO,
} from "../models/phamarcy/dispense.model";

interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    id: string;
    facilityId?: string;
    [key: string]: any;
  };
}

const dispenseService = new DispenseService();

@Route("api/pharmacy/dispense")
@Tags("Pharmacy Dispense")
export class DispenseController extends Controller {
  @Get("prescriptions")
  @Security("JWT")
  @SuccessResponse("200", "Success")
  @Response("401", "Unauthorized")
  public async getPendingPrescriptions(
    @Request() request: AuthenticatedRequest,
    @Query() facilityId?: string,
  ): Promise<any> {
    const resolvedFacilityId =
      facilityId ||
      request.user?.facilityId ||
      (request.headers?.["x-facility-id"] as string);

    return await dispenseService.getPendingPrescriptions(resolvedFacilityId);
  }

  @Get("{id}")
  @Security("JWT")
  @SuccessResponse("200", "Success")
  @Response("401", "Unauthorized")
  @Response("404", "Not Found")
  public async getDispenseRecordById(@Path() id: string): Promise<any> {
    const record = await dispenseService.getDispenseRecordById(id);
    if (!record) {
      this.setStatus(404);
      throw new Error("Dispense record not found");
    }
    return record;
  }

  @Security("JWT", ["ADMIN", "PHARMACIST"])
  @SuccessResponse("201", "Created")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Post()
  public async dispenseItems(
    @Request() request: AuthenticatedRequest,
    @Body() requestBody: CreateDispenseRecordDTO,
  ): Promise<any> {
    const facilityId =
      request.user?.facilityId ||
      (request.headers?.["x-facility-id"] as string) ||
      requestBody.facilityId;

    if (!facilityId) {
      this.setStatus(400);
      throw new Error("USER_FACILITY_NOT_FOUND_IN_SESSION");
    }

    const userId = request.user?.id || requestBody.dispensedById;
    if (!userId) {
      this.setStatus(401);
      throw new Error("UNAUTHORIZED_USER_ID_MISSING");
    }

    const validatedData = CreateDispenseRecordDtoSchema.parse({
      ...requestBody,
      facilityId,
      dispensedById: userId,
    });

    this.setStatus(201);
    return await dispenseService.dispensePrescription(validatedData);
  }

  // src/controllers/phamarcy/dispense.controller.ts
  @Get("prescriptions/mrn/{mrn}")
  @Security("JWT")
  @SuccessResponse("200", "Success")
  @Response("404", "Not Found")
  public async getPrescriptionsByMrn(
    @Request() request: AuthenticatedRequest,
    @Path() mrn: string,
    @Query() facilityId?: string,
  ): Promise<any> {
    const resolvedFacilityId =
      facilityId ||
      request.user?.facilityId ||
      (request.headers?.["x-facility-id"] as string);

    return await dispenseService.getPrescriptionsByMrn(mrn, resolvedFacilityId);
  }
}
