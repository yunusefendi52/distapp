<template>
    <div v-if="!app" class="py-2">
        <ProgressSpinner style="width: 20px; height: 20px;" />
    </div>
    <div v-else class="flex flex-col gap-4 py-2">
        <!-- App level retention settings -->
        <AppCard>
            <div class="p-4 flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <div class="text-lg font-semibold">Retention</div>
                    <p class="text-sm text-surface-500">
                        Automatically delete old artifacts. By default this app follows the organization retention
                        settings, you can override them below.
                    </p>
                </div>
                <div class="flex flex-row items-center gap-3">
                    <ToggleSwitch v-model="form.override" data-testid="retention_override" @update:model-value="onOverrideChange" />
                    <label for="retentionOverride">Override organization retention settings</label>
                </div>

                <div v-if="!form.override" class="text-sm text-surface-500 border rounded-lg p-3 flex flex-col gap-1"
                    data-testid="retention_inherited">
                    <span class="font-semibold">Using organization settings</span>
                    <span>Status: {{ orgSettings?.enabled ? 'enabled' : 'disabled' }}</span>
                    <span v-if="orgSettings?.enabled">{{ orgRetentionDescription }}</span>
                    <span>Change it in
                        <NuxtLink
                            :to="{ name: 'orgs-orgName-settings-retention', params: { orgName: orgName } }"
                            class="text-sky-600 hover:text-sky-700 hover:underline dark:text-sky-400 dark:hover:text-sky-300"
                            data-testid="retention_org_settings_link">
                            Organization Settings &gt; Retention
                        </NuxtLink>.
                    </span>
                </div>

                <template v-else>
                    <div class="flex flex-row items-center gap-3">
                        <ToggleSwitch v-model="form.enabled" data-testid="retention_enabled"
                            @update:model-value="onEnabledChange" />
                        <label for="retentionEnabled">Enable retention for this app</label>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label>Mode</label>
                        <Select v-model="form.mode" :options="modeOptions" option-label="label" option-value="value"
                            :disabled="!form.enabled" class="max-w-sm" data-testid="retention_mode" />
                    </div>
                    <div class="flex flex-col md:flex-row gap-3">
                        <div class="flex flex-col gap-2 flex-1">
                            <label>Keep latest (number of artifacts)</label>
                            <InputNumber v-model="form.keepLatest" :min="1" :max="256" show-buttons
                                :disabled="!form.enabled || form.mode === 'days'" data-testid="retention_keep_latest" />
                        </div>
                        <div class="flex flex-col gap-2 flex-1">
                            <label>Keep days</label>
                            <InputNumber v-model="form.keepDays" :min="1" :max="730" show-buttons
                                :disabled="!form.enabled || form.mode === 'latest'" data-testid="retention_keep_days" />
                        </div>
                    </div>
                </template>
                <Button label="Save" class="sm:self-start" :loading="savingApp" data-testid="retention_save"
                    @click="saveAppSettings" />
            </div>
        </AppCard>

        <!-- Preview -->
        <AppCard>
            <div class="p-4 flex flex-col gap-3">
                <div class="flex flex-col gap-1">
                    <div class="text-lg font-semibold">Preview deletion</div>
                    <p class="text-sm text-surface-500">
                        Nothing is deleted here, this only shows which artifacts the current rules would remove during
                        the next purge.
                    </p>
                </div>
                <Button label="Preview Deletion" class="sm:self-start" :loading="previewing" data-testid="retention_preview"
                    @click="() => runPreview()" />
                <div v-if="preview" class="flex flex-col gap-3" data-testid="retention_preview_result">
                    <div v-if="!preview.artifactsToDelete.length" class="text-sm">
                        No artifacts would be deleted.
                    </div>
                    <template v-else>
                        <div class="text-sm">
                            {{ preview.artifactsToDelete.length }} artifact(s) would be deleted.
                        </div>
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="text-left border-b">
                                    <th class="p-3">Release ID</th>
                                    <th class="p-3">Version</th>
                                    <th class="p-3">Version Code</th>
                                    <th class="p-3">Created</th>
                                    <th class="p-3">Size</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="artifact in preview.artifactsToDelete" :key="artifact.id"
                                    class="border-b last:border-b-0 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800"
                                    data-testid="retention_preview_row"
                                    @click="goToRelease(artifact.releaseId)">
                                    <td class="p-3">
                                        <span class="font-semibold">{{ artifact.releaseId }}</span>
                                    </td>
                                    <td class="p-3">{{ artifact.versionName }}</td>
                                    <td class="p-3">{{ artifact.versionCode }}</td>
                                    <td class="p-3">{{ formatDate(artifact.createdAt) }}</td>
                                    <td class="p-3">{{ formatSize(artifact.fileContentLength) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </template>
                </div>
            </div>
        </AppCard>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    name: 'app-info-retention',
})

type RetentionMode = 'latest' | 'days'

interface RetentionSettings {
    enabled: boolean
    mode: RetentionMode
    keepLatest: number
    keepDays: number
}

interface PreviewArtifact {
    id: string
    versionName: string
    versionCode: string
    createdAt: string | null
    releaseId: number
    fileContentLength: number | null
    fileApkContentLength: number | null
}

interface PreviewResponse {
    appSettings: RetentionSettings
    artifactsToDelete: PreviewArtifact[]
}

const { params } = useRoute()
const orgName = computed(() => params.orgName as string)
const appName = computed(() => params.appId as string)
const toast = useToast()

const { data: app, refresh: refreshApp } = useFetch('/api/detail-app', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})

const detailOrg = useDetailGroup()
const orgSettings = computed(() => {
    const org = detailOrg.value
    if (!org) {
        return undefined
    }
    return {
        enabled: org.retentionEnabled ?? false,
        mode: (org.retentionMode as RetentionMode) ?? 'days',
        keepLatest: org.retentionKeepLatest ?? 10,
        keepDays: org.retentionKeepDays ?? 90,
    }
})

const modeOptions: { label: string, value: RetentionMode }[] = [
    { label: 'Keep artifacts newer than X days', value: 'days' },
    { label: 'Keep latest N artifacts', value: 'latest' },
]

const isValidMode = (mode: string | null | undefined): mode is RetentionMode => {
    return !!mode && modeOptions.some(v => v.value === mode)
}

const orgRetentionDescription = computed(() => {
    const settings = orgSettings.value
    if (!settings) {
        return undefined
    }
    if (settings.mode === 'latest') {
        return `Keep the latest ${settings.keepLatest} artifact(s)`
    }
    return `Keep artifacts newer than ${settings.keepDays} day(s)`
})

const form = ref({
    override: false,
    enabled: false,
    mode: 'days' as RetentionMode,
    keepLatest: null as number | null,
    keepDays: null as number | null,
})
watchEffect(() => {
    if (app.value) {
        const isOverride = !!app.value.retentionMode && app.value.retentionMode !== 'inherit'
        form.value = {
            override: isOverride,
            enabled: app.value.retentionEnabled ?? false,
            mode: isValidMode(app.value.retentionMode) ? app.value.retentionMode : modeOptions[0].value,
            keepLatest: app.value.retentionKeepLatest ?? 10,
            keepDays: app.value.retentionKeepDays ?? 90,
        }
    }
})

// Prefill with the organization values when switching to a custom config
const onOverrideChange = (value: boolean) => {
    if (value) {
        form.value.enabled = true
        form.value.keepLatest = orgSettings.value?.keepLatest ?? 10
        form.value.keepDays = orgSettings.value?.keepDays ?? 90
        form.value.mode = isValidMode(orgSettings.value?.mode)
            ? orgSettings.value.mode
            : modeOptions[0].value
    }
}

// Default the mode to the first option when enabling retention
const onEnabledChange = (value: boolean) => {
    if (value && !isValidMode(form.value.mode)) {
        form.value.mode = modeOptions[0].value
    }
}

const { mutate: saveApp, isPending: savingApp } = useMutation({
    mutationFn: async () => {
        const body = form.value.override
            ? {
                retentionEnabled: form.value.enabled,
                retentionMode: form.value.mode,
                retentionKeepLatest: form.value.keepLatest ?? 10,
                retentionKeepDays: form.value.keepDays ?? 90,
            }
            : {
                retentionEnabled: false,
                retentionMode: 'inherit' as const,
                retentionKeepLatest: null,
                retentionKeepDays: null,
            }
        return await $fetch('/api/apps/update-retention', {
            method: 'post',
            body: {
                orgName: orgName.value,
                appName: appName.value,
                ...body,
            },
        })
    },
    onSuccess: async () => {
        await refreshApp()
        toast.add({
            severity: 'success',
            detail: 'Retention settings saved',
            life: 3000,
        })
    },
    onError(error) {
        toast.add({
            severity: 'error',
            detail: error.message,
            life: 5000,
        })
    },
})
const saveAppSettings = () => saveApp()

const preview = ref<PreviewResponse | null>(null)

const goToRelease = async (releaseId: number) => {
    await navigateTo({
        name: 'orgs-orgName-apps-appId-releases-detailArtifact',
        params: {
            orgName: orgName.value,
            appId: appName.value,
            detailArtifact: String(releaseId),
        },
    })
}

const { mutate: runPreview, isPending: previewing } = useMutation({
    mutationFn: async () => {
        return await $fetch<PreviewResponse>('/api/apps/retention-preview', {
            method: 'get',
            query: {
                orgName: orgName.value,
                appName: appName.value,
            },
        })
    },
    onSuccess: (response) => {
        preview.value = response
    },
    onError(error) {
        toast.add({
            severity: 'error',
            detail: error.message,
            life: 5000,
        })
    },
})

const formatDate = (value: string | null | undefined) => {
    if (!value) {
        return '-'
    }
    return new Date(value).toLocaleString()
}

const formatSize = (value: number | null | undefined) => {
    if (!value || value <= 0) {
        return '-'
    }
    const units = ['B', 'KB', 'MB', 'GB']
    let size = value
    let index = 0
    while (size >= 1024 && index < units.length - 1) {
        size = size / 1024
        index++
    }
    return `${size.toFixed(1)} ${units[index]}`
}
</script>
