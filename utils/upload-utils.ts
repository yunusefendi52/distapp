import { readPackageFile } from '@/utils/package-reader.js'
import { ofetch } from 'ofetch'

var myFetchApiKey: string
export function updateMyFetchApiKey(value: string) {
    myFetchApiKey = value
}
export const myFetch = ofetch.create({
    onRequest(request) {
        request.options.baseURL = 'http://localhost:3000'
        if (myFetchApiKey) {
            request.options.headers.append('API-KEY', myFetchApiKey)
        }
    }
})

export async function uploadArtifact(
    file: File | Buffer | ArrayBuffer | string | Blob,
    orgName: string,
    appName: string,
    releaseNotes: string | null,
) {
    const packageMetadata = await readPackageFile(file)
    const { url, uploadId } = await myFetch('/api/artifacts/upload-artifact', {
        method: 'post',
        body: {
            orgName: orgName,
            appName: appName,
        },
        onResponseError(r) {
            console.error('Error ', r.error)
        },
    })
    await myFetch(url, {
        method: 'put',
        body: file,
        redirect: "follow",
    })
    const data = await myFetch('/api/artifacts/upload-artifact-url', {
        method: 'post',
        body: {
            uploadId,
            appName: appName,
            orgName: orgName,
            releaseNotes: releaseNotes ? releaseNotes : undefined,
            packageMetadata,
        },
    })
    return data
}