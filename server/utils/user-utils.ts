import type { EventHandler, EventHandlerRequest, H3Event } from "h3"

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

export async function getUserSubFromDb(event: H3Event<EventHandlerRequest>, whichUserId?: string | undefined) {
    const db = event.context.drizzle
    const userId = whichUserId || event.context.auth.userId
    return await db.select()
        .from(tables.users_subs)
        .where(and(
            eq(tables.users_subs.userId, userId),
            ne(tables.users_subs.status, 'expired'),
        ))
        .then(singleOrDefault)
}

export async function getUserMaxOrg(event: H3Event<EventHandlerRequest>) {
    const {
        APP_LIMIT_ORG,
        APP_LIMIT_PRO_ORG,
    } = useRuntimeConfig(event)
    const ownerUserSubs = await getUserSubFromDb(event, event.context.auth.userId)
    const isSubsActive = await checkIfSubsActive(event, ownerUserSubs)
    return {
        orgLimit: isSubsActive ? APP_LIMIT_PRO_ORG : APP_LIMIT_ORG,
    }
}

export async function getUserFeature(event: H3Event<EventHandlerRequest>, orgId: string) {
    const {
        APP_LIMIT_APPS,
        APP_LIMIT_APPS_GROUP,
        APP_LIMIT_INVITE_ORGS,
        APP_LIMIT_SIZE_ARTIFACT_MB,
        APP_LIMIT_PRO_APPS,
        APP_LIMIT_PRO_APPS_GROUP,
        APP_LIMIT_PRO_INVITE_ORGS,
        APP_LIMIT_PRO_SIZE_ARTIFACT_MB,
    } = useRuntimeConfig(event)
    const ownerUserSubs = await getOwnerUserSub(event, orgId)
    const isSubsActive = await checkIfSubsActive(event, ownerUserSubs)
    return {
        appLimit: isSubsActive ? APP_LIMIT_PRO_APPS : APP_LIMIT_APPS,
        appGroupLimit: isSubsActive ? APP_LIMIT_PRO_APPS_GROUP : APP_LIMIT_APPS_GROUP,
        inviteOrgLimit: isSubsActive ? APP_LIMIT_PRO_INVITE_ORGS : APP_LIMIT_INVITE_ORGS,
        artifactSizeLimit: isSubsActive ? APP_LIMIT_PRO_SIZE_ARTIFACT_MB : APP_LIMIT_SIZE_ARTIFACT_MB,
    }
}

async function getOwnerUserSub(event: H3Event<EventHandlerRequest>, orgId: string) {
    const db = event.context.drizzle
    const orgOwner = await db.select({
        userId: tables.organizationsPeople.userId
    })
        .from(tables.organizations)
        .leftJoin(tables.organizationsPeople, eq(tables.organizationsPeople.organizationId, tables.organizations.id))
        .where(and(
            eq(tables.organizations.id, orgId),
            eq(tables.organizationsPeople.role, 'owner'),
        ))
        .then(takeUniqueOrThrow)
    return await getUserSubFromDb(event, orgOwner.userId!)
}

async function checkIfSubsActive(event: H3Event<EventHandlerRequest>, ownerUserSubs: Awaited<ReturnType<typeof getOwnerUserSub>>) {
    const {
        APP_GRACE_PERIOD_HOUR,
    } = useRuntimeConfig(event)
    const isExpired = ownerUserSubs && ownerUserSubs.endsAt ? checkIsExpire(APP_GRACE_PERIOD_HOUR, ownerUserSubs.endsAt) : true
    const isPro = ownerUserSubs?.product_name === 'DistApp Pro'
    const isSubsActive = !isExpired && isPro
    return isSubsActive
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