export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return

  if (to.name === 'invitation') {
    const auth = useCookie(cookieAuthKey)
    if (!auth.value) {
      const invitationKey = from.query['c']
      return navigateTo(`/signin?redirect=/invitation?c=${invitationKey}`)
    }
  }
})
