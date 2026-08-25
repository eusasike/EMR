import {
  Controller,
  Get,
  Query,
  Route,
  Tags,
  SuccessResponse,
  Response,
} from "tsoa";
import { FacilityService } from "../service/location/facility.service";
import { FacilityDTO } from "../models/location/facility.model";

@Route("api/v1/facilities")
@Tags("Facility Services")
export class FacilityController extends Controller {
  private facilityService: FacilityService;

  constructor() {
    super();
    this.facilityService = new FacilityService();
  }

  /**
   * Search a facility by exact code (e.g. /api/v1/facilities/by-code?code=FAC-001)
   */
  @Get("by-code")
  @SuccessResponse("200", "OK")
  @Response("400", "Missing required code parameter")
  @Response("404", "Facility not found")
  public async getFacilityByCode(@Query() code: string): Promise<FacilityDTO> {
    if (!code || !code.trim()) {
      this.setStatus(400);
      throw new Error("Query parameter 'code' is required.");
    }

    const facility = await this.facilityService.getFacilityByCode(code);
    if (!facility) {
      this.setStatus(404);
      throw new Error(`Facility with code '${code}' not found.`);
    }

    return facility;
  }

  /**
   * Search facilities by name query (e.g. /api/v1/facilities/search?name=Kibongoto)
   */
  @Get("search")
  @SuccessResponse("200", "OK")
  @Response("400", "Missing required name parameter")
  public async searchFacilitiesByName(
    @Query() name: string,
  ): Promise<FacilityDTO[]> {
    if (!name || !name.trim()) {
      this.setStatus(400);
      throw new Error("Query parameter 'name' is required.");
    }

    return this.facilityService.searchFacilitiesByName(name);
  }
}
