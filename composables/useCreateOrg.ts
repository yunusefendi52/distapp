export const useCreateOrg = async () => {

    const addOrgVisible = ref(false)
    const orgName = ref('')
    const { mutateAsync, isPending, data } = useMutation({
        mutationFn: (r: any) => $fetch.raw('/api/create-org', {
            method: 'post',
            body: r,
        }).then(e => e._data!),
        onSuccess: async (r) => {
            orgsStore.refresh()
            addOrgVisible.value = false
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
        onCreateOrgData: data,
    }
}