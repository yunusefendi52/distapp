<template>
    <div class="flex flex-row gap-1 items-center">
        <AppHeader class="flex-auto" />
        <template v-if="showAccountBtn">
            <template v-if="isLoggedIn">
                <div class="flex flex-row gap-2 px-3">
                    <SignOutButton />
                </div>
            </template>
            <template v-else>
                <NuxtLink :to="{
                    name: 'signin',
                }" class="mr-5">
                    <Button label="Sign In" />
                </NuxtLink>
            </template>
        </template>
    </div>
    <div class="flex max-w-lg flex-col mx-auto justify-stretch sm:px-0 pt-6 pb-20">
        <slot />
    </div>
</template>

<script setup lang="ts">
const showAccountBtn = useState('show-account-btn', () => false)
const isLoggedIn = useCookie(cookieAuthKey)
</script>