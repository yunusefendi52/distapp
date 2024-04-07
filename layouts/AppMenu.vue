<script setup lang="ts">
const orgsStore = useOrgsStore()

const items = computed(() => [{
    label: 'All Apps',
    icon: 'pi pi-home',
    route: '/apps'
}, ...orgsStore.orgs.map((e) => ({
    label: e.name,
    icon: 'pi pi-users',
    route: `/orgs/${e.name}`
}))])

await callOnce(orgsStore.fetchOrgs)

const route = useRoute()
const activeRoute = computed(() => route.path)

</script>

<template>
    <div class="p-2 flex gap-2 flex-column">
        <router-link v-for="(item, index) in items" :key="index" :to="item.route" custom
            v-slot="{ href, route, navigate, isActive, isExactActive }">
            <a :active="activeRoute.startsWith(item.route)" :href="href" @click="navigate" class="cursor-pointer">
                <div class="flex flex-row px-3 py-2.5 gap-3 rounded-md" style="align-items: center;"
                    :class="{ 'menu-active': activeRoute.startsWith(item.route) }">
                    <i class="text-xl" :class="item.icon">
                    </i>
                    <label :class="{ 'font-bold': isActive }">{{ item.label }}</label>
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
