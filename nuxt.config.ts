import { resolve } from 'path'
import { createCommonJS } from 'mlly'
const { __dirname } = createCommonJS(import.meta.url)

export default defineNuxtConfig({
  runtimeConfig: {
    app: {
      enableDrizzleLogging: true,
      limitUploadSizeMb: 120,
    },
    JWT_KEY: '',
    DB_URL: '',
    DB_AUTH_TOKEN: '',
    S3_ENDPOINT: '',
    S3_ACCESS_KEY_ID: '',
    S3_SECRET_ACCESS_KEY: '',
    adminKey: {
      key: '' // generate using openssl
    },
    google: {
      clientSecret: '',
      clientId: '',
      redirectUrl: '/api/auth/callback',
    },
    public: {
      adminKey: {
        enable: true,
      },
    },
  },
  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      openAPI: true
    },
    // node: true,
  },
  imports: {
    presets: [{
      from: '@tanstack/vue-query',
      imports: ['useMutation']
    }],
    dirs: [
      'server/stores',
    ],
  },
  vite: {
    define: {
      global: {},
    },
  },
  app: {
    head: {
      title: 'DistApp',
      // link: [
      //   {
      //     id: 'theme-css',
      //     rel: 'stylesheet',
      //     type: 'text/css',
      //     href: '/themes/aura-dark-green/theme.css'
      //   }
      // ]
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: ['@hebilicious/vue-query-nuxt', 'nuxt-primevue', '@vueuse/nuxt'],
  primevue: {
    options: { ripple: true },
    components: {
      exclude: ['Editor']
    }
  },
  css: ['~/assets/css/main.css', 'primeicons/primeicons.css', 'primeflex/primeflex.scss', 'primevue/resources/primevue.min.css', '@/assets/styles.scss'],
  hooks: {
    'pages:extend'(pages) {
      pages.push({
        name: 'orgs',
        path: '/orgs/:orgName',
        file: resolve(__dirname, 'pages/apps.vue'),
      })
      pages.push({
        name: 'add-account',
        path: '/add-account',
        file: resolve(__dirname, 'pages/signin.vue'),
      })
    }
  }
})