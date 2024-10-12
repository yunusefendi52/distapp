import { parse } from "@plist/parse"
import JSZip from "jszip"
import { myFetch } from './upload-utils.js'

export const readPackageFile = async (data: File | Buffer | ArrayBuffer | string | Blob) => {
    var fileZip = new JSZip();
    await fileZip.loadAsync(data)
    var extension = ''
    var packageMetadata: { versionCode: string, versionName: string, packageName: string } | undefined = undefined

    // it's iOS
    const appFolder = fileZip.folder('Payload')?.folder(/.app/).at(0)
    if (appFolder) {
        const infoPlistStr = await fileZip.folder(appFolder.name)?.file('Info.plist')?.async('arraybuffer')
        const plist: any = parse(infoPlistStr!)
        packageMetadata = {
            versionName: plist.CFBundleShortVersionString,
            versionCode: plist.CFBundleVersion,
            packageName: plist.CFBundleIdentifier,
        }
        extension = 'ipa'
    }

    // it's android apk
    const androidManifestApkEntry = fileZip.file('AndroidManifest.xml')
    if (androidManifestApkEntry) {
        extension = 'apk'
        if (process.server) {
            const androidManifestApk = await androidManifestApkEntry?.async('nodebuffer')
            if (androidManifestApk) {
                const ManifestParser = await import('~/utils/apkparser/manifest')
                const manifestParser = new ManifestParser.default(androidManifestApk, {}).parse()
                packageMetadata = {
                    versionCode: manifestParser.versionCode,
                    versionName: manifestParser.versionName,
                    packageName: manifestParser.package,
                }
            }
        } else {
            const base64Manifest = await androidManifestApkEntry.async('base64')
            packageMetadata = await myFetch('/api/manifest-parser-api', {
                method: 'post',
                body: {
                    base64: base64Manifest,
                }
            })
        }
    }

    // it's android aab
    const androidManifestAabString = await fileZip.folder('base/manifest')?.file('AndroidManifest.xml')?.async('binarystring')
    if (androidManifestAabString) {
        extension = 'aab'
        const versionCode = androidManifestAabString.match(/versionCode.*?(?=\")/g)?.toString().replaceAll('versionCode\x1A\x02', '')
        const versionName = androidManifestAabString.match(/versionName.*?(?=\()/g)?.toString().replaceAll('versionName\x1A\x05', '')
        const packageName = androidManifestAabString.match(/package.*?(?=\")/g)?.toString().replaceAll('package\x1A\x13', '')
        packageMetadata = {
            versionCode: versionCode!,
            versionName: versionName!,
            packageName: packageName!,
        }
    }
    if (!packageMetadata) {
        return undefined
    }

    const packageDetail = {
        versionName: packageMetadata?.versionName!,
        versionCode: parseInt(packageMetadata?.versionCode!),
        extension: extension,
        packageName: packageMetadata.packageName,
    }
    return packageDetail
}
