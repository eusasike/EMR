import { prisma } from "../../config/database";
import { RegisterUserDTO } from "../../models/User/user.model";

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: RegisterUserDTO & { passwordHash: string }) {
    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || "middle",
        email: data.email,
        phone: data.phone || null, // 👈 Added phone field support
        password: data.passwordHash,
        role: data.role,
        isActive: true,
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
        createdAt: true,
      },
    });
  }
}
