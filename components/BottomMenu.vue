<template>
    <div class="flex gap-3 p-2 flex-col justify-stretch">
        <Button label="Join Invite Code" @click="joinDialog = true" severity="secondary" />
        <SplitButton :pt="{
            pcButton: {
                root: {
                    'class': 'w-full',
                },
            },
        }" @click="signout" label="Sign Out" :model="items" menuButtonIcon="pi pi-ellipsis-h" />
        <LazyJoinInviteLink v-model="joinDialog" @joined="joined" />
    </div>
</template>

<script setup lang="ts">
import { UserTokenInfo } from '~/server/models/UserTokenInfo';
import { userTokensKey } from '~/server/utils/utils';

const cookie = useCookie('app-auth')
const cookiePayload = cookie.value ? decodeJwt(cookie.value) : undefined
const userEmail = cookiePayload?.email?.toString()
const signout = () => {
    if (process.client) {
        const userTokens = useLocalStorage<UserTokenInfo[]>(userTokensKey, [])
        try {
            if (cookie.value) {
                const newUserTokens = userTokens.value.filter(e => e.email !== userEmail)
                userTokens.value = newUserTokens
            }
        } catch (e) {
            console.error('Error decode on signout', e)
        }
        cookie.value = userTokens.value.find(e => new Boolean(e))?.token
        navigateTo({
            name: 'index',
        })
    }
}
const joinDialog = ref(false)
const joined = () => {
    location.reload()
}

const items = ref([{
    label: 'Add Account',
    icon: 'pi pi-add',
    command: () => {
        navigateTo({
            name: 'add-account',
        })
    }
}])
if (process.client) {
    const userTokens = useLocalStorage<UserTokenInfo[]>(userTokensKey, [])
    watchEffect(() => {
        items.value = [
            ...items.value,
            ...userTokens.value.map(e => ({
                label: `${e.email} ${e.email === userEmail ? '(Current)' : ''}`.trimEnd(),
                icon: 'pi pi-user',
                command: () => {
                    cookie.value = e.token
                    location.href = '/'
                },
            }))
        ]
    })
}
</script>