-- CreateEnum
CREATE TYPE "TriagePriority" AS ENUM ('RED', 'YELLOW', 'GREEN', 'BLACK');

-- CreateTable
CREATE TABLE "VitalSigns" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "temperature" DECIMAL(65,30) NOT NULL,
    "systolicBP" INTEGER NOT NULL,
    "diastolicBP" INTEGER NOT NULL,
    "pulseRate" INTEGER NOT NULL,
    "respiratoryRate" INTEGER NOT NULL,
    "spo2" INTEGER NOT NULL,
    "weight" DECIMAL(65,30) NOT NULL,
    "height" DECIMAL(65,30) NOT NULL,
    "bmi" DECIMAL(65,30),
    "priority" "TriagePriority" NOT NULL DEFAULT 'GREEN',
    "notes" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VitalSigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VitalSigns_visitId_key" ON "VitalSigns"("visitId");

-- AddForeignKey
ALTER TABLE "VitalSigns" ADD CONSTRAINT "VitalSigns_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "patient_visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VitalSigns" ADD CONSTRAINT "VitalSigns_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
