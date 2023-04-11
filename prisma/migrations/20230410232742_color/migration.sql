/*
  Warnings:

  - Added the required column `color` to the `Column` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Column" ADD COLUMN     "color" TEXT NOT NULL;
