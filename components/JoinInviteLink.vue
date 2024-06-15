<template>
    <Dialog v-model:visible="model" modal header="Join Invite Code" :style="{ width: '25rem' }">
        <form @submit="joinInvite">
            <div class="flex align-items-center gap-2 mb-3">
                <label for="username">Link</label>
                <InputText name="link" class="flex-auto" autocomplete="off" autofocus />
            </div>
            <div class="w-full">
                <Button :loading="joinIsPending" type="submit" class="w-full" label="Join"></Button>
            </div>
        </form>
    </Dialog>
</template>
<script setup lang="ts">
import _ from 'lodash';

const emit = defineEmits(['joined'])

const model = defineModel<boolean>()
const toast = useToast()

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
        emit('joined')
        model.value = false
    },
    onError(error, variables, context) {
        toast.add({
            severity: 'error',
            detail: error.name,
            life: 5000,
        })
    },
})
</script>