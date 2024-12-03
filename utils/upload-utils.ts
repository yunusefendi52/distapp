import { readPackageFile } from '@/utils/package-reader.js'
import { ofetch } from 'ofetch'
import { normalizeError } from '~/utils/showErrorAlert.js'

var myFetchApiKey: string
export function updateMyFetchApiKey(value: string) {
    myFetchApiKey = value
}
export const myFetch = ofetch.create({
    onRequest(request) {
        request.options.baseURL = process.env.DISTAPP_CLI_URL
        if (myFetchApiKey) {
            request.options.headers.append('API-KEY', myFetchApiKey)
        }
    }
})

export type UploadArtifactResponse = {
    url: string,
    fileKey: string,
    apkUrl: {
        apkSignedUrl: string,
        apkFileKey: string,
    } | undefined
}

export async function uploadArtifact(
    file: File | Buffer | ArrayBuffer | string | Blob,
    orgName: string,
    appName: string,
    releaseNotes: string | null,
    fileApk: File | Buffer | ArrayBuffer | string | Blob | undefined,
) {
    const packageMetadata = await readPackageFile(file)
    if (!packageMetadata) {
        throw 'Cannot read package file'
    }
    const { url, fileKey, apkUrl } = await myFetch<UploadArtifactResponse>('/api/artifacts/upload-artifact', {
        method: 'post',
        body: {
            orgName: orgName,
            appName: appName,
            hasFileApk: fileApk ? true : false,
        },
        onResponseError(r) {
            console.error('Error ', normalizeError(r))
        },
    })
    async function uploadUrl() {
        await myFetch(url, {
            method: 'put',
            body: file,
            redirect: "follow",
        })
    }
    async function uploadApkUrl() {
        if (fileApk) {
            if (!apkUrl) {
                console.error('Something happen apkUrl is null')
            }
            await myFetch(apkUrl!.apkSignedUrl, {
                method: 'put',
                body: fileApk,
                redirect: 'follow'
            })
        }
    }
    await Promise.all([uploadUrl(), uploadApkUrl()])
    const data = await myFetch('/api/artifacts/upload-artifact-url', {
        method: 'post',
        body: {
            fileKey,
            apkFileKey: apkUrl?.apkFileKey,
            appName: appName,
            orgName: orgName,
            releaseNotes: releaseNotes ? releaseNotes : undefined,
            packageMetadata,
        },
    })
    return data
}