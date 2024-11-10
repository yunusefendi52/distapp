<script setup lang="ts">
const orgsStore = await useOrgsStore()

const items = computed(() => [{
    label: 'All Apps',
    icon: 'pi pi-th-large',
    routeName: 'apps',
    routeParams: undefined,
    name: undefined,
}, ...orgsStore.orgs.value.map((e) => ({
    label: e.displayName,
    icon: 'pi pi-users',
    routeName: 'orgs',
    routeParams: {
        orgName: e.name,
    },
    name: e.name,
}))])

const route = useRoute()
const routePath = computed(() => route.path)
const orgName = computed(() => route.params.orgName as string)
</script>

<template>
    <div class="px-3 py-4 flex gap-3 flex-col">
        <ProgressSpinner style="width: 22px; height: 22px; margin: unset;" strokeWidth="6" class="self-center"
            v-if="orgsStore.status.value === 'pending'" />
        <NuxtLink v-else v-for="(item, index) in items" :key="index" :to="{
            name: item.routeName,
            params: item.routeParams,
        }" custom v-slot="{ href, route, navigate, isActive, isExactActive }">
            <a :active="item.routeParams?.orgName === orgName || item.name === orgName || routePath === route.path"
                :href="href" @click="navigate" class="cursor-pointer">
                <div class="flex flex-row px-3 py-2.5 gap-3 rounded-md menu-hover" style="align-items: center;"
                    :class="{ 'menu-active': item.routeParams?.orgName == orgName || item.name === orgName || routePath === route.path }">
                    <i :class="item.icon" style="font-size: 1.25rem">
                    </i>
                    <label
                        :class="{ 'font-bold': item.routeParams?.orgName == orgName || item.name === orgName || routePath === route.path }">{{
                            item.label }}</label>
                </div>
            </a>
        </NuxtLink>
    </div>
</template>

<style lang="scss" scoped>
.menu-active {
    background: rgb(238, 238, 238);
}

.menu-hover:hover {
    background: rgb(238, 238, 238);
}

.appdark {
    .menu-active {
        background: var(--p-navigation-item-focus-background);
    }

    .menu-hover:hover {
        background: var(--p-navigation-item-focus-background);
    }
}
</style>
