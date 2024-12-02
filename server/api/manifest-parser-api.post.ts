import ManifestParser from '~/utils/apkparser/manifest'

export default defineEventHandler(async (event) => {
    // TODO: validate userid and key token
    // if (!event.context.auth.userId) {
    //     setResponseStatus(event, 401, 'Unauthorized')
    //     return
    // }

    const { base64 } = await readBody(event)
    const androidManifestApk = Buffer.from(base64, 'base64')
    const manifestParser = new ManifestParser(androidManifestApk, {}).parse()
    const packageMetadata = {
        versionCode: `${manifestParser.versionCode}`,
        versionName: manifestParser.versionName,
        packageName: manifestParser.package,
    }
    return packageMetadata
})
