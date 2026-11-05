export type AppThemePreference = 'light' | 'dark' | 'system'

const normalizeThemePreference = (value: unknown): AppThemePreference => {
    if (value === 'dark' || value === 'd') return 'dark'
    if (value === 'light' || value === 'l') return 'light'
    return 'system'
}

export const useAppTheme = () => {
    const cookie = useCookie(APP_THEME_COOKIE)
    const preference = useState<AppThemePreference>('app-theme-preference', () => normalizeThemePreference(cookie.value))

    watch(preference, (value) => {
        cookie.value = value
    })

    const systemDark = ref(false)
    if (import.meta.client) {
        const media = window.matchMedia('(prefers-color-scheme: dark)')
        systemDark.value = media.matches
        const onColorChange = (e: MediaQueryListEvent) => {
            systemDark.value = e.matches
        }
        onMounted(() => media.addEventListener('change', onColorChange))
        onUnmounted(() => media.removeEventListener('change', onColorChange))
    }

    const isDark = computed(() => preference.value === 'system' ? systemDark.value : preference.value === 'dark')
    const appTheme = computed(() => isDark.value ? DARK_THEME_CLASS : LIGHT_THEME_CLASS)

    watchEffect(() => {
        const themeColor = isDark.value ? 'black' : 'white'
        if (import.meta.client) {
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor)
        }
    })

    return {
        appTheme,
        preference,
        isDark,
        setTheme: (value: AppThemePreference) => {
            preference.value = value
        },
    }
}
