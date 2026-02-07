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

const title = 'DistApp • Manage and distribute Android, iOS and Desktop apps'
const description = 'Manage and distribute Android, iOS and Desktop apps. Useful for tester or self distribution. Alternative App Center Distribution.'
export default defineNuxtConfig({
  compatibilityDate: '2024-08-20',
  devtools: { enabled: true },
  routeRules: {
    '/': { ssr: true }, // Enable SSR on index page
    '/pricing': { ssr: true }, // Enable SSR on pricing page
    '/**': { ssr: false }, // Disable SSR for all other pages
  },
  spaLoadingTemplate: true,
  runtimeConfig: {
    app: {
      enableDrizzleLogging: true,
      limitUploadSizeMb: 120,
    },
    APP_API_AUTH_KEY: '', // For compatibility with previous env
    appConfig: {
      apiAuthKey: '',
    },
    // Features free plan
    APP_LIMIT_ORG: 1,
    APP_LIMIT_APPS: 2,
    APP_LIMIT_APPS_GROUP: 8,
    APP_LIMIT_INVITE_ORGS: 8,
    APP_LIMIT_SIZE_ARTIFACT_MB: 50,
    // Features subsription plan
    APP_LIMIT_PRO_ORG: 10,
    APP_LIMIT_PRO_APPS: 100,
    APP_LIMIT_PRO_APPS_GROUP: 25,
    APP_LIMIT_PRO_INVITE_ORGS: 25,
    APP_LIMIT_PRO_SIZE_ARTIFACT_MB: 5000,
    APP_LIMIT_PRO_UPLOAD_SIZE: 314572800, // 300 mb

    APP_LIMIT_API_KEYS: 10,
    APP_LIMIT_APPS_TESTER_GROUPS: 100,
    APP_LIMIT_UPLOAD_SIZE: 104857600, // 100 mb
    APP_GRACE_PERIOD_HOUR: 120, // 5 days
    APP_DISABLE_BILLING: false,
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
      UPLOAD_WITH_BUILD_APK: false,
      CLERK_AUTH_ENABLED: false,
      CLERK_PUBLISHABLE_KEY: '',
    },
    CLERK_SECRET_KEY: '',
  },

  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      openAPI: true,
      tasks: true,
    },
    scheduledTasks: {
      '0 */24 * * *': ['purgeArtifact', 'purgeUploadTemp'],
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
      }, {
        rel: 'stylesheet',
        href: '/assets/spa-loader.css',
        media: "print",
        onload: "this.media='all'",
      }],
      meta: [{
        name: 'theme-color',
        content: '',
      }, {
        name: 'description',
        content: description,
      }, {
        name: 'keywords',
        content: 'distapp, dist, app, app center, appcenter, ios, android, microsoft, alternative app center, alternative, firebase',
      }, {
        name: 'author',
        content: 'DistApp',
      },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: 'https://distapp.app/assets/distapp_dark.webp' },
      { property: 'og:url', content: 'https://distapp.app' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: 'https://distapp.app/assets/distapp_dark.webp' },
      ...(import.meta.env.NUXT_DISTAPP_SELF_HOST ? [{ name: 'robots', content: 'noindex' }] : []),
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
    '@nuxt/test-utils/module',
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