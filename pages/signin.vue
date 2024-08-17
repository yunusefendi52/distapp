<template>
    <div class="flex flex-col gap-4 login-container m-4">
        <span class="text-3xl font-semibold text-center">DistApp</span>
        <form @submit.prevent="signin" v-if="adminKeyEnabled">
            <div class="flex flex-col gap-2">
                <InputText v-model="key" placeholder="Login Key" type="password" />
                <Button type="submit" :loading="isPending" label="Sign In"></Button>
            </div>
        </form>
        <form method="get" action="/api/auth/signin-google">
            <input type="hidden" name="host" :value="host">
            <Button icon="pi pi-google" label="Sign In with Google" type="submit" class="w-full" />
        </form>
    </div>
</template>

<script setup lang="ts">
import _ from 'lodash';

const config = useRuntimeConfig()
const adminKeyEnabled = ref(config.public.adminKey.enable)

definePageMeta({
    layout: 'auth-layout',
})

const route = useRoute()

const isAddAccount = computed(() => route.path.startsWith('/add-account'))
if (!isAddAccount.value) {
    const cookie = useCookie('app-auth')
    if (cookie.value) {
        await navigateTo({
            name: 'index',
        })
    }
}

const key = ref('')

const { mutate, isPending } = useMutation({
    mutationFn: () => $fetch('/api/auth/signin', {
        method: 'post',
        body: {
            key: key.value,
        },
    }),
    onSuccess: () => {
        navigateTo({
            name: 'index',
        })
    },
})

const signin = (event: any) => {
    mutate()
}

const host = ref('')
if (process.client) {
    host.value = window.location.origin
}
</script>

<style scoped>
.login-container {
    width: 100%;
}

@media only screen and (min-width: 600px) {
    .login-container {
        width: 320px;
    }
}
</style>