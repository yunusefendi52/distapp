<template>
    <div class="flex flex-col gap-2">
        <label class="font-bold text-small">Upload Here</label>
        <div class="border-2 border-dashed p-3 rounded flex flex-row items-center gap-3" style="
    border-color: var(--surface-border);">
            <input class="p-2 border rounded-lg" ref="fileRef" type="file" :accept="mimeTypeFromOsType">
            <Button label="Upload" @click="submit" :loading="isPending" />
        </div>
    </div>
</template>

<script setup lang="ts">
const osType = inject<OsType>('detail-app')
const mimeTypeFromOsType = getMimeTypeFromosType(osType)
const fileRef = ref<HTMLInputElement | null>(null)
const emit = defineEmits<{
    (event: 'onUpload', file: File, resolve: (value: unknown) => void, reject: (value: unknown) => void): void
}>()

const refreshListArtifacts = inject<any>('refresh-list-artifacts')

const { mutateAsync, isPending } = useMutation({
    mutationFn: async (file: File) => {
        await new Promise((resolve, reject) => {
            emit('onUpload', file, resolve, reject)
        })
    },
    onSuccess: () => {
        if (fileRef.value) {
            fileRef.value.value = ''
            refreshListArtifacts()
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
</script>
