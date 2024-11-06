export const useCreateOrg = async () => {

    const addOrgVisible = ref(false)
    const orgName = ref('')
    const { mutateAsync, isPending } = useMutation({
        mutationFn: (r: any) => $fetch.raw('/api/create-org', {
            method: 'post',
            body: r,
        }).then(e => e._data!),
        onSuccess: async (r) => {
            orgsStore.refresh()
            addOrgVisible.value = false
            navigateTo({
                name: 'orgs',
                params: {
                    orgName: r.normalizedOrgName,
                },
            })
            orgName.value = ''
        },
    })

    const orgsStore = await useOrgsStore()

    const saveOrg = async () => {
        await mutateAsync({
            name: orgName.value,
            displayName: orgName.value,
        })
    }

    return {
        addOrgVisible,
        orgName,
        isPending,
        saveOrg,
    }
}