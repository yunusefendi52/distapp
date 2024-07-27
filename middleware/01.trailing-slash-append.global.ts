export default defineNuxtRouteMiddleware((to, from) => {
    if (to.path !== '/' && !to.path.endsWith('/')) {
        const { path, query, hash, params } = to
        const nextPath = `${path}/`
        const nextRoute = {
            path: nextPath,
            query,
            hash,
            params,
        }
        return navigateTo(nextRoute, {
            redirectCode: 302,
        })
    }
})
