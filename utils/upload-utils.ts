import { readPackageFile } from '@/utils/package-reader.js'
import { ofetch } from 'ofetch'
import { normalizeError } from '~/utils/showErrorAlert.js'

var myFetchApiKey: string
export var myFetchApiUrl: string
export function updateMyFetch(apiKey: string, fetchApiUrl: string) {
    myFetchApiKey = apiKey
    myFetchApiUrl = fetchApiUrl
}
export const myFetch = ofetch.create({
    retry: false,
    onRequest(request) {
        if (myFetchApiUrl) {
            request.options.baseURL = myFetchApiUrl
        }
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

function getSizeFromFile(
    input: File | Buffer | any
) {
    let sizeInBytes: number | undefined = undefined

    if (input && input instanceof File) {
        sizeInBytes = input.size
    } else if (input && input.length) {
        sizeInBytes = input.length
    }

    return sizeInBytes
}

export async function uploadArtifact(
    file: File | Buffer,
    filename: string,
    orgName: string,
    appName: string,
    releaseNotes: string | null,
    fileApk: File | Buffer | 'generate_bundle' | undefined,
) {
    const packageMetadata = await readPackageFile(file)
    if (!packageMetadata) {
        throw 'Cannot read package file'
    }
    const fileSize = getSizeFromFile(file)
    const fileSizeApk = getSizeFromFile(fileApk)
    const { url, fileKey, apkUrl, uploadId } = await myFetch<UploadArtifactResponse>('/api/artifacts/upload-artifact', {
        method: 'post',
        body: {
            orgName: orgName,
            appName: appName,
            hasFileApk: fileApk && fileApk !== 'generate_bundle' ? true : false,
            filename: filename,
            fileSize,
            fileSizeApk,
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
    let headlessApkFileKey: string | undefined = undefined
    let headlessUploadId: string | undefined = undefined
    async function uploadApkUrl() {
        if (generateBundleHeadless) {
            if (apkUrl) {
                throw 'Not invalid upload URL. Should not have one'
            }

            await myFetch.raw('/api/artifacts/generate-bundle-headless', {
                timeout: 60 * 60000, // 60 minutes
                keepalive: true,
                query: {
                    orgName,
                    appName,
                    fileKey,
                    hostOrigin: window.origin,
                },
                // mode: 'no-cors',
                redirect: 'follow',
                method: 'get',
            }).then(e => {
                if (!e.ok) {
                    throw `Error bundle ${e.status} - ${e.statusText}`
                }
                headlessApkFileKey = e._data.headlessApkFileKey
                headlessUploadId = e._data.headlessUploadIdHeadless
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
    const apkFileKey = apkUrl?.apkFileKey || headlessApkFileKey
    if (generateBundleHeadless && !headlessApkFileKey) {
        throw 'Server error upload apk file'
    }
    if (generateBundleHeadless && !headlessUploadId) {
        throw 'Server error upload id file'
    }
    const data = await myFetch('/api/artifacts/upload-artifact-url', {
        method: 'post',
        body: {
            uploadId,
            fileKey,
            apkFileKey: apkFileKey,
            appName: appName,
            orgName: orgName,
            releaseNotes: releaseNotes ? releaseNotes : undefined,
            packageMetadata,
            filename: filename,
            headlessUploadId,
        },
    })
    return data
}