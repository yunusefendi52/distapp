<template>
    <div>
        <div class="flex flex-row *:flex-1 gap-4">
            <div>
                <Button class="w-full" fluid label="Cancel" @click="closeDialog" />
            </div>
            <div>
                <Button class="w-full" fluid label="Install" severity="info" @click="installClick"
                    :loading="installLoading" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const dialogRef = inject<any>('dialogRef')
const manifestLink = computed(() => {
    return dialogRef.value.data ? dialogRef.value.data.manifestLink : undefined
})

const closeDialog = () => {
    dialogRef.value.close()
}

const installLoading = ref(false)
const installClick = () => {
    installLoading.value = true
    location.href = manifestLink.value
    // There is no way to know href is finished loading right?
    setTimeout(() => {
        installLoading.value = false
        closeDialog()
    }, 1200);
}
</script>