-- AlterTable
ALTER TABLE "users" ADD COLUMN     "first_name" TEXT NOT NULL DEFAULT 'First',
ADD COLUMN     "last_name" TEXT NOT NULL DEFAULT 'Last';
