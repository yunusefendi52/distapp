import { EventHandlerRequest, H3Event } from 'h3'
import { describe, expect, test, vi } from 'vitest'
import handler from '~/server/api/billing/current-billing.get'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

type UserSubType = Awaited<ReturnType<typeof getUserSubFromDb>>

const { getUserSubFromDbMock, getUserSubscriptionLmsMock } = vi.hoisted(() => {
    return {
        getUserSubFromDbMock: vi.fn(() => {
            return {
            } as UserSubType
        }),
        getUserSubscriptionLmsMock: vi.fn(() => {
            return undefined
        })
    }
})

mockNuxtImport('getUserSubFromDb', () => {
    return getUserSubFromDbMock
})
// TODO: Test this??
mockNuxtImport('getUserSubscriptionLms', () => {
    return getUserSubscriptionLmsMock
})

describe('Current billing tests', () => {
    test('Should has isCancelled when status cancelled and endsAt defined', async () => {
        getUserSubFromDbMock.mockImplementation(() => {
            return {
                userId: 'userid',
                status: 'cancelled',
                currentPlan: 'basic',
                renewsAt: new Date(),
                subscriptionId: '1',
                customerId: '2',
                webhookEventName: 'subscription_updated',
                status_formatted: 'Cancelled',
                webhookEventId: '3',
                createdAt: new Date(),
                cardBrand: 'mc',
                providerUserId: 'puserid',
                updatedAt: new Date(),
                endsAt: new Date(),
            }
        })
        const handlerEvent = {
            context: {
                auth: {
                    userId: 'userid',
                    email: 'userid@email.com',
                },
            },
        } as H3Event<EventHandlerRequest>
        const ok = await handler(handlerEvent)
        expect(ok).toBeDefined()
        expect(ok.isCancelled).toBeTruthy()
    })

    type SubscriptionStatus = "on_trial" | "active" | "paused" | "past_due" | "unpaid" | "cancelled" | "expired"
    const list: SubscriptionStatus[] = [
        "on_trial",
        "active",
        "paused",
        "past_due",
        "unpaid",
        "expired",
    ];
    for (const element of list) {
        test(`isCancelled should be false when ${element}`, async () => {
            getUserSubFromDbMock.mockImplementation(() => {
                return {
                    userId: 'userid',
                    status: element,
                    currentPlan: 'basic',
                    renewsAt: new Date(),
                    subscriptionId: '1',
                    customerId: '2',
                    webhookEventName: 'subscription_updated',
                    status_formatted: 'Cancelled',
                    webhookEventId: '3',
                    createdAt: new Date(),
                    cardBrand: 'mc',
                    providerUserId: 'puserid',
                    updatedAt: new Date(),
                    endsAt: new Date(),
                }
            })
            const handlerEvent = {
                context: {
                    auth: {
                        userId: 'userid',
                        email: 'userid@email.com',
                    },
                },
            } as H3Event<EventHandlerRequest>
            const ok = await handler(handlerEvent)
            expect(ok).toBeDefined()
            expect(ok.isCancelled).toBeFalsy()
        })
    }

    test('Returned plan should be undefined/empty when user subs expired', async () => {
        getUserSubFromDbMock.mockImplementation(() => {
            return {
                userId: 'userid',
                status: 'expired',
                currentPlan: null,
                renewsAt: new Date(),
                subscriptionId: '1',
                customerId: '2',
                webhookEventName: 'subscription_updated',
                status_formatted: 'Cancelled',
                webhookEventId: '3',
                createdAt: new Date(),
                cardBrand: 'mc',
                providerUserId: 'puserid',
                updatedAt: new Date(),
                endsAt: new Date(),
            }
        })
        const handlerEvent = {
            context: {
                auth: {
                    userId: 'userid',
                    email: 'userid@email.com',
                },
            },
        } as H3Event<EventHandlerRequest>
        const ok = await handler(handlerEvent)
        expect(ok).toBeDefined()
        expect(ok.isCancelled).toBeFalsy()
        expect(ok.plan).toBeFalsy()
    })
})