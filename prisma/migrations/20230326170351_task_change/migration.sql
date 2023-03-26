/*
  Warnings:

  - You are about to drop the column `statusId` on the `Task` table. All the data in the column will be lost.
  - Added the required column `columnId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_statusId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "statusId",
ADD COLUMN     "columnId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
