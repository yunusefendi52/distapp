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
    console.log(event.data)
    const orgName = event.data.organization.name
    navigateTo(`/orgs/${orgName}/apps/${appName}`)
};

const addOrgVisible = ref(false)

const items: MenuItem[] = [{
    label: 'Add Organization',
    command: () => {
        addOrgVisible.value = true
    },
}]

const orgName = ref('')
const orgNameNormalized = computed(() => normalizeName(orgName.value))
const { mutateAsync, isPending } = useMutation({
    mutationFn: (r: any) => $fetch('/api/create-org', {
        method: 'post',
        body: r,
    }),
    onSuccess: async (r) => {
        orgsStore.refresh()
        addOrgVisible.value = false
        navigateTo(`/orgs/${r.normalizedOrgName}`)
        orgName.value = ''
    },
})

const saveOrg = async () => {
    await mutateAsync({
        name: orgNameNormalized.value,
        displayName: orgName.value,
    })
}

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
    <div class="card pt-2" style="padding: 0px;">
        <div class="flex flex-col gap-3 px-3 py-3 sm:flex-row">
            <div class="flex flex-row items-center gap-2 sm:flex-1">
                <div class="flex-1 flex gap-3 items-center">
                    <label class="text-2xl font-bold">Apps</label>
                    <ProgressSpinner style="width: 22px; height: 22px; margin: unset;" strokeWidth="6" v-if="pending" />
                </div>
                <div>
                    <NuxtLink :to="`/orgs/${orgNameParam}/settings`" append v-if="isOrg">
                        <Button icon="pi pi-cog" severity="secondary" rounded aria-label="Settings" />
                    </NuxtLink>
                </div>
            </div>
            <div class="flex flex-row gap-3">
                <form @submit="search" class="flex-1 flex-shrink-0">
                    <IconField iconPosition="left" styl>
                        <InputIcon class="pi pi-search"> </InputIcon>
                        <InputText style="width: 100%;" placeholder="Search" name="search" />
                    </IconField>
                </form>
                <div class="flex-shrink">
                    <SplitButton label="Add App" :model="items" @click="addApp" v-if="!isOrg"></SplitButton>
                    <Button label="Add App" @click="addApp" v-if="isOrg"></Button>
                </div>
            </div>
        </div>
        <DataTable scrollable :value="apps" :rows="99999" responsiveLayout="scroll" @rowSelect="onRowSelect"
            selectionMode="single">
            <Column header="Name">
                <template #body="prop">
                    <div class="flex flex-row gap-3 items-center px-3 py-2">
                        <div class="rounded flex items-center justify-center"
                            style="height: 34px; width: 34px; background-color: #ece9fc; color: #2a1261">
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
                    <label>No data found</label>
                </div>
            </template>
        </DataTable>
    </div>

    <Dialog v-model:visible="addOrgVisible" modal header="Add Organization">
        <form @submit.prevent="saveOrg">
            <div class="flex flex-column gap-3 w-25rem">
                <InputText name="name" v-model="orgName"></InputText>
                <Button label="Save" type="submit" :loading="isPending"></Button>
            </div>
        </form>
    </Dialog>
</template>
