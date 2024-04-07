-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "Organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationsPeople" (
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "OrganizationsPeople_pkey" PRIMARY KEY ("userId","organizationId")
);

-- CreateTable
CREATE TABLE "Apps" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "osType" INTEGER NOT NULL,
    "organizationsId" INTEGER NOT NULL,

    CONSTRAINT "Apps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organizations_name_key" ON "Organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Apps_organizationsId_name_key" ON "Apps"("organizationsId", "name");

-- AddForeignKey
ALTER TABLE "OrganizationsPeople" ADD CONSTRAINT "OrganizationsPeople_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationsPeople" ADD CONSTRAINT "OrganizationsPeople_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apps" ADD CONSTRAINT "Apps_organizationsId_fkey" FOREIGN KEY ("organizationsId") REFERENCES "Organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
