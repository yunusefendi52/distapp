import { PrismaClient } from '@prisma/client'
import { services } from '../services';

declare module 'h3' {
    interface H3EventContext {
        prisma: PrismaClient;
    }
}

export default defineEventHandler(async (event) => {
    event.context.prisma = services.prisma
})
