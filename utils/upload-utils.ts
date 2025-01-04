import { readPackageFile } from '@/utils/package-reader.js'
import { ofetch } from 'ofetch'
import { normalizeError } from '~/utils/showErrorAlert.js'

var myFetchApiKey: string
export function updateMyFetchApiKey(value: string) {
    myFetchApiKey = value
}
export const myFetch = ofetch.create({
    retry: false,
    onRequest(request) {
        request.options.baseURL = process.env.DISTAPP_CLI_URL
        if (myFetchApiKey) {
            request.options.headers.append('API-KEY', myFetchApiKey)
        }
    }
})

export type UploadArtifactResponse = {
    uploadId: string,
    url: string,
    fileKey: string,
    apkUrl: {
        apkSignedUrl: string,
        apkFileKey: string,
    } | undefined
}

export async function uploadArtifact(
    file: File | Buffer | ArrayBuffer | string | Blob,
    filename: string,
    orgName: string,
    appName: string,
    releaseNotes: string | null,
    fileApk: File | Buffer | ArrayBuffer | string | Blob | undefined,
) {
    const packageMetadata = await readPackageFile(file)
    if (!packageMetadata) {
        throw 'Cannot read package file'
    }
    const { url, fileKey, apkUrl, uploadId } = await myFetch<UploadArtifactResponse>('/api/artifacts/upload-artifact', {
        method: 'post',
        body: {
            orgName: orgName,
            appName: appName,
            hasFileApk: fileApk ? true : false,
            filename: filename,
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
    const generateBundleHeadless = fileApk === 'generate_bundle'
    async function uploadApkUrl() {
        if (generateBundleHeadless) {
            await myFetch.raw('/api/artifacts/generate-bundle-headless', {
                timeout: 60 * 60000, // 60 minutes
                keepalive: true,
                query: {
                    orgName,
                    appName,
                    fileKey,
                    apkFileKey: apkUrl?.apkFileKey,
                    apkSignedUrl: apkUrl?.apkSignedUrl,
                    hostOrigin: window.origin,
                },
                // mode: 'no-cors',
                redirect: 'follow',
                method: 'get',
            }).then(e => {
                if (!e.ok) {
                    throw `Error bundle ${e.status} - ${e.statusText}`
                }
                return e
            })
        } else if (fileApk) {
            if (fileApk && !apkUrl) {
                console.error('Something happen apkUrl is null. Shouldnt happen')
            }
            await myFetch.raw(apkUrl!.apkSignedUrl, {
                timeout: 60 * 60000, // 60 minutes
                method: 'put',
                body: fileApk,
                redirect: 'follow'
            })
        }
    }
    if (generateBundleHeadless) {
        await uploadUrl()
        await uploadApkUrl()
    } else {
        await Promise.all([uploadUrl(), uploadApkUrl()])
    }
    const data = await myFetch('/api/artifacts/upload-artifact-url', {
        method: 'post',
        body: {
            uploadId,
            fileKey,
            apkFileKey: apkUrl?.apkFileKey,
            appName: appName,
            orgName: orgName,
            releaseNotes: releaseNotes ? releaseNotes : undefined,
            packageMetadata,
            filename: filename,
        },
    })
    return data
}