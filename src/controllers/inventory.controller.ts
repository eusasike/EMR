// controller/pharmacy/pharmacy.controller.ts
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
} from "tsoa";
import { PharmacyService } from "../service/phamarcy/inventory.service";
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
import { JwtPayload } from "jsonwebtoken";

@Tags("Pharmacy")
@Route("api/pharmacy")
@Security("jwt", ["ADMIN"])
export class PharmacyController extends Controller {
  private pharmacyService: PharmacyService;

  constructor() {
    super();
    this.pharmacyService = new PharmacyService();
  }

  // ==========================================
  // Product Endpoints
  // ==========================================

  /**
   * Create a new pharmacy product with a reorder level threshold.
   */
  @Post("products")
  @SuccessResponse("201", "Created")
  @Response(400, "Bad Request - Validation Error")
  public async createProduct(@Body() requestBody: CreateProductDTO) {
    const validatedData = createProductSchema.parse(requestBody);
    this.setStatus(201);
    return await this.pharmacyService.createProduct(validatedData);
  }

  /**
   * Get all products along with their active batch inventory (Cached in Redis).
   */
  @Get("products")
  public async getAllProducts() {
    return await this.pharmacyService.getAllProducts();
  }

  /**
   * Get a single product by ID (Cached in Redis).
   */
  @Get("products/{id}")
  @Response(404, "Product Not Found")
  public async getProductById(@Path() id: string) {
    return await this.pharmacyService.getProductById(id);
  }

  /**
   * Update product details or adjust its reorder level.
   */
  @Put("products/{id}")
  @Response(400, "Bad Request - Validation Error")
  @Response(404, "Product Not Found")
  public async updateProduct(
    @Path() id: string,
    @Body() requestBody: UpdateProductDTO,
  ) {
    const validatedData = updateProductSchema.parse(requestBody);
    return await this.pharmacyService.updateProduct(id, validatedData);
  }

  // ==========================================
  // Product Batch Endpoints
  // ==========================================

  /**
   * Add a new stock batch to a product and clear low-stock alert locks.
   */
  @Post("batches")
  @SuccessResponse("201", "Created")
  @Response(400, "Bad Request - Validation Error")
  public async createBatch(@Body() requestBody: CreateBatchDTO) {
    const validatedData = createBatchSchema.parse(requestBody);
    this.setStatus(201);
    return await this.pharmacyService.createBatch(validatedData);
  }

  // ==========================================
  // Dispense & Stock Deductions
  // ==========================================

  /**
   * Atomically dispense items, record transactions, emit RabbitMQ events,
   * and evaluate reorder levels for low-stock notifications.
   */
  @Post("dispense")
  @Security("jwt") // <-- Required so TSOA runs authentication middleware
  @SuccessResponse("201", "Created")
  @Response(400, "Bad Request - Insufficient Stock or Invalid Input")
  public async dispenseProducts(
    @Body() requestBody: CreateDispenseRecordDTO,
    @Request() req: any,
  ) {
    const currentuser = (req as any).user as JwtPayload;
    if (!currentuser) {
      this.setStatus(401);
      return {
        success: false,
        message: "Unauthorized",
        data: null as any,
      };
    }

    const validatedData = createDispenseRecordSchema.parse(requestBody);
    this.setStatus(201);
    return await this.pharmacyService.dispenseProducts(
      validatedData,
      currentuser.id,
    );
  }
}
