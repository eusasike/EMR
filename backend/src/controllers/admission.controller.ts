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
} from "tsoa";
import { AdmissionService } from "../service/admission/admission.service";
import {
  CreateWardDTO,
  CreateBedDTO,
  AdmitPatientDTO,
  DischargePatientDTO,
} from "../models/admission/admission.model";

@Tags("Wards & Admissions")
@Route("api/v1/admissions")
@Security("jwt")
export class AdmissionController extends Controller {
  private admissionService: AdmissionService;

  constructor() {
    super();
    this.admissionService = new AdmissionService();
  }

  /**
   * Register a new hospital Ward
   */
  @Post("wards")
  @SuccessResponse("201", "Created")
  @Response("400", "Bad Request")
  public async createWard(@Body() requestBody: CreateWardDTO): Promise<any> {
    this.setStatus(201);
    return await this.admissionService.createWard(requestBody);
  }

  /**
   * Get all Wards (with linked Beds)
   */
  @Get("wards")
  @SuccessResponse("200", "OK")
  public async getAllWards(): Promise<any> {
    return await this.admissionService.getAllWards();
  }

  /**
   * Add a new Bed to a Ward
   */
  @Post("beds")
  @SuccessResponse("201", "Created")
  @Response("400", "Bad Request")
  public async createBed(@Body() requestBody: CreateBedDTO): Promise<any> {
    this.setStatus(201);
    return await this.admissionService.createBed(requestBody);
  }

  /**
   * Admit a patient to an available Bed and trigger RabbitMQ event
   */
  @Post("admit")
  @SuccessResponse("201", "Created")
  @Response("400", "Bed unavailable or bad request")
  public async admitPatient(
    @Body() requestBody: AdmitPatientDTO,
  ): Promise<any> {
    try {
      this.setStatus(201);
      return await this.admissionService.admitPatient(requestBody);
    } catch (error: any) {
      this.setStatus(400);
      return { message: error.message || "Failed to admit patient." };
    }
  }

  /**
   * Discharge an admitted patient, release Bed, and publish billing event
   */
  @Put("{admissionId}/discharge")
  @SuccessResponse("200", "OK")
  @Response("400", "Active admission not found")
  public async dischargePatient(
    @Path() admissionId: string,
    @Body() requestBody: DischargePatientDTO,
  ): Promise<any> {
    try {
      return await this.admissionService.dischargePatient(
        admissionId,
        requestBody,
      );
    } catch (error: any) {
      this.setStatus(400);
      return { message: error.message || "Failed to discharge patient." };
    }
  }
}
