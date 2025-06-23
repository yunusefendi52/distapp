<template>
    <Drawer class="!w-[30rem]" position="right" header="Upload" v-model:visible="showUpload">
        <div class="flex flex-col gap-3" v-if="allowedExts">
            <div>
                <InputFileUpload dataTestId="upload_input_btn" v-model="fileList" type="file"
                    :allowed-exts="allowedExts" @change="checkFile" />
                <div v-if="isFileAab">
                    <div class="text-m mb-2">
                        <span class="text-sm dark:text-neutral-200">
                            <span class="">You can use CLI to generate APK automatically. </span>
                            <a href="https://github.com/yunusefendi52/distapp?tab=readme-ov-file#cli-usage"
                                class="underline" target="_blank">Learn
                                more.</a>
                            <br>
                        </span>
                    </div>
                    <div class="flex flex-row items-center gap-2 mt-3">
                        <Checkbox v-model="generateApk" inputId="generate_apk" binary />
                        <label class="cursor-pointer text-sm dark:text-neutral-200" for="generate_apk">
                            Build APK (slower - use CLI for faster builds)
                        </label>
                    </div>
                    <div class="mt-4" v-if="!generateApk">
                        <InputFileUpload v-model="fileApkRef" type="file"
                            accept="application/vnd.android.package-archive" placeholder="Click to attach APK" />
                    </div>
                </div>
            </div>
            <div class="flex flex-row gap-2" v-if="osType === 'desktop'">
                <div class="flex-1 flex flex-col gap-2">
                    <label for="versionname">Version Name</label>
                    <InputText id="versionname" data-testid="i_versionname" fluid v-model="versionName" placeholder="e.g 1.0.0" />
                </div>
                <div class="flex-1 flex flex-col gap-2">
                    <label for="versioncode">Version Code</label>
                    <InputText id="versioncode" data-testid="i_versioncode" fluid v-model="versionCode" placeholder="e.g 1" />
                </div>
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
                data-testid="submit_upload_btn" :loading="isPending" />
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
const versionName = ref<string | undefined>(undefined)
const versionCode = ref<string | undefined>(undefined)
const osType = computed<OsType | null>(() => props.dataProps!.osType)
const orgName = computed(() => props.dataProps!.orgName)
const appName = computed(() => props.dataProps!.appName)
const groupName = computed(() => props.dataProps.groupName)

const allowedExts = computed(() => osType.value ? getAllowedExtsFromOstype(osType.value) : undefined)
const fileList = ref<FileList | undefined>()
const fileApkRef = ref<FileList | undefined>()
const isFileAab = ref(false)
function checkFile(files: FileList | undefined) {
    isFileAab.value = files?.item(0)?.name?.endsWith('.aab') || false
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
    mutationFn: async (param: { file: File, fileApk: File | 'generate_bundle' | undefined }) => {
        const { artifactId } = await onUpload(param.file, param.fileApk)
        const groupIds = selectedGroup.value?.map(e => e.name) ?? []
        if (artifactId && groupIds && groupIds.length) {
            await $fetch('/api/update-artifact-groups', {
                body: {
                    artifactId: artifactId,
                    orgName: orgName.value,
                    appName: appName.value,
                    groupNames: groupIds,
                } satisfies UpdateGroupsRequest,
                method: 'put',
            })
        }
    },
    onSuccess: () => {
        if (fileList.value) {
            fileList.value = undefined
            fileApkRef.value = undefined
            releaseNotes.value = null
            selectedGroup.value = undefined
            emit('onSuccess')
        }
    },
})

const submit = async () => {
    const realFile = fileList.value?.length ? fileList.value[0] : undefined
    if (!realFile) {
        return
    }
    const actualApkFile = fileApkRef.value?.length ? fileApkRef.value[0] : undefined
    const isFileAab = realFile.name?.endsWith('.aab') || false
    mutateAsync({
        file: realFile,
        // fileApk: realApkFile,
        fileApk: isFileAab ? ((generateApk.value ? 'generate_bundle' : undefined) || actualApkFile) : undefined,
    })
}

const toast = useToast()

const onUpload = async (file: File, fileApk: File | 'generate_bundle' | undefined) => {
    try {
        const data = await uploadArtifact(file, file.name, orgName.value, appName.value, releaseNotes.value, fileApk,
            versionName.value && versionCode.value ? {
                versionName: versionName.value,
                versionCode: versionCode.value,
            } : undefined)
        return {
            artifactId: data!.artifactId,
        }
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: normalizeError(e),
            life: 3000,
        })
        throw e
    }
}

const { public: { UPLOAD_WITH_BUILD_APK } } = useRuntimeConfig()
const generateApk = ref(UPLOAD_WITH_BUILD_APK)
</script>
