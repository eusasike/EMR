"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressAuthentication = expressAuthentication;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function expressAuthentication(request, securityName, scopes) {
    if (securityName === "jwt") {
        let token = request.cookies?.accessToken;
        if (!token && request.headers.authorization) {
            const parts = request.headers.authorization.split(" ");
            if (parts[0] === "Bearer" && parts[1]) {
                token = parts[1];
            }
        }
        if (!token) {
            throw new Error("Missing authentication token");
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "supersecret");
            if (scopes && scopes.length > 0) {
                if (!scopes.includes(decoded.role)) {
                    throw new Error("Insufficient permissions to access this resource");
                }
            }
            return decoded;
        }
        catch (err) {
            throw new Error(err.message || "Unauthorized");
        }
    }
    throw new Error("Unknown security scheme");
}
