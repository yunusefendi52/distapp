<script setup lang="ts">
const { isOpen } = useAppDrawer()
const touchStartX = ref<number | null>(null)

const onTouchStart = (event: TouchEvent) => {
    touchStartX.value = event.touches[0]?.clientX ?? null
}

const onTouchEnd = (event: TouchEvent) => {
    if (touchStartX.value === null) return
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.value
    if (touchStartX.value - endX > 60) {
        isOpen.value = false
    }
    touchStartX.value = null
}
</script>

<template>
    <div class="flex flex-col h-full touch-pan-y" @touchstart="onTouchStart" @touchend="onTouchEnd">
        <AppHeader />
        <AppDivider orientation="horizontal" />
        <div class="flex-1 overflow-auto">
            <AppMenu />
        </div>
        <LazyBottomMenu />
    </div>
</template>
