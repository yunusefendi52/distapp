<script setup lang="ts">
const orgsStore = await useOrgsStore()

const items = computed(() => [{
    label: 'All Apps',
    icon: 'pi pi-th-large',
    route: '/apps/',
    name: undefined,
}, ...orgsStore.orgs.value.map((e) => ({
    label: e.displayName,
    icon: 'pi pi-users',
    route: `/orgs/${e.name}/`,
    name: e.name,
}))])

const route = useRoute()
const routePath = computed(() => route.path)
const orgName = computed(() => route.params.orgName as string)
</script>

<template>
    <div class="px-3 py-4 flex gap-2 flex-col">
        <NuxtLink v-for="(item, index) in items" :key="index" :to="item.route" custom
            v-slot="{ href, route, navigate, isActive, isExactActive }">
            <a :active="item.route.endsWith(orgName) || item.name === orgName || routePath === route.path" :href="href"
                @click="navigate" class="cursor-pointer">
                <div class="flex flex-row px-3 py-2.5 gap-3 rounded-md menu-hover" style="align-items: center;"
                    :class="{ 'menu-active': item.route.endsWith(orgName) || item.name === orgName || routePath === route.path }">
                    <i class="text-xl" :class="item.icon">
                    </i>
                    <label
                        :class="{ 'font-bold': item.route.endsWith(orgName) || item.name === orgName || routePath === route.path }">{{
    item.label }}</label>
                </div>
            </a>
        </NuxtLink>
    </div>
</template>

<style lang="scss" scoped>
.menu-active {
    background: var(--p-navigation-item-focus-background);
}

.menu-hover:hover {
    background: var(--p-navigation-item-focus-background);
}
</style>
