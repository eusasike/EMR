import { prisma } from "../../config/database";
import { RegisterUserDTO } from "../../models/User/user.model";
import bcrypt from "bcrypt";

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
  async updateUser(id: string, input: RegisterUserDTO) {
    const { facilityId, password, ...restInput } = input;

    // Prepare data object, hashing password only if provided
    const updateData: any = { ...restInput };
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    return prisma.$transaction(async (tx) => {
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
