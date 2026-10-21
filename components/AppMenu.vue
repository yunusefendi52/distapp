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
    <div class="px-3 py-4 flex gap-3 flex-col" data-testid="a_menus">
        <NuxtLink v-for="(item, index) in items" :key="index" :to="{
            name: item.routeName,
            params: item.routeParams,
        }" custom v-slot="{ href, route, navigate, isActive, isExactActive }">
            <a :active="item.routeParams?.orgName === orgName || item.name === orgName || routePath === route.path"
                :href="href" @click="navigate" class="cursor-pointer" :data-testid="`amenu-${index}`">
                <div class="flex flex-row justify-center px-3 py-2.5 gap-3 rounded-md menu-hover group" style="align-items: center;"
                    :class="{ 'menu-active': item.routeParams?.orgName == orgName || item.name === orgName || routePath === route.path }">
                    <i :class="item.icon" style="font-size: 1.25rem">
                    </i>
                    <div class="flex-1">
                        <span
                            class="line-clamp-1"
                            :class="{ 'font-bold': item.routeParams?.orgName == orgName || item.name === orgName || routePath === route.path }">{{
                                item.label }}</span>
                    </div>
                    <NuxtLink :to="{
                        name: 'org-settings-info',
                        params: {
                            orgName: item.routeParams?.orgName ?? '',
                        },
                    }" v-if="item.routeName === 'orgs'">
                        <div class="rounded border border-transparent p-1 group-hover:flex hidden items-center justify-center">
                           <i class="pi pi-cog" style="font-size: 0.75rem"></i>
                        </div>
                    </NuxtLink>
                </div>
            </a>
        </NuxtLink>
        <ProgressSpinner style="width: 22px; height: 22px; margin: unset;" strokeWidth="6" class="self-center"
            data-testid="menu-loading" v-if="orgsStore.status.value === 'pending'" />
    </div>
</template>

<style lang="scss" scoped>
$menuActiveColorLight: rgb(229, 229, 229);

.menu-active {
    background: $menuActiveColorLight;
}

.menu-hover:hover {
    background: $menuActiveColorLight;
}

.appdark {
    $menuActiveColorDark: var(--p-navigation-item-focus-background);

    .menu-active {
        background: $menuActiveColorDark;
    }

    .menu-hover:hover {
        background: $menuActiveColorDark;
    }
}
</style>
