import { resolve } from 'path'
import { createCommonJS } from 'mlly'
const { __dirname } = createCommonJS(import.meta.url)
import path from 'path'
import fs from 'fs'
import Aura from '@primevue/themes/aura';
import { definePreset } from '@primevue/themes';

const Noir = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{surface.50}',
      100: '{surface.100}',
      200: '{surface.200}',
      300: '{surface.300}',
      400: '{surface.400}',
      500: '{surface.500}',
      600: '{surface.600}',
      700: '{surface.700}',
      800: '{surface.800}',
      900: '{surface.900}',
      950: '{surface.950}'
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.950}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.800}',
          activeColor: '{primary.700}'
        },
        highlight: {
          background: '{primary.950}',
          focusBackground: '{primary.700}',
          color: '#ffffff',
          focusColor: '#ffffff'
        }
      },
      dark: {
        primary: {
          color: '{primary.50}',
          contrastColor: '{primary.950}',
          hoverColor: '{primary.200}',
          activeColor: '{primary.300}'
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.300}',
          color: '{primary.950}',
          focusColor: '{primary.950}'
        },
        content: {
          background: '{primary.950}',
        },
      }
    }
  }
})

const title = 'DistApp • Manage and distribute Android or iOS app'
const description = 'Manage and distribute Android or iOS app'
export default defineNuxtConfig({
  compatibilityDate: '2024-08-20',
  devtools: { enabled: true },
  ssr: false,
  routeRules: {
    '/': {
      prerender: true,
    },
    '/**': {
      ssr: false,
    },
  },
  spaLoadingTemplate: true,
  runtimeConfig: {
    app: {
      enableDrizzleLogging: true,
      limitUploadSizeMb: 120,
      apiAuthKey: '',
    },
    APP_LIMIT_BETA_ORG: 1,
    APP_LIMIT_BETA_APPS: 2,
    APP_LIMIT_API_KEYS: 5,
    APP_LIMIT_APPS_GROUP: 16,
    APP_LIMIT_APPS_GROUPS_TESTER: 100,
    APP_LIMIT_INVITE_ORGS: 48,
    APP_LIMIT_UPLOAD_SIZE: 83886080, // 80 mb
    LOCAL_AUTHS: '',
    JWT_KEY: '',
    DB_URL: '',
    DB_AUTH_TOKEN: '',
    S3_ENDPOINT: '',
    S3_ACCESS_KEY_ID: '',
    S3_SECRET_ACCESS_KEY: '',
    BUNDLEAAB: {
      KEYSTORE_URL: '',
      KEYSTORE_PASS: '',
      KEYSTORE_ALIAS: '',
    },
    public: {
      GOOGLE_CLIENT_ID: '',
      LOCAL_AUTH_ENABLED: false,
    },
  },

  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      openAPI: true,
      tasks: true,
    },
    scheduledTasks: {
      '0 */24 * * *': 'purgeArtifact',
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
      title: title,
      htmlAttrs: {
        lang: 'en',
      },
      link: [{
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      }, {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      }, {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      }, {
        rel: 'manifest',
        href: '/site.webmanifest',
      }, {
        rel: 'mask-icon',
        href: '/safari-pinned-tab.svg',
        color: '#717171',
      }],
      meta: [{
        name: 'theme-color',
        content: 'theme-color',
      },
      {
        name: 'description',
        content: 'Manage and distribute Android or iOS app. App Center Alternative',
      }, {
        name: 'keywords',
        content: 'distapp, dist, app, app center, appcenter, ios, android, microsoft, alternative app center, alternative',
      }, {
        name: 'author',
        content: 'DistApp',
      },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: 'https://distapp.lhf.my.id/assets/distapp-dark.webp' },
      { property: 'og:url', content: 'https://distapp.lhf.my.id' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: 'https://distapp.lhf.my.id/assets/distapp-dark.webp' },
      ],
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
    'nuxt-svgo-loader',
    "@nuxtjs/google-fonts",
    '@nuxt/test-utils/module'
  ],

  primevue: {
    usePrimeVue: true,
    options: {
      ripple: true,
      theme: {
        preset: Noir,
        options: {
          darkModeSelector: '.appdark',
        },
      },
      pt: {
        divider: {
          root: {
            'class': 'm-0 divider-app',
          },
        },
        drawer: {
          mask: {
            style: {
              'padding': '10px',
            },
          },
          root: {
            class: 'rounded-lg bg-clip-border p-1',
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
    },
    'nitro:build:public-assets': (nitro) => {
      const targetDir = path.join(nitro.options.output.serverDir, 'db/drizzle');
      fs.cpSync('server/db/drizzle', targetDir, {
        recursive: true,
        force: true,
      });
    },
  },
  googleFonts: {
    families: {
      "Plus Jakarta Sans": {
        wght: [300, 400, 500, 600, 700],
        ital: [300, 400, 500, 600, 700],
      },
    },
  },
})