<template>
    <div class="acc relative isolate max-w-6xl mx-auto px-5">
        <div aria-hidden="true"
            class="pointer-events-none absolute left-1/2 top-0 -z-10 h-[560px] w-screen -translate-x-1/2"
            style="background: radial-gradient(55% 55% at 50% 0%, var(--acc-glow), transparent 72%);"></div>

        <!-- Hero -->
        <section class="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 pt-12 pb-14 lg:pt-20 lg:pb-24">
            <div class="flex flex-col items-start gap-5 flex-1">
                <span
                    class="inline-flex items-center gap-2 rounded-full border border-[var(--acc-border)] bg-[var(--acc-soft)] px-3 py-1 text-xs font-semibold text-[var(--acc)]">
                    <i class="pi pi-server text-[10px]"></i>
                    Self-hostable · App Center alternative
                </span>

                <h1 class="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08]">
                    Manage and distribute your builds
                </h1>
                <p class="text-lg leading-relaxed max-w-xl text-[var(--p-text-muted-color)]">
                    All your builds in one place. Distribute Android, iOS and Desktop apps to testers and users,
                    or self-host the whole thing on your own infrastructure.
                </p>

                <div class="flex flex-row flex-wrap items-center gap-2 mt-1">
                    <NuxtLink :to="{
                        name: isLoggedIn ? 'apps' : 'signin',
                    }">
                        <Button data-testid="hero_cta_btn" :label="isLoggedIn ? 'Go To Apps' : 'Get Started'" />
                    </NuxtLink>
                    <NuxtLink to="https://github.com/yunusefendi52/distapp" target="_blank">
                        <Button icon="pi pi-github" label="GitHub" text />
                    </NuxtLink>
                </div>

                <div
                    class="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2 text-sm text-[var(--p-text-muted-color)]">
                    <span class="font-medium">Works with</span>
                    <span class="inline-flex items-center gap-1.5"><i class="pi pi-android"></i> Android</span>
                    <span class="inline-flex items-center gap-1.5"><i class="pi pi-apple"></i> iOS</span>
                    <span class="inline-flex items-center gap-1.5"><i class="pi pi-desktop"></i> Desktop</span>
                </div>
            </div>

            <div class="flex flex-col flex-1 w-full min-w-0">
                <a :href="link" class="group block">
                    <img class="distapp-dark border border-white/15 rounded-xl shadow-xl max-w-full h-auto" width="550"
                        loading="lazy"
                        fetchpriority="high"
                        alt="DistApp showcase in dark mode"
                        src="/assets/screenshots/distapp_dark.webp">
                    <img class="distapp-light border border-black/15 rounded-xl shadow-xl max-w-full h-auto" width="550"
                        loading="lazy"
                        fetchpriority="high"
                        alt="DistApp showcase in light mode"
                        src="/assets/screenshots/distapp_light.webp">
                </a>
                <a :href="link" class="self-center lg:self-start mt-2">
                    <span class="text-xs">Example app: Habit Tool</span>
                </a>
            </div>
        </section>

        <!-- How it works -->
        <section class="py-14 lg:py-20 border-t border-[var(--p-content-border-color)]">
            <p class="text-sm font-semibold text-[var(--acc)]">How it works</p>
            <h2 class="text-3xl font-bold tracking-tight mt-1 max-w-2xl">From build to installed in three steps</h2>
            <div class="grid sm:grid-cols-3 gap-x-10 gap-y-9 mt-9">
                <div v-for="(step, index) in steps" :key="step.title" class="flex flex-col gap-3">
                    <div class="flex items-center gap-3">
                        <span
                            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--acc-border)] bg-[var(--acc-soft)] text-[var(--acc)] text-base">
                            <i :class="step.icon"></i>
                        </span>
                        <span class="text-xs font-semibold uppercase tracking-wide">
                            Step {{ index + 1 }}
                        </span>
                    </div>
                    <h3 class="font-semibold text-lg">{{ step.title }}</h3>
                    <p class="leading-relaxed text-[var(--p-text-muted-color)]">{{ step.description }}</p>
                </div>
            </div>
        </section>

        <!-- CLI -->
        <section class="py-14 lg:py-20 border-t border-[var(--p-content-border-color)]">
            <div class="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                <div>
                    <p class="text-sm font-semibold text-[var(--acc)]">CLI</p>
                    <h2 class="text-3xl font-bold tracking-tight mt-1">Ship builds from your terminal</h2>
                    <p class="mt-3 leading-relaxed max-w-lg text-[var(--p-text-muted-color)]">
                        Install the CLI once, then upload APK, AAB or IPA builds straight from your machine or CI
                        pipeline. Every upload becomes a shareable build.
                    </p>
                    <NuxtLink to="https://docs.distapp.app/cli/cli-usage" target="_blank">
                        <Button label="CLI docs" icon="pi pi-arrow-right" iconPos="right" text class="mt-4 -ml-3" />
                    </NuxtLink>
                </div>

                <div
                    class="rounded-xl border border-[var(--p-content-border-color)] bg-[var(--p-surface-50)] dark:bg-[var(--p-surface-900)] overflow-hidden shadow-lg">
                    <div class="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--p-content-border-color)]">
                        <span class="h-3 w-3 rounded-full bg-red-400/80"></span>
                        <span class="h-3 w-3 rounded-full bg-yellow-400/80"></span>
                        <span class="h-3 w-3 rounded-full bg-green-400/80"></span>
                        <span class="ml-2 text-xs terminal">terminal</span>
                    </div>
                    <pre
                        class="terminal px-4 py-4 text-[13px] leading-relaxed overflow-x-auto text-[var(--p-text-color)]"><code><span class="term-prompt">$</span> npm install -g distapp
<span class="term-prompt">$</span> distapp distribute \
    --file ./app-release.apk \
    --slug yedev/habit-tool \
    --api-key $DISTAPP_API_KEY

<span class="term-muted">Distributing ./app-release.apk</span>
<span class="term-muted">Finished Distributing "./app-release.apk"</span></code></pre>
                </div>
            </div>
        </section>

        <!-- Features -->
        <section class="py-14 lg:py-20 border-t border-[var(--p-content-border-color)]">
            <p class="text-sm font-semibold text-[var(--acc)]">Features</p>
            <h2 class="text-3xl font-bold tracking-tight mt-1 max-w-2xl">Built for distributing apps</h2>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-9">
                <div v-for="feature in features" :key="feature.title"
                    class="flex flex-col gap-3 rounded-2xl border border-[var(--p-content-border-color)] p-5">
                    <span
                        class="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--acc-border)] bg-[var(--acc-soft)] text-[var(--acc)] text-lg">
                        <i :class="feature.icon"></i>
                    </span>
                    <h3 class="font-semibold text-lg">{{ feature.title }}</h3>
                    <p class="leading-relaxed text-[var(--p-text-muted-color)]">{{ feature.description }}</p>
                </div>
            </div>
        </section>

        <!-- Self-hosting callout -->
        <section class="my-6 rounded-2xl bg-[var(--acc-soft)] border border-[var(--acc-border)] px-8 py-10 sm:px-12 sm:py-12">
            <p class="text-sm font-semibold text-[var(--acc)]">Self-hostable</p>
            <h2 class="text-3xl font-bold tracking-tight mt-1 max-w-xl">Run DistApp on your own infrastructure</h2>
            <p class="mt-3 max-w-xl leading-relaxed text-[var(--p-text-muted-color)]">
                Self-host with Docker and S3-compatible storage. Your builds, your server.
            </p>
            <div class="flex flex-wrap items-center gap-2 mt-4">
                <span class="inline-flex items-center gap-1.5 rounded-full border border-[var(--acc-border)] px-3 py-1 text-xs font-medium text-[var(--acc)]">
                    <i class="pi pi-server text-[10px]"></i> Docker
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full border border-[var(--acc-border)] px-3 py-1 text-xs font-medium text-[var(--acc)]">
                    <i class="pi pi-cloud text-[10px]"></i> S3-compatible storage
                </span>
            </div>
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
                            :aria-expanded="openItems.includes(index)"
                            :aria-controls="`faq-answer-${index}`"
                            @click="toggleFaq(index)">
                            <span class="font-medium text-lg">{{ faq.question }}</span>
                            <i :class="['pi', openItems.includes(index) ? 'pi-chevron-up' : 'pi-chevron-down']"
                                class="text-sm"></i>
                        </button>
                        <div v-if="openItems.includes(index)" :id="`faq-answer-${index}`" class="px-4 pb-3">
                            <p v-html="faq.answer"></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Get started -->
        <section class="pb-14 lg:pb-20">
            <p class="text-sm font-semibold text-[var(--acc)]">Get started</p>
            <h2 class="text-3xl font-bold tracking-tight mt-1">Your infrastructure or ours</h2>
            <p class="mt-3 max-w-xl leading-relaxed text-[var(--p-text-muted-color)]">
                Self-host it for free, or let us manage it for you.
            </p>

            <div class="grid sm:grid-cols-2 gap-5 mt-9">
                <div class="flex flex-col rounded-2xl border border-[var(--p-content-border-color)] p-6">
                    <div class="flex items-center gap-3">
                        <span
                            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--acc-border)] bg-[var(--acc-soft)] text-[var(--acc)] text-lg">
                            <i class="pi pi-server"></i>
                        </span>
                        <span class="font-semibold text-lg">Self-hosted</span>
                    </div>
                    <p class="mt-4 leading-relaxed flex-1 text-[var(--p-text-muted-color)]">
                        Run DistApp on your own infrastructure with Docker and S3-compatible storage.
                    </p>
                    <div class="mt-4 text-2xl font-bold">Free</div>
                    <NuxtLink to="https://docs.distapp.app/self-hosted/setup-self-hosted" target="_blank" class="mt-5">
                        <Button label="Self-hosting guide" outlined fluid />
                    </NuxtLink>
                </div>

                <div class="flex flex-col rounded-2xl border border-[var(--acc-border)] bg-[var(--acc-soft)] p-6">
                    <div class="flex items-center gap-3">
                        <span
                            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--acc-border)] bg-[var(--acc-soft)] text-[var(--acc)] text-lg">
                            <i class="pi pi-cloud"></i>
                        </span>
                        <span class="font-semibold text-lg">Managed service</span>
                    </div>
                    <p class="mt-4 leading-relaxed flex-1 text-[var(--p-text-muted-color)]">
                        Ready to use, no hassle. We manage the service for you.
                    </p>
                    <div class="mt-4 flex items-baseline gap-1">
                        <span class="text-2xl font-bold">$0</span>
                        <span class="text-sm">to start, Pro <NuxtLink to="/pricing"
                                class="font-medium text-[var(--p-text-color)] underline underline-offset-2 hover:text-[var(--acc)]">$5/month</NuxtLink></span>
                    </div>
                    <NuxtLink :to="{ name: isLoggedIn ? 'apps' : 'signin' }" class="mt-5">
                        <Button label="Get Started" fluid />
                    </NuxtLink>
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
    --acc-glow: rgb(21 128 61 / 0.10);
}

.appdark .acc {
    --acc: #4ade80;
    --acc-soft: rgb(74 222 128 / 0.09);
    --acc-border: rgb(74 222 128 / 0.28);
    --acc-glow: rgb(74 222 128 / 0.12);
}

.terminal {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
    font-variant-ligatures: none;
}

.term-prompt {
    color: var(--acc);
    font-weight: 600;
    user-select: none;
}

.term-muted {
    color: var(--p-text-muted-color);
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

const steps = [
    {
        title: 'Upload a build',
        description: 'Run the CLI or drop the file from the dashboard. APK, AAB or IPA.',
        icon: 'pi pi-cloud-upload',
    },
    {
        title: 'Share a link',
        description: 'Every build gets a link and a QR code you can hand to your testers.',
        icon: 'pi pi-qrcode',
    },
    {
        title: 'Testers install',
        description: 'They open the link, install the app and they are done. No store review.',
        icon: 'pi pi-download',
    },
]

const features = [
    {
        title: 'Manage your apps',
        description: 'All your builds in one place, across Android, iOS, Desktop and other platforms.',
        icon: 'pi pi-box',
    },
    {
        title: 'Groups and organizations',
        description: 'Keep apps organized with separate groups and organizations.',
        icon: 'pi pi-sitemap',
    },
    {
        title: 'Public and private apps',
        description: 'Manage access to each build with private testers, public releases, or secure links shared with selected people.',
        icon: 'pi pi-shield',
    },
    {
        title: 'Distribute from the CLI',
        description: 'Upload your builds directly from your terminal or CI pipeline.',
        icon: 'pi pi-code',
    },
    {
        title: 'QR code installs',
        description: 'Testers scan a QR code to install a build, no store required.',
        icon: 'pi pi-qrcode',
    },
    {
        title: 'Retention policy',
        description: 'Delete old artifacts on your rules, like the latest N builds or the last N days.',
        icon: 'pi pi-history',
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
        answer: 'DistApp offers a Free plan with limitations: 100 MB artifact storage, up to 2 apps, 1 organization, and 100 MB upload size. The Pro plan at $5/month includes 5 GB storage, up to 100 apps, 50 organizations, and 1 GB upload size. These limits apply to our managed service only. If you self-host, DistApp is free and has none of these limitations. See the <a href="/pricing" class="text-[var(--p-primary-color)] underline">Pricing page</a> for details.',
    },
    {
        question: 'Is there a download limit in DistApp?',
        answer: 'No, there is no download limit. You can install your apps as many times as you like.',
    },
]
</script>
