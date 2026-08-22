import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@system.local";
  const rawPassword = process.env.ADMIN_PASSWORD || "Admin@123456!";

  // 1. Hash the default admin password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

  // 2. Upsert admin record (creates if missing, leaves unchanged if exists)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {}, // Keep existing data untouched if admin already exists
    create: {
      firstName: "System",
      lastName: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN, // Matches Prisma Role enum
      isActive: true,
    },
  });

  console.log("--------------------------------------------------");
  console.log("✅ Seed script executed successfully!");
  console.log(`👤 Admin Account: ${admin.email}`);
  console.log(`🔑 Role:          ${admin.role}`);
  console.log(`🆔 User ID:       ${admin.id}`);
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
