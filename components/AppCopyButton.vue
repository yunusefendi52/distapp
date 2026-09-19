<script setup lang="ts">
const props = defineProps<{
    label?: string,
    text?: boolean | undefined,
    textValue: () => string | undefined | null,
}>()

const { copy, copied } = useClipboard()
</script>

<template>
    <Button :icon="copied ? 'pi pi-check' : 'pi pi-copy'" :text="text" :label="label" @click="() => {
        const text = props.textValue()
        if (text) {
            copy(text)
        }
    }" />
</template>
