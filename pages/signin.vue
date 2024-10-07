<template>
    <div class="flex items-center justify-center h-full">
        <div class="flex flex-col gap-4 login-container m-4">
            <span class="text-3xl font-semibold text-center">DistApp</span>
            <div class="w-full flex justify-center" style="color-scheme: auto;">
                <GoogleSignInButton @success="handleLoginSuccess" @error="handleLoginError"></GoogleSignInButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    GoogleSignInButton,
    type CredentialResponse,
} from "vue3-google-signin";

const handleLoginSuccess = async (response: CredentialResponse) => {
    const r = await $fetch('/api/auth/sign-in-google', {
        method: 'post',
        body: {
            token: response.credential,
        },
    })
    if (r) {
        location.href = `/?${r.param}`
    }
};

const handleLoginError = () => {
    console.error("Login failed");
}

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