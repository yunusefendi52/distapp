<template>
    <div class="flex items-center gap-1 border-t border-[var(--p-content-border-color)] px-3 py-2.5">
        <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--p-surface-200)] text-xs font-semibold uppercase text-[var(--p-text-color)] dark:bg-[var(--p-surface-700)]">
            {{ initial }}
        </div>
        <span class="min-w-0 flex-1 truncate px-2 text-sm font-medium" :title="email ?? undefined">
            {{ email }}
        </span>
        <NuxtLink :to="{ name: 'account-settings-profile' }">
            <Button icon="pi pi-cog" text rounded size="small" aria-label="Account settings" data-testid="btn_acc_stngs"
                v-tooltip.top="'Account settings'" />
        </NuxtLink>
        <Button icon="pi pi-sign-out" text rounded size="small" aria-label="Sign out" data-testid="b_sign_out_btn"
            v-tooltip.top="'Sign out'" @click="signout" />
        <Button icon="pi pi-ellipsis-h" text rounded size="small" aria-label="More account options"
            data-testid="b_more_btn" v-tooltip.top="'Accounts'" @click="toggleMenu" />
    </div>
    <Menu ref="menu" :model="items" :popup="true" appendTo="body" />
</template>

<script setup lang="ts">
import { UserTokenInfo } from '~/server/models/UserTokenInfo'
import { userTokensKey } from '~/server/utils/utils'

const confirm = useConfirm()
const cookie = useCookie(cookieAuthKey)
const { email } = useAccount()

const initial = computed(() => email.value?.trim().charAt(0).toUpperCase() ?? '?')

const menu = ref()
const toggleMenu = (event: PointerEvent) => {
    menu.value.toggle(event)
}

const userTokens = useLocalStorage<UserTokenInfo[]>(userTokensKey, [])

const items = computed(() => [
    {
        label: 'Add Account',
        icon: 'pi pi-plus',
        command: () => {
            navigateTo({
                name: 'add-account',
            })
        },
    },
    ...(userTokens.value.length ? [{ separator: true }] : []),
    ...userTokens.value.map(e => ({
        label: `${e.email} ${e.email === email.value ? '(Current)' : ''}`.trimEnd(),
        icon: 'pi pi-user',
        command: () => {
            cookie.value = e.token
            location.reload()
        },
    })),
])

const signout = (event: MouseEvent) => {
    confirm.require({
        target: event.currentTarget as HTMLElement,
        message: 'Are you sure you want to logout?',
        icon: 'pi pi-info-circle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true,
        },
        acceptProps: {
            label: 'Yes',
            severity: 'danger',
        },
        accept: () => {
            try {
                if (cookie.value) {
                    const newUserTokens = userTokens.value.filter(e => e.email !== email.value)
                    userTokens.value = newUserTokens
                }
            } catch (e) {
                console.error('Error decode on signout', e)
            }
            cookie.value = userTokens.value.find(e => e ? true : false)?.token
            navigateTo({
                name: 'index',
            })
        },
        reject: () => {
        },
    })
}
</script>
