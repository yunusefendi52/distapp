export function useTitleApp(title: string | Ref<string | undefined> | Ref<string>) {
    const titleRef = computed(() => {
        return isRef(title) ? title.value : title
    })
    useHead({
        title: computed(() => {
            const gTitle = titleRef.value
            return `${gTitle ? `${gTitle} • ` : ''}` + 'DistApp'
        }),
    })
    return titleRef
}