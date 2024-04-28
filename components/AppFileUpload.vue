<template>
    <div class="flex flex-column gap-3">
        <input class="p-2 border rounded-lg" ref="fileRef" type="file" :accept="mimeTypeFromOsType">
        <div class="flex flex-column gap-2">
            <label for="releasenotes">Release Notes</label>
            <InputText id="releasenotes" v-model="releaseNotes" aria-describedby="releasenotes-help" />
        </div>
        <Button label="Upload" @click="submit" :loading="isPending" />
    </div>
</template>

<script setup lang="ts">
const releaseNotes = ref<string | null>(null)
const dialogRef = inject<any>('dialogRef');
const osType = ref<OsType | null>(null)
const prop = ref<any>(null)
const orgName = ref<string>('')
const appName = ref<string>('')
onMounted(() => {
    osType.value = dialogRef.value.data.osType;
    prop.value = dialogRef.value.data.props
    orgName.value = dialogRef.value.data.orgName
    appName.value = dialogRef.value.data.appName
})

const mimeTypeFromOsType = computed(() => getMimeTypeFromosType(osType.value ?? 'android'))
const fileRef = ref<HTMLInputElement | null>(null)

const { mutateAsync, isPending } = useMutation({
    mutationFn: async (file: File) => {
        await onUpload(file)
    },
    onSuccess: () => {
        if (fileRef.value) {
            fileRef.value.value = ''
            dialogRef.value.close({
                success: true,
            });
        }
    },
})

const submit = async () => {
    const inputFile = fileRef.value as HTMLInputElement | null
    const realFile = inputFile?.files && inputFile?.files.length ? inputFile.files[0] : undefined
    if (!realFile) {
        return
    }
    mutateAsync(realFile)
}



const onUpload = async (file: File) => {
    const { url, file: key } = await $fetch('/api/artifacts/upload-artifact', {
        method: 'post',
        body: {
            orgName: orgName.value,
            appName: appName.value,
        },
    })
    await $fetch(url, {
        method: 'put',
        body: file,
        redirect: "follow",
    })
    await $fetch('/api/artifacts/upload-artifact-url', {
        method: 'post',
        body: {
            key: key,
            ...prop.value,
            releaseNotes: releaseNotes.value,
        },
    })
};
</script>
