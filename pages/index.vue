<template>
    <div class="acc max-w-6xl mx-auto px-5">
        <!-- Hero -->
        <section class="flex flex-col lg:flex-row items-center gap-10 lg:gap-14 pt-14 pb-14 lg:pt-24 lg:pb-20">
            <div class="flex flex-col items-start gap-4 flex-1">
                <h1 class="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08]">
                    Manage and distribute your builds
                </h1>
                <p class="text-lg font-light leading-relaxed text-[var(--p-text-color)] max-w-xl">
                    All your builds in one place. Useful for self-distribution or testers, and a self-hostable alternative to App Center.
                </p>

                <div class="flex flex-row flex-wrap items-center gap-2 mt-2">
                    <NuxtLink :to="{
                        name: isLoggedIn ? 'apps' : 'signin',
                    }">
                        <Button :label="isLoggedIn ? 'Go To Apps' : 'Get Started'" />
                    </NuxtLink>
                    <NuxtLink to="https://github.com/yunusefendi52/distapp" target="_blank">
                        <Button icon="pi pi-github" label="GitHub" text />
                    </NuxtLink>
                </div>
            </div>

            <div class="flex flex-col flex-1 w-full min-w-0">
                <a :href="link" class="group block">
                    <img class="distapp-dark border border-white/15 rounded-xl shadow-xl max-w-full h-auto" width="550"
                        loading="lazy"
                        fetchpriority="high"
                        alt="DistApp showcase in dark mode"
                        src="/assets/distapp_dark.webp">
                    <img class="distapp-light border border-black/15 rounded-xl shadow-xl max-w-full h-auto" width="550"
                        loading="lazy"
                        fetchpriority="high"
                        alt="DistApp showcase in light mode"
                        src="/assets/distapp_light.webp">
                </a>
                <a :href="link" class="self-center lg:self-start mt-2">
                    <span class="text-xs text-[var(--p-text-muted-color)]">Habit Tool - Habit tracker log</span>
                </a>
            </div>
        </section>

        <!-- Features -->
        <section class="py-10">
            <div class="rounded-2xl border border-[var(--p-content-border-color)] px-7 py-9 sm:px-10 sm:py-11">
                <p class="text-sm font-semibold text-[var(--acc)]">Features</p>
                <h2 class="text-3xl font-bold tracking-tight mt-1 max-w-2xl">Built for distributing apps</h2>
                <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-9 mt-8">
                    <div v-for="feature in features" :key="feature.title">
                        <h3 class="font-semibold text-lg">{{ feature.title }}</h3>
                        <p class="font-light text-[var(--p-text-muted-color)] mt-1 leading-relaxed">{{ feature.description }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Self-hosting callout -->
        <section class="my-6 rounded-2xl bg-[var(--acc-soft)] border border-[var(--acc-border)] px-8 py-10 sm:px-12 sm:py-12">
            <p class="text-sm font-semibold text-[var(--acc)]">Self-hostable</p>
            <h2 class="text-3xl font-bold tracking-tight mt-1 max-w-xl">Run DistApp on your own infrastructure</h2>
            <p class="font-light text-[var(--p-text-muted-color)] mt-3 max-w-xl leading-relaxed">
                Self-host with Docker and S3-compatible storage. Your builds, your server.
            </p>
            <NuxtLink to="https://docs.distapp.app/self-hosted/setup-self-hosted" target="_blank">
                <Button label="Self-hosting guide" class="mt-5" />
            </NuxtLink>
        </section>

        <!-- FAQ -->
        <section class="py-10">
            <p class="text-sm font-semibold text-[var(--acc)]">Questions</p>
            <h2 class="text-3xl font-bold tracking-tight mt-1 mb-5">Frequently asked questions</h2>
            <div class="rounded-2xl border border-[var(--p-content-border-color)] px-2 sm:px-4">
                <div class="flex flex-col">
                    <div v-for="(faq, index) in faqs" :key="index"
                        class="border-b border-b-[var(--p-content-border-color)] last:border-b-0">
                        <button class="flex items-center justify-between w-full px-4 py-3 text-left font-medium hover:bg-[var(--p-surface-hover)] cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--acc)]"
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
        </section>
    </div>
</template>

<style scoped lang="css">
.applight .acc {
    --acc: #15803d;
    --acc-soft: rgb(21 128 61 / 0.06);
    --acc-border: rgb(21 128 61 / 0.22);
}

.appdark .acc {
    --acc: #4ade80;
    --acc-soft: rgb(74 222 128 / 0.09);
    --acc-border: rgb(74 222 128 / 0.28);
}

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

const features = [
    {
        title: 'Manage your apps',
        description: 'All your builds in one place, across Android, iOS, Desktop and other platforms.',
    },
    {
        title: 'Groups and organizations',
        description: 'Keep apps organized with separate groups and organizations.',
    },
    {
        title: 'Public and private apps',
        description: 'Control who can access each build, from private testers to public releases.',
    },
    {
        title: 'Distribute from the CLI',
        description: 'Upload your builds directly from your terminal or CI pipeline.',
    },
    {
        title: 'QR code installs',
        description: 'Testers scan a QR code to install a build, no store required.',
    },
    {
        title: 'Retention policy',
        description: 'Delete old artifacts on your rules, like the latest N builds or the last N days.',
    },
]

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