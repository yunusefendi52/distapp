<template>
    <div class="relative flex min-h-full w-full items-center justify-center px-4 py-8">
        <div v-if="isAddAccount" class="absolute left-4 top-4">
            <LazyAppDrawerButton />
        </div>

        <div class="signin w-full max-w-[372px]">
            <div class="mb-6 flex justify-center">
                <span class="flex h-11 w-11 items-center justify-center rounded-xl border"
                    style="background: var(--acc-soft); border-color: var(--acc-border); color: var(--acc);">
                    <AppIcon class="h-[22px] w-[22px] fill-current" />
                </span>
            </div>

            <h1 class="mb-1.5 text-center text-[27px] font-bold leading-tight tracking-tight">
                Sign in to DistApp
            </h1>
            <p class="mb-6 text-center text-[13.5px] leading-relaxed text-[var(--p-text-muted-color)]">
                Manage and distribute your builds
            </p>

            <div v-if="signInError" id="signin-error" role="alert" aria-live="assertive"
                class="mb-5 flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] leading-snug text-red-700 dark:text-red-300"
                style="background: rgb(239 68 68 / 0.08); border-color: rgb(239 68 68 / 0.28);">
                <i class="pi pi-exclamation-circle mt-px text-[14px]" aria-hidden="true" />
                <span>{{ signInError }}</span>
            </div>

            <form v-if="LOCAL_AUTH_ENABLED" class="flex flex-col" @submit.prevent="(e) => signInAuth(e)">
                <div class="mb-4">
                    <label for="username" class="mb-1.5 block text-[13px] font-semibold">Username</label>
                    <InputText id="username" name="username" placeholder="e.g. yunus" autocomplete="username"
                        autocapitalize="none" spellcheck="false" required fluid
                        :aria-invalid="!!signInError" :aria-describedby="signInError ? 'signin-error' : undefined" />
                </div>

                <div class="mb-4">
                    <div class="mb-1.5 flex items-baseline justify-between gap-3">
                        <label for="password" class="block text-[13px] font-semibold">Password</label>
                        <span class="text-[11.5px] text-[var(--p-text-muted-color)]">Ask your admin</span>
                    </div>
                    <div class="relative">
                        <InputText id="password" name="password" :type="showPassword ? 'text' : 'password'"
                            placeholder="Enter your password" autocomplete="current-password" required fluid
                            class="pr-11" :aria-invalid="!!signInError"
                            :aria-describedby="signInError ? 'signin-error' : undefined" />
                        <button type="button"
                            class="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-[var(--p-text-muted-color)] hover:text-[var(--p-text-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--acc)]"
                            :aria-label="showPassword ? 'Hide password' : 'Show password'" :aria-pressed="showPassword"
                            @click="showPassword = !showPassword">
                            <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <Button type="submit" data-testid="sign_in_btn" label="Sign in" class="mt-1 w-full" :loading="isPending" />
            </form>

            <div v-if="showProviderDivider" class="my-6 flex items-center gap-3">
                <span class="h-px flex-1" style="background: var(--p-content-border-color);" />
                <span class="text-[11px] font-semibold uppercase tracking-wider text-[var(--p-text-muted-color)]">or</span>
                <span class="h-px flex-1" style="background: var(--p-content-border-color);" />
            </div>

            <div ref="providerStack" class="flex flex-col gap-2">
                <div v-if="GOOGLE_CLIENT_ID" class="flex w-full justify-center" style="color-scheme: auto;">
                    <GoogleSignInButton :width="googleButtonWidth" @success="handleLoginSuccess" @error="handleLoginError" />
                </div>
                <Button v-if="CLERK_AUTH_ENABLED" label="Sign in with email" icon="pi pi-envelope" outlined
                    severity="contrast" class="w-full" :loading="signingEmail" @click="() => signInWithEmail()" />
            </div>

            <div v-if="isLoggingIn" role="status" aria-live="polite"
                class="mt-4 flex items-center gap-2.5 text-[13px] text-[var(--p-text-muted-color)]">
                <ProgressSpinner style="width: 16px; height: 16px; margin: unset;" strokeWidth="6" />
                Signing in…
            </div>

            <div class="mt-10 flex justify-end">
                <ThemeSwitcher />
            </div>
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
// import { Clerk } from '@clerk/clerk-js'

useTitleApp('Sign In')

const route = useRoute()

const signInError = ref('')
const showPassword = ref(false)
const isLoggingIn = ref(false)

const providerStack = ref<HTMLElement | null>(null)
const googleButtonWidth = ref('320')
let providerObserver: ResizeObserver | undefined

function updateGoogleButtonWidth() {
    const el = providerStack.value
    if (!el) return
    googleButtonWidth.value = String(Math.min(400, Math.floor(el.clientWidth)))
}

onMounted(() => {
    updateGoogleButtonWidth()
    providerObserver = new ResizeObserver(updateGoogleButtonWidth)
    if (providerStack.value) providerObserver.observe(providerStack.value)
})

onUnmounted(() => providerObserver?.disconnect())

const invalidCredentialsMessage = 'We couldn\'t sign you in. Check your username and password, then try again.'

function handleSuccessSignIn(r: { param: string } | undefined) {
    if (r) {
        const redirect = route.query.redirect
        location.href = `/?${r.param}${redirect ? `&redirect=${redirect}` : ''}`
    }
}

const handleLoginSuccess = async (response: CredentialResponse) => {
    signInError.value = ''
    try {
        isLoggingIn.value = true

        const r = await $fetch('/api/auth/sign-in-google', {
            method: 'post',
            body: {
                token: response.credential,
            },
        })
        handleSuccessSignIn(r)
    } catch {
        signInError.value = 'Google sign-in didn\'t complete. Try again.'
    } finally {
        isLoggingIn.value = false
    }
}

const handleLoginError = () => {
    signInError.value = 'Google sign-in didn\'t complete. Try again.'
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

const { public: { LOCAL_AUTH_ENABLED, CLERK_AUTH_ENABLED, CLERK_PUBLISHABLE_KEY, GOOGLE_CLIENT_ID } } = useRuntimeConfig()

const showProviderDivider = computed(() => LOCAL_AUTH_ENABLED && (CLERK_AUTH_ENABLED || !!GOOGLE_CLIENT_ID))

const { mutate: signInAuth, isPending } = useMutation({
    mutationFn: async (r: any) => {
        if (!LOCAL_AUTH_ENABLED) {
            return
        }

        signInError.value = ''
        const request = getObjectForm(r)
        try {
            const e = await $fetch.raw('/api/auth/sign-in-auth', {
                method: 'post',
                body: request,
            })
            if (e.ok) {
                handleSuccessSignIn(e._data as any)
            } else {
                signInError.value = invalidCredentialsMessage
            }
        } catch {
            signInError.value = invalidCredentialsMessage
        }
    },
})

const { mutate: signInWithEmail, isPending: signingEmail } = useMutation({
    mutationFn: async () => {
        if (!CLERK_AUTH_ENABLED) {
            return
        }

        signInError.value = ''
        try {
            // const clerk = new Clerk(CLERK_PUBLISHABLE_KEY)
            // await clerk.load({})
            // await clerk.signOut(() => {
            //     console.log('signed out cleared')
            // })
            // await clerk.redirectToSignIn({
            //     redirectUrl: '/auth/clerk-callback',
            // })
        } catch {
            signInError.value = 'Email sign-in didn\'t start. Try again.'
        }
    },
})
</script>

<style scoped>
.signin {
    --acc: #15803d;
    --acc-soft: rgb(21 128 61 / 0.06);
    --acc-border: rgb(21 128 61 / 0.22);
}

.appdark .signin {
    --acc: #4ade80;
    --acc-soft: rgb(74 222 128 / 0.09);
    --acc-border: rgb(74 222 128 / 0.28);
}

.signin :deep(.p-inputtext:enabled:focus) {
    border-color: var(--acc);
    box-shadow: 0 0 0 3px var(--acc-soft);
}
</style>
