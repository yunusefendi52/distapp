<template>
    <div class="px-4 py-3" style="background-color: var(--surface-card);">
        <label class="font-bold text-lg">DistApp</label>
    </div>
    <div class="flex flex-col items-center">
        <div class="container flex flex-col gap-3 p-3">
            <div>
                <h1>{{ data?.app.displayName }}</h1>
                <h6>{{ data?.app.osType }} | {{ data?.org.displayName }}</h6>
            </div>
            <Panel v-for="item in data?.artifacts" :key="item.id">
                <template #header>
                    <div class="flex flex-row w-full">
                        <div class="flex-1 flex flex-col">
                            <a :name="item.id" :href="'#' + item.id" class="font-bold">Version {{ item.versionName2 }}
                                ({{
                                    item.releaseId
                                }})</a>
                            <span>{{ formatDate(item.createdAt) }}</span>
                            <!-- <span>30mbbb</span> -->
                        </div>
                        <div>
                            <Button label="Download" />
                        </div>
                    </div>
                </template>
                <template #default>
                    <div v-if="item.releaseNotes">
                        {{ item.releaseNotes }}
                    </div>
                    <div v-else>
                        -
                    </div>
                </template>
            </Panel>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: false,
})

const route = useRoute()
const { value: { publicId } } = computed(() => route.params)

const { data } = await useFetch('/api/install/get-data', {
    query: {
        publicId,
    },
})

useSeoMeta({
    title: `DistApp - ${data.value?.app.name ?? ''}`
})

</script>

<style scoped>
.container {
    width: 100%;
}

@media only screen and (min-width: 600px) {
    .container {
        width: 576px;
    }
}
</style>