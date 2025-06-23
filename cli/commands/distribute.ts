import { uploadArtifact, updateMyFetch } from '../../utils/upload-utils.js'
import { promises } from "node:fs"
import { resolve } from "node:path"
import { extractAabToApk } from '../extract-aab-to-apk.js'
import { basename, extname } from 'path'
import { UpdateGroupsRequest } from '~/server/api/update-artifact-groups.put.js'
import { Command } from '@commander-js/extra-typings';
import { myFetch } from '../../utils/upload-utils.js'

function slugToOrgApp(slug: string): { orgName: string, appName: string } {
    const slugPath = slug.split('/')
    return {
        orgName: slugPath[0],
        appName: slugPath[1],
    }
}

export const distribute = new Command('distribute')
    .requiredOption('--slug <string>', 'Slug of you app')
    .requiredOption('--file <string>', 'File path to your app')
    .requiredOption('--api-key <string>')
    .option('--release-notes <string>')
    .option('--url <url>')
    .option('--group <string...>')
    .option('--version-name <string>', 'Version name of your desktop app (e.g v1.0.0)')
    .option('--version-code <string>', 'Version code of your desktop app (e.g 1)')
    .action(async (options) => {
        const optUrl = options.url || process.env.DISTAPP_CLI_URL || 'https://distapp.lhf.my.id'
        updateMyFetch(options.apiKey, optUrl)
        const { orgName, appName } = slugToOrgApp(options.slug!)
        const filePath = resolve(options.file!)
        const filename = basename(filePath)
        const file = await promises.readFile(filePath)
        console.log("Distributing", {
            filePath,
        })
        var bundleApkPath: string | undefined = undefined
        var disposeBundle: (() => Promise<void>) | undefined
        try {
            if (filePath.endsWith('.aab')) {
                const aabPath = filePath
                const { bundleApk, dispose } = await extractAabToApk(aabPath)
                bundleApkPath = bundleApk
                disposeBundle = dispose
            }
            const bundleApkFile = bundleApkPath ? await promises.readFile(bundleApkPath) : undefined
            const { artifactId } = await uploadArtifact(file, filename, orgName, appName, options.releaseNotes ? options.releaseNotes : null, bundleApkFile
                , options.versionCode && options.versionName ? {
                    versionCode: options.versionCode,
                    versionName: options.versionName,
                } : undefined)
            const groupNames = options.group
            let updateToGroup = false
            if (artifactId && groupNames && groupNames.length) {
                await myFetch('/api/update-artifact-groups', {
                    body: {
                        artifactId: artifactId,
                        orgName: orgName,
                        appName: appName,
                        groupNames: groupNames,
                    } satisfies UpdateGroupsRequest,
                    method: 'put',
                })
                updateToGroup = true
            }
            const groups = groupNames?.join(', ')
            console.log(`Finished Distributing "${filePath}"` + (bundleApkPath ? ' with generated APK' : '') + (updateToGroup ? ` to groups ${groups}` : ''))
        } finally {
            await disposeBundle?.()
        }
    })
