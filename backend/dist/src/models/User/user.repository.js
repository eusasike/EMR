"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_1 = require("../../config/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserRepository {
    async findByEmail(email) {
        return database_1.prisma.user.findUnique({
            where: { email },
        });
    }
    async createUser(data) {
        return database_1.prisma.user.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                middleName: data.middleName || "middle",
                email: data.email,
                phone: data.phone || null,
                password: data.passwordHash,
                role: data.role,
                isActive: true,
                // If a facilityId is provided, link via the FacilityUser join model
                ...(data.facilityId && {
                    facilities: {
                        create: {
                            facilityId: data.facilityId,
                        },
                    },
                }),
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                facilities: {
                    select: {
                        facilityId: true,
                    },
                },
                createdAt: true,
            },
        });
    }
    //list user
    async findAll() {
        return database_1.prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
                password: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                facilities: {
                    select: {
                        facilityId: true,
                    },
                },
                createdAt: true,
            },
        });
    }
    //update user
    //
    async updateUser(id, input) {
        const { facilityId, password, ...restInput } = input;
        // Prepare data object, hashing password only if provided
        const updateData = { ...restInput };
        if (password && password.trim() !== "") {
            updateData.password = await bcrypt_1.default.hash(password, 10);
        }
        return database_1.prisma.$transaction(async (tx) => {
            // 1. Update core user details (with encrypted password if present)
            await tx.user.update({
                where: { id },
                data: updateData,
            });
            // 2. Safely update facility links using transaction
            if (facilityId !== undefined) {
                await tx.facilityUser.deleteMany({
                    where: { userId: id },
                });
                if (facilityId) {
                    await tx.facilityUser.create({
                        data: {
                            userId: id,
                            facilityId: facilityId,
                        },
                    });
                }
            }
            // 3. Return the fully updated user with relations
            return tx.user.findUnique({
                where: { id },
                include: {
                    facilities: {
                        include: {
                            facility: true,
                        },
                    },
                },
            });
        });
    }
}
exports.UserRepository = UserRepository;
