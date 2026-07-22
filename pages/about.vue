<template>
    <div>
        <div class="w-full md:max-w-2xl m-auto p-5">
            <h1 class="text-3xl">About</h1>
            <div class="mt-5">
                <p>DistApp is a platform built to help you manage and distribute your apps with ease.</p>
                <br>
                <p class="text-lg font-bold">Contact</p>
                <ul>
                    <li>Email: <a href="mailto:contact@distapp.app" class="underline">contact@distapp.app</a></li>
                    <li>GitHub: <a href="https://github.com/yunusefendi52/distapp" target="_blank" class="underline">github.com/yunusefendi52/distapp</a></li>
                    <li>Twitter: <a href="https://x.com/yunusefendi52" target="_blank" class="underline">@yunusefendi52</a></li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'content-layout',
})
</script>

<style lang="css" scoped>
li {
    margin: 10px 0;
}
</style>
