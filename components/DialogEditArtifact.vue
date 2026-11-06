<template>
    <!-- TODO: Check responsiveness on mobile -->
    <Drawer class="!w-[30rem]" position="right" header="Edit" v-model:visible="show">
        <form id="editForm" @submit.prevent="onFormSubmit" class="flex flex-col gap-4 w-full">
            <input name="orgName" hidden required :value="orgName" />
            <input name="appName" hidden required :value="appName" />
            <input name="releaseId" hidden required :value="releaseId" />
            <div class="flex flex-col gap-1">
                <Textarea rows="5" form="editForm" v-model="releaseNotesInput" :pt="{
                    root: {
                        'name': 'releaseNotes',
                    },
                }" id="releaseNotes" placeholder="Release Notes" />
            </div>
            <Button type="submit" severity="secondary" label="Save" data-testid="save_edit_btn" :loading="isPending" />
        </form>
    </Drawer>
</template>

<script setup lang="ts">
const { params } = useRoute()
const appName = params.appId as string
const orgName = params.orgName as string
const releaseId = params.detailArtifact as string
const show = defineModel<boolean>()

const props = defineProps({
    releaseNotes: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['onEdited'])

const releaseNotesInput = ref(props.releaseNotes)

watch(() => props.releaseNotes, (value) => {
    releaseNotesInput.value = value
})

const { mutate, isPending } = useMutation({
    mutationFn: async (r: any) => {
        await $fetch.raw('/api/artifacts/edit-artifact', {
            method: 'post',
            body: r,
        })
        show.value = false
        emit('onEdited')
    },
})

const onFormSubmit = (ev: Event) => {
    const request = getObjectForm(ev)
    mutate(request)
};
</script>