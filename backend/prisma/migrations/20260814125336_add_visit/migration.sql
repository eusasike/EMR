-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('OPD', 'EMERGENCY', 'REFERRAL', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "VisitPriority" AS ENUM ('NORMAL', 'URGENT', 'CRITICAL');

-- AlterTable
ALTER TABLE "patient_visits" ADD COLUMN     "priority" "VisitPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "visit_type" "VisitType" NOT NULL DEFAULT 'OPD';
