import { PrismaClient } from "@prisma/client"
import { services } from "../services"

export default defineNitroPlugin(async (nuxtApp) => {
    services.prisma = new PrismaClient({
        log: ['error', 'info', 'query', 'warn']
    })
})
