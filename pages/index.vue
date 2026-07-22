<template>
    <div class="flex justify-center max-w-7xl flex-col mx-auto mt-10 px-5 gap-14">
        <div class="flex flex-col lg:flex-row gap-10">
            <div class="flex flex-col gap-3 justify-center items-start flex-1">
                <span class="text-4xl font-medium">DistApp</span>
                <span class="text-lg font-light">Manage and distribute Android, iOS and Desktop apps.
                    Useful for tester or self distribution.
                    Alternative App Center Distribution.</span>
                <div class="flex flex-row flex-wrap gap-3 mt-3">
                    <NuxtLink :to="{
                        name: isLoggedIn ? 'apps' : 'signin',
                    }">
                        <Button :label="isLoggedIn ? 'Go To Apps' : 'Get Started'" />
                    </NuxtLink>
                    <NuxtLink to="https://docs.distapp.app/self-hosted/setup-self-hosted" target="_blank">
                        <Button icon="pi pi-server" label="Self Hosted" text />
                    </NuxtLink>
                    <NuxtLink to="https://github.com/yunusefendi52/distapp" target="_blank">
                        <Button icon="pi pi-github" label="GitHub" text />
                    </NuxtLink>
                </div>
            </div>
            <div class="flex flex-col">
                <a :href="link">
                    <div class="flex justify-center items-center lg:h-[310px]">
                        <img class="distapp-dark border border-white/15 rounded-lg" width="550"
                            loading="lazy"
                            fetchpriority="high"
                            alt="DistApp showcase in dark mode"
                            src="/assets/distapp_dark.webp">
                        <img class="distapp-light border border-black/15 rounded-lg" width="550"
                            loading="lazy"
                            fetchpriority="high"
                            alt="DistApp showcase in light mode"
                            src="/assets/distapp_light.webp">
                    </div>
                </a>
                <a class="self-center lg:self-start" :href="link">
                    <span class="text-xs text-[var(--p-text-muted-color)]">Habit Tool - Habit tracker log</span>
                </a>
            </div>
        </div>
        <div class="flex flex-col gap-6 sm:grid sm:grid-cols-3">
            <AppCard class="h-full" :apply-shadow="true">
                <article class="px-2">
                    <h2 class="font-bold text-lg mb-1">Manage your apps</h2>
                    <p class="font-light">Manage all of your apps in one place. Supports Android, iOS, Desktop and other platforms.
                    </p>
                </article>
            </AppCard>
            <AppCard class="h-full" :apply-shadow="true">
                <article class="px-2">
                    <h2 class="font-bold text-lg mb-2">Group and organization</h2>
                    <p class="font-light">Create seperate group or organization for your apps</p>
                </article>
            </AppCard>
            <AppCard class="h-full" :apply-shadow="true">
                <article class="px-2">
                    <h2 class="font-bold text-lg mb-1">Self Hosted</h2>
                    <p class="font-light">You can self host in your own infrastructure</p>
                </article>
            </AppCard>
        </div>
        <div class="flex flex-col gap-4">
            <h2 class="text-2xl font-medium">Frequently Asked Questions</h2>
            <div class="flex flex-col">
                <div v-for="(faq, index) in faqs" :key="index"
                    class="border-b border-[var(--p-text-muted-color)] last:border-b-0">
                    <button class="flex items-center justify-between w-full px-4 py-3 text-left font-medium hover:bg-[var(--p-surface-hover)] cursor-pointer"
                        @click="toggleFaq(index)">
                        <span class="font-medium text-lg">{{ faq.question }}</span>
                        <i :class="['pi', openItems.includes(index) ? 'pi-chevron-up' : 'pi-chevron-down']"
                            class="text-sm text-[var(--p-text-muted-color)]"></i>
                    </button>
                    <div v-if="openItems.includes(index)" class="px-4 pb-3 text-[var(--p-muted-color)]">
                        <p v-html="faq.answer"></p>
                    </div>
                </div>
            </div>
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
import { uniqBy } from 'es-toolkit';
import { UserTokenInfo } from '~/server/models/UserTokenInfo';
import { userTokensKey } from '~/server/utils/utils';

definePageMeta({
    layout: 'content-layout',
})

const title = 'DistApp • Manage and distribute Android, iOS and Desktop apps'
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
            const newUserTokens = uniqBy([
                ...userTokens.value,
                {
                    email: userEmail,
                    token: userToken,
                },
            ], e => e.email)
            userTokens.value = newUserTokens
        }
        if (redirect) {
            navigateTo(decodeURIComponent(redirect))
        }
    }
}

const link = 'https://play.google.com/store/apps/details?id=com.yedev.habittrackertool&utm_source=distapp&utm_campaign=distapp&utm_medium=distapp'

const openItems = ref<number[]>([])
const toggleFaq = (index: number) => {
    if (openItems.value.includes(index)) {
        openItems.value = openItems.value.filter(i => i !== index)
    } else {
        openItems.value.push(index)
    }
}

const faqs = [
    {
        question: 'What is DistApp?',
        answer: 'DistApp is a platform to manage and distribute Android, iOS, and Desktop apps. It is useful for testers or self-distribution, providing a simple way to share builds with your team or users.',
    },
    {
        question: 'Is this an alternative to App Center?',
        answer: 'Yes, DistApp is an alternative to App Center Distribution. It supports group management and apps with private/public modes, giving you control over who can access your builds.',
    },
    {
        question: 'Does DistApp have pricing?',
        answer: 'DistApp offers a Free plan with limitations: 100 MB artifact storage, up to 2 apps, 1 organization, and 100 MB upload size. The Pro plan at $4/month includes 5 GB storage, up to 100 apps, 10 organizations, and 300 MB upload size. See the <a href="/pricing" class="text-[var(--p-primary-color)] underline">Pricing page</a> for details.',
    },
    {
        question: 'Is there a download limit in DistApp?',
        answer: 'No, there is no download limit. You can install your apps as many times as you like.',
    },
]
</script>