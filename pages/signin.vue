<template>
    <!-- <form @submit.prevent="signin">
        <div class="flex flex-column gap-3">
            <h4>Sign In</h4>
            <InputText v-model="key" />
            <Button type="submit" :loading="isPending" label="Sign In"></Button>
        </div>
    </form> -->
    <form method="get" action="/api/auth/signin-google">
        <input type="hidden" name="host" :value="host">
        <Button label="Sign In with Google" type="submit" />
    </form>
</template>

<script setup lang="ts">

definePageMeta({
    layout: 'auth-layout',
})

const cookie = useCookie('app-auth')
if (cookie.value) {
    await navigateTo('/')
}

const key = ref('')

const { mutate, isPending } = useMutation({
    mutationFn: () => $fetch('/api/auth/signin', {
        method: 'post',
        body: {
            key: key.value,
        },
    }),
    onSuccess: () => {
        navigateTo('/')
    },
})

const signin = (event: any) => {
    mutate()
}

const host = ref('')
if (process.client) {
    onMounted(() => {
        host.value = window.location.origin
    })
}
</script>