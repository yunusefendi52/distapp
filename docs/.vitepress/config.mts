import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "DistApp",
  description: "Manage and distribute Android or iOS app",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'DistApp Managed', link: 'https://distapp.lhf.my.id' },
      { text: 'CLI', link: '/cli/cli-usage' },
    ],

    sidebar: [
      {
        text: 'Overview',
        items: [
          {
            text: 'What Is DistApp',
            link: '/overview/what-is-distapp',
          },
        ],
      },
      {
        text: 'CLI',
        items: [
          {
            text: 'CLI Usage',
            link: '/cli/cli-usage',
          },
        ],
      },
      {
        text: 'Self Hosted',
        items: [
          {
            text: 'Setup Self Hosted',
            link: '/self-hosted/setup-self-hosted',
          },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yunusefendi52/distapp' }
    ]
  }
})
