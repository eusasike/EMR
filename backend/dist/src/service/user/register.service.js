"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_repository_1 = require("../../models/User/user.repository");
const redis_1 = require("../../config/redis");
const rabbitmq_1 = require("../../config/rabbitmq");
class UserService {
    userRepository;
    constructor() {
        this.userRepository = new user_repository_1.UserRepository();
    }
    async registerStaffUser(input) {
        // 1. Check existing email
        const existingUser = await this.userRepository.findByEmail(input.email);
        if (existingUser) {
            throw new Error("A user with this email address already exists.");
        }
        // 2. Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt_1.default.hash(input.password, saltRounds);
        // 3. Save to Database via Repository
        const newUser = await this.userRepository.createUser({
            ...input,
            passwordHash,
        });
        // 4. Invalidate relevant Redis Cache (e.g., cached staff list)
        await redis_1.redisClient.del("staff:list:all");
        // 5. Publish Event to RabbitMQ (e.g., trigger email/notification worker)
        await (0, rabbitmq_1.publishToQueue)("user_events", "USER_REGISTERED", {
            userId: newUser.id,
            email: newUser.email,
            name: `${newUser.firstName} ${newUser.lastName}`,
            role: newUser.role,
            facilityId: input.facilityId,
            tempPassword: input.password,
        });
        return newUser;
    }
    //view user
    async viewUser() {
        const user = await this.userRepository.findAll();
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    //find by email
    async findByEmail(email) {
        return this.userRepository.findByEmail(email);
    }
    //update user detail
    async updateUser(id, input) {
        return this.userRepository.updateUser(id, input);
    }
}
exports.UserService = UserService;
