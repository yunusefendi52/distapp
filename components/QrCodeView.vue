<script setup lang="ts">
import QRCodeStyling from 'qr-code-styling'

const divQr = useTemplateRef('divQr')

const props = defineProps<{
    code: string,
}>()
onMounted(() => {
    watchEffect(() => {
        const qrCode = new QRCodeStyling({
            width: 250,
            height: 250,
            type: 'svg',
            data: props.code,
            image: "",
            margin: 10,
            dotsOptions: {
                type: 'classy',
            },
            backgroundOptions: {
                color: "#ffffff",
            },
            imageOptions: {
                crossOrigin: "anonymous",
                // margin: 40,
            },
        })
        divQr.value!.innerHTML = ''
        qrCode.append(divQr.value!)
    })
})
</script>

<template>
    <div class="flex items-center justify-center">
        <div ref="divQr"></div>
    </div>
</template>