"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Starting seed for Regions, Districts, Facilities, and Admin User...");
    // 1. Create Regions (Upsert by unique 'name')
    const regionData = [
        { name: "Dar es Salaam", code: "DAR" },
        { name: "Dodoma", code: "DOM" },
        { name: "Arusha", code: "ARS" },
        { name: "Mwanza", code: "MWZ" },
        { name: "Kilimanjaro", code: "KLM" },
    ];
    const createdRegions = [];
    for (const reg of regionData) {
        const region = await prisma.region.upsert({
            where: { name: reg.name },
            update: { code: reg.code },
            create: reg,
        });
        createdRegions.push(region);
    }
    // 2. Create Districts (Upsert by compound key 'regionId_name')
    const districtData = [
        { name: "Kinondoni", code: "KIN", regionId: createdRegions[0].id },
        { name: "Dodoma Urban", code: "DDU", regionId: createdRegions[1].id },
        { name: "Arusha City", code: "ARC", regionId: createdRegions[2].id },
        { name: "Nyamagana", code: "NYM", regionId: createdRegions[3].id },
        { name: "Moshi Urban", code: "MSU", regionId: createdRegions[4].id },
    ];
    const createdDistricts = [];
    for (const dist of districtData) {
        const district = await prisma.district.upsert({
            where: {
                regionId_name: {
                    regionId: dist.regionId,
                    name: dist.name,
                },
            },
            update: { code: dist.code },
            create: dist,
        });
        createdDistricts.push(district);
    }
    // 3. Create Facilities (Upsert by unique 'code')
    const facilityData = [
        {
            name: "Muhimbili National Hospital",
            code: "FAC-001",
            districtId: createdDistricts[0].id,
            regionId: createdRegions[0].id,
        },
        {
            name: "Dodoma Regional Referral Hospital",
            code: "FAC-002",
            districtId: createdDistricts[1].id,
            regionId: createdRegions[1].id,
        },
        {
            name: "Mount Meru Regional Referral Hospital",
            code: "FAC-003",
            districtId: createdDistricts[2].id,
            regionId: createdRegions[2].id,
        },
        {
            name: "Bugando Medical Centre",
            code: "FAC-004",
            districtId: createdDistricts[3].id,
            regionId: createdRegions[3].id,
        },
        {
            name: "Kibongoto Infectious Diseases Hospital",
            code: "FAC-005",
            districtId: createdDistricts[4].id,
            regionId: createdRegions[4].id,
        },
    ];
    console.log("\n🏥 Created Facilities:");
    const createdFacilities = [];
    for (const fac of facilityData) {
        const facility = await prisma.facility.upsert({
            where: { code: fac.code },
            update: {
                name: fac.name,
                districtId: fac.districtId,
                regionId: fac.regionId,
            },
            create: fac,
        });
        createdFacilities.push(facility);
        console.log(`- ID: ${facility.id} | Name: ${facility.name}`);
    }
    // 4. Create Admin User using the correct 'facilities' relation mapping
    console.log("\n👤 Seeding Admin User...");
    const hashedPassword = await bcrypt.hash("Admin@123456!", 10);
    let adminUser = await prisma.user.findUnique({
        where: { email: "admin@system.local" },
    });
    if (!adminUser) {
        adminUser = await prisma.user.create({
            data: {
                email: "admin@system.local",
                password: hashedPassword,
                firstName: "System",
                lastName: "Admin",
                role: "ADMIN",
                facilities: {
                    create: {
                        facilityId: createdFacilities[0].id,
                    },
                },
            },
        });
    }
    else {
        adminUser = await prisma.user.update({
            where: { email: "admin@system.local" },
            data: {
                password: hashedPassword,
                role: "ADMIN",
            },
        });
    }
    console.log(`- Admin created/updated successfully: ${adminUser.email}`);
    console.log("\n✅ Seeding completed successfully!");
}
main()
    .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
