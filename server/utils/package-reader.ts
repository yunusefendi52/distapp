import { parse } from "@plist/parse"
import JSZip from "jszip"
// @ts-ignore
import ManifestParser from 'adbkit-apkreader/lib/apkreader/parser/manifest'

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
    const androidManifestApk = await fileZip.file('AndroidManifest.xml')?.async('nodebuffer')
    if (androidManifestApk) {
        extension = 'apk'
        const manifestParser = new ManifestParser(androidManifestApk, {}).parse()
        packageMetadata = {
            versionCode: manifestParser.versionCode,
            versionName: manifestParser.versionName,
            packageName: manifestParser.packageName,
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
        metadata: packageMetadata,
    }
    return packageDetail
}
