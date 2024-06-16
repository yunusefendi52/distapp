import { runMigration } from "../db/migrate"

export default defineNitroPlugin(async (nuxtApp) => {
    await runMigration()
})
