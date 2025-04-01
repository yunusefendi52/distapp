<template>
    <div v-if="status === 'pending'" class="flex w-full items-center justify-center">
        <ProgressSpinner style="width: 40px; height: 40px; margin: unset;" strokeWidth="4" />
    </div>
    <div v-if="status === 'error'" class="px-4">
        <span>{{ error?.data?.message }}</span>
    </div>
    <template v-else>
        <div class="max-w-lg md:mx-0 mx-4">
            <div class="flex flex-col">
                <span class="text-lg">You are invited to join tester "{{ data?.group?.displayName }}"</span>
                <span class="text-2xl mt-3">{{ data?.app.displayName }}</span>
                <span class="">{{ data?.org.displayName }}</span>
                <Button label="Join Tester" class="mt-5" :loading="isPending" @click="mutate" />
                <span class="mt-2">You logged in as: {{ email }}</span>
            </div>
        </div>
    </template>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'install-layout',
    server: false,
})
useSeoMeta({
    title: `DistApp - Join Tester`,
})
const showAccountBtn = useState('show-account-btn')
showAccountBtn.value = true

const { email } = useAccount()

const route = useRoute()
const testerToken = computed(() => route.query.c?.toString())
const { status, data, execute, error } = useFetch('/api/install/tester/get-data-join-tester', {
    method: 'get',
    query: {
        token: testerToken.value,
    },
    immediate: true,
})

const { mutate, isPending } = useMutation({
    async mutationFn(r: any) {
        const { _data } = await $fetch.raw('/api/install/tester/join-tester', {
            method: 'post',
            body: {
                token: testerToken.value,
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
