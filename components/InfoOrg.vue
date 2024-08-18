<template>
    <div class="py-2">
        <form @submit.prevent="saveGroup" class="flex flex-col gap-5">
            <input name="currentOrgId" type="hidden" :value="detailOrg?.id" />
            <div class="flex flex-col gap-2">
                <label for="orgDisplayName">Organization Name</label>
                <InputText name="orgDisplayName" :value="detailOrg?.displayName" aria-describedby="org-display-name" />
            </div>
            <div class="flex flex-col gap-2">
                <label for="orgName">Organization URL</label>
                <InputText name="orgName" :value="detailOrg?.name" aria-describedby="org-name" />
            </div>
            <Button :loading="isPending" type="submit" class="sm:self-start" label="Save Changes" />
        </form>
    </div>
</template>

<script setup lang="ts">
import { UpdateGroupRequest } from '~/server/api/groups/update-group.post';

const { params } = useRoute()
const orgName = computed(() => params.orgName as string)

const detailOrg = useDetailGroup()

const orgStore = useOrgsStore()

const { mutate, isPending } = useMutation({
    mutationFn: async (e: Event) => {
        const request = getObjectForm<UpdateGroupRequest>(e)
        const r = await $fetch('/api/groups/update-group', {
            method: 'post',
            body: request,
        })
        if (r && orgName.value !== r.org.name) {
            navigateTo({
                name: 'orgs',
                params: {
                    orgName: r.org.name,
                },
            })
        } else {
            (await orgStore).refresh()
        }
    },
})
const saveGroup = (e: Event) => {
    mutate(e)
}
</script>