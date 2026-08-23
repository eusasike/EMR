import {
  Controller,
  Route,
  Post,
  Body,
  SuccessResponse,
  Response,
  Tags,
} from "tsoa";
import { AuthService } from "../service/user/auth.service";
import {
  LoginDTO,
  LoginZodSchema,
  LoginResponseDTO,
  LogoutDTO,
  LogoutResponseDTO,
  LogoutZodSchema,
  RefreshTokenDTO,
  RefreshTokenZodSchema,
  RefreshTokenResponseDTO,
} from "../models/User/auth.model";

@Tags("Authentication")
@Route("api/v1/auth")
export class AuthController extends Controller {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  //login
  @SuccessResponse("200", "Login successful")
  @Response("400", "Validation failed")
  @Response("401", "Invalid credentials")
  @Response("403", "Account deactivated")
  @Post("login")
  public async login(@Body() requestBody: LoginDTO): Promise<LoginResponseDTO> {
    LoginZodSchema.parse(requestBody);

    // 2. Process login service
    const authData = await this.authService.login(requestBody);

    this.setStatus(200);
    return {
      success: true,
      message: "Login successful.",
      data: authData,
    };
  }

  //logout
  @SuccessResponse("200", "Logout successful")
  @Response("400", "Validation failed")
  @Post("logout")
  public async logout(
    @Body() requestBody: LogoutDTO,
  ): Promise<LogoutResponseDTO> {
    // 1. Validate request payload
    LogoutZodSchema.parse(requestBody);

    // 2. Perform logout in Redis
    await this.authService.logout(requestBody);

    this.setStatus(200);
    return {
      success: true,
      message: "Successfully logged out. Session invalidated.",
    };
  }

  //refresh token
  @SuccessResponse("200", "Tokens refreshed successfully")
  @Response("400", "Validation failed")
  @Response("401", "Invalid or revoked refresh token")
  @Response("403", "Account deactivated")
  @Post("refresh")
  public async refresh(
    @Body() requestBody: RefreshTokenDTO,
  ): Promise<RefreshTokenResponseDTO> {
    RefreshTokenZodSchema.parse(requestBody);
    const tokenData = await this.authService.refreshToken(requestBody);

    this.setStatus(200);
    return {
      success: true,
      message: "Tokens refreshed successfully.",
      data: tokenData,
    };
  }
}
