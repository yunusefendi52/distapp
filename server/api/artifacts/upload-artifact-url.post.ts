import { getStorageKeys } from "~/server/utils/utils"

export default defineEventHandler(async (event) => {
    const { key, appName, orgName } = await readBody(event)
    const { temp, assets } = getStorageKeys(event.context.auth, key)
    const prisma = event.context.prisma
    await prisma.$transaction(async (t) => {
        // TODO: Select only id
        const app = await prisma.apps.findFirstOrThrow({
            include: {
                Organization: true,
            },
            where: {
                name: appName,
                Organization: {
                    name: orgName,
                    OrganizationsPeople: {
                        every: {
                            userId: event.context.auth.userId,
                        },
                    },
                },
            },
        })
        const now = new Date()
        await prisma.artifacts.create({
            data: {
                createdAt: now,
                updatedAt: now,
                fileObjectKey: key,
                versionCode: '1',
                versionName: '1.0.0',
                appsId: app.id,
            },
        })
    })
    await event.context.s3.copyObject({
        CopySource: `app-deployin/${temp}`,
        Bucket: 'app-deployin',
        Key: assets,
    })
    await event.context.s3.deleteObject({
        Bucket: 'app-deployin',
        Key: temp,
    })
})
