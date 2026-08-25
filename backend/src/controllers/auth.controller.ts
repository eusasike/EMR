import {
  Controller,
  Route,
  Post,
  Body,
  SuccessResponse,
  Response,
  Tags,
  Request,
} from "tsoa";
import express from "express";
import { AuthService } from "../service/user/auth.service";
import {
  LoginDTO,
  LoginZodSchema,
  LoginResponseDTO,
  LogoutDTO,
  LogoutResponseDTO,
  LogoutZodSchema,
  RefreshTokenResponseDTO,
} from "../models/User/auth.model";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

@Tags("Authentication")
@Route("api/v1/auth")
export class AuthController extends Controller {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  private setAuthCookies(
    res: express.Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      path: "/api/v1/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @SuccessResponse("200", "Login successful")
  @Response("400", "Validation failed")
  @Response("401", "Invalid credentials")
  @Post("login")
  public async login(
    @Body() requestBody: LoginDTO,
    @Request() req: express.Request,
  ): Promise<LoginResponseDTO> {
    LoginZodSchema.parse(requestBody);

    const authData = await this.authService.login(requestBody);

    if (req.res) {
      this.setAuthCookies(req.res, authData.accessToken, authData.refreshToken);
    }

    this.setStatus(200);
    return {
      success: true,
      message: "Login successful.",
      data: authData,
    };
  }

  @SuccessResponse("200", "Logout successful")
  @Response("400", "Validation failed")
  @Post("logout")
  public async logout(
    @Body() requestBody: LogoutDTO,
    @Request() req: express.Request,
  ): Promise<LogoutResponseDTO> {
    LogoutZodSchema.parse(requestBody);

    await this.authService.logout(requestBody);

    if (req.res) {
      req.res.clearCookie("accessToken");
      req.res.clearCookie("refreshToken", { path: "/api/v1/auth/refresh" });
    }

    this.setStatus(200);
    return {
      success: true,
      message: "Successfully logged out. Session invalidated.",
    };
  }

  @SuccessResponse("200", "Tokens refreshed successfully")
  @Response("401", "Invalid or missing refresh token")
  @Post("refresh")
  public async refresh(
    @Request() req: express.Request,
  ): Promise<RefreshTokenResponseDTO> {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      this.setStatus(401);
      throw new Error("Refresh token cookie missing.");
    }

    const tokenData = await this.authService.refreshToken({ refreshToken });

    if (req.res) {
      this.setAuthCookies(
        req.res,
        tokenData.accessToken,
        tokenData.refreshToken,
      );
    }

    this.setStatus(200);
    return {
      success: true,
      message: "Tokens refreshed successfully.",
      data: tokenData,
    };
  }
}
