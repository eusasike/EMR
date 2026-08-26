import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Route,
  Tags,
  SuccessResponse,
  Response,
  Security,
  Request,
  Put,
  Path,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import {
  RegisterPatientDTO,
  PatientResponseDTO,
  PaginatedPatientsResponseDTO,
  RegisterPatientZodSchema,
  PatientQueryZodSchema,
  PatientListResponse,
  UpdatePatientDTO,
} from "../models/patient/patient.model";
import { PatientService } from "../service/patient/patient.service";
import { JwtPayload } from "../middlewares/authenticate";

@Route("api/v1/patients")
@Tags("Patient Management")
@Security("jwt", ["NURSE", "ADMIN", "DOCTOR"])
export class PatientController extends Controller {
  private patientService: PatientService;

  constructor() {
    super();
    this.patientService = new PatientService();
  }

  @Post("register")
  @SuccessResponse("201", "Patient Registered Successfully")
  @Response("400", "Bad Request / Validation Error")
  @Response("401", "Unauthorized")
  @Response("500", "Internal Server Error")
  public async registerPatient(
    @Body() requestBody: RegisterPatientDTO,
    @Request() req: ExpressRequest,
  ): Promise<PatientResponseDTO> {
    // 1. Extract and validate user session & facility context from JWT
    const currentUser = (req as any).user as JwtPayload;
    if (!currentUser || !currentUser.facilityIds) {
      this.setStatus(401);
      return {
        success: false,
        message: "Unauthorized: Missing active facility context in session",
        data: null as any,
      };
    }

    // 2. Runtime validation
    const validationResult = RegisterPatientZodSchema.safeParse(requestBody);
    if (!validationResult.success) {
      this.setStatus(400);
      const errorMessages = validationResult.error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ");

      return {
        success: false,
        message: `Validation failed: ${errorMessages}`,
        data: null as any,
      };
    }

    // 3. Delegate execution with facility scope
    const patient = await this.patientService.registerPatient(
      validationResult.data,
      currentUser.id,
      currentUser.facilityIds[0],
    );

    this.setStatus(201);
    return {
      success: true,
      message: "Patient registered successfully",
      data: patient,
    };
  }

  @Get("lookup")
  @SuccessResponse("200", "Patients Fetched Successfully")
  @Response("400", "Bad Request - Missing query parameters")
  @Response("401", "Unauthorized")
  public async lookupPatients(
    @Request() req: ExpressRequest,
    @Query() mrn?: string,
    @Query() firstName?: string,
    @Query() lastName?: string,
  ): Promise<PatientListResponse> {
    const currentUser = (req as any).user as JwtPayload;
    if (!currentUser || !currentUser.facilityIds) {
      this.setStatus(401);
      return {
        success: false,
        count: 0,
        data: [],
        message: "Unauthorized: Missing facility context",
      };
    }

    if (!mrn && !firstName && !lastName) {
      this.setStatus(400);
      return {
        success: false,
        count: 0,
        data: [],
        message:
          "At least one parameter (mrn, firstName, or lastName) must be provided.",
      };
    }

    const patients = await this.patientService.searchPatients({
      mrn,
      firstName,
      lastName,
      facilityId: currentUser.facilityIds[0],
    });

    return {
      success: true,
      count: patients.length,
      data: patients,
    };
  }

  @Get("")
  @SuccessResponse("200", "OK")
  @Response("400", "Invalid Query Parameters")
  @Response("401", "Unauthorized")
  public async getPatients(
    @Request() req: ExpressRequest,
    @Query() page?: number,
    @Query() limit?: number,
    @Query() search?: string,
    @Query() gender?: "MALE" | "FEMALE" | "OTHER",
    @Query() sortBy?: "createdAt" | "lastName" | "mrn",
    @Query() sortOrder?: "asc" | "desc",
  ): Promise<PaginatedPatientsResponseDTO> {
    const currentUser = (req as any).user as JwtPayload;
    if (!currentUser || !currentUser.facilityIds) {
      this.setStatus(401);
      throw new Error("Unauthorized: Missing facility context");
    }

    const queryValidation = PatientQueryZodSchema.safeParse({
      page,
      limit,
      search,
      gender,
      sortBy,
      sortOrder,
    });

    if (!queryValidation.success) {
      this.setStatus(400);
      throw new Error(
        `Invalid query filters: ${queryValidation.error.issues.map((e) => e.message).join(", ")}`,
      );
    }

    const result = await this.patientService.getPatients(
      queryValidation.data,
      currentUser.facilityIds[0],
    );

    this.setStatus(200);
    return result;
  }
  //update patient
  @Put(":id")
  @SuccessResponse("200", "Patient Updated Successfully")
  @Response("400", "Bad Request / Validation Error")
  @Response("401", "Unauthorized")
  @Response("500", "Internal Server Error")
  public async updatePatient(
    @Path() id: string,
    @Body() requestBody: UpdatePatientDTO,
  ): Promise<PatientResponseDTO> {
    // Runtime validation
    const validationResult = RegisterPatientZodSchema.safeParse(requestBody);
    if (!validationResult.success) {
      this.setStatus(400);
      return {
        success: false,
        message: `Validation failed: ${validationResult.error.issues
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join("; ")}`,
        data: null as any,
      };
    }

    // 3. Delegate execution with facility scope
    const patient = await this.patientService.updatePatient(
      id,
      validationResult.data,
    );

    this.setStatus(200);
    return {
      success: true,
      message: "Patient updated successfully",
      data: patient,
    };
  }
}
