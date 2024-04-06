-- Migration number: 0002 	 2024-04-06T16:34:55.466Z
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "OrganizationsPeople" (
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "organizationId"),
    CONSTRAINT "OrganizationsPeople_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrganizationsPeople_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Apps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "osType" INTEGER NOT NULL,
    "organizationsId" TEXT NOT NULL,
    CONSTRAINT "Apps_organizationsId_fkey" FOREIGN KEY ("organizationsId") REFERENCES "Organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Artifacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileObjectKey" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "versionCode" TEXT NOT NULL,
    "releaseNotes" TEXT,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "releaseId" INTEGER NOT NULL,
    "appsId" TEXT NOT NULL,
    CONSTRAINT "Artifacts_appsId_fkey" FOREIGN KEY ("appsId") REFERENCES "Apps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArtifactsGroups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "appsId" TEXT NOT NULL,
    CONSTRAINT "ArtifactsGroups_appsId_fkey" FOREIGN KEY ("appsId") REFERENCES "Apps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArtifactsGroupsManager" (
    "artifactsId" TEXT NOT NULL,
    "artifactsGroupsId" TEXT NOT NULL,
    CONSTRAINT "ArtifactsGroupsManager_artifactsId_fkey" FOREIGN KEY ("artifactsId") REFERENCES "Artifacts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ArtifactsGroupsManager_artifactsGroupsId_fkey" FOREIGN KEY ("artifactsGroupsId") REFERENCES "ArtifactsGroups" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Organizations_id_key" ON "Organizations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Organizations_name_key" ON "Organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Apps_id_key" ON "Apps"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Apps_organizationsId_name_key" ON "Apps"("organizationsId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Artifacts_id_key" ON "Artifacts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Artifacts_fileObjectKey_key" ON "Artifacts"("fileObjectKey");

-- CreateIndex
CREATE UNIQUE INDEX "Artifacts_appsId_releaseId_key" ON "Artifacts"("appsId", "releaseId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtifactsGroups_id_key" ON "ArtifactsGroups"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ArtifactsGroups_appsId_name_key" ON "ArtifactsGroups"("appsId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ArtifactsGroupsManager_artifactsId_artifactsGroupsId_key" ON "ArtifactsGroupsManager"("artifactsId", "artifactsGroupsId");

