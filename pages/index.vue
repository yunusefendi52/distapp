<template>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { UserTokenInfo } from '~/server/models/UserTokenInfo';
import { userTokensKey } from '~/server/utils/utils';

definePageMeta({
    layout: false,
})

const cookie = useCookie('app-auth')
if (cookie.value) {
    if (process.client) {
        const userTokens = useLocalStorage<UserTokenInfo[]>(userTokensKey, [])
        const newUserTokens = _.uniqBy([
            ...userTokens.value,
            {
                email: 'Main Account',
                token: cookie.value,
            },
        ], e => e.email)
        userTokens.value = newUserTokens
        setTimeout(() => { // why this need delay?
            navigateTo('/apps')
        }, 500)
    }
} else {
    await navigateTo('/signin')
}
</script>