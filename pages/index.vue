<template>
    <div class="flex justify-center max-w-7xl flex-col mx-auto mt-10 px-5 gap-14">
        <div class="flex flex-col lg:flex-row gap-10">
            <div class="flex flex-col gap-3 justify-center items-start flex-1">
                <span class="text-4xl font-medium">DistApp</span>
                <span class="text-lg font-light">Manage and distribute your Android or iOS app.
                    Useful for tester or self distribution.
                    Alternative App Center Distribution.</span>
                <div class="flex flex-row flex-wrap gap-3 mt-3">
                    <NuxtLink :to="{
                        name: isLoggedIn ? 'apps' : 'signin',
                    }">
                        <Button :label="isLoggedIn ? 'Go To Apps' : 'Get Started'" />
                    </NuxtLink>
                    <NuxtLink to="https://docs-distapp.lhf.my.id/self-hosted/setup-self-hosted" target="_blank">
                        <Button icon="pi pi-server" label="Self Hosted" text />
                    </NuxtLink>
                    <NuxtLink to="https://github.com/yunusefendi52/distapp" target="_blank">
                        <Button icon="pi pi-github" label="GitHub" text />
                    </NuxtLink>
                </div>
                <span class="text-sm italic font-light">Beta testing</span>
            </div>
            <div class="flex justify-center items-center lg:w-[550px]">
                <img class="distapp-dark border border-white/15 rounded-lg" width="550" src="/assets/distapp_dark.webp">
                <img class="distapp-light border border-black/15 rounded-lg" width="550"
                    src="/assets/distapp_light.webp">
            </div>
        </div>
        <div class="flex flex-col gap-6 sm:grid sm:grid-cols-3">
            <AppCard class="h-full">
                <article class="px-2">
                    <h2 class="font-bold text-lg mb-1">Self Hosted</h2>
                    <p class="font-light">You can self host in your own infrastructure</p>
                </article>
            </AppCard>
            <AppCard class="h-full">
                <article class="px-2">
                    <h2 class="font-bold text-lg mb-1">Manage your apps</h2>
                    <p class="font-light">Manage all of your apps in one place. Supports Android and iOS. More coming
                    </p>
                </article>
            </AppCard>
            <AppCard class="h-full">
                <article class="px-2">
                    <h2 class="font-bold text-lg mb-2">Group and organization</h2>
                    <p class="font-light">Create seperate group or organization for your apps</p>
                </article>
            </AppCard>
        </div>
        <div class="h-[50px]"></div>
    </div>
</template>

<style scoped lang="css">
.distapp-dark {
    display: none;
}

.appdark .distapp-dark {
    display: unset;
}

.distapp-light {
    display: none;
}

.applight .distapp-light {
    display: unset;
}
</style>

<script setup lang="ts">
import _ from 'lodash';
import { UserTokenInfo } from '~/server/models/UserTokenInfo';
import { userTokensKey } from '~/server/utils/utils';

definePageMeta({
    layout: 'content-layout',
})

const title = 'DistApp • Manage and distribute Android or iOS app'
useHead({
    title: title,
})

const route = useRoute()
const router = useRouter()
const cookie = useCookie(cookieAuthKey)
const isLoggedIn = computed(() => cookie.value ? true : false)
if (isLoggedIn.value) {
    if (import.meta.client) {
        const userToken = route.query.usr?.toString()
        const userEmail = route.query.e?.toString()
        const redirect = route.query.redirect?.toString()
        const userTokens = useLocalStorage<UserTokenInfo[]>(userTokensKey, [])
        router.push({
            query: {
            },
        })
        if (userToken && userEmail) {
            const newUserTokens = _.uniqBy([
                ...userTokens.value,
                {
                    email: userEmail,
                    token: userToken,
                },
            ], e => e.email)
            userTokens.value = newUserTokens
        }
        if (redirect) {
            navigateTo(redirect)
        }
    }
}
</script>