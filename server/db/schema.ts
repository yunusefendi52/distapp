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
    idv4: text('idv4').unique(),
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

// users_subs
export const users_subs = sqliteTable('users_app_subs', {
    subscriptionId: text('subsription_id').primaryKey().unique(),
    customerId: text('customer_id').notNull(),
    userId: text('user_id').notNull(),
    providerUserId: text('p_user_id'),
    currentPlan: text({
        enum: ['basic'],
    }),
    status: text('status', {
        // enum: ['on_trial', 'active', 'paused', 'past_due', 'unpaid', 'cancelled', 'expired',],
        enum: ['incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid',],
    }),
    status_formatted: text('status_formatted'),
    endsAt: integer('ends_at', {
        mode: 'timestamp_ms',
    }),
    renewsAt: integer('renews_at', {
        mode: 'timestamp_ms',
    }),
    webhookEventId: text('webhook_id'),
    webhookEventName: text('hook_event_name'),
    cardBrand: text('card_brand'),
    variantId: text('variant_id'),
    variant_name: text('variant_name'),
    product_id: text('product_id'),
    product_name: text('product_name'),
    user_name: text('user_name'),
    testMode: integer('test_mode', {
        mode: 'boolean',
    }),
    subs_quantity: integer('subs_quantity'),
    subs_created_at: text('subs_created_at'),
    subs_updated_at: text('subs_updated_at'),
    subs_price_id: integer('subs_price_id'),
    ...timeColumns,
}, t => ({
    idx_user_app_subs_userId: index('idx_user_app_subs_userId').on(t.userId),
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
        enum: ['owner', 'admin', 'collaborator'],
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
        enum: ['android', 'ios', 'desktop', 'windows', 'macos', 'linux', 'embedded', 'other'],
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
    fileObjectApkKey: text('file_object_apk_key'),
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
    filename: text('filename'),
    fileContentLength: integer('file_content_length'),
    fileApkContentLength: integer('file_apk_content_length'),

    appsId: text('appsId'),
    organizationId: text('organizationId'),
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
    publicId: text('publicId'),
    isPublic: integer('isPublic', {
        mode: 'boolean'
    }).default(false),
    ...timeColumns,
}, t => ({
    appsId_releaseId: unique().on(t.appsId, t.name),
    appsId_name_publicId: unique().on(t.appsId, t.name, t.publicId),
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

// Groups Tester
export const groupTester = sqliteTable('grouptester', {
    id: text('id').primaryKey().unique(),
    testerId: text('testerId').notNull().references(() => users.id, {
        onDelete: 'cascade',
    }),
    organizationId: text('organizationId').notNull().references(() => organizations.id, {
        onDelete: 'cascade',
    }),
    appsId: text('appsId').notNull().references(() => apps.id, {
        onDelete: 'cascade',
    }),
    artifactGroupId: text('artifactGroupId').notNull().references(() => artifactsGroups.id, {
        onDelete: 'cascade',
    }),
}, t => ({
    testerId_orgId_appId_groupId: uniqueIndex('testerId_orgId_appId_groupId').on(t.testerId, t.organizationId, t.appsId, t.artifactGroupId),
    grouptester_artifactGroupId_IDX: uniqueIndex('grouptester_artifactGroupId_IDX').on(t.artifactGroupId),
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
    hasArtifact: integer('hasArtifact'),
    appName: integer('appName'),
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
    idx_createdAt: index('idx_createdAt').on(t.createdAt),
    idx_hasArtifact: index('idx_hasArtifact').on(t.hasArtifact),
}))

export const keyValue = sqliteTable('key_value', {
    key: text('key').primaryKey(),
    group: text('group').default('default'),
    value: text('value', {
        mode: 'json',
    }),
    ...timeColumns,
}, (t) => ({
    key_value_group_key: unique().on(t.key, t.group),
    key_value_group_createdAt_key: index('key_value_group_createdAt_key_IDX').on(t.createdAt, t.createdAt),
}))
