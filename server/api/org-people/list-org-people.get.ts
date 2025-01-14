import { and, asc, count, desc, eq } from 'drizzle-orm'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'

export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const db = event.context.drizzle
    const { orgName } = await getValidatedQuery(event, z.object({
        orgName: z.string().trim().min(1),
    }).parse)
    const orgId = await db.select({
        orgId: tables.organizations.id,
    }).from(tables.organizations)
        .leftJoin(tables.organizationsPeople, eq(tables.organizations.id, tables.organizationsPeople.organizationId))
        .where(and(
            eq(tables.organizations.name, orgName),
            eq(tables.organizationsPeople.userId, userId),
        ))
        .limit(1)
        .then(takeUniqueOrThrow)

    const people = await getListOrg(db, orgId.orgId, 'list').then(e => e!.list)
    const canEdit = await roleEditAllowed(event, orgName)
    return {
        canChange: canEdit,
        people,
    }
})


export async function getListOrg(
    db: LibSQLDatabase<typeof tables>, orgId: string, returnAs: 'list' | 'count') {
    if (returnAs === 'list') {
        const people = await db.select({
            profileName: tables.users.name,
            email: tables.users.email,
            createdAt: tables.organizationsPeople.createdAt,
            role: tables.organizationsPeople.role,
        })
            .from(tables.organizationsPeople)
            .leftJoin(tables.users, eq(tables.users.id, tables.organizationsPeople.userId))
            .where(and(eq(tables.organizationsPeople.organizationId, orgId)))
            .orderBy(asc(tables.users.name))
        return {
            list: people,
        }
    } else if (returnAs === 'count') {
        const people = await db.select({
            count: count(),
        })
            .from(tables.organizationsPeople)
            .leftJoin(tables.users, eq(tables.users.id, tables.organizationsPeople.userId))
            .where(and(eq(tables.organizationsPeople.organizationId, orgId)))
            .orderBy(asc(tables.users.name))
            .then(takeUniqueOrThrow)
        return {
            count: people.count,
        }
    }
}
