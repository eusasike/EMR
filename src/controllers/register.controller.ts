import {
  Controller,
  Route,
  Post,
  Body,
  SuccessResponse,
  Response,
  Security,
  Tags,
} from "tsoa";
import { UserService } from "../service/user/register.service";
import {
  RegisterUserDTO,
  RegisterUserZodSchema,
} from "../models/User/user.model";

@Tags("Users")
@Route("api/users")
export class UserController extends Controller {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  /**
   * Register a new staff member (Admin only)
   */
  @Security("jwt", ["ADMIN"])
  @SuccessResponse("201", "Staff member registered successfully")
  @Response("400", "Validation failed")
  @Response("409", "Email already exists")
  @Post("register")
  public async register(
    @Body() requestBody: RegisterUserDTO,
  ): Promise<{ success: boolean; message: string; data: any }> {
    // 1. Run Zod validation for refined checks (e.g., regex phone format)
    RegisterUserZodSchema.parse(requestBody);

    // 2. Pass validated input to service (Service -> Repo -> Redis -> RabbitMQ)
    const newUser = await this.userService.registerStaffUser(requestBody);

    this.setStatus(201);
    return {
      success: true,
      message: "Staff member registered successfully.",
      data: newUser,
    };
  }
}
