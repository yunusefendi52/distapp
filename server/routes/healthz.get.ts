export default defineEventHandler(async (event) => {
    setResponseStatus(event, 500)
    return 'ok'
})
