export const useDownloadArtifact = (appName: string, orgName: string) => {
    const isDownloading = ref(false)

    const download = async (releaseId: string, publicId: string | undefined, hasApk: boolean) => {
        let url = `/api/artifacts/download-artifact?appName=${appName}&orgName=${orgName}&releaseId=${releaseId}&publicId=${publicId || ''}&hasApk=${hasApk}`
        if (isIosDevice()) {
            try {
                isDownloading.value = true
                url = `${url}&hasManifestPList=true`
                const data = await $fetch(url, {
                    query: {
                        hasManifestPList: true,
                    },
                })
                const manifestLink = generateManifestLink(data, orgName, appName, releaseId, publicId)
                if (import.meta.dev) {
                    console.log('manifestLink', manifestLink)
                }
                document.location = manifestLink
            } finally {
                isDownloading.value = false
            }
        } else {
            window.open(url, '_blank')
        }
    }

    return {
        download,
        isDownloading,
    }
}