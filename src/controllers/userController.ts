import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Route,
  Body,
  Path,
  Query,
  SuccessResponse,
  Response,
  Tags,
  Security,
  Example,
} from "tsoa";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "manager";
  createdAt: Date;
}

export interface UserCreationParams {
  email: string;
  name: string;
  role?: "admin" | "user" | "manager";
}

export interface UserUpdateParams {
  name?: string;
  role?: "admin" | "user" | "manager";
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

@Tags("Users")
@Route("api/v1/users")
@Security("jwt")
export class UsersController extends Controller {
  /**
   * Retrieves a paginated list of registered enterprise users.
   * @param page Target page index (default: 1)
   * @param limit Number of items per page (default: 10)
   * @param role Optional filter by user role
   */
  @Get("")
  @Example<PaginatedUsersResponse>({
    data: [
      {
        id: "usr_12345",
        email: "jane.doe@enterprise.com",
        name: "Jane Doe",
        role: "admin",
        createdAt: new Date("2026-01-15T08:30:00Z"),
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
  })
  public async getUsers(
    @Query() page = 1,
    @Query() limit = 10,
    @Query() role?: "admin" | "user" | "manager",
  ): Promise<PaginatedUsersResponse> {
    this.setStatus(200);
    return {
      data: [
        {
          id: "usr_12345",
          email: "jane.doe@enterprise.com",
          name: "Jane Doe",
          role: role || "admin",
          createdAt: new Date("2026-01-15T08:30:00Z"),
        },
      ],
      total: 1,
      page,
      limit,
    };
  }

  /**
   * Fetch details for a specific user by unique identifier.
   * @param userId The unique identifier of the user
   */
  @Get("{userId}")
  @Response<ErrorResponse>(404, "User Not Found", {
    message: "User with the specified ID does not exist",
    code: "USER_NOT_FOUND",
  })
  public async getUserById(@Path() userId: string): Promise<User> {
    if (userId !== "usr_12345") {
      this.setStatus(404);
      throw new Error(`User ${userId} not found`);
    }

    return {
      id: userId,
      email: "jane.doe@enterprise.com",
      name: "Jane Doe",
      role: "admin",
      createdAt: new Date("2026-01-15T08:30:00Z"),
    };
  }

  /**
   * Provision a new user account.
   */
  @Post("")
  @SuccessResponse(201, "Created")
  @Response<ErrorResponse>(400, "Bad Request", {
    message: "Invalid email address provided",
    code: "INVALID_INPUT",
  })
  public async createUser(
    @Body() requestBody: UserCreationParams,
  ): Promise<User> {
    this.setStatus(201);
    return {
      id: `usr_${Date.now()}`,
      email: requestBody.email,
      name: requestBody.name,
      role: requestBody.role || "user",
      createdAt: new Date(),
    };
  }

  /**
   * Update existing user attributes.
   * @param userId ID of user to update
   */
  @Put("{userId}")
  @Response<ErrorResponse>(404, "User Not Found")
  public async updateUser(
    @Path() userId: string,
    @Body() requestBody: UserUpdateParams,
  ): Promise<User> {
    return {
      id: userId,
      email: "jane.doe@enterprise.com",
      name: requestBody.name || "Jane Doe",
      role: requestBody.role || "admin",
      createdAt: new Date("2026-01-15T08:30:00Z"),
    };
  }

  /**
   * Permanently remove a user account.
   * @param userId ID of user to remove
   */
  @Delete("{userId}")
  @SuccessResponse(204, "No Content")
  @Response<ErrorResponse>(403, "Forbidden", {
    message: "Insufficient permissions to perform this action",
    code: "FORBIDDEN",
  })
  public async deleteUser(@Path() userId: string): Promise<void> {
    this.setStatus(204);
    return;
  }
}
