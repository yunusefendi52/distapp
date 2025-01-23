<template>
    <div class="flex gap-3 p-3 flex-col justify-stretch bottom-menu">
        <NuxtLink :to="{
            name: 'account-settings-profile',
        }">
            <Button data-testid="btn_acc_stngs" label="Account Settings" outlined fluid />
        </NuxtLink>
        <SignOutButton />
    </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
</script>