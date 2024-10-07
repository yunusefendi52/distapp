export default defineNuxtPlugin(async (nuxtApp) => {
    const { GOOGLE_CLIENT_ID } = useRuntimeConfig().public
    if (GOOGLE_CLIENT_ID) {
        const plugin = await import('vue3-google-signin')
        nuxtApp.vueApp.use(plugin.default, { clientId: GOOGLE_CLIENT_ID })
    }
})