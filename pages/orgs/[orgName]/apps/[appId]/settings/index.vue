<template>
    <AppBarContainer>
        <div class="flex flex-row flex-1 gap-2 items-center">
            <span class="text-2xl font-bold">Apps Settings</span>
            <div v-if="status === 'pending'">
                <ProgressSpinner style="width: 22px; height: 22px" strokeWidth="6" />
            </div>
        </div>
    </AppBarContainer>
    <div class="flex flex-col gap-3 px-4 py-2">
        <TabMenu v-model:active-index="active" :model="items" :pt="{
            menu: 'remove-bg-tabmenu',
            menuitem: 'remove-bg-tabmenu',
        }" />
        <div :style="{
            display: active == 0 ? 'unset' : 'none',
        }">

        </div>
        <div :style="{
            display: active == 1 ? 'unset' : 'none',
        }">
            <div class="flex flex-col items-start gap-3 w-full">
                <Button @click="() => mutate()" :loading="isPending" label="Generate Token" />

                <AppCard class="p-4" v-show="data">
                    <span class="text-sm" style="color: var(--p-text-muted-color);">Keep this key safe</span>
                    <div class="flex flex-row gap-4 items-center">
                        <span class="flex-1 break-all flex-wrap text-xl">{{ data?.token }}</span>
                        <Button icon="pi pi-copy" @click="() => copyText(data?.token)" />
                    </div>
                </AppCard>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const items = ref([
    { label: 'App Info' },
    { label: 'API Keys' },
])

const active = ref(0)

const { params } = useRoute()

const appName = params.appId as string
const orgName = params.orgName as string

const detailApp = useFetch('/api/detail-app', {
    query: {
        appName: appName,
        orgName: orgName,
    },
})
const { status } = detailApp

// API Keys
const { mutate, data, isPending } = useMutation({
    mutationFn: async (r) => {
        return await $fetch('/api/api-keys/generate-api-key', {
            method: 'post',
            body: {
                orgName,
                appName,
            }
        })
    },
})
</script>

<style></style>