import { getStorageKeys } from "~/server/utils/utils"

export default defineEventHandler(async (event) => {
    return {}
    // const { key, appName, orgName, releaseNotes } = await readBody(event)
    // const { temp, assets } = getStorageKeys(event.context.auth, key)
    // const prisma = event.context.prisma
    // await prisma.$transaction(async (t) => {
    //     // TODO: Select only id
    //     const app = await prisma.apps.findFirstOrThrow({
    //         include: {
    //             Organization: true,
    //         },
    //         where: {
    //             name: appName,
    //             Organization: {
    //                 name: orgName,
    //                 OrganizationsPeople: {
    //                     every: {
    //                         userId: event.context.auth.userId,
    //                     },
    //                 },
    //             },
    //         },
    //     })
    //     const lastArtifact = await prisma.artifacts.findFirst({
    //         orderBy: {
    //             releaseId: 'desc',
    //         },
    //         select: {
    //             releaseId: true,
    //         },
    //         where: {
    //             apps: {
    //                 name: appName,
    //                 Organization: {
    //                     name: orgName,
    //                     OrganizationsPeople: {
    //                         every: {
    //                             userId: event.context.auth.userId,
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //     })
    //     const newReleaseId = (lastArtifact?.releaseId ?? 0) + 1
    //     const now = new Date()
    //     await prisma.artifacts.create({
    //         data: {
    //             createdAt: now,
    //             updatedAt: now,
    //             fileObjectKey: key,
    //             versionCode: '1',
    //             versionName: '1.0.0',
    //             appsId: app.id,
    //             releaseNotes: releaseNotes,
    //             releaseId: newReleaseId,
    //         },
    //     })
    // })
    // await event.context.s3.copyObject({
    //     CopySource: `app-deployin/${temp}`,
    //     Bucket: 'app-deployin',
    //     Key: assets,
    // })
    // await event.context.s3.deleteObject({
    //     Bucket: 'app-deployin',
    //     Key: temp,
    // })
})
