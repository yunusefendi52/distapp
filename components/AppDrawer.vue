<template>
    <div class="flex flex-col h-full dark:bg-[rgb(25,25,25)] bg-[var(--p-surface-50)]">
        <div class="flex-1 overflow-auto">
            <AppHeader />
            <AppMenu />
        </div>
        <LazyBottomMenu />
    </div>
</template>