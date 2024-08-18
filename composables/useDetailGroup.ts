export const useDetailGroup = () => {
    const { params } = useRoute()
    const orgName = computed(() => params.orgName as string)

    const { data } = useFetch('/api/list-orgs', {
        query: {
            orgName,
        },
    })
    const detailOrg = computed(() => data.value && data.value.length ? data.value[0] : undefined)
    return detailOrg
}