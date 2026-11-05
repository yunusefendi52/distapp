export function usePricingPlans() {
    const planConfig = useRuntimeConfig().public.plans

    const formatStorage = (mb: number) => formatBytes(mb * 1024 * 1024, 0, true) ?? ''

    const freeFeatures = [
        {
            name: 'Artifacts storage',
            desc: `Only ${formatStorage(planConfig.free.artifactMb)}`,
        },
        {
            name: 'Number of apps',
            desc: `Only ${planConfig.free.apps}`,
        },
        {
            name: 'Number of organizations',
            desc: `Only ${planConfig.free.orgs}`,
        },
        {
            name: 'Upload size',
            desc: `Only ${formatStorage(planConfig.free.uploadMb)}`,
        },
    ]

    const proFeatures = [
        {
            name: 'Artifacts storage',
            desc: formatStorage(planConfig.pro.artifactMb),
            desc2: `Then extra $${planConfig.pro.extraPerGb} /GB (round up)`,
        },
        {
            name: 'Number of apps',
            desc: `Up To ${planConfig.pro.apps}`,
        },
        {
            name: 'Number of organizations',
            desc: `Up To ${planConfig.pro.orgs}`,
        },
        {
            name: 'Upload size',
            desc: `Up To ${formatStorage(planConfig.pro.uploadMb)}`,
        },
    ]

    const plans = [
        {
            name: 'Pro',
            price: planConfig.pro.price,
            period: '/month',
            highlighted: true,
            cta: 'Upgrade to Pro',
            features: proFeatures,
        },
        {
            name: 'Free',
            price: planConfig.free.price,
            period: '',
            highlighted: false,
            cta: 'Get Started',
            features: freeFeatures,
        },
    ]

    return {
        plans,
        freeFeatures,
        proFeatures,
    }
}
