<script setup lang="ts">
const orgsStore = await useOrgsStore()

type MenuItemInfo = {
    label: string
    icon: string
    routeName: string
    routeParams?: { orgName: string }
}

const items = computed<MenuItemInfo[]>(() => [
    {
        label: 'All Apps',
        icon: 'pi pi-th-large',
        routeName: 'apps',
    },
    ...orgsStore.orgs.value.map((e): MenuItemInfo => ({
        label: e.displayName,
        icon: 'pi pi-users',
        routeName: 'orgs',
        routeParams: {
            orgName: e.name,
        },
    })),
])

const route = useRoute()
const { isOpen } = useAppDrawer()
const isItemActive = (item: MenuItemInfo) => {
    if (item.routeName === 'apps') return route.name === 'apps'
    return route.params.orgName === item.routeParams?.orgName
}

const closeDrawer = () => {
    isOpen.value = false
}
</script>

<template>
    <div class="flex flex-col gap-1 px-3 py-4" data-testid="a_menus">
        <template v-for="(item, index) in items" :key="index">
            <span v-if="index === 1"
                class="mt-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--p-text-color)]">
                Organizations
            </span>
            <div class="group menu-hover relative flex items-center rounded-md"
                :class="{ 'menu-active': isItemActive(item) }">
                <NuxtLink :to="{
                    name: item.routeName,
                    params: item.routeParams,
                }" custom v-slot="{ href, navigate }">
                    <a :href="href" @click="navigate($event); closeDrawer()"
                        class="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--p-primary-color)]"
                        :aria-current="isItemActive(item) ? 'page' : undefined" :data-testid="`amenu-${index}`">
                        <i :class="item.icon" style="font-size: 1.25rem"></i>
                        <span class="line-clamp-1 flex-1"
                            :class="{ '': isItemActive(item) }">{{ item.label }}</span>
                    </a>
                </NuxtLink>
                <NuxtLink v-if="item.routeName === 'orgs'" :to="{
                    name: 'org-settings-info',
                    params: {
                        orgName: item.routeParams?.orgName ?? '',
                    },
                }" custom v-slot="{ href, navigate }">
                    <a :href="href" @click.stop="navigate($event); closeDrawer()" aria-label="Organization settings"
                        class="mr-1 flex h-8 w-8 items-center justify-center rounded-md text-[var(--p-text-muted-color)] transition-colors hover:bg-[var(--p-surface-200)] hover:text-[var(--p-text-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--p-primary-color)] dark:hover:bg-[var(--p-surface-700)]">
                        <i class="pi pi-cog" style="font-size: 0.875rem"></i>
                    </a>
                </NuxtLink>
            </div>
        </template>
        <span v-if="orgsStore.status.value === 'pending' && orgsStore.orgs.value.length === 0"
            class="mt-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--p-text-color)]">
            Organizations
        </span>
        <div v-if="orgsStore.status.value === 'pending' && orgsStore.orgs.value.length === 0"
            data-testid="menu-loading" class="flex flex-col gap-3 px-3 py-2">
            <div v-for="i in 3" :key="i" class="flex items-center gap-3">
                <div class="sk h-4 w-4 animate-pulse rounded" />
                <div class="sk h-4 animate-pulse rounded" :style="{ width: `${45 + i * 12}%` }" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.menu-hover:hover:not(.menu-active) {
    background: var(--p-surface-100);
}

.menu-active {
    position: relative;
    background: var(--p-surface-200);
}

.menu-active::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    height: 1.25rem;
    width: 3px;
    transform: translateY(-50%);
    border-radius: 0 3px 3px 0;
    background: var(--p-primary-color);
}

.appdark {

    .menu-hover:hover:not(.menu-active) {
        background: rgb(255 255 255 / 0.03);
    }

    .menu-active {
        background: #1f1f1f;
    }
}

.sk {
    background-color: var(--p-surface-200);
}

.appdark .sk {
    background-color: var(--p-surface-700);
}
</style>
