<template>
    <div v-if="status === 'pending'">
        <ProgressSpinner style="width: 40px; height: 40px; margin: unset;" strokeWidth="4" />
    </div>
    <div v-if="status === 'error'">
        <span>{{ error?.data?.message }}</span>
    </div>
    <div class="flex flex-col" v-else>
        <span class="text-lg">You are invited to join tester "{{ data?.group?.displayName }}"</span>
        <span class="text-2xl mt-3">{{ data?.app.displayName }}</span>
        <span class="">{{ data?.org.displayName }}</span>
        <Button label="Join Tester" class="mt-5" :loading="isPending" @click="mutate" />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'install-layout',
    server: false,
})
useSeoMeta({
    title: `DistApp - Join Tester`,
})

const { hash } = useRoute()
const router = useRouter()
const testerToken = computed(() => hash.slice(1))
const { status, data, execute, error } = useFetch('/api/install/tester/get-data-join-tester', {
    method: 'get',
    query: {
        token: testerToken.value,
    },
    immediate: true,
})
onMounted(() => {
    if (!import.meta.dev) {
        router.replace({
            hash: '',
            replace: true,
        })
    }
})

const { mutate, isPending } = useMutation({
    async mutationFn(r: any) {
        const { _data } = await $fetch.raw('/api/install/tester/join-tester', {
            method: 'post',
            body: {
                token: testerToken.value,
            },
            onResponseError(error) {
                showErrorAlert(error)
            },
        })
        if (_data) {
            navigateTo({
                name: 'install-publicId',
                params: {
                    orgName: _data.orgName,
                    appName: _data.appName,
                    publicId: _data.groupName,
                },
            })
        }
    },
})
</script>
