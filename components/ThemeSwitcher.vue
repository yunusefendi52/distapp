<template>
    <div>
        <Button class="mr-3" outlined @click="toggleMenu" text aria-label="Switch theme" aria-haspopup="true" aria-controls="theme-menu">
            <template #icon>
                <ThemeSystemIcon v-if="preference === 'system'" class="w-4 h-4" />
                <i v-else :class="currentIcon" />
            </template>
        </Button>
        <Menu id="theme-menu" ref="menu" :model="items" :popup="true" appendTo="body">
            <template #itemicon="{ item, class: iconClass }">
                <ThemeSystemIcon v-if="item.key === 'system'" :class="[iconClass, 'w-4', 'h-4']" />
                <span v-else :class="[iconClass, item.icon]" />
            </template>
        </Menu>
    </div>
</template>

<script setup lang="ts">
import ThemeSystemIcon from '~/public/theme-system.svg'

const menu = ref()
const { preference, setTheme } = useAppTheme()

const items = [
    { key: 'light', label: 'Light', icon: 'pi pi-sun', command: () => setTheme('light') },
    { key: 'dark', label: 'Dark', icon: 'pi pi-moon', command: () => setTheme('dark') },
    { key: 'system', label: 'System', command: () => setTheme('system') },
]

const currentIcon = computed(() => (preference.value === 'dark' ? 'pi pi-moon' : 'pi pi-sun'))

const toggleMenu = (event: PointerEvent) => {
    menu.value.toggle(event)
}
</script>
