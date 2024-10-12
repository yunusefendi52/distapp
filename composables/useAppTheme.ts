export const useAppTheme = () => {
    const appTheme = useCookie('app-theme')
    if (import.meta.client && !appTheme.value) {
        const watchColor = window.matchMedia('(prefers-color-scheme: dark)')
        function onColorChange(e: MediaQueryListEvent) {
            const newColorScheme = e.matches ? "d" : "l";
            appTheme.value = newColorScheme
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            appTheme.value = 'd'
        }
        onMounted(() => {
            watchColor.addEventListener('change', onColorChange)
        })
        onUnmounted(() => {
            watchColor.removeEventListener('change', onColorChange)
        })
    }
    const appThemeComputed = computed(() => appTheme.value === 'd' ? 'appdark' : 'applight')
    return {
        appTheme: appThemeComputed,
        switchTheme: () => {
            appTheme.value = appTheme.value === 'd' ? 'l' : 'd'
        },
    }
}