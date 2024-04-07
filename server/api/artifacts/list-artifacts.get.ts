import { getStorageKeys } from "~/server/utils/utils"

export default defineEventHandler(async (event) => {
    return []
    // const prisma = event.context.prisma
    // const { appName, orgName } = getQuery(event)
    // return await prisma.artifacts.findMany({
    //     include: {
    //         apps: true,
    //     },
    //     orderBy: {
    //         createdAt: 'desc',
    //     },
    //     where: {
    //         apps: {
    //             name: appName?.toString(),
    //             Organization: {
    //                 name: orgName?.toString(),
    //                 OrganizationsPeople: {
    //                     every: {
    //                         userId: event.context.auth.userId,
    //                     },
    //                 },
    //             },
    //         },
    //     },
    // })
})
