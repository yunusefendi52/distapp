import util from 'util'
import { join, basename, extname } from 'path'
import { promises, createWriteStream, existsSync } from 'fs'
import child_process from 'node:child_process'
import { uuidv4 } from "uuidv7"
const exec = util.promisify(child_process.exec)
import { myFetch } from '../../utils/upload-utils.js'
import type { BundleKeystoreResponse } from '../api/artifacts/get-bundle-keystore.get.js'
import { Readable } from 'stream'
import { ReadableStream } from 'stream/web'
import { finished } from 'stream/promises'

function getDateFilename(): string {
    const today = new Date()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const yyyy = today.getFullYear()

    return `${yyyy}_${mm}_${dd}_${today.getHours()}_${today.getMinutes()}`
}

async function downloadFile(url: string, filepath: string) {
    const response = await fetch(url);
    const body = Readable.fromWeb(response.body as ReadableStream);
    const tempFilepath = `${filepath}.tmp`
    const download_write_stream = createWriteStream(tempFilepath);
    await finished(body.pipe(download_write_stream));
    await promises.rename(tempFilepath, filepath)
}

export async function extractAabToApk(aabPath: string) {
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

    const bundleKeystoreResponse: BundleKeystoreResponse | undefined = await myFetch('/api/artifacts/get-bundle-keystore')
    if (!bundleKeystoreResponse) {
        throw 'Error bundleKeystoreResponse'
    }
    const keystorePass = bundleKeystoreResponse.appKeystorePass
    const keystoreAlias = bundleKeystoreResponse.appKeystoreAlias
    const keystoreBase64 = bundleKeystoreResponse.appKeystoreBase64
    await promises.writeFile(keystoreFile, Buffer.from(keystoreBase64, 'base64'))

    await exec(`
    java -jar "${bundletoolJarPath}" build-apks --bundle=${aabPath} --output=${bundleApks} --mode=universal \\
        --ks="${keystoreFile}" \\
        --ks-pass=pass:${keystorePass} \\
        --ks-key-alias=${keystoreAlias} \\
        --key-pass=pass:${keystorePass}
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