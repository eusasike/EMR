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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tsoa_1 = require("tsoa");
const express_1 = __importDefault(require("express"));
const auth_service_1 = require("../service/user/auth.service");
const auth_model_1 = require("../models/User/auth.model");
const IS_PRODUCTION = process.env.NODE_ENV === "production";
let AuthController = class AuthController extends tsoa_1.Controller {
    authService;
    constructor() {
        super();
        this.authService = new auth_service_1.AuthService();
    }
    setAuthCookies(res, accessToken, refreshToken) {
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
    async login(requestBody, req) {
        auth_model_1.LoginZodSchema.parse(requestBody);
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
    async logout(requestBody, req) {
        auth_model_1.LogoutZodSchema.parse(requestBody);
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
    async refresh(req) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            this.setStatus(401);
            throw new Error("Refresh token cookie missing.");
        }
        const tokenData = await this.authService.refreshToken({ refreshToken });
        if (req.res) {
            this.setAuthCookies(req.res, tokenData.accessToken, tokenData.refreshToken);
        }
        this.setStatus(200);
        return {
            success: true,
            message: "Tokens refreshed successfully.",
            data: tokenData,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, tsoa_1.SuccessResponse)("200", "Login successful"),
    (0, tsoa_1.Response)("400", "Validation failed"),
    (0, tsoa_1.Response)("401", "Invalid credentials"),
    (0, tsoa_1.Post)("login"),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, tsoa_1.SuccessResponse)("200", "Logout successful"),
    (0, tsoa_1.Response)("400", "Validation failed"),
    (0, tsoa_1.Post)("logout"),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, tsoa_1.SuccessResponse)("200", "Tokens refreshed successfully"),
    (0, tsoa_1.Response)("401", "Invalid or missing refresh token"),
    (0, tsoa_1.Post)("refresh"),
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
exports.AuthController = AuthController = __decorate([
    (0, tsoa_1.Tags)("Authentication"),
    (0, tsoa_1.Route)("api/v1/auth"),
    __metadata("design:paramtypes", [])
], AuthController);
