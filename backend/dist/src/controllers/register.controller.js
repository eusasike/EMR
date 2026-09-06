"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const tsoa_1 = require("tsoa");
const register_service_1 = require("../service/user/register.service");
const user_model_1 = require("../models/User/user.model");
let UserController = class UserController extends tsoa_1.Controller {
    userService;
    constructor() {
        super();
        this.userService = new register_service_1.UserService();
    }
    /**
     * Register a new staff member (Admin only)
     */
    async register(requestBody) {
        // 1. Run Zod validation for refined checks (e.g., regex phone format)
        user_model_1.RegisterUserZodSchema.parse(requestBody);
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
    async view() {
        const users = await this.userService.viewUser();
        this.setStatus(200);
        return {
            success: true,
            message: "Users fetched successfully.",
            data: users,
        };
    }
    //view by email
    async viewByEmail(email) {
        const users = await this.userService.findByEmail(email);
        this.setStatus(200);
        return {
            success: true,
            message: "Users fetched successfully.",
            data: users,
        };
    }
    //update user
    async update(id, input) {
        return this.userService.updateUser(id, input);
    }
};
exports.UserController = UserController;
__decorate([
    (0, tsoa_1.Security)("jwt", ["ADMIN"]),
    (0, tsoa_1.SuccessResponse)("201", "Staff member registered successfully"),
    (0, tsoa_1.Response)("400", "Validation failed"),
    (0, tsoa_1.Response)("409", "Email already exists"),
    (0, tsoa_1.Post)("register"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    (0, tsoa_1.Security)("jwt", ["ADMIN"]),
    (0, tsoa_1.SuccessResponse)("200", "Users fetched successfully"),
    (0, tsoa_1.Response)("400", "Validation failed"),
    (0, tsoa_1.Response)("409", "Email already exists"),
    (0, tsoa_1.Get)("view"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "view", null);
__decorate([
    (0, tsoa_1.Security)("jwt", ["ADMIN"]),
    (0, tsoa_1.SuccessResponse)("200", "Users fetched successfully"),
    (0, tsoa_1.Response)("400", "Validation failed"),
    (0, tsoa_1.Response)("409", "Email already exists"),
    (0, tsoa_1.Post)("view/:email"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "viewByEmail", null);
__decorate([
    (0, tsoa_1.Security)("jwt", ["ADMIN"]),
    (0, tsoa_1.SuccessResponse)("200", "Users fetched successfully"),
    (0, tsoa_1.Response)("400", "Validation failed"),
    (0, tsoa_1.Response)("409", "Email already exists"),
    (0, tsoa_1.Put)("update/:id"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
exports.UserController = UserController = __decorate([
    (0, tsoa_1.Tags)("Users"),
    (0, tsoa_1.Route)("api/v1/users"),
    __metadata("design:paramtypes", [])
], UserController);
