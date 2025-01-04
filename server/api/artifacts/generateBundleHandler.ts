import { existsSync } from "fs";
import promises from "node:fs/promises";
import { join } from "path/posix";
import { uuidv4 } from "uuidv7";
import { extractAabToApk } from "../../../cli/extract-aab-to-apk";
import { downloadFile } from "../../../server/services/downloadFile";

async function generateTempFolder(orgId: string, appId: string): Promise<string> {
    const tempFolder = join(process.cwd(), '.temp', 'aab_gen', orgId, appId, uuidv4().substring(0, 13))
    await promises.mkdir(tempFolder, {
        recursive: true,
    })
    return tempFolder
}

export async function generateBundleHandler(
    aabSignedUrl: string,
    orgId: string,
    appId: string,
    keystorePass: string,
    keystoreAlias: string,
    keystoreUrl: string,
    apkSignedUrl: string,
    keystoreFetcher: (keystoreFile: string) => Promise<void>,
) {
    const aabGenFolderTemp = await generateTempFolder(orgId, appId);
    const aabFilePath = join(aabGenFolderTemp, 'app.aab');

    try {
        await downloadFile(aabSignedUrl, aabFilePath);

        const { bundleApk, dispose } = await extractAabToApk(aabFilePath, async (keystoreFile) => {
            await keystoreFetcher(keystoreFile)

            if (!existsSync(keystoreFile)) {
                throw 'keystoreFile not found, should not happen';
            }

            return {
                appKeystorePass: keystorePass,
                appKeystoreAlias: keystoreAlias,
                appKeystoreUrl: keystoreUrl,
            };
        });

        try {
            const bundleApkFile = await promises.readFile(bundleApk);
            await fetch(apkSignedUrl, {
                method: 'put',
                body: bundleApkFile,
                redirect: 'follow',
            }).then(e => {
                if (!e.ok) {
                    throw `Error upload file ${e.status} ${e.statusText}`
                }
                return e
            })
        } finally {
            dispose();
        }
    } finally {
        await promises.rm(aabGenFolderTemp, {
            force: true,
            recursive: true,
        });
    }
}
