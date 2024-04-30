export const useOrgsStore = async () => {
    const orgs = useState<OrgInfo[]>('orgs', () => [])
    const { data, refresh, execute } = useFetch('/api/list-orgs')
    watchEffect(() => {
        orgs.value = data.value ?? []
    })
    return { orgs: orgs ?? [], refresh: execute }
}

interface OrgInfo {
    name: string
    id: string
    displayName: string
}
