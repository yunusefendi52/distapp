import { resolve } from 'path'
import { createCommonJS } from 'mlly'
const { __dirname } = createCommonJS(import.meta.url)
import { spawn, spawnSync } from "child_process";

export default defineNuxtConfig({
  runtimeConfig: {
    JWT_KEY: '',
  },
  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      openAPI: true
    },
  },
  imports: {
    presets: [{
      from: '@tanstack/vue-query',
      imports: ['useMutation']
    },]
  },
  vite: {
    define: {
      global: {},
    },
  },
  app: {
    head: {
      title: 'AppDeployin',
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
  modules: ['@hebilicious/vue-query-nuxt', 'nuxt-primevue', '@pinia/nuxt'],
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
    },
    "build:done": async () => {
      if (process.env.NODE_ENV === 'developemtn') {
        console.log('Starting server-api dev server')
        spawn('bun', [
          'run',
          'dev:remote',
        ], {
          cwd: './server-api',
          stdio: 'inherit',
        }).on('exit', (code) => {
          console.log('Finished starting server-api dev server')
        })
      }
    },
  },
  routeRules: {
    '/api/**': {
      proxy: {
        to: "http://localhost:3001/api/**",
      },
    },
  },
})
// maunya disatuin atau dipisahin apinya ? satuin ajalha dan pikirin dockernya