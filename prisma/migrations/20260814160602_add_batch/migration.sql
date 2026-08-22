/*
  Warnings:

  - You are about to drop the column `stock_quantity` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batch_id` to the `dispensed_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dispensed_items" ADD COLUMN     "batch_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "stock_quantity",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'MEDICINE',
ADD COLUMN     "code" TEXT,
ADD COLUMN     "reorder_level" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "product_batches" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "initial_qty" INTEGER NOT NULL,
    "cost_price" DECIMAL(10,2),
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_batches_product_id_batch_number_key" ON "product_batches"("product_id", "batch_number");

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- AddForeignKey
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensed_items" ADD CONSTRAINT "dispensed_items_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "product_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
