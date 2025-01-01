<template>
    <AppCard @click="clickUpload" class="cursor-pointer !py-3">
        <div class="flex flex-row items-center">
            <div class="flex-1 flex flex-col">
                <template v-if="modelFile">
                    <span>{{ modelFile.name }}</span>
                    <span class="text-sm">{{ formatBytes(modelFile.size) }}</span>
                </template>
                <span v-else>Click to upload here</span>
            </div>
            <Button v-if="modelFile" icon="pi pi-times" text @click="(e) => {
                e.stopPropagation()
                model = undefined
            }" />
            <Button v-else icon=" pi pi-upload" text />
        </div>
    </AppCard>
    <div class="mt-1 text-m" v-if="modelFile?.name.endsWith('.aab')">
        <span class="text-sm dark:text-neutral-200">
            <span class="">APK generation not supported here, use CLI for
                now. </span>
            <a href="https://github.com/yunusefendi52/distapp?tab=readme-ov-file#cli-usage" target="_blank">Learn
                more.</a>
        </span>
    </div>
    <input ref="fileRef" :modelValue="model" class="hidden" type="file" :accept="prop.accept" @change="(e) => {
        onChange(e)
    }">
</template>

<script setup lang="ts">
import { formatBytes } from '#imports'

defineOptions({
    inheritAttrs: false,
})

const fileRef = ref<HTMLInputElement>()
const model = defineModel<FileList | undefined>()
watchEffect(() => {
    if (!model.value && fileRef.value) {
        fileRef.value.value = ''
    }
})
const modelFile = computed(() => model.value && model.value.length ? model.value.item(0) : undefined)
const prop = defineProps<{
    accept?: string,
}>()
function onChange(event: Event) {
    const inputEl = event.target as HTMLInputElement
    model.value = inputEl?.files || undefined
    emit('change', event)
}
const emit = defineEmits<{
    (e: 'change', event: Event): void
}>()

function clickUpload() {
    fileRef.value?.click()
}
</script>
