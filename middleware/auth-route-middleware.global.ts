export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return

  const auth = useCookie(cookieAuthKey)
  if (!auth.value) {
    if (to.name === 'invitation') {
      const invitationKey = from.query['c']?.toString()
      return navigateTo(`/signin?redirect=/invitation?c=${invitationKey}`)
    } else if (to.name === 'install-join-tester') {
      const invitationKey = from.query['c']?.toString()
      return navigateTo(`/signin?redirect=/install/join-tester?c=${invitationKey}`)
    }
  }
})
