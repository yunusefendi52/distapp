export const useAppTheme = () => {
    const appTheme = useCookie('apptheme')
    const toggle = () => {
        appTheme.value = appTheme.value === 'd' ? 'l' : 'd'
    }

    useHead({
        htmlAttrs: {
            'class': computed(() => {
                return appTheme.value === 'd' ? 'appdark' : 'applight'
            }),
        },
    })

    return {
        switchTheme: toggle,
    }
}