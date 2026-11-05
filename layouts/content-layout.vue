<template>
    <div class="min-h-screen flex flex-col">
        <header class="border-b border-[var(--p-content-border-color)] sticky top-0 z-30 bg-[var(--p-content-background)]">
            <nav class="flex w-full items-center">
                <AppHeader class="flex-1" />
            </nav>
        </header>

        <div class="flex-1">
            <slot />
        </div>

        <footer class="w-full px-5 sm:px-10 py-5 bg-[var(--p-content-background)]">
            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span class="text-sm text-[var(--p-text-muted-color)]">© {{ year }} DistApp. All rights reserved.</span>
                <div class="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <NuxtLink to="https://docs.distapp.app" target="_blank" class="footer-link">Docs</NuxtLink>
                    <NuxtLink to="https://github.com/yunusefendi52/distapp" target="_blank"
                        class="footer-link">GitHub</NuxtLink>
                    <NuxtLink to="about" class="footer-link">About</NuxtLink>
                    <NuxtLink to="privacy-policy" class="footer-link">Privacy</NuxtLink>
                    <NuxtLink to="tos" class="footer-link">Terms of Service</NuxtLink>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.footer-link {
    padding: 0.25rem 0;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: var(--p-text-color);
    transition: color 0.15s ease;
}

.footer-link:hover {
    text-decoration: underline;
}
</style>