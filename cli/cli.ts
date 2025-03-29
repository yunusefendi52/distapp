#!/usr/bin/env node

import { uploadArtifact, updateMyFetch } from '../utils/upload-utils.js'
import { promises } from "node:fs"
import { resolve } from "node:path"
import { parseArgs } from "node:util"
import { extractAabToApk } from './extract-aab-to-apk.js'
import { basename, extname } from 'path'
import { UpdateGroupsRequest } from '~/server/api/update-artifact-groups.put.js'
import { myFetch } from '../utils/upload-utils.js'

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
        url: {
            type: 'string',
            short: 'u',
            default: process.env.DISTAPP_CLI_URL || 'https://distapp.lhf.my.id',
        },
        group: {
            type: 'string',
            multiple: true,
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
        console.error('API Key required. Specify using --apiKey YOUR_API_KEY')
        return
    }
    updateMyFetch(values.apiKey, values.url)
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
            const { artifactId } = await uploadArtifact(file, filename, orgName, appName, values.releaseNotes ? values.releaseNotes : null, bundleApkFile)
            const groupNames = values.group
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
    } else {
        console.error('No valid command')
    }
}

start()