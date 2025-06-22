import { EventHandlerRequest, H3Event } from 'h3'
import { describe, expect, test, vi } from 'vitest'
import handler from '~/server/api/billing/current-billing.get'
import { mockNuxtImport, mountSuspended, registerEndpoint, renderSuspended } from '@nuxt/test-utils/runtime'
import Billing from '~/pages/account-settings/billing.vue'
import { flushPromises } from '@vue/test-utils'
import currentBillingGet from '~/server/api/billing/current-billing.get'

type CurrentBillingGetType = Awaited<ReturnType<typeof currentBillingGet>> | undefined

const { useFetchMock } = vi.hoisted(() => {
    return {
        useFetchMock: vi.fn(async (e) => {
            return {}
        })
    }
})

mockNuxtImport('useFetch', () => useFetchMock)

describe('Billing component test', {
    skip: true,
}, () => {
    test('Should load component with loading first', async () => {
        useFetchMock.mockImplementationOnce(async () => {
            return {
                data: undefined
            }
        })
        const component = await mountSuspended(Billing)
        expect(component.find('[data-testid="menu-loading"]').html()).toContain('menu-loading')
        expect(component.find('[data-testid="checkout_btn"]').exists()).toBeFalsy()
    })

    test('Should get current billing and shows free when no subsription with checkout btn', async () => {
        useFetchMock.mockImplementationOnce(() => {
            return {
                data: {
                    plan: undefined,
                    planPrice: 333,
                    status: undefined,
                    statusFormatted: undefined,
                    endsAt: undefined,
                    renewsAt: undefined,
                    isCancelled: false,
                } as CurrentBillingGetType,
                status: 'success',
            }
        })
        const component = await mountSuspended(Billing)
        await flushPromises()
        expect(component.find('[data-testid="menu-loading"]').exists()).toBeFalsy()
        expect(component.find('[data-testid="checkout_btn"]').exists()).toBeTruthy()
        expect(component.find('[data-testid="btn_free_current"]').exists()).toBeTruthy()
        expect(component.html()).not.toContain('Update Payment Method')
        expect(component.html(), 'Shows price in $').toContain('$4')
    })

    test('Should get current billing and shows subscribed user', async () => {
        useFetchMock.mockImplementationOnce(() => {
            const renewsAt = new Date()
            renewsAt.setHours(renewsAt.getHours() + 12)
            return {
                data: {
                    plan: 'basic',
                    planPrice: 333,
                    status: 'active',
                    statusFormatted: 'Active',
                    endsAt: undefined,
                    renewsAt: renewsAt,
                    isCancelled: false,
                } as CurrentBillingGetType,
                status: 'success',
            }
        })
        const component = await mountSuspended(Billing)
        await flushPromises()
        expect(component.find('[data-testid="menu-loading"]').exists()).toBeFalsy()
        expect(component.find('[data-testid="checkout_btn"]').exists(), 'Checkout button should be hidden, user already subscribed').toBeFalsy()
        expect(component.find('[data-testid="btn_free_current"]').exists()).toBeFalsy()
        expect(component.html()).toContain('Update Payment Method')
        expect(component.html()).toContain('Renews at')
    })

    test('Should get current billing and shows subscribed user with renews at', async () => {
        useFetchMock.mockImplementationOnce(() => {
            const renewsAt = new Date()
            renewsAt.setHours(renewsAt.getHours() + 12)
            return {
                data: {
                    plan: 'basic',
                    planPrice: 333,
                    status: 'active',
                    statusFormatted: 'Active',
                    endsAt: undefined,
                    renewsAt: renewsAt,
                    isCancelled: false,
                } as CurrentBillingGetType,
                status: 'success',
            }
        })
        const component = await mountSuspended(Billing)
        await flushPromises()
        expect(component.find('[data-testid="menu-loading"]').exists()).toBeFalsy()
        expect(component.find('[data-testid="checkout_btn"]').exists(), 'Checkout button should be hidden, user already subscribed').toBeFalsy()
        expect(component.find('[data-testid="btn_free_current"]').exists()).toBeFalsy()
        expect(component.html()).toContain('Update Payment Method')
        expect(component.html()).toContain('Renews at')
    })

    test('Should get current billing and shows cancelled subscribed user with ends at', async () => {
        useFetchMock.mockImplementationOnce(() => {
            const renewsAt = new Date()
            renewsAt.setHours(renewsAt.getHours() + 12)
            const endsAt = new Date(renewsAt.getTime())
            endsAt.setHours(endsAt.getHours() + 24)
            return {
                data: {
                    plan: 'basic',
                    planPrice: 333,
                    status: 'active',
                    statusFormatted: 'Active',
                    endsAt: endsAt,
                    renewsAt: renewsAt,
                    isCancelled: false,
                } as CurrentBillingGetType,
                status: 'success',
            }
        })
        const component = await mountSuspended(Billing)
        await flushPromises()
        expect(component.find('[data-testid="menu-loading"]').exists()).toBeFalsy()
        expect(component.find('[data-testid="checkout_btn"]').exists(), 'Checkout button should be hidden, user already subscribed').toBeFalsy()
        expect(component.find('[data-testid="btn_free_current"]').exists()).toBeFalsy()
        expect(component.html()).toContain('Update Payment Method')
        expect(component.html()).toContain('Ends at')
    })
})