import { uploadArtifact, updateMyFetchApiKey } from '../utils/upload-utils.js'
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { parseArgs } from "node:util"

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
        const file = readFileSync(filePath)
        console.log("Distributing", {
            filePath,
        })
        await uploadArtifact(file, orgName, appName, values.releaseNotes ? values.releaseNotes : null, undefined)
        console.log('Finished Distributing', {
            filePath,
        })
    } else {
        console.error('No valid command')
    }
}

start()