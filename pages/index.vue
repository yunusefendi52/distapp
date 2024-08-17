<template>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { UserTokenInfo } from '~/server/models/UserTokenInfo';
import { userTokensKey } from '~/server/utils/utils';

definePageMeta({
    layout: false,
})

const route = useRoute()
const router = useRouter()
const cookie = useCookie('app-auth')
if (cookie.value) {
    if (process.client) {
        const userToken = route.query.usr?.toString()
        const userEmail = route.query.e?.toString()
        const userTokens = useLocalStorage<UserTokenInfo[]>(userTokensKey, [])
        router.push({
            query: {
            },
        })
        if (userToken && userEmail) {
            const newUserTokens = _.uniqBy([
                ...userTokens.value,
                {
                    email: userEmail,
                    token: userToken,
                },
            ], e => e.email)
            userTokens.value = newUserTokens
        }
        onMounted(() => {
            navigateTo({
                name: 'apps',
            })
        })
    }
} else {
    await navigateTo({
        name: 'signin',
    })
}
</script>