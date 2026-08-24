import {
  Controller,
  Route,
  Get,
  Post,
  Put,
  Tags,
  Body,
  Path,
  Query,
  SuccessResponse,
  Security,
  Request,
  Response,
} from "tsoa";
import { VitalSigns, TriagePriority } from "@prisma/client";
import { VitalSignsService } from "../service/visit/vital-sign.service";
import {
  CreateVitalSignsInput,
  UpdateVitalSignsInput,
  createVitalSignsSchema,
  updateVitalSignsSchema,
} from "../models/visit/vital-sign.model";
import { JwtPayload } from "../middlewares/authenticate";

@Tags("Vital Signs")
@Route("api/v1/vital-signs")
@Security("jwt")
export class VitalSignsController extends Controller {
  private vitalSignsService: VitalSignsService;
  constructor() {
    super();
    this.vitalSignsService = new VitalSignsService();
  }

  @Post("/")
  @SuccessResponse("201", "Created")
  @Response("400", "Bad Request")
  @Response("404", "Patient Visit Not Found")
  @Response("409", "Vital Signs Already Recorded")
  public async create(
    @Request() req: Express.Request, // 👈 Declare req here as a parameter!
    @Body() requestBody: CreateVitalSignsInput,
  ): Promise<{ success: boolean; message: string; data: VitalSigns }> {
    const validatedInput = createVitalSignsSchema.parse(requestBody);
    const currentuser = (req as any).user as JwtPayload;

    const result = await this.vitalSignsService.create(
      currentuser.id,
      validatedInput,
    );
    this.setStatus(201);

    return {
      success: true,
      message: "Vital signs recorded successfully",
      data: result,
    };
  }

  @Get("visit/{visitId}")
  @SuccessResponse("200", "OK")
  @Response("404", "Vital Signs Not Found")
  public async getByVisitId(
    @Path() visitId: string,
  ): Promise<{ success: boolean; data: VitalSigns }> {
    const result = await this.vitalSignsService.findByVisitId(visitId);

    return {
      success: true,
      data: result,
    };
  }

  @Put("{id}")
  @SuccessResponse("200", "OK")
  @Response("404", "Vital Signs Record Not Found")
  public async update(
    @Path() id: string,
    @Body() requestBody: UpdateVitalSignsInput,
  ): Promise<{ success: boolean; message: string; data: VitalSigns }> {
    const validatedInput = updateVitalSignsSchema.parse(requestBody);
    const result = await this.vitalSignsService.update(id, validatedInput);

    return {
      success: true,
      message: "Vital signs updated successfully",
      data: result,
    };
  }

  @Get("/")
  @SuccessResponse("200", "OK")
  public async getAll(
    @Query() page = 1,
    @Query() limit = 20,
    @Query() patientId?: string,
    @Query() priority?: TriagePriority,
    @Query() startDate?: Date,
    @Query() endDate?: Date,
  ): Promise<{
    success: boolean;
    data: VitalSigns[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const result = await this.vitalSignsService.findMany({
      page,
      limit,
      patientId,
      priority,
      startDate,
      endDate,
    });

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }
}
