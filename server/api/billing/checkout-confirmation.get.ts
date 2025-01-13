export default defineEventHandler(async event => {
    await sendRedirect(event, `/account-settings/billing`)
})
