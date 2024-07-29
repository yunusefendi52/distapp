import { resolve } from 'path'
import { createCommonJS } from 'mlly'
const { __dirname } = createCommonJS(import.meta.url)
import path from 'path'
import fs from 'fs'
import PrimeVueTheme from '@primevue/themes/aura';

export default defineNuxtConfig({
  runtimeConfig: {
    app: {
      enableDrizzleLogging: true,
      limitUploadSizeMb: 120,
      apiAuthKey: '',
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
      openAPI: true,
      tasks: true,
    },
    scheduledTasks: {
      '*/5 * * * *': ['cleanupTempFile'],
    },
    // node: true,
  },

  imports: {
    presets: [{
      from: '@tanstack/vue-query',
      imports: ['useMutation'],
    }],
    dirs: [
      'server/stores',
      'server/utils',
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
    },
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: [
    '@hebilicious/vue-query-nuxt',
    '@vueuse/nuxt',
    '@primevue/nuxt-module',
  ],

  primevue: {
    usePrimeVue: true,
    options: {
      ripple: true,
      theme: {
        preset: PrimeVueTheme,
        options: {
          darkModeSelector: '.dark',
        },
      },
      pt: {
        divider: {
          root: {
            'class': 'm-0 divider-app',
          },
        },
      },
    },
  },

  css: [
    '~/assets/css/main.css',
    'primeicons/primeicons.css',
  ],

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
      pages.push({
        name: 'orgNameAppIdTabName',
        path: '/orgs/:orgName/apps/:appId/:tabName',
        file: resolve(__dirname, 'pages/orgs/[orgName]/apps/[appId]/index.vue'),
      })
    },
    'nitro:build:public-assets': (nitro) => {
      const targetDir = path.join(nitro.options.output.serverDir, 'db/drizzle');
      fs.cpSync('server/db/drizzle', targetDir, {
        recursive: true,
        force: true,
      });
    },
  },
})