<template>
    <div class="flex items-center justify-center h-full">
        <div class="flex flex-col gap-8 login-container m-4">
            <div class="flex flex-row gap-4 items-center justify-center">
                <AppIcon class="h-12 fill-black dark:fill-white" />
                <span class="text-3xl font-semibold text-center">DistApp</span>
            </div>
            <form class="w-full flex flex-col gap-3" v-if="LOCAL_AUTH_ENABLED" @submit.prevent="(e) => signInAuth(e)">
                <InputText required name="username" placeholder="Username" fluid />
                <InputText required name="password" placeholder="Password" type="password" fluid />
                <Button type="submit" data-testid="sign_in_btn" label="Sign In" :loading="isPending" />
            </form>
            <AppDivider :orientation="'horizontal'" v-if="LOCAL_AUTH_ENABLED" />
            <div class="w-full flex justify-center" style="color-scheme: auto;">
                <GoogleSignInButton @success="handleLoginSuccess" @error="handleLoginError"></GoogleSignInButton>
            </div>
            <ProgressSpinner v-if="isLoggingIn" style="width: 40px; height: 40px; margin: unset;" strokeWidth="4"
                class="self-center" />
        </div>
    </div>
</template>

<script setup lang="ts">
import AppIcon from '~/public/appicon.svg'
import {
    GoogleSignInButton,
    type CredentialResponse,
} from "vue3-google-signin";
import ProgressSpinner from 'primevue/progressspinner';

useTitleApp('Sign In')

const route = useRoute()

function handleSuccessSignIn(r: { param: string } | undefined) {
    if (r) {
        const redirect = route.query.redirect
        location.href = `/?${r.param}${redirect ? `&redirect=${redirect}` : ''}`
    }
}

const isLoggingIn = ref(false)

const handleLoginSuccess = async (response: CredentialResponse) => {
    try {
        isLoggingIn.value = true

        const r = await $fetch('/api/auth/sign-in-google', {
            method: 'post',
            body: {
                token: response.credential,
            },
        })
        handleSuccessSignIn(r)
    } finally {
        isLoggingIn.value = false
    }
}

const handleLoginError = () => {
    console.error("Login failed");
}

definePageMeta({
    layout: 'auth-layout',
    name: 'signin',
})

const isAddAccount = computed(() => route.path.startsWith('/add-account'))
if (!isAddAccount.value) {
    const cookie = useCookie(cookieAuthKey)
    if (cookie.value) {
        await navigateTo({
            name: 'index',
        })
    }
}

const { public: { LOCAL_AUTH_ENABLED } } = useRuntimeConfig()

const { mutate: signInAuth, isPending } = useMutation({
    mutationFn: async (r: any) => {
        if (!LOCAL_AUTH_ENABLED) {
            return
        }

        const request = getObjectForm(r)
        await $fetch.raw('/api/auth/sign-in-auth', {
            method: 'post',
            body: request,
        }).then(e => {
            if (e.ok) {
                handleSuccessSignIn(e._data)
            }
        })
    },
})
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