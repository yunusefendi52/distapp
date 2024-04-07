import type { PrismaClient } from "@prisma/client";

class Services {
    prisma!: PrismaClient;
}

export const services = new Services()
