<script setup lang="ts">
import { MenuItem } from 'primevue/menuitem';
import { CreateAppDialog } from '#components'
import { ListAppsRequest } from '~/server/api/list-apps.get';
import _ from 'lodash'
import { normalizeName } from '~/server/utils/utils';

const { name: routeName, params } = useRoute()
const orgNameParam = params.orgName
const isOrg = computed(() => routeName === 'orgs')

const orgsStore = await useOrgsStore()

const onRowSelect = (event: any) => {
    const appName = event.data.name
    const orgName = event.data.organization.name
    if (!orgName || !appName) {
        return
    }
    navigateTo({
        name: 'orgs-orgName-apps-appId',
        params: {
            orgName: orgName,
            appId: appName,
        },
    })
};

const request = ref<ListAppsRequest | undefined>({
    orgName: orgNameParam as string | undefined,
})
const { data: apps, refresh, pending } = useFetch('/api/list-apps', {
    query: request,
    watch: [request],
})

const dialog = useDialog()

const addApp = () => {
    dialog.open(CreateAppDialog, {
        props: {
            header: 'Add App',
            modal: true,
            style: {
                'width': '320px',
            },
        },
        data: {
            'orgName': orgNameParam,
        },
        onClose: (options) => {
            if (options?.data?.refresh) {
                refresh()
            }
        },
    })
}

const search = (e: any) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.target))
    request.value = _.omitBy({
        ...request.value,
        ...data,
    }, _.isEmpty)
}

const upperCase = (value: string | null | undefined) => {
    return value?.toUpperCase()
}
</script>

<template>
    <div>
        <AppBarContainer>
            <div class="flex flex-row items-center gap-2 sm:flex-1">
                <div class="flex-1 flex gap-3 items-center">
                    <AppTitle title="Apps" />
                    <ProgressSpinner style="width: 22px; height: 22px; margin: unset;" strokeWidth="6" v-if="pending" />
                </div>
                <div>
                    <NuxtLink :to="{
                        name: 'orgs-orgName-settings',
                        params: {
                            orgName: orgNameParam?.toString() ?? '',
                        },
                    }" v-if="isOrg">
                        <Button icon="pi pi-cog" outlined aria-label="Settings" />
                    </NuxtLink>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
                <form @submit="search" class="flex-1 flex-shrink-0">
                    <IconField iconPosition="left" styl>
                        <InputIcon class="pi pi-search"> </InputIcon>
                        <InputText style="width: 100%;" placeholder="Search" name="search" />
                    </IconField>
                </form>
                <div class="flex-shrink flex flex-row gap-2">
                    <template v-if="!isOrg">
                        <Button label="Add App" @click="addApp"></Button>
                    </template>
                    <Button label="Add App" @click="addApp" v-else></Button>
                </div>
            </div>
        </AppBarContainer>
        <DataTable :show-gridlines="false" :value="apps" @rowSelect="onRowSelect" selectionMode="single" class="m-4">
            <Column header="Name">
                <template #body="prop">
                    <div class="flex flex-row gap-5 items-center px-3 py-2">
                        <div class="rounded flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500"
                            style="height: 34px; width: 34px; background-color: var(--p-primary-200); color: #2a1261">
                            <label class="text-2xl">{{ upperCase(prop.data.displayName[0]) }}</label>
                        </div>
                        <label class="font-semibold text-lg">{{ prop.data.displayName }}</label>
                    </div>
                </template>
            </Column>
            <Column header="OS">
                <template #body="prop">
                    {{ prop.data.osType === 'android' ? 'Android' : 'iOS' }}
                </template>
            </Column>
            <Column header="Owner" v-if="!isOrg">
                <template #body="prop">
                    {{ prop.data.organization.displayName }}
                </template>
            </Column>
            <template #empty>
                <div class="flex items-center justify-center">
                    <label>No apps yet</label>
                </div>
            </template>
        </DataTable>
    </div>
</template>
