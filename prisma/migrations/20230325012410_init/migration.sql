/*
  Warnings:

  - You are about to drop the column `status` on the `Column` table. All the data in the column will be lost.
  - Added the required column `name` to the `Column` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Column" DROP COLUMN "status",
ADD COLUMN     "name" TEXT NOT NULL;
