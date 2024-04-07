-- CreateTable
CREATE TABLE "ArtifactsGroups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "appsId" INTEGER NOT NULL,

    CONSTRAINT "ArtifactsGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactsGroupsManager" (
    "artifactsId" INTEGER NOT NULL,
    "artifactsGroupsId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtifactsGroupsManager_artifactsId_artifactsGroupsId_key" ON "ArtifactsGroupsManager"("artifactsId", "artifactsGroupsId");

-- AddForeignKey
ALTER TABLE "ArtifactsGroups" ADD CONSTRAINT "ArtifactsGroups_appsId_fkey" FOREIGN KEY ("appsId") REFERENCES "Apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactsGroupsManager" ADD CONSTRAINT "ArtifactsGroupsManager_artifactsId_fkey" FOREIGN KEY ("artifactsId") REFERENCES "Artifacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactsGroupsManager" ADD CONSTRAINT "ArtifactsGroupsManager_artifactsGroupsId_fkey" FOREIGN KEY ("artifactsGroupsId") REFERENCES "ArtifactsGroups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
