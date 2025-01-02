import util from 'util'
import { join, basename, extname } from 'path'
import { promises, existsSync } from 'fs'
import child_process from 'node:child_process'
import { uuidv4 } from "uuidv7"
const exec = util.promisify(child_process.exec)
import { myFetch } from '../utils/upload-utils.js'
import type { BundleKeystoreResponse } from '../server/api/artifacts/get-bundle-keystore.get.js'
import { downloadFile } from '~/server/services/downloadFile.js'

function getDateFilename(): string {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const yyyy = today.getFullYear()

    return `${yyyy}_${mm}_${dd}_${today.getHours()}_${today.getMinutes()}`
}

async function getBundleKeystore(keystoreFile: string) {
    const bundleKeystoreResponse: BundleKeystoreResponse | undefined = await myFetch('/api/artifacts/get-bundle-keystore')
    if (!bundleKeystoreResponse) {
        throw 'Error bundleKeystoreResponse'
    }
    var keystoreUrl = bundleKeystoreResponse.appKeystoreUrl
    if (keystoreUrl.startsWith('/')) {
        keystoreUrl = `${process.env.DISTAPP_CLI_URL}${keystoreUrl}`
    }
    await downloadFile(keystoreUrl, keystoreFile)
    return bundleKeystoreResponse
}

export async function extractAabToApk(aabPath: string, bundleKeystoreFetcher?: (keystoreFile: string) => Promise<BundleKeystoreResponse>) {
    const cwdRoot = process.cwd()
    const bundeFilesDir = join(cwdRoot, '.temp', 'bundle_files')
    await promises.mkdir(bundeFilesDir, {
        recursive: true,
    })

    const bundletoolJarPath = join(bundeFilesDir, 'bundletool.jar')
    if (!existsSync(bundletoolJarPath)) {
        await downloadFile('https://github.com/google/bundletool/releases/download/1.17.2/bundletool-all-1.17.2.jar', bundletoolJarPath)
    }

    const tempBundleDir = join(bundeFilesDir, `${getDateFilename()}_${uuidv4().replaceAll('-', '').slice(0, 12)}`)
    // console.log('extract_aab: ', {
    //     tempBundleDir: tempBundleDir,
    // })
    await promises.mkdir(tempBundleDir, {
        recursive: true,
    })

    const bundleApks = join(tempBundleDir, "bundle.apks")
    const actualApk = join(tempBundleDir, `${basename(aabPath, extname(aabPath))}.apk`)
    const keystoreFile = join(tempBundleDir, `app.jks`)

    const bundleKeystore = bundleKeystoreFetcher
        ? await bundleKeystoreFetcher?.(keystoreFile)
        : await getBundleKeystore(keystoreFile)

    await exec(`
    java -jar "${bundletoolJarPath}" build-apks --bundle=${aabPath} --output=${bundleApks} --mode=universal \\
        --ks="${keystoreFile}" \\
        --ks-pass=pass:${bundleKeystore.appKeystorePass} \\
        --ks-key-alias=${bundleKeystore.appKeystoreAlias} \\
        --key-pass=pass:${bundleKeystore.appKeystorePass}
    `)
    await exec(`unzip -p "${bundleApks}" universal.apk > ${actualApk}`)
    await promises.rm(bundleApks, {
        force: true,
    })
    // console.log('extract_aab: success', {
    //     output: actualApk,
    // })
    return {
        bundleApk: actualApk,
        dispose: async () => {
            await promises.rm(tempBundleDir, {
                force: true,
                recursive: true,
            })
        },
    }
}