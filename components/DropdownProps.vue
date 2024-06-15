<template>
    <Dropdown v-bind:value="model" name="role" :options="options" placeholder="Select a role" class="w-full md:w-14rem"
        @change="(v) => emit('change', v)" />
</template>

<script setup lang="ts">
const emit = defineEmits(['change'])
const { options, selectedOption } = defineProps<{
    options: any[],
    selectedOption: any,
}>()
const model = ref(selectedOption)
watchEffect(() => {
    model.value = selectedOption
})
</script>