import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log(
    "🌱 Starting seed for Regions, Districts, Facilities, and Admin User...",
  );

  // 1. Create All Regions of Tanzania (Upsert by unique 'name')
  const regionData = [
    { name: "Arusha", code: "ARS" },
    { name: "Dar es Salaam", code: "DAR" },
    { name: "Dodoma", code: "DOM" },
    { name: "Geita", code: "GET" },
    { name: "Iringa", code: "IRG" },
    { name: "Kagera", code: "KGR" },
    { name: "Katavi", code: "KTV" },
    { name: "Kigoma", code: "KGM" },
    { name: "Kilimanjaro", code: "KLM" },
    { name: "Lindi", code: "LND" },
    { name: "Manyara", code: "MNY" },
    { name: "Mara", code: "MAR" },
    { name: "Mbeya", code: "MBY" },
    { name: "Morogoro", code: "MRG" },
    { name: "Mtwara", code: "MTW" },
    { name: "Mwanza", code: "MWZ" },
    { name: "Njombe", code: "NJB" },
    { name: "Pemba North", code: "PNR" },
    { name: "Pemba South", code: "PSR" },
    { name: "Pwani", code: "PWN" },
    { name: "Rukwa", code: "RKW" },
    { name: "Ruvuma", code: "RVV" },
    { name: "Shinyanga", code: "SHN" },
    { name: "Simiyu", code: "SMY" },
    { name: "Singida", code: "SNG" },
    { name: "Songwe", code: "SGW" },
    { name: "Tabora", code: "TBR" },
    { name: "Tanga", code: "TNG" },
    { name: "Zanzibar Central/South", code: "ZCS" },
    { name: "Zanzibar North", code: "ZNR" },
    { name: "Zanzibar Urban West", code: "ZUW" },
  ];

  const regionMap = new Map<string, string>(); // name -> id
  for (const reg of regionData) {
    const region = await prisma.region.upsert({
      where: { name: reg.name },
      update: { code: reg.code },
      create: reg,
    });
    regionMap.set(reg.name, region.id);
  }

  // Helper to safely get region ID
  const getRegionId = (name: string) => {
    const id = regionMap.get(name);
    if (!id) throw new Error(`Region not found in map: ${name}`);
    return id;
  };

  // 2. Create Districts across all Regions (Upsert by compound key 'regionId_name')
  const districtData = [
    // Arusha
    { name: "Arusha City", code: "ARC", regionName: "Arusha" },
    { name: "Arusha District", code: "ARD", regionName: "Arusha" },
    { name: "Karatu", code: "KRT", regionName: "Arusha" },
    { name: "Longido", code: "LGD", regionName: "Arusha" },
    { name: "Meru", code: "MRU", regionName: "Arusha" },
    { name: "Monduli", code: "MDL", regionName: "Arusha" },
    { name: "Ngorongoro", code: "NGR", regionName: "Arusha" },

    // Dar es Salaam
    { name: "Ilala", code: "ILA", regionName: "Dar es Salaam" },
    { name: "Kinondoni", code: "KIN", regionName: "Dar es Salaam" },
    { name: "Temeke", code: "TMK", regionName: "Dar es Salaam" },
    { name: "Ubungo", code: "UBG", regionName: "Dar es Salaam" },
    { name: "Kigamboni", code: "KGB", regionName: "Dar es Salaam" },

    // Dodoma
    { name: "Dodoma Urban", code: "DDU", regionName: "Dodoma" },
    { name: "Bahi", code: "BAH", regionName: "Dodoma" },
    { name: "Chamwino", code: "CHW", regionName: "Dodoma" },
    { name: "Chemba", code: "CMB", regionName: "Dodoma" },
    { name: "Kondoa", code: "KND", regionName: "Dodoma" },
    { name: "Kongwa", code: "KNG", regionName: "Dodoma" },
    { name: "Mpwapwa", code: "MPW", regionName: "Dodoma" },

    // Geita
    { name: "Geita Town", code: "GTT", regionName: "Geita" },
    { name: "Bukombe", code: "BKB", regionName: "Geita" },
    { name: "Chato", code: "CHT", regionName: "Geita" },
    { name: "Mbogwe", code: "MBG", regionName: "Geita" },
    { name: "Nyang'hwale", code: "NYH", regionName: "Geita" },

    // Iringa
    { name: "Iringa Municipal", code: "IRM", regionName: "Iringa" },
    { name: "Iringa District", code: "IRD", regionName: "Iringa" },
    { name: "Kilolo", code: "KLL", regionName: "Iringa" },
    { name: "Mufindi", code: "MFD", regionName: "Iringa" },

    // Kagera
    { name: "Bukoba Municipal", code: "BKM", regionName: "Kagera" },
    { name: "Bukoba District", code: "BKD", regionName: "Kagera" },
    { name: "Biharamulo", code: "BHR", regionName: "Kagera" },
    { name: "Karagwe", code: "KRG", regionName: "Kagera" },
    { name: "Kyerwa", code: "KYR", regionName: "Kagera" },
    { name: "Missenyi", code: "MSN", regionName: "Kagera" },
    { name: "Muleba", code: "MLB", regionName: "Kagera" },
    { name: "Ngara", code: "NGR_K", regionName: "Kagera" },

    // Katavi
    { name: "Mpanda Municipal", code: "MPM", regionName: "Katavi" },
    { name: "Mpanda District", code: "MPD", regionName: "Katavi" },
    { name: "Mlele", code: "MLL", regionName: "Katavi" },
    { name: "Nsimbo", code: "NSM", regionName: "Katavi" },
    { name: "Tanganyika", code: "TGY", regionName: "Katavi" },

    // Kigoma
    { name: "Kigoma Ujiji", code: "KGU", regionName: "Kigoma" },
    { name: "Kigoma District", code: "KGD", regionName: "Kigoma" },
    { name: "Buhigwe", code: "BHG", regionName: "Kigoma" },
    { name: "Kakonko", code: "KKK", regionName: "Kigoma" },
    { name: "Kasulu Town", code: "KST", regionName: "Kigoma" },
    { name: "Kasulu District", code: "KSD", regionName: "Kigoma" },
    { name: "Kibondo", code: "KBD", regionName: "Kigoma" },
    { name: "Uvinza", code: "UVZ", regionName: "Kigoma" },

    // Kilimanjaro
    { name: "Moshi Urban", code: "MSU", regionName: "Kilimanjaro" },
    { name: "Moshi District", code: "MSD", regionName: "Kilimanjaro" },
    { name: "Hai", code: "HAI", regionName: "Kilimanjaro" },
    { name: "Mwanga", code: "MWG", regionName: "Kilimanjaro" },
    { name: "Same", code: "SME", regionName: "Kilimanjaro" },
    { name: "Rombo", code: "RMB", regionName: "Kilimanjaro" },
    { name: "Siha", code: "SHA", regionName: "Kilimanjaro" },

    // Lindi
    { name: "Lindi Municipal", code: "LDM", regionName: "Lindi" },
    { name: "Lindi District", code: "LDD", regionName: "Lindi" },
    { name: "Kilwa", code: "KLW", regionName: "Lindi" },
    { name: "Liwale", code: "LWL", regionName: "Lindi" },
    { name: "Nachingwea", code: "NCH", regionName: "Lindi" },
    { name: "Ruangwa", code: "RGW", regionName: "Lindi" },

    // Manyara
    { name: "Babati Town", code: "BBT", regionName: "Manyara" },
    { name: "Babati District", code: "BBD", regionName: "Manyara" },
    { name: "Hanang", code: "HNG", regionName: "Manyara" },
    { name: "Kiteto", code: "KTT", regionName: "Manyara" },
    { name: "Mbulu", code: "MBL", regionName: "Manyara" },
    { name: "Simanjiro", code: "SMJ", regionName: "Manyara" },

    // Mara
    { name: "Musoma Municipal", code: "MSM", regionName: "Mara" },
    { name: "Musoma District", code: "MSD_M", regionName: "Mara" },
    { name: "Bunda", code: "BND", regionName: "Mara" },
    { name: "Butiama", code: "BTM", regionName: "Mara" },
    { name: "Rorya", code: "RRY", regionName: "Mara" },
    { name: "Serengeti", code: "SRG", regionName: "Mara" },
    { name: "Tarime", code: "TRM", regionName: "Mara" },

    // Mbeya
    { name: "Mbeya City", code: "MBC", regionName: "Mbeya" },
    { name: "Mbeya District", code: "MBD", regionName: "Mbeya" },
    { name: "Busokelo", code: "BSK", regionName: "Mbeya" },
    { name: "Chunya", code: "CHY", regionName: "Mbeya" },
    { name: "Kyela", code: "KYL", regionName: "Mbeya" },
    { name: "Rungwe", code: "RNG", regionName: "Mbeya" },

    // Morogoro
    { name: "Morogoro Municipal", code: "MGM", regionName: "Morogoro" },
    { name: "Morogoro District", code: "MGD", regionName: "Morogoro" },
    { name: "Gairo", code: "GRO", regionName: "Morogoro" },
    { name: "Kilombero", code: "KLB", regionName: "Morogoro" },
    { name: "Kilosa", code: "KLS", regionName: "Morogoro" },
    { name: "Mvomero", code: "MVM", regionName: "Morogoro" },
    { name: "Ulanga", code: "ULG", regionName: "Morogoro" },
    { name: "Malinyi", code: "MLY", regionName: "Morogoro" },

    // Mtwara
    { name: "Mtwara Urban", code: "MTU", regionName: "Mtwara" },
    { name: "Mtwara District", code: "MTD", regionName: "Mtwara" },
    { name: "Masasi Town", code: "MST", regionName: "Mtwara" },
    { name: "Masasi District", code: "MSD_T", regionName: "Mtwara" },
    { name: "Nanyumbu", code: "NYB", regionName: "Mtwara" },
    { name: "Newala", code: "NWL", regionName: "Mtwara" },
    { name: "Tandahimba", code: "TDH", regionName: "Mtwara" },

    // Mwanza
    { name: "Nyamagana", code: "NYM", regionName: "Mwanza" },
    { name: "Ilemela", code: "ILM", regionName: "Mwanza" },
    { name: "Kwimba", code: "KWB", regionName: "Mwanza" },
    { name: "Magu", code: "MGH", regionName: "Mwanza" },
    { name: "Misungwi", code: "MSW", regionName: "Mwanza" },
    { name: "Sengerema", code: "SGR", regionName: "Mwanza" },
    { name: "Ukerewe", code: "UKR", regionName: "Mwanza" },

    // Njombe
    { name: "Njombe Town", code: "NJT", regionName: "Njombe" },
    { name: "Njombe District", code: "NJD", regionName: "Njombe" },
    { name: "Ludewa", code: "LDW", regionName: "Njombe" },
    { name: "Makambako", code: "MKB", regionName: "Njombe" },
    { name: "Wanging'ombe", code: "WNG", regionName: "Njombe" },

    // Pemba North
    { name: "Wete", code: "WTE", regionName: "Pemba North" },
    { name: "Micheweni", code: "MCH", regionName: "Pemba North" },

    // Pemba South
    { name: "Chake Chake", code: "CHK", regionName: "Pemba South" },
    { name: "Mkoani", code: "MKN", regionName: "Pemba South" },

    // Pwani
    { name: "Kibaha Town", code: "KBT", regionName: "Pwani" },
    { name: "Kibaha District", code: "KBD_P", regionName: "Pwani" },
    { name: "Bagamoyo", code: "BGM", regionName: "Pwani" },
    { name: "Kisarawe", code: "KSR", regionName: "Pwani" },
    { name: "Mafia", code: "MFA", regionName: "Pwani" },
    { name: "Mkuranga", code: "MKR", regionName: "Pwani" },
    { name: "Rufiji", code: "RFJ", regionName: "Pwani" },

    // Rukwa
    { name: "Sumbawanga Municipal", code: "SWM", regionName: "Rukwa" },
    { name: "Sumbawanga District", code: "SWD", regionName: "Rukwa" },
    { name: "Kalambo", code: "KLB_R", regionName: "Rukwa" },
    { name: "Nkasi", code: "NKS", regionName: "Rukwa" },

    // Ruvuma
    { name: "Songea Municipal", code: "SGM", regionName: "Ruvuma" },
    { name: "Songea District", code: "SGD", regionName: "Ruvuma" },
    { name: "Mbinga", code: "MBG_R", regionName: "Ruvuma" },
    { name: "Namtumbo", code: "NMT", regionName: "Ruvuma" },
    { name: "Tunduru", code: "TDR", regionName: "Ruvuma" },
    { name: "Nyasa", code: "NYS", regionName: "Ruvuma" },

    // Shinyanga
    { name: "Shinyanga Municipal", code: "SHM", regionName: "Shinyanga" },
    { name: "Shinyanga District", code: "SHD", regionName: "Shinyanga" },
    { name: "Kahama Municipal", code: "KHM", regionName: "Shinyanga" },
    { name: "Kishapu", code: "KSP", regionName: "Shinyanga" },

    // Simiyu
    { name: "Bariadi", code: "BRD", regionName: "Simiyu" },
    { name: "Busega", code: "BSG", regionName: "Simiyu" },
    { name: "Itilima", code: "ITL", regionName: "Simiyu" },
    { name: "Maswa", code: "MSW_S", regionName: "Simiyu" },
    { name: "Meatu", code: "MTU_S", regionName: "Simiyu" },

    // Singida
    { name: "Singida Municipal", code: "SGM_S", regionName: "Singida" },
    { name: "Singida District", code: "SGD_S", regionName: "Singida" },
    { name: "Ikungi", code: "IKG", regionName: "Singida" },
    { name: "Iramba", code: "IRB", regionName: "Singida" },
    { name: "Manyoni", code: "MNY_S", regionName: "Singida" },
    { name: "Itigi", code: "ITG", regionName: "Singida" },

    // Songwe
    { name: "Mbozi", code: "MBZ", regionName: "Songwe" },
    { name: "Ileje", code: "ILJ", regionName: "Songwe" },
    { name: "Momba", code: "MMB", regionName: "Songwe" },
    { name: "Tunduma Town", code: "TDM", regionName: "Songwe" },

    // Tabora
    { name: "Tabora Municipal", code: "TBM", regionName: "Tabora" },
    { name: "Igunga", code: "IGG", regionName: "Tabora" },
    { name: "Kaliua", code: "KLU", regionName: "Tabora" },
    { name: "Nzega", code: "NZG", regionName: "Tabora" },
    { name: "Sikonge", code: "SKG", regionName: "Tabora" },
    { name: "Urambo", code: "URB", regionName: "Tabora" },
    { name: "Uyui", code: "YYI", regionName: "Tabora" },

    // Tanga
    { name: "Tanga City", code: "TGC", regionName: "Tanga" },
    { name: "Handeni Town", code: "HDT", regionName: "Tanga" },
    { name: "Handeni District", code: "HDD", regionName: "Tanga" },
    { name: "Kilindi", code: "KLD", regionName: "Tanga" },
    { name: "Korogwe Town", code: "KGT", regionName: "Tanga" },
    { name: "Korogwe District", code: "KGD_T", regionName: "Tanga" },
    { name: "Lushoto", code: "LST", regionName: "Tanga" },
    { name: "Muheza", code: "MHZ", regionName: "Tanga" },
    { name: "Pangani", code: "PGN", regionName: "Tanga" },
    { name: "Bumbuli", code: "BMB", regionName: "Tanga" },

    // Zanzibar Central/South
    {
      name: "Kati (Central)",
      code: "KTI",
      regionName: "Zanzibar Central/South",
    },
    {
      name: "Kusini (South)",
      code: "KSN",
      regionName: "Zanzibar Central/South",
    },

    // Zanzibar North
    { name: "North 'A'", code: "NRA", regionName: "Zanzibar North" },
    { name: "North 'B'", code: "NRB", regionName: "Zanzibar North" },

    // Zanzibar Urban West
    { name: "Mjini (Urban)", code: "MJN", regionName: "Zanzibar Urban West" },
    { name: "Magharibi 'A'", code: "MGA", regionName: "Zanzibar Urban West" },
    { name: "Magharibi 'B'", code: "MGB", regionName: "Zanzibar Urban West" },
  ];

  const districtMap = new Map<string, string>(); // "regionId_districtName" -> id
  for (const dist of districtData) {
    const regionId = getRegionId(dist.regionName);
    const district = await prisma.district.upsert({
      where: {
        regionId_name: {
          regionId,
          name: dist.name,
        },
      },
      update: { code: dist.code },
      create: {
        name: dist.name,
        code: dist.code,
        regionId,
      },
    });
    districtMap.set(`${regionId}_${dist.name}`, district.id);
  }

  const getDistrictId = (regionName: string, districtName: string) => {
    const regionId = getRegionId(regionName);
    const districtId = districtMap.get(`${regionId}_${districtName}`);
    if (!districtId)
      throw new Error(`District not found: ${districtName} in ${regionName}`);
    return districtId;
  };

  // 3. Create Sample Referral & Specialized Facilities (Upsert by unique 'code')
  const facilityData = [
    {
      name: "Muhimbili National Hospital",
      code: "FAC-001",
      regionName: "Dar es Salaam",
      districtName: "Ilala",
    },
    {
      name: "Dodoma Regional Referral Hospital",
      code: "FAC-002",
      regionName: "Dodoma",
      districtName: "Dodoma Urban",
    },
    {
      name: "Mount Meru Regional Referral Hospital",
      code: "FAC-003",
      regionName: "Arusha",
      districtName: "Arusha City",
    },
    {
      name: "Mount Meru Hope Dispensary",
      code: "FAC-006",
      regionName: "Arusha",
      districtName: "Meru",
    },
    {
      name: "Bugando Medical Centre",
      code: "FAC-004",
      regionName: "Mwanza",
      districtName: "Nyamagana",
    },
    {
      name: "Kibongoto Infectious Diseases Hospital",
      code: "FAC-005",
      regionName: "Kilimanjaro",
      districtName: "Siha",
    },
  ];

  console.log("\n🏥 Created Facilities:");
  const createdFacilities = [];
  for (const fac of facilityData) {
    const regionId = getRegionId(fac.regionName);
    const districtId = getDistrictId(fac.regionName, fac.districtName);

    const facility = await prisma.facility.upsert({
      where: { code: fac.code },
      update: {
        name: fac.name,
        districtId,
        regionId,
      },
      create: {
        name: fac.name,
        code: fac.code,
        districtId,
        regionId,
      },
    });
    createdFacilities.push(facility);
    console.log(
      `- ID: ${facility.id} | Name: ${facility.name} (${fac.regionName})`,
    );
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
  } else {
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
