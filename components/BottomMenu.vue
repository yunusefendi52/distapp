<template>
    <div class="flex gap-3 p-2 flex-column">
        <Button label="Join Invite Code" @click="joinDialog = true" severity="secondary" />
        <SplitButton @click="signout" label="Sign Out" :model="items" menuButtonIcon="pi pi-ellipsis-h" />
        <LazyJoinInviteLink v-model="joinDialog" @joined="joined" />
    </div>
</template>

<script setup lang="ts">
import { UserTokenInfo } from '~/server/models/UserTokenInfo';
import { userTokensKey } from '~/server/utils/utils';

const cookie = useCookie('app-auth')
const signout = () => {
    cookie.value = null
    navigateTo('/')
}
const joinDialog = ref(false)
const joined = () => {
    location.reload()
}

const items = ref([{
    label: 'Add Account',
    icon: 'pi pi-add',
    command: () => {
        navigateTo('/add-account')
    }
}])
if (process.client) {
    const userTokens = useLocalStorage<UserTokenInfo[]>(userTokensKey, [])
    watchEffect(() => {
        items.value = [
            ...items.value,
            ...userTokens.value.map(e => ({
                label: e.email,
                icon: 'pi pi-user',
                command: () => {
                    cookie.value = e.token
                    location.reload()
                },
            }))
        ]
    })
}
</script>