import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Path,
  Route,
  Tags,
  SuccessResponse,
  Response,
  Security,
  Request,
  Get,
  Query,
} from "tsoa";
import { LocationService } from "../service/location/location.service";
import {
  CreateRegionDTO,
  UpdateRegionDTO,
  CreateDistrictDTO,
  UpdateDistrictDTO,
  CreateRegionZodSchema,
  UpdateRegionZodSchema,
  CreateDistrictZodSchema,
  UpdateDistrictZodSchema,
} from "../models/location/location.model";
import { Region, District } from "@prisma/client";

@Route("api/v1/admin/locations")
@Tags("Administrative Location Management")
@Security("jwt", ["ADMIN"])
export class LocationAdminController extends Controller {
  private locationService: LocationService;

  constructor() {
    super();
    this.locationService = new LocationService();
  }

  @Post("regions")
  @SuccessResponse("201", "Region Created")
  @Response("400", "Validation Error / Duplicate Entry")
  public async createRegion(
    @Body() requestBody: CreateRegionDTO,
  ): Promise<Region> {
    const validation = CreateRegionZodSchema.safeParse(requestBody);
    if (!validation.success) {
      this.setStatus(400);
      throw new Error(
        `Validation failed: ${validation.error.issues.map((i) => i.message).join("; ")}`,
      );
    }

    this.setStatus(201);
    return this.locationService.createRegion(validation.data);
  }

  @Put("regions/{id}")
  @SuccessResponse("200", "Region Updated")
  @Response("400", "Validation Error")
  @Response("404", "Region Not Found")
  public async updateRegion(
    @Path() id: string,
    @Body() requestBody: UpdateRegionDTO,
  ): Promise<Region> {
    const validation = UpdateRegionZodSchema.safeParse(requestBody);
    if (!validation.success) {
      this.setStatus(400);
      throw new Error(
        `Validation failed: ${validation.error.issues.map((i) => i.message).join("; ")}`,
      );
    }

    return this.locationService.updateRegion(id, validation.data);
  }

  @Delete("regions/{id}")
  @SuccessResponse("204", "Region Deleted")
  @Response("404", "Region Not Found")
  public async deleteRegion(@Path() id: string): Promise<void> {
    await this.locationService.deleteRegion(id);
    this.setStatus(204);
  }

  @Post("regions/{regionId}/districts")
  @SuccessResponse("201", "District Created")
  @Response("400", "Validation Error")
  public async createDistrict(
    @Path() regionId: string,
    @Body() requestBody: CreateDistrictDTO,
  ): Promise<District> {
    const validation = CreateDistrictZodSchema.safeParse(requestBody);
    if (!validation.success) {
      this.setStatus(400);
      throw new Error(
        `Validation failed: ${validation.error.issues.map((i) => i.message).join("; ")}`,
      );
    }

    this.setStatus(201);
    return this.locationService.createDistrict(regionId, validation.data);
  }

  @Put("districts/{id}")
  @SuccessResponse("200", "District Updated")
  @Response("400", "Validation Error")
  public async updateDistrict(
    @Path() id: string,
    @Body() requestBody: UpdateDistrictDTO,
  ): Promise<District> {
    const validation = UpdateDistrictZodSchema.safeParse(requestBody);
    if (!validation.success) {
      this.setStatus(400);
      throw new Error(
        `Validation failed: ${validation.error.issues.map((i) => i.message).join("; ")}`,
      );
    }

    return this.locationService.updateDistrict(id, validation.data);
  }

  @Delete("districts/{id}")
  @SuccessResponse("204", "District Deleted")
  public async deleteDistrict(@Path() id: string): Promise<void> {
    await this.locationService.deleteDistrict(id);
    this.setStatus(204);
  }

  /**
   * Find Region details (including ID) by Region Name
   */
  @Get("regions/search")
  @SuccessResponse("200", "OK")
  @Response("400", "Missing name query parameter")
  @Response("404", "Region not found")
  public async getRegionByName(@Query() name: string): Promise<Region> {
    if (!name || !name.trim()) {
      this.setStatus(400);
      throw new Error("Query parameter 'name' is required.");
    }

    const region = await this.locationService.getRegionByName(name);
    if (!region) {
      this.setStatus(404);
      throw new Error(`Region with name '${name}' not found.`);
    }

    return region;
  }

  /**
   * Find District details (including ID) by District Name (and optional regionId filter)
   */
  @Get("districts/search")
  @SuccessResponse("200", "OK")
  @Response("400", "Missing name query parameter")
  @Response("404", "District not found")
  public async getDistrictByName(
    @Query() name: string,
    @Query() regionId?: string,
  ): Promise<District> {
    if (!name || !name.trim()) {
      this.setStatus(400);
      throw new Error("Query parameter 'name' is required.");
    }

    const district = await this.locationService.getDistrictByName(
      name,
      regionId,
    );
    if (!district) {
      this.setStatus(404);
      throw new Error(`District with name '${name}' not found.`);
    }

    return district;
  }
}
