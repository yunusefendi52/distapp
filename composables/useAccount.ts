export function useAccount() {
    const cookie = useCookie(cookieAuthKey)
    const cookiePayload = cookie.value ? decodeJwt(cookie.value) : undefined
    const userEmail = computed(() => cookiePayload?.email?.toString())
    return {
        email: userEmail,
    }
}