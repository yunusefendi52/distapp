import { relations, sql } from 'drizzle-orm'
import { sqliteTable, text, integer, uniqueIndex, unique, index, primaryKey } from 'drizzle-orm/sqlite-core'

const timeColumns = {
    createdAt: integer('createdAt', {
        mode: 'timestamp_ms',
    }),
    updatedAt: integer('updatedAt', {
        mode: 'timestamp_ms',
    }),
}

// Users
export const users = sqliteTable('users', {
    id: text('id').primaryKey().unique(),
    providerUserId: text('providerUserId').unique(),
    name: text('name').notNull(),
    email: text('email').unique(),
    ...timeColumns,
}, t => ({
    idx_providerUserId: index('providerUserId').on(t.providerUserId),
}))
export const usersRelations = relations(users, (r) => ({
    organizationsPeople: r.many(organizationsPeople)
}))

// Organizations
export const organizations = sqliteTable('organizations', {
    id: text('id').primaryKey().unique(),
    name: text('name').unique().notNull(),
    displayName: text('displayName').notNull(),
    ...timeColumns,
})
export const organizationsRelations = relations(organizations, (r) => ({
    organizationsPeople: r.many(organizationsPeople),
    apps: r.many(apps),
}))

// OrganizationsPeople
export const organizationsPeople = sqliteTable('organizationsPeople', {
    userId: text('userId').references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }),
    organizationId: text('organizationId').references(() => organizations.id, {
        onDelete: 'cascade',
    }),
    createdAt: integer('createdAt', {
        mode: 'timestamp_ms',
    }),
    role: text('role', {
        enum: ['admin', 'collaborator'],
    }),
}, (t) => ({
    userIdOrganizationId: unique().on(t.userId, t.organizationId),
}))
export const organizationsPeopleRelations = relations(organizationsPeople, (r) => ({
    user: r.one(users, {
        fields: [organizationsPeople.userId],
        references: [users.id],
    }),
    organization: r.one(organizations, {
        fields: [organizationsPeople.organizationId],
        references: [organizations.id],
    }),
}))

// Apps
export const apps = sqliteTable('apps', {
    id: text('id').primaryKey().unique(),
    name: text('name').notNull(),
    displayName: text('displayName').notNull(),
    osType: text('osType', {
        enum: ['android', 'ios']
    }),
    organizationsId: text('organizationsId').references(() => organizations.id, {
        onDelete: 'cascade',
    }),
    ...timeColumns,
}, (t) => ({
    organizationsId_name: unique().on(t.organizationsId, t.name),
}))
export const appsRelations = relations(apps, r => ({
    organization: r.one(organizations, {
        fields: [apps.organizationsId],
        references: [organizations.id],
    }),
    artifacts: r.many(artifacts),
    artifactsGroups: r.many(artifactsGroups),
}))

// Artifacts
export const artifacts = sqliteTable('artifacts', {
    id: text('id').primaryKey().unique(),
    fileObjectKey: text('fileObjectKey').notNull(),
    // versionName: text('fileObjectKey').notNull().default(''),
    // versionCode: text('fileObjectKey').notNull().default(''),
    versionName2: text('versionName2').notNull(),
    versionCode2: text('versionCode2').notNull(),
    releaseNotes: text('releaseNotes'),
    createdAt: integer('createdAt', {
        mode: 'timestamp_ms',
    }),
    updatedAt: integer('updatedAt', {
        mode: 'timestamp_ms',
    }),
    releaseId: integer('releaseId').notNull(),
    extension: text('extension'),
    packageName: text('packageName'),

    appsId: text('appsId').references(() => apps.id, {
        onDelete: 'cascade',
    }),
}, t => ({
    appsId_releaseId: unique().on(t.appsId, t.releaseId),
}))
export const artifactsRelations = relations(artifacts, t => ({
    apps: t.one(apps, {
        fields: [artifacts.appsId],
        references: [apps.id],
    }),
    artifactsGroupsManager: t.many(artifactsGroupsManager),
}))

// ArtifactsGroups (this should be app gorups actually)
export const artifactsGroups = sqliteTable('artifactsGroups', {
    id: text('id').primaryKey().unique(),
    name: text('name').notNull(),
    displayName: text('displayName'),
    appsId: text('appsId').references(() => apps.id, {
        onDelete: 'cascade',
    }),
    publicId: text('publicId').unique(), // TODO: Add index?
    isPublic: integer('isPublic', {
        mode: 'boolean'
    }).default(false),
    ...timeColumns,
}, t => ({
    appsId_releaseId: unique().on(t.appsId, t.name),
}))
export const artifactsGroupsRelations = relations(artifactsGroups, t => ({
    artifactsGroupsManager: t.many(artifactsGroupsManager),
    apps: t.one(apps, {
        fields: [artifactsGroups.appsId],
        references: [apps.id],
    }),
}))

// ArtifactsGroupsManger
export const artifactsGroupsManager = sqliteTable('artifactsGroupsManager', {
    artifactsId: text('artifactsId').notNull().references(() => artifacts.id, {
        onDelete: 'cascade',
    }),
    artifactsGroupsId: text('artifactsGroupsId').notNull().references(() => artifactsGroups.id, {
        onDelete: 'cascade',
    }),
}, t => ({
    artifactsId_artifactsGroupsId: unique().on(t.artifactsId, t.artifactsGroupsId),
}))
export const artifactsGroupsManagerRelations = relations(artifactsGroupsManager, t => ({
    artifacts: t.one(artifacts, {
        fields: [artifactsGroupsManager.artifactsId],
        references: [artifacts.id],
    }),
    artifactsGroups: t.one(artifactsGroups, {
        fields: [artifactsGroupsManager.artifactsGroupsId],
        references: [artifactsGroups.id],
    }),
}))

// API Keys
export const apiKeys = sqliteTable('apiKeys', {
    id: text('id').primaryKey().unique(),
    createdAt: integer('createdAt', {
        mode: 'timestamp_ms',
    }).notNull(),

    organizationId: text('organizationId').references(() => organizations.id, {
        onDelete: 'cascade',
    }),
    appsId: text('appsId').references(() => apps.id, {
        onDelete: 'cascade',
    }),
})
export const apiKeysRelations = relations(apiKeys, t => ({
    apps: t.one(apps, {
        fields: [apiKeys.appsId],
        references: [apps.id],
    }),
    organizationId: t.one(organizations, {
        fields: [apiKeys.organizationId],
        references: [organizations.id],
    }),
}))

// Purge Artifacts
export const purgeAppArtifact = sqliteTable('purgeAppArtifact', {
    orgId: text('orgId'),
    appId: text('appId'),
    createdAt: integer('createdAt', {
        mode: 'timestamp_ms',
    }).default(sql`(unixepoch('subsecond') * 1000)`).notNull(),
    updatedAt: integer('updatedAt', {
        mode: 'timestamp_ms',
    }).default(sql`(unixepoch('subsecond') * 1000)`).notNull(),
}, t => ({
    pk_orgId_appId: primaryKey({
        columns: [t.orgId, t.appId],
    }),
}))
