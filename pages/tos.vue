<template>
    <div>
        <div class="w-full md:max-w-2xl m-auto p-5">
            <h1 class="text-3xl">Terms of Service</h1>
            <div class="mt-5">
                <p>By using the our services, you accept the following terms:</p>
                <ol type="1" style="list-style: square;">
                    <li>All use of the service and any content is undertaken at your own risk. The service is
                        provider "as is" and "as available" and is without warranty of any kind, express or implied,
                        including, but
                        not limited to, the implied warranties of title, non-infringement, merchantability and
                        fitness for a particular purpose.</li>
                    <li>In the case of user that makes excessive use of our server resources, we reserves the right
                        to block the account.</li>
                    <li>We are not liable for any damages, including but not limited to, suspension or cessation of
                        DistApp hosting and circumstances caused by user's fault, e.g. user's software.</li>
                    <li>We offer a paid service. Each subscription includes 5GB of data usage per month. Any usage beyond 5GB will be billed at a rate of $0.02 per additional GB. You can sign up for a monthly subscription, which will automatically renew unless canceled. If you cancel your subscription, you will not receive a refund or credit for any amounts already paid. Your data will be retained for 30 days after cancellation, after which it will be permanently deleted. We reserve the right to change our service pricing at any time. Changes to pricing will not apply until your next renewal.</li>
                    <li>We reserves the right to change these terms.</li>
                </ol>
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