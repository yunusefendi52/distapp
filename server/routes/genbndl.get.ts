export default defineEventHandler(async (event) => {
    const { apkFileKey, uploadIdHeadless } = await getValidatedQuery(event, z.object({
        apkFileKey: z.string().min(1),
        uploadIdHeadless: z.string().min(1),
    }).parse)

    return {
        headlessApkFileKey: apkFileKey,
        headlessUploadIdHeadless: uploadIdHeadless,
    }
})
