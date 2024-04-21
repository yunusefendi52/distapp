export const useOrgsStore = defineStore('orgs-store', () => {
    const orgs = ref<OrgInfo[]>([])

    const fetchOrgs = async () => {
        const r = useFetch('/api/list-orgs')
        orgs.value = r.data.value ?? []
    }

    return { orgs, fetchOrgs }
})

interface OrgInfo {
    name: string
    id: string
}
