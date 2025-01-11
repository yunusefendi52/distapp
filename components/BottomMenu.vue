<template>
    <div class="flex gap-3 p-3 flex-col justify-stretch bottom-menu">
        <Button data-testid="btn_acc_stngs" label="Account Settings" outlined @click="() => navigateTo({
            name: 'account-settings',
        })" />
        <SignOutButton />
    </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
</script>