<template>
    <div class="flex max-w-xl flex-col mx-auto justify-stretch p-10">
        <div class="flex flex-col">
            <span class="text-3xl font-medium">{{ title }}</span>

            <form class="mt-6" @submit="joinInvite">
                <div class="flex flex-col gap-2 mb-3">
                    <label for="username">Invitation code</label>
                    <InputText name="link" :value="invitationCode" readonly fluid autocomplete="off" />
                </div>
                <div class="w-full mt-5 flex flex-col space-y-2">
                    <Button :loading="joinIsPending" type="submit" class="w-full" label="Join"></Button>
                    <span>
                        <span>You logged in as: </span>
                        <span>{{ email }}</span>
                    </span>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import _ from 'lodash'

const { email } = useAccount()

const { query } = useRoute()
const invitationCode = computed(() => query.c)

const { mutate: joinInvite, isPending: joinIsPending } = useMutation({
    mutationFn: async (form: any) => {
        form.preventDefault()
        const data = Object.fromEntries(new FormData(form.target))
        const formData = _.omitBy({
            ...data,
        }, _.isEmpty)
        await $fetch('/api/invitations/join-invite-link', {
            method: 'post',
            body: formData,
        })
        location.replace('/apps')
    },
})

const title = useTitleApp('Invitation')
</script>
