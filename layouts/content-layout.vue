<template>
    <div class="mb-16">
        <header class="">
            <nav class="flex w-full items-center">
                <AppHeader class="flex-1" />
            </nav>
        </header>

        <slot />

        <footer class="sm:fixed bottom-0 w-full px-10 py-5 text-right bg-[var(--p-content-background)]">
            <NuxtLink to="privacy-policy">
                <Button label="Privacy" text size="small" />
            </NuxtLink>
            <NuxtLink to="tos">
                <Button label="Terms of Service" text size="small" />
            </NuxtLink>
        </footer>
    </div>
</template>