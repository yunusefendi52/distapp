<template>
    <SplitButton :pt="{
        pcButton: {
            root: {
                'class': 'w-full',
                'data-testid': 'b_sign_out_btn',
            },
        },
        pcDropdown: {
            root: {
                'data-testid': 'b_more_btn',
            },
        },
    }" @click="signout" label="Sign Out" :model="items" menuButtonIcon="pi pi-ellipsis-h" outlined />
</template>

<script setup lang="ts">
import { UserTokenInfo } from '~/server/models/UserTokenInfo';
import { userTokensKey } from '~/server/utils/utils';

const signout = () => {
    if (import.meta.client) {
        const userTokens = useLocalStorage<UserTokenInfo[]>(userTokensKey, [])
        try {
            if (cookie.value) {
                const newUserTokens = userTokens.value.filter(e => e.email !== userEmail.value)
                userTokens.value = newUserTokens
            }
        } catch (e) {
            console.error('Error decode on signout', e)
        }
        cookie.value = userTokens.value.find(e => e ? true : false)?.token
        navigateTo({
            name: 'index',
        })
    }
}

const cookie = useCookie(cookieAuthKey)
const cookiePayload = cookie.value ? decodeJwt(cookie.value) : undefined
const userEmail = computed(() => cookiePayload?.email?.toString())

const items = ref([{
    label: 'Add Account',
    icon: 'pi pi-add',
    command: () => {
        navigateTo({
            name: 'add-account',
        })
    }
}])

if (import.meta.client) {
    const userTokens = useLocalStorage<UserTokenInfo[]>(userTokensKey, [])
    watchEffect(() => {
        items.value = [
            ...items.value,
            ...userTokens.value.map(e => ({
                label: `${e.email} ${e.email === userEmail.value ? '(Current)' : ''}`.trimEnd(),
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