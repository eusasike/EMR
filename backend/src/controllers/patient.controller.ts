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
} from "tsoa";
import {
  RegisterPatientDTO,
  PatientResponseDTO,
  PaginatedPatientsResponseDTO,
  RegisterPatientZodSchema,
  PatientQueryZodSchema,
  PatientListResponse,
} from "../models/patient/patient.model";
import { PatientService } from "../service/patient/patient.service";
import { JwtPayload } from "../middlewares/authenticate";

@Route("api/v1/patients")
@Tags("Patient Management")
@Security("jwt", ["NURSE", "ADMIN"])
export class PatientController extends Controller {
  private patientService: PatientService;

  constructor() {
    super();
    this.patientService = new PatientService();
  }

  @Post("register")
  @SuccessResponse("201", "Patient Registered Successfully")
  @Response("400", "Bad Request / Validation Error")
  @Response("500", "Internal Server Error")
  public async registerPatient(
    @Body() requestBody: RegisterPatientDTO,
    @Request() req: Express.Request, // 👈 Declare req here as a parameter!
  ): Promise<PatientResponseDTO> {
    // 1. Enforce Zod runtime validation & sanitization
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

    // 2. Delegate execution to PatientService
    const currentuser = (req as any).user as JwtPayload;
    if (!currentuser) {
      this.setStatus(401);
      return {
        success: false,
        message: "Unauthorized",
        data: null as any,
      };
    }
    const patient = await this.patientService.registerPatient(
      validationResult.data,
      currentuser.id,
    );

    this.setStatus(201);
    return {
      success: true,
      message: "Patient registered successfully",
      data: patient,
    };
  }

  /**
   * Retrieve patient details by Medical Record Number (MRN).
   * Checks Redis cache first before falling back to PostgreSQL.
   */
  @Get("lookup")
  @Security("jwt", ["NURSE", "DOCTOR", "ADMIN"])
  @SuccessResponse("200", "Patients Fetched Successfully")
  @Response<PatientListResponse>(
    "400",
    "Bad Request - Missing query parameters",
  )
  public async lookupPatients(
    @Query() mrn?: string,
    @Query() firstName?: string,
    @Query() lastName?: string,
  ): Promise<PatientListResponse> {
    // 1. Validate that at least one filter query parameter was supplied
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

    // 2. Fetch matches from Service Layer
    const patients = await this.patientService.searchPatients({
      mrn,
      firstName,
      lastName,
    });

    // 3. Return structured response with count and array
    return {
      success: true,
      count: patients.length,
      data: patients,
    };
  }
  /**
   * Search and list patients with pagination and filtering.
   */
  @Get("")
  @Security("jwt", ["NURSE", "ADMIN"]) // 🔒 Enforces Nurse role via JWT
  @SuccessResponse("200", "OK")
  @Response("400", "Invalid Query Parameters")
  public async getPatients(
    @Query() page?: number,
    @Query() limit?: number,
    @Query() search?: string,
    @Query() gender?: "MALE" | "FEMALE" | "OTHER",
    @Query() sortBy?: "createdAt" | "lastName" | "mrn",
    @Query() sortOrder?: "asc" | "desc",
  ): Promise<PaginatedPatientsResponseDTO> {
    // 1. Validate query filters
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

    // 2. Query paginated results
    const result = await this.patientService.getPatients(queryValidation.data);

    this.setStatus(200);
    return result;
  }
}
