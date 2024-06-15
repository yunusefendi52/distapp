<template>
    <div class="flex flex-column gap-4 login-container m-4">
        <h4 class="text-center">DistApp</h4>
        <form @submit.prevent="signin" v-if="adminKeyEnabled">
            <div class="flex flex-column gap-2">
                <InputText v-model="key" placeholder="Login Key" type="password" />
                <Button type="submit" :loading="isPending" label="Sign In"></Button>
            </div>
        </form>
        <form method="get" action="/api/auth/signin-google">
            <input type="hidden" name="host" :value="host">
            <input type="hidden" name="isAddAccount" :value="isAddAccount">
            <Button icon="pi pi-google" label="Sign In with Google" type="submit" class="w-full" />
        </form>
    </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { UserTokenInfo } from '~/server/models/UserTokenInfo';
import { userTokensKey } from '~/server/utils/utils';


const config = useRuntimeConfig()
const adminKeyEnabled = ref(config.public.adminKey.enable)

definePageMeta({
    layout: 'auth-layout',
})

const route = useRoute()
const router = useRouter()
const isAddAccount = computed(() => route.path == '/add-account')

if (!isAddAccount.value) {
    const cookie = useCookie('app-auth')
    if (cookie.value) {
        await navigateTo('/')
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
        navigateTo('/')
    },
})

const signin = (event: any) => {
    mutate()
}

const host = ref('')
if (process.client) {
    host.value = window.location.origin
}

if (isAddAccount.value) {
    const userToken = route.query.usr?.toString()
    const userEmail = route.query.userEmail?.toString()
    if (userToken && userEmail) {
        if (process.client) {
            const userTokens = useLocalStorage<UserTokenInfo[]>(userTokensKey, [])
            router.push({
                query: {
                },
            })
            const newUserTokens = _.uniqBy([
                ...userTokens.value,
                {
                    email: userEmail,
                    token: userToken,
                },
            ], e => e.email)
            userTokens.value = newUserTokens
        }
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