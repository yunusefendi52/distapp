<template>
    <div class="mb-16">
        <header class="">
            <nav class="flex w-full items-center">
                <AppHeader class="flex-1" />
            </nav>
        </header>

        <div>
            <div class="flex flex-col sm:flex-row sm:mt-5 gap-2">
                <div class="flex flex-col gap-3 px-5 py-5 sm:p-20 justify-center items-start flex-1">
                    <span class="text-4xl font-medium">DistApp</span>
                    <span class="text-lg font-light">Manage and distribute your Android or iOS app.
                        Useful for tester or self distribution.
                        Alternative App Center Distribution.</span>
                    <div class="flex flex-row flex-wrap gap-4 mt-3">
                        <NuxtLink to="https://github.com/yunusefendi52/distapp" target="_blank">
                            <Button icon="pi pi-github" label="GitHub" severity="secondary" />
                        </NuxtLink>
                        <NuxtLink :to="{
                            name: isLoggedIn ? 'apps' : 'signin',
                        }">
                            <Button :label="isLoggedIn ? 'Go To Apps' : 'Get Started'" />
                        </NuxtLink>
                    </div>
                    <span class="text-sm italic font-light">Beta testing</span>
                </div>
                <div class="flex justify-center items-center flex-1 p-5 sm:p-0 sm:mr-10">
                    <img class="distapp-dark border border-white/15 rounded-lg" src="/assets/distapp-dark.png">
                    <img class="distapp-light border border-black/15 rounded-lg" src="/assets/distapp-light.png">
                </div>
            </div>
        </div>
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
    layout: false,
})

const title = 'DistApp • Manage and distribute Android or iOS app'
const description = 'Manage and distribute Android or iOS app'
useHead({
    meta: [{
        name: 'description',
        content: 'Manage and distribute Android or iOS app. App Center Alternative',
    }, {
        name: 'keywords',
        content: 'distapp, dist, app, app center, appcenter, ios, android, microsoft, alternative app center, alternative',
    }, {
        name: 'author',
        content: 'DistApp',
    },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: 'https://distapp.lhf.my.id/assets/distapp-dark.png' },
    { property: 'og:url', content: 'https://distapp.lhf.my.id' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: 'https://distapp.lhf.my.id/assets/distapp-dark.png' }
    ],
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
    }
}
</script>