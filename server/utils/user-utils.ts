import type { EventHandlerRequest, H3Event } from "h3"

export const getCurrentUserRole = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string,
    userId: string) => {
    const db = event.context.drizzle
    const currentUserRole = await db.select({
        role: tables.organizationsPeople.role,
    }).from(tables.organizationsPeople)
        .leftJoin(tables.organizations, eq(tables.organizations.id, tables.organizationsPeople.organizationId))
        .where(and(
            eq(tables.organizations.name, orgName),
            eq(tables.organizationsPeople.userId, userId),
        ))
        .then(takeUniqueOrThrow)
    return currentUserRole
}

export const roleEditAllowed = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string) => {
    const userId = event.context.auth.userId
    const currentUserRole = await getCurrentUserRole(event, orgName, userId)
    return currentUserRole.role && (currentUserRole.role === 'admin' || currentUserRole.role === 'owner')
}

export const roleEditNotAllowed = async (
    event: H3Event<EventHandlerRequest>,
    orgName: string) => {
    return !(await roleEditAllowed(event, orgName))
}

export async function getUserSubFromDb(event: H3Event<EventHandlerRequest>) {
    const db = event.context.drizzle
    const userId = event.context.auth.userId
    return await db.select()
        .from(tables.users_subs)
        .where(and(
            eq(tables.users_subs.userId, userId),
            ne(tables.users_subs.status, 'expired'),
        ))
        .then(singleOrDefault)
}

export async function getUserFeature(event: H3Event<EventHandlerRequest>) {
    const {
        APP_LIMIT_ORG,
        APP_LIMIT_APPS,
        APP_LIMIT_APPS_GROUP,
        APP_LIMIT_INVITE_ORGS,
        APP_LIMIT_ARTIFACT,
    } = useRuntimeConfig(event)
    return {
        orgLimit: APP_LIMIT_ORG,
        appLimit: APP_LIMIT_APPS,
        appGroupLimit: APP_LIMIT_APPS_GROUP,
        inviteOrgLimit: APP_LIMIT_INVITE_ORGS,
        artifactLimit: APP_LIMIT_ARTIFACT,
    }
}

export function checkIsExpire(gracePeriodHour: number, endsAt: Date) {
    const now = new Date()
    now.setHours(now.getHours() - gracePeriodHour)
    return (endsAt.getTime() - now.getTime()) <= 0
}

export function isBillingEnabled(event: H3Event<EventHandlerRequest>) {
    const { APP_DISABLE_BILLING } = useRuntimeConfig(event)
    return !APP_DISABLE_BILLING
}