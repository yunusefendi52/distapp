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

export default defineNuxtConfig({
  compatibilityDate: '2024-08-20',
  devtools: { enabled: true },
  ssr: false,
  spaLoadingTemplate: true,
  runtimeConfig: {
    app: {
      enableDrizzleLogging: true,
      limitUploadSizeMb: 120,
      apiAuthKey: '',
    },
    LOCAL_AUTHS: '',
    JWT_KEY: '',
    DB_URL: '',
    DB_AUTH_TOKEN: '',
    S3_ENDPOINT: '',
    S3_ACCESS_KEY_ID: '',
    S3_SECRET_ACCESS_KEY: '',
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
      title: 'DistApp',
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
      }],
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
    'nuxt-svgo-loader'
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
})