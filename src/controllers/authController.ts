import {
  Controller,
  Post,
  Body,
  Route,
  SuccessResponse,
  Response,
  Tags,
  Example
} from 'tsoa';

export interface LoginCredentials {
  email: string;
  passwordHash: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

@Tags('Authentication')
@Route('api/v1/auth')
export class AuthController extends Controller {

  /**
   * Authenticate user credentials and issue JWT tokens.
   */
  @Post('login')
  @SuccessResponse(200, 'Authenticated Successfully')
  @Response(401, 'Unauthorized Credentials')
  @Example<AuthTokenResponse>({
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refreshToken: 'd9b2d63d-8832-478a-a43e-324c0d12e8b2',
    expiresIn: 3600,
    tokenType: 'Bearer'
  })
  public async login(
    @Body() credentials: LoginCredentials
  ): Promise<AuthTokenResponse> {
    this.setStatus(200);
    return {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample_token',
      refreshToken: 'd9b2d63d-8832-478a-a43e-324c0d12e8b2',
      expiresIn: 3600,
      tokenType: 'Bearer'
    };
  }

  /**
   * Obtain a new access token using a valid refresh token.
   */
  @Post('refresh')
  @SuccessResponse(200, 'Token Refreshed')
  @Response(400, 'Invalid Refresh Token')
  public async refreshToken(
    @Body() body: RefreshTokenRequest
  ): Promise<AuthTokenResponse> {
    this.setStatus(200);
    return {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_token',
      refreshToken: body.refreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer'
    };
  }
}