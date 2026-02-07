<script setup lang="ts">
import { normalizeError } from '#imports'
import { Clerk } from '@clerk/clerk-js'

definePageMeta({
    layout: false,
})

const { CLERK_AUTH_ENABLED, CLERK_PUBLISHABLE_KEY } = useRuntimeConfig().public

const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
        if (!CLERK_AUTH_ENABLED) {
            return
        }

        const clerk = new Clerk(CLERK_PUBLISHABLE_KEY)
        await clerk.load({})
        const authResponse = await $fetch('/api/auth/sign-in-clerk', {
            method: 'post',
        })
        location.href = `/?${authResponse.param}`
    },
    gcTime: 0,
})
onMounted(() => {
    mutate()
})
</script>

<template>
    <div class="w-full h-full p-5 flex items-center justify-center">
        <div class="flex flex-col gap-5" v-if="isPending">
            <span class="font-medium text-xl">Signing in</span>
            <ProgressSpinner style="width: 32px; height: 32px; margin: unset;" strokeWidth="6" class="self-center" />
        </div>
        <div v-if="error" class="flex flex-col gap-5 items-center">
            <span class="text-red-400">{{ normalizeError(error) }}</span>
            <NuxtLink :to="{
                force: true,
                replace: true,
                name: 'index',
            }">
                <Button label="Okay"></Button>
            </NuxtLink>
        </div>
    </div>
</template>
