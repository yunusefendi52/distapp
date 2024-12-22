import { uploadArtifact, updateMyFetchApiKey } from '../utils/upload-utils.js'
import { promises } from "node:fs"
import { resolve } from "node:path"
import { parseArgs } from "node:util"
import { extractAabToApk } from './extract-aab-to-apk.js'
import { basename, extname } from 'path'

const args = parseArgs({
    options: {
        distribute: {
            type: 'boolean',
        },
        slug: {
            type: 'string',
        },
        file: {
            type: 'string',
        },
        releaseNotes: {
            type: 'string',
        },
        apiKey: {
            type: 'string',
        },
    },
})

const { values } = args

function slugToOrgApp(slug: string): { orgName: string, appName: string } {
    const slugPath = slug.split('/')
    return {
        orgName: slugPath[0],
        appName: slugPath[1],
    }
}

async function start() {
    if (!values.apiKey) {
        console.error('API Key required')
        return
    }
    updateMyFetchApiKey(values.apiKey)
    if (values.distribute) {
        const { orgName, appName } = slugToOrgApp(values.slug!)
        const filePath = resolve(values.file!)
        const filename = basename(filePath, extname(filePath))
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
            await uploadArtifact(file, filename, orgName, appName, values.releaseNotes ? values.releaseNotes : null, bundleApkFile)
            console.log('Finished Distributing', {
                filePath,
                bundleApkPath,
            })
        } finally {
            await disposeBundle?.()
        }
    } else {
        console.error('No valid command')
    }
}

start()