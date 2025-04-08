<template>
    <AppCard @click="clickUpload" class="cursor-pointer !py-3" :class="isDragOver ? 'bg-gray-200 dark:bg-gray-800' : ''"
        :data-testid="dataTestId" @dragover.prevent="handleDragOver" @dragleave="handleDragLeave"
        @drop.prevent="handleDrop">
        <div class="flex flex-row items-center">
            <div class="flex-1 flex flex-col">
                <template v-if="modelFile">
                    <span>{{ modelFile.name }}</span>
                    <span class="text-sm">{{ formatBytes(modelFile.size) }}</span>
                </template>
                <span v-else>{{ placeholder || 'Click or drop to upload here' }}</span>
            </div>
            <Button v-if="modelFile" icon="pi pi-times" text @click="(e) => {
                e.stopPropagation()
                model = undefined
            }" />
            <Button v-else icon=" pi pi-upload" text />
        </div>
        <span v-if="errorMsg" class="text-red-400">{{ errorMsg }}</span>
    </AppCard>
    <input ref="fileRef" :modelValue="model" class="hidden" type="file" @change="(e) => {
        onChange(e)
    }">
</template>

<style lang="css"></style>

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
    allowedExts?: string,
    placeholder?: string,
    dataTestId?: string,
}>()
function onChange(event: Event) {
    const inputEl = event.target as HTMLInputElement
    updateFile(inputEl?.files)
}
const emit = defineEmits<{
    (e: 'change', fileList: FileList | undefined): void
}>()

function clickUpload() {
    fileRef.value?.click()
}

const isDragOver = ref(false)

const handleDragOver = () => {
    isDragOver.value = true
}

const handleDragLeave = () => {
    isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
    isDragOver.value = false
    const files = event.dataTransfer?.files
    if (!files || !files.length || files.length > 1) {
        return
    }
    updateFile(files)
}

const errorMsg = ref()

function updateFile(files: FileList | null) {
    errorMsg.value = undefined
    if (files && prop.allowedExts) {
        const exts = prop.allowedExts.split(',')
        for (let index = 0; index < files.length; index++) {
            const file = files.item(index)
            if (file) {
                const validFile = exts.find(e => file.name.endsWith(e.trim())) ? true : false
                if (!validFile) {
                    errorMsg.value = `Invalid file type, only accepts ${prop.allowedExts}`
                    return
                }
            }
        }
    }
    model.value = files || undefined
}
watch(() => model.value, v => {
    emit('change', v)
})
</script>
