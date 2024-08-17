<template>
    <div class="flex flex-col gap-3" v-if="mimeTypeFromOsType">
        <input class="p-2 border rounded-lg" ref="fileRef" type="file" :accept="mimeTypeFromOsType">
        <div class="flex flex-col gap-2">
            <label for="releasenotes">Release Notes</label>
            <InputText id="releasenotes" v-model="releaseNotes" aria-describedby="releasenotes-help" />
        </div>
        <div class="flex flex-col gap-2">
            <label for="releasenotes">Groups</label>
            <MultiSelect v-model="selectedGroup" display="chip" :options="groups" optionLabel="name"
                placeholder="Select Groups" />
        </div>
        <Button :label="isPending ? 'Uploading...' : 'Upload'" @click="submit" :loading="isPending" />
    </div>
</template>

<script setup lang="ts">
import { UpdateGroupsRequest } from '~/server/api/update-artifact-groups.put';

const releaseNotes = ref<string | null>(null)
const dialogRef = inject<any>('dialogRef');
const osType = ref<OsType | null>(null)
const prop = ref<any>(null)
const orgName = ref<string>('')
const appName = ref<string>('')
prop.value = dialogRef.value.data.props
osType.value = dialogRef.value.data.props.osType
orgName.value = dialogRef.value.data.props.orgName
appName.value = dialogRef.value.data.props.appName

const mimeTypeFromOsType = computed(() => osType.value ? getMimeTypeFromosType(osType.value) : undefined)
const fileRef = ref<HTMLInputElement | null>(null)

const { data: appGroups } = useFetch('/api/groups/list-groups', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})
const groups = computed(() => appGroups.value ?? [])
const selectedGroup = ref<any[]>()

const { mutateAsync, isPending } = useMutation({
    mutationFn: async (file: File) => {
        const { artifactId } = await onUpload(file)
        const groupIds = selectedGroup.value?.map(e => e.id) ?? []
        if (artifactId && groupIds && groupIds.length) {
            await $fetch('/api/update-artifact-groups', {
                body: {
                    artifactId: artifactId,
                    groupIds: groupIds,
                } satisfies UpdateGroupsRequest,
                method: 'put',
            })
        }
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
    const packageMetadata = await readPackageFile(file)
    const { url, uploadId } = await $fetch('/api/artifacts/upload-artifact', {
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
    const data = await $fetch('/api/artifacts/upload-artifact-url', {
        method: 'post',
        body: {
            uploadId,
            ...prop.value,
            releaseNotes: releaseNotes.value,
            packageMetadata,
        },
    })
    return {
        artifactId: data?.artifactId,
    }
};
</script>
