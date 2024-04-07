/*
  Warnings:

  - You are about to drop the column `fileObjectId` on the `Artifacts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileObjectKey]` on the table `Artifacts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileObjectKey` to the `Artifacts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Artifacts_fileObjectId_key";

-- AlterTable
ALTER TABLE "Artifacts" DROP COLUMN "fileObjectId",
ADD COLUMN     "fileObjectKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Artifacts_fileObjectKey_key" ON "Artifacts"("fileObjectKey");
