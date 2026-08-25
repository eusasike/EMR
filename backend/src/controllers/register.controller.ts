import {
  Controller,
  Route,
  Post,
  Body,
  SuccessResponse,
  Response,
  Security,
  Tags,
  Get,
} from "tsoa";
import { UserService } from "../service/user/register.service";
import {
  RegisterUserDTO,
  RegisterUserZodSchema,
} from "../models/User/user.model";

@Tags("Users")
@Route("api/v1/users")
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

  //view all users
  @Security("jwt", ["ADMIN"])
  @SuccessResponse("200", "Users fetched successfully")
  @Response("400", "Validation failed")
  @Response("409", "Email already exists")
  @Get("view")
  public async view(): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    const users = await this.userService.viewUser();
    this.setStatus(200);
    return {
      success: true,
      message: "Users fetched successfully.",
      data: users,
    };
  }

  //view by email
  @Security("jwt", ["ADMIN"])
  @SuccessResponse("200", "Users fetched successfully")
  @Response("400", "Validation failed")
  @Response("409", "Email already exists")
  @Post("view/:email")
  public async viewByEmail(
    email: string,
  ): Promise<{ success: boolean; message: string; data: any }> {
    const users = await this.userService.findByEmail(email);
    this.setStatus(200);
    return {
      success: true,
      message: "Users fetched successfully.",
      data: users,
    };
  }
}
