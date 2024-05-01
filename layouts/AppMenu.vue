<script setup lang="ts">
const orgsStore = await useOrgsStore()

const items = computed(() => [{
    label: 'All Apps',
    icon: 'pi pi-th-large',
    route: '/apps'
}, ...orgsStore.orgs.value.map((e) => ({
    label: e.displayName,
    icon: 'pi pi-users',
    route: `/orgs/${e.name}`
}))])

const route = useRoute()
const routePath = computed(() => route.path)
const orgName = computed(() => route.params.orgName as string)
</script>

<template>
    <div class="p-2 flex gap-2 flex-column">
        <router-link v-for="(item, index) in items" :key="index" :to="item.route" custom
            v-slot="{ href, route, navigate, isActive, isExactActive }">
            <a :active="item.route.endsWith(orgName) || routePath === route.path" :href="href" @click="navigate" class="cursor-pointer">
                <div class="flex flex-row px-3 py-2.5 gap-3 rounded-md" style="align-items: center;"
                    :class="{ 'menu-active': item.route.endsWith(orgName) || routePath === route.path }">
                    <i class="text-xl" :class="item.icon">
                    </i>
                    <label :class="{ 'font-bold': item.route.endsWith(orgName) || routePath === route.path }">{{
                        item.label }}</label>
                </div>
            </a>
        </router-link>
    </div>
</template>

<style lang="scss" scoped>
.menu-active {
    background: var(--surface-border);
}
</style>
