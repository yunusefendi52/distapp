/*
  Warnings:

  - A unique constraint covering the columns `[appsId,releaseId]` on the table `Artifacts` will be added. If there are existing duplicate values, this will fail.
  - Made the column `releaseId` on table `Artifacts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Artifacts" ALTER COLUMN "releaseId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Artifacts_appsId_releaseId_key" ON "Artifacts"("appsId", "releaseId");
