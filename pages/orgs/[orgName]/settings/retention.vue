<template>
    <div class="flex flex-col gap-4 py-2">
        <!-- Organization retention defaults -->
        <AppCard>
            <div class="p-4 flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <div class="text-lg font-semibold">Organization retention</div>
                    <p class="text-sm text-surface-500">
                        Applies to all apps without custom retention settings. Enabling this will delete old artifacts
                        from those apps during the next purge.
                    </p>
                </div>
                <div class="flex flex-row items-center gap-3">
                    <ToggleSwitch v-model="form.enabled" data-testid="org_retention_enabled"
                        @update:model-value="onEnabledChange" />
                    <label for="orgRetentionEnabled">Enable retention</label>
                </div>
                <div class="flex flex-col gap-2">
                    <label>Mode</label>
                    <Select v-model="form.mode" :options="modeOptions" option-label="label" option-value="value"
                        :disabled="!form.enabled" class="max-w-sm" data-testid="org_retention_mode" />
                </div>
                <div class="flex flex-col md:flex-row gap-3">
                    <div class="flex flex-col gap-2 flex-1">
                        <label>Keep latest (number of artifacts)</label>
                        <InputNumber v-model="form.keepLatest" :min="1" :max="256" show-buttons
                            :disabled="!form.enabled || form.mode === 'days'" data-testid="org_retention_keep_latest" />
                    </div>
                    <div class="flex flex-col gap-2 flex-1">
                        <label>Keep days</label>
                        <InputNumber v-model="form.keepDays" :min="1" :max="730" show-buttons
                            :disabled="!form.enabled || form.mode === 'latest'" data-testid="org_retention_keep_days" />
                    </div>
                </div>
                <Button label="Save" class="sm:self-start" :loading="saving" data-testid="org_retention_save"
                    @click="saveSettings" />
            </div>
        </AppCard>

        <!-- Apps using these defaults -->
        <AppCard>
            <div class="p-4 flex flex-col gap-3">
                <div class="flex flex-col gap-1">
                    <div class="text-lg font-semibold">Apps</div>
                    <p class="text-sm text-surface-500">
                        Apps marked as custom can be configured from the app settings retention page.
                    </p>
                </div>
                <DataTable :value="appRows" :show-gridlines="false" data-testid="org_retention_apps_table">
                    <Column field="name" header="App Name">
                        <template #body="{ data }">
                            <span class="font-semibold">{{ data.name }}</span>
                        </template>
                    </Column>
                    <Column field="status" header="Retention">
                        <template #body="{ data }">
                            <Badge :value="data.status" :severity="data.status === 'INHERIT' ? 'contrast' : 'info'" />
                        </template>
                    </Column>
                    <Column field="settings" header="Settings" />
                    <Column header="" style="width: 3rem">
                        <template #body="{ data }">
                            <Button icon="pi pi-cog" text class="p-0" data-testid="org_retention_app_settings" @click="() => openAppSettings(data.appName)" />
                        </template>
                    </Column>
                    <template #empty>
                        <div class="flex items-center justify-center py-3">
                            <label>No apps found</label>
                        </div>
                    </template>
                </DataTable>
            </div>
        </AppCard>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    name: 'orgs-orgName-settings-retention',
})

type RetentionMode = 'latest' | 'days'

const { params } = useRoute()
const orgName = computed(() => params.orgName as string)
const toast = useToast()

const { data: orgs, refresh: refreshOrgs } = useFetch('/api/list-orgs', {
    query: {
        orgName,
    },
})
const org = computed(() => orgs.value?.[0])

const { data: apps, refresh: refreshApps } = useFetch('/api/list-apps', {
    query: {
        orgName,
    },
})

const modeOptions: { label: string, value: RetentionMode }[] = [
    { label: 'Keep artifacts newer than X days', value: 'days' },
    { label: 'Keep latest N artifacts', value: 'latest' },
]

const modeLabel = (mode: string | null | undefined) => {
    return modeOptions.find(v => v.value === mode)?.label ?? String(mode)
}

const isValidMode = (mode: string | null | undefined): mode is RetentionMode => {
    return !!mode && modeOptions.some(v => v.value === mode)
}

// Default the mode to the first option when enabling retention
const onEnabledChange = (value: boolean) => {
    if (value && !isValidMode(form.value.mode)) {
        form.value.mode = modeOptions[0].value
    }
}

const form = ref({
    enabled: false,
    mode: 'days' as RetentionMode,
    keepLatest: null as number | null,
    keepDays: null as number | null,
})
watchEffect(() => {
    if (org.value) {
        form.value = {
            enabled: org.value.retentionEnabled ?? false,
            mode: isValidMode(org.value.retentionMode) ? org.value.retentionMode : modeOptions[0].value,
            keepLatest: org.value.retentionKeepLatest ?? 10,
            keepDays: org.value.retentionKeepDays ?? 90,
        }
    }
})

const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async () => {
        return await $fetch.raw('/api/orgs/update-retention', {
            method: 'post',
            body: {
                orgName: orgName.value,
                retentionEnabled: form.value.enabled,
                retentionMode: form.value.mode,
                retentionKeepLatest: form.value.keepLatest ?? 10,
                retentionKeepDays: form.value.keepDays ?? 90,
            },
        })
    },
    onSuccess: async () => {
        await Promise.all([refreshOrgs(), refreshApps()])
        toast.add({
            severity: 'success',
            detail: 'Organization retention settings saved',
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
const saveSettings = () => save()

interface AppRow {
    id: string
    name: string
    appName: string
    displayName: string
    retentionEnabled: boolean | null
    retentionMode: string | null
}

const appRows = computed(() => {
    return ((apps.value ?? []) as AppRow[]).map((app) => {
        const isCustom = !!app.retentionMode && app.retentionMode !== 'inherit'
        return {
            id: app.id,
            name: app.displayName,
            appName: app.name,
            status: !isCustom ? 'INHERIT' : (app.retentionEnabled ? 'CUSTOM' : 'DISABLED'),
            settings: !isCustom
                ? 'Uses organization settings'
                : (app.retentionEnabled ? modeLabel(app.retentionMode) : 'Retention off for this app'),
        }
    })
})

const openAppSettings = async (appName: string) => {
    await navigateTo({
        name: 'app-info-retention',
        params: {
            orgName: orgName.value,
            appId: appName,
        },
    })
}
</script>
