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
    return prisma.user.findMany({
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
}
