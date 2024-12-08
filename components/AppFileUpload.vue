<template>
    <Drawer class="!w-[30rem]" position="right" header="Upload" v-model:visible="showUpload">
        <div class="flex flex-col gap-3" v-if="mimeTypeFromOsType">
            <div>
                <InputFileUpload v-model="fileList" type="file" :accept="mimeTypeFromOsType" @change="checkFile" />
            </div>
            <div class="flex flex-col gap-2">
                <label for="releasenotes">Release Notes</label>
                <Textarea rows="4" id="releasenotes" v-model="releaseNotes" aria-describedby="releasenotes-help" />
            </div>
            <div class="flex flex-col gap-2">
                <label>Groups</label>
                <MultiSelect v-model="selectedGroup" display="chip" :options="groups" optionLabel="name"
                    placeholder="Select Groups" filter />
            </div>
            <Button class="self-end mt-4" :label="isPending ? 'Uploading...' : 'Upload'" @click="submit"
                :loading="isPending" />
        </div>
    </Drawer>
</template>

<script setup lang="ts">
import { UpdateGroupsRequest } from '~/server/api/update-artifact-groups.put'

const showUpload = defineModel<boolean>()
const props = defineProps<{
    dataProps: any,
}>()
const emit = defineEmits(['onSuccess'])

const releaseNotes = ref<string | null>(null)
const osType = computed<OsType | null>(() => props.dataProps!.osType)
const orgName = computed(() => props.dataProps!.orgName)
const appName = computed(() => props.dataProps!.appName)
const groupName = computed(() => props.dataProps.groupName)

const mimeTypeFromOsType = computed(() => osType.value ? getMimeTypeFromosType(osType.value) : undefined)
const fileList = ref<FileList | undefined>()
// const fileApkRef = ref<HTMLInputElement | null>(null)
const showUploadFileApk = ref(false)
const isFileAab = ref(false)
function checkFile(event: Event) {
    const input = event.target as HTMLInputElement
    isFileAab.value = input.files?.item(0)?.name?.endsWith('.aab') || false
}

const { data: appGroups } = useFetch('/api/groups/list-groups', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})
const groups = computed(() => appGroups.value ?? [])
const selectedGroup = ref<typeof groups.value>()

watchEffect(() => {
    if (groupName.value) {
        const s = groups.value.find(e => e.name === groupName.value)
        if (s) {
            selectedGroup.value = [s]
        }
    }
})

const { mutateAsync, isPending } = useMutation({
    mutationFn: async (param: { file: File }) => {
        const { artifactId } = await onUpload(param.file, 'generate_bundle')
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
        if (fileList.value) {
            fileList.value = undefined
            emit('onSuccess')
        }
    },
})

const submit = async () => {
    const realFile = fileList.value?.length ? fileList.value[0] : undefined
    if (!realFile) {
        return
    }
    mutateAsync({
        file: realFile,
    })
}

const onUpload = async (file: File, fileApk: string) => {
    const data = await uploadArtifact(file, orgName.value, appName.value, releaseNotes.value, fileApk)
    return {
        artifactId: data!.artifactId,
    }
}
</script>
