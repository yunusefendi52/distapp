/*
  Warnings:

  - A unique constraint covering the columns `[appsId,name]` on the table `ArtifactsGroups` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ArtifactsGroups_appsId_name_key" ON "ArtifactsGroups"("appsId", "name");
