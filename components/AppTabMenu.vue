<template>
    <div class="flex w-full flex-col gap-3">
        <div class="app-tabs-shell">
            <nav ref="nav" class="app-tabs" :class="{
                'app-tabs--fade-start': canScrollStart,
                'app-tabs--fade-end': canScrollEnd,
            }" aria-label="Tabs" @scroll="updateScrollState">
                <NuxtLink v-for="item in items" :key="item.routeName ?? item.label" :to="toFor(item)"
                    class="app-tabs__item" :class="{ 'app-tabs__item--active': isActive(item) }"
                    :aria-label="labelOf(item)" :aria-current="isActive(item) ? 'page' : undefined">
                    {{ item.label }}
                </NuxtLink>
            </nav>
            <button v-if="canScrollStart" type="button" class="app-tabs__scroll-btn app-tabs__scroll-btn--start"
                aria-label="Scroll tabs left" @click="scrollTabs(-1)">
                <i class="pi pi-chevron-left" />
            </button>
            <button v-if="canScrollEnd" type="button" class="app-tabs__scroll-btn app-tabs__scroll-btn--end"
                aria-label="Scroll tabs right" @click="scrollTabs(1)">
                <i class="pi pi-chevron-right" />
            </button>
        </div>
        <AppDivider orientation="horizontal" class="app-tabs__separator" />
    </div>
</template>

<script setup lang="ts">
import { MenuItem } from '#imports'

interface AppTabItem extends MenuItem {
    routeName?: string
    routeParams?: Record<string, string | number>
}

const props = defineProps<{
    items: AppTabItem[]
}>()

const route = useRoute()
const nav = ref<HTMLElement>()
const canScrollStart = ref(false)
const canScrollEnd = ref(false)

const isActive = (item: AppTabItem) => !!item.routeName && route.name === item.routeName

const labelOf = (item: AppTabItem) => typeof item.label === 'string' ? item.label : ''

const toFor = (item: AppTabItem) => {
    if (item.routeName) {
        return {
            name: item.routeName,
            params: { ...route.params, ...item.routeParams },
        }
    }
    return item.url ?? '#'
}

const updateScrollState = () => {
    const el = nav.value
    if (!el) return
    const tolerance = 6
    canScrollStart.value = el.scrollLeft > tolerance
    canScrollEnd.value = el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance
}

const scrollTabs = (direction: 1 | -1) => {
    const el = nav.value
    if (!el) return
    el.scrollBy({
        left: direction * Math.max(el.clientWidth * 0.6, 96),
        behavior: 'smooth',
    })
}

const activeIndex = computed(() => props.items.findIndex(isActive))

watchEffect(async () => {
    const index = activeIndex.value
    await nextTick()
    const el = nav.value?.children[index] as HTMLElement | undefined
    if (el && nav.value) {
        const itemRect = el.getBoundingClientRect()
        const navRect = nav.value.getBoundingClientRect()
        if (itemRect.left < navRect.left || itemRect.right > navRect.right) {
            el.scrollIntoView({ inline: 'center', block: 'nearest' })
        }
    }
    updateScrollState()
})

let resizeObserver: ResizeObserver | undefined

onMounted(() => {
    updateScrollState()
    resizeObserver = new ResizeObserver(updateScrollState)
    if (nav.value) resizeObserver.observe(nav.value)
    window.addEventListener('resize', updateScrollState)
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    window.removeEventListener('resize', updateScrollState)
})
</script>

<style scoped>
.app-tabs-shell {
    position: relative;
    display: inline-flex;
    align-self: flex-start;
    max-width: 100%;
    padding: 0.25rem;
    border: 1px solid var(--p-content-border-color);
    border-radius: 0.75rem;
}

.app-tabs {
    --app-tabs-fade-start: 0px;
    --app-tabs-fade-end: 0px;
    display: flex;
    align-items: center;
    gap: 0.125rem;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    mask-image: linear-gradient(90deg,
            transparent 0,
            #000 var(--app-tabs-fade-start),
            #000 calc(100% - var(--app-tabs-fade-end)),
            transparent 100%);
    -webkit-mask-image: linear-gradient(90deg,
            transparent 0,
            #000 var(--app-tabs-fade-start),
            #000 calc(100% - var(--app-tabs-fade-end)),
            transparent 100%);
}

.app-tabs--fade-start {
    --app-tabs-fade-start: 1.5rem;
}

.app-tabs--fade-end {
    --app-tabs-fade-end: 1.5rem;
}

.app-tabs::-webkit-scrollbar {
    display: none;
}

.app-tabs__separator {
    width: auto;
    margin-inline: -1rem;
}

.app-tabs__scroll-btn {
    position: absolute;
    top: 50%;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border: 1px solid var(--p-content-border-color);
    border-radius: 9999px;
    background: var(--p-content-background);
    color: var(--p-text-color);
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
    font-size: 0.75rem;
    transform: translateY(-50%);
    transition: background-color 0.15s;
}

.app-tabs__scroll-btn:hover {
    background: var(--p-surface-100);
}

.appdark .app-tabs__scroll-btn:hover {
    background: var(--p-surface-800);
}

.app-tabs__scroll-btn--start {
    left: -0.875rem;
}

.app-tabs__scroll-btn--end {
    right: -0.875rem;
}

.app-tabs__item {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    padding: 0.4375rem 0.875rem;
    border: 1px solid transparent;
    border-radius: 0.625rem;
    color: var(--p-text-muted-color);
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.25;
    text-decoration: none;
    white-space: nowrap;
    scroll-snap-align: start;
    transition: color 0.15s, border-color 0.15s, background-color 0.15s;
}

.app-tabs__item:hover {
    color: var(--p-text-color);
}

.app-tabs__item--active {
    border-color: var(--p-surface-300);
    color: var(--p-text-color);
}

.appdark .app-tabs__item--active {
    border-color: var(--p-surface-600);
}

.app-tabs__item:focus-visible {
    outline: 2px solid var(--p-primary-color);
    outline-offset: 2px;
}
</style>
