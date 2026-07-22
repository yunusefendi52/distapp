<template>
    <div class="mb-16">
        <header class="border-b border-[var(--p-content-border-color)] sticky top-0 bg-[var(--p-content-background)]">
            <nav class="flex w-full items-center">
                <AppHeader class="flex-1" />
            </nav>
        </header>

        <slot />

        <footer class="bottom-0 w-full px-10 py-5 text-right bg-[var(--p-content-background)]">
            <NuxtLink to="about">
                <Button label="About" text size="small" />
            </NuxtLink>
            <NuxtLink to="privacy-policy">
                <Button label="Privacy" text size="small" />
            </NuxtLink>
            <NuxtLink to="tos">
                <Button label="Terms of Service" text size="small" />
            </NuxtLink>
        </footer>
    </div>
</template>