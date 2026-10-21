import { describe, expect, test } from 'vitest'
import type * as schema from '../server/db/schema'
import type { S3Fetch } from '../server/services/s3fetch'
import { computeRetentionPlan, executeRetention, getEffectiveSettings } from '../server/services/retention'
import { getStorageKeys } from '~/server/utils/utils'

type OrgRow = typeof schema.organizations.$inferSelect
type AppRow = typeof schema.apps.$inferSelect
type ArtifactRow = typeof schema.artifacts.$inferSelect
type Db = Parameters<typeof computeRetentionPlan>[0]

const ORG_ID = 'org-1'
const APP_ID = 'app-1'

// A fake drizzle db: `limit` is the chain terminator, it consumes the next
// queued result set and records the limit value so tests can assert how many
// rows a query is capped at.
function makeFakeDb(queues: unknown[][], failTransactions = false) {
    const stats = {
        selectCalls: 0,
        limits: [] as number[],
        deleteCalls: 0,
        transactions: 0,
    }
    type Chain = {
        from: () => Chain
        orderBy: () => Chain
        where: () => Chain
        limit: (n: number) => Promise<unknown[]>
    }
    const db = {
        select: () => {
            stats.selectCalls++
            const chain: Chain = {
                from: () => chain,
                orderBy: () => chain,
                where: () => chain,
                limit: async (n: number) => {
                    stats.limits.push(n)
                    return queues.splice(0, 1)[0] ?? []
                },
            }
            return chain
        },
        transaction: async (fn: (tx: unknown) => Promise<void>) => {
            stats.transactions++
            if (failTransactions) {
                throw new Error('tx boom')
            }
            const tx = {
                delete: () => {
                    stats.deleteCalls++
                    return {
                        where: async () => undefined,
                    }
                },
            }
            return await fn(tx)
        },
    }
    return { db: db as unknown as Db, stats }
}

function makeS3(deleteObject?: (key: string) => Promise<void>) {
    const calls: string[] = []
    const s3 = {
        async deleteObject(key: string) {
            calls.push(key)
            if (deleteObject) {
                await deleteObject(key)
            }
        },
    } as unknown as S3Fetch
    return { s3, calls }
}

const orgRow = (overrides: Record<string, unknown> = {}) => {
    return {
        id: ORG_ID,
        retentionEnabled: true,
        retentionMode: 'days',
        retentionKeepLatest: 5,
        retentionKeepDays: 30,
        retentionLastScheduledAt: null,
        createdAt: null,
        updatedAt: null,
        ...overrides,
    } as unknown as OrgRow
}

const appRow = (overrides: Record<string, unknown> = {}) => {
    return {
        id: APP_ID,
        name: 'my-app',
        displayName: 'My App',
        osType: 'android',
        organizationsId: ORG_ID,
        retentionEnabled: true,
        retentionMode: 'inherit',
        retentionKeepLatest: 5,
        retentionKeepDays: 30,
        retentionLastScheduledAt: null,
        createdAt: null,
        updatedAt: null,
        ...overrides,
    } as unknown as AppRow
}

const artifactRow = (id: string, overrides: Record<string, unknown> = {}) => {
    return {
        id,
        fileObjectKey: `file-${id}`,
        fileObjectApkKey: `file-${id}-apk`,
        versionName2: '1.2.3',
        versionCode2: '123',
        createdAt: new Date('2026-01-31T00:00:00.000Z'),
        releaseId: 2,
        fileContentLength: 100,
        fileApkContentLength: 90,
        ...overrides,
    } as unknown as ArtifactRow
}

describe('getEffectiveSettings', () => {
    test('App inherits enabled org settings', () => {
        expect(getEffectiveSettings(
            orgRow({ retentionKeepLatest: 7, retentionKeepDays: 14 }),
            appRow(),
        )).toEqual({
            enabled: true,
            mode: 'days',
            keepLatest: 7,
            keepDays: 14,
        })
    })

    test('App inherits disabled org settings', () => {
        expect(getEffectiveSettings(
            orgRow({ retentionEnabled: false }),
            appRow({ retentionEnabled: true }),
        )).toEqual({
            enabled: false,
            mode: 'days',
            keepLatest: 5,
            keepDays: 30,
        })
    })

    test('Null app mode is treated as inherit', () => {
        expect(getEffectiveSettings(
            orgRow({ retentionMode: 'latest', retentionKeepLatest: 3 }),
            appRow({ retentionMode: null }),
        )).toEqual({
            enabled: true,
            mode: 'latest',
            keepLatest: 3,
            keepDays: 30,
        })
    })

    test('Custom app settings replace org settings and fall back to org values', () => {
        expect(getEffectiveSettings(
            orgRow({ retentionMode: 'days', retentionKeepLatest: 9, retentionKeepDays: 45 }),
            appRow({
                retentionMode: 'latest',
                retentionEnabled: true,
                retentionKeepLatest: null,
                retentionKeepDays: null,
            }),
        )).toEqual({
            enabled: true,
            mode: 'latest',
            keepLatest: 9,
            keepDays: 45,
        })
    })

    test('Custom app can opt out of enabled org retention', () => {
        expect(getEffectiveSettings(orgRow(), appRow({
            retentionMode: 'latest',
            retentionEnabled: false,
        })).enabled).toBe(false)
    })

    test('Missing org values fall back to defaults (same as form defaults)', () => {
        expect(getEffectiveSettings(
            orgRow({ retentionMode: null, retentionKeepLatest: null, retentionKeepDays: null }),
            appRow(),
        )).toEqual({
            enabled: true,
            mode: 'days',
            keepLatest: 10,
            keepDays: 90,
        })
    })
})

describe('computeRetentionPlan', () => {
    test('Disabled settings produce an empty plan without querying artifacts', async () => {
        const { db, stats } = makeFakeDb([])
        const plan = await computeRetentionPlan(db, orgRow({ retentionEnabled: false }), appRow())
        expect(plan.appSettings.enabled).toBe(false)
        expect(plan.artifactsToDelete).toEqual([])
        expect(stats.selectCalls).toBe(0)
    })

    test('Days mode returns artifacts older than keepDays, capped at 32', async () => {
        const { db, stats } = makeFakeDb([[artifactRow('old-1'), artifactRow('old-2')]])
        const plan = await computeRetentionPlan(db, orgRow({ retentionKeepDays: 7 }), appRow())
        expect(plan.appSettings).toEqual({ enabled: true, mode: 'days', keepLatest: 5, keepDays: 7 })
        expect(plan.artifactsToDelete.map(v => v.id)).toEqual(['old-1', 'old-2'])
        expect(plan.artifactsToDelete[0]).toMatchObject({
            fileObjectKey: 'file-old-1',
            fileObjectApkKey: 'file-old-1-apk',
            releaseId: 2,
        })
        expect(stats.limits).toEqual([32])
        expect(stats.selectCalls).toBe(1)
    })

    test('Latest mode excludes the newest keepLatest artifacts, capped at 32', async () => {
        const latestIds = [{ id: 'keep-1' }, { id: 'keep-2' }]
        const removable = [artifactRow('old-1')]
        const { db, stats } = makeFakeDb([latestIds, removable])
        const plan = await computeRetentionPlan(
            db,
            orgRow({ retentionMode: 'latest', retentionKeepLatest: 2 }),
            appRow(),
        )
        // First select (subquery) keeps the newest 2, second selects the rest
        expect(stats.limits).toEqual([2, 32])
        expect(plan.appSettings).toEqual({ enabled: true, mode: 'latest', keepLatest: 2, keepDays: 30 })
        expect(plan.artifactsToDelete.map(v => v.id)).toEqual(['old-1'])
        expect(stats.selectCalls).toBe(2)
    })

    test('Legacy both mode is rejected', async () => {
        const { db } = makeFakeDb([])
        await expect(
            computeRetentionPlan(db, orgRow({ retentionMode: 'both' }), appRow()),
        ).rejects.toThrowError('retention both currently not suppported')
    })
})

describe('executeRetention', () => {
    test('Deletes S3 objects then DB rows within one transaction', async () => {
        const artifacts = [artifactRow('a-1'), artifactRow('a-2', { fileObjectApkKey: null })]
        const { db, stats } = makeFakeDb([artifacts])
        const { s3, calls } = makeS3()

        const result = await executeRetention(db, orgRow(), appRow(), s3)

        expect(result).toEqual({ deleted: 2, failed: 0, errors: [] })
        expect(stats.transactions).toBe(2)
        expect(stats.deleteCalls).toBe(4) // groups manager rows + artifact rows
        // Concurrent artifacts, so compare as a set
        expect(calls.slice().sort()).toEqual([
            getStorageKeys(ORG_ID, APP_ID, 'file-a-1').assets,
            getStorageKeys(ORG_ID, APP_ID, 'file-a-1-apk').assets,
            getStorageKeys(ORG_ID, APP_ID, 'file-a-2').assets,
        ].sort())
    })

    test('S3 404 counts as deleted', async () => {
        const { db, stats } = makeFakeDb([[artifactRow('a-1')]])
        const { s3, calls } = makeS3(async () => {
            throw { statusCode: 404 }
        })

        const result = await executeRetention(db, orgRow(), appRow(), s3)

        expect(result).toEqual({ deleted: 1, failed: 0, errors: [] })
        expect(calls.length).toBe(2)
    })

    test('S3 failure is collected per artifact without aborting the rest', async () => {
        const { db, stats } = makeFakeDb([[artifactRow('a-1'), artifactRow('a-2')]])
        const { s3, calls } = makeS3(async (key) => {
            if (key.includes('file-a-1')) {
                throw new Error('boom')
            }
        })

        const result = await executeRetention(db, orgRow(), appRow(), s3)

        expect(result.deleted).toBe(1)
        expect(result.failed).toBe(1)
        expect(result.errors).toEqual(['artifact a-1 (1.2.3): boom'])
        // DB rows never start for the failed artifact; the healthy one is complete
        expect(calls.length).toBe(3)
        expect(stats.deleteCalls).toBe(2)
    })

    test('Transaction failure is collected per artifact', async () => {
        const { db, stats } = makeFakeDb([[artifactRow('a-1')]], true)
        const { s3, calls } = makeS3()

        const result = await executeRetention(db, orgRow(), appRow(), s3)

        expect(result.deleted).toBe(0)
        expect(result.failed).toBe(1)
        expect(result.errors).toEqual(['artifact a-1 (1.2.3): tx boom'])
        expect(calls).toEqual([])
    })

    test('Disabled settings delete nothing', async () => {
        const { db, stats } = makeFakeDb([[artifactRow('a-1')]])
        const { s3, calls } = makeS3()

        const result = await executeRetention(db, orgRow({ retentionEnabled: false }), appRow(), s3)

        expect(result).toEqual({ deleted: 0, failed: 0, errors: [] })
        expect(stats.selectCalls).toBe(0)
        expect(stats.transactions).toBe(0)
        expect(calls).toEqual([])
    })
})
