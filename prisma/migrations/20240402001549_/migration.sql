-- CreateTable
CREATE TABLE "Artifacts" (
    "id" SERIAL NOT NULL,
    "fileObjectId" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "versionCode" TEXT NOT NULL,
    "releaseNotes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "appsId" INTEGER NOT NULL,

    CONSTRAINT "Artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Artifacts_fileObjectId_key" ON "Artifacts"("fileObjectId");

-- AddForeignKey
ALTER TABLE "Artifacts" ADD CONSTRAINT "Artifacts_appsId_fkey" FOREIGN KEY ("appsId") REFERENCES "Apps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
