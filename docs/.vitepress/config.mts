import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "DistApp",
  description: "Manage and distribute Android, iOS and Desktop apps",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'DistApp Managed', link: 'https://distapp.app' },
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
          {
            text: 'Distribute Desktop',
            link: '/cli/distribute-desktop',
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
          {
            text: 'Hosting License',
            link: '/self-hosted/hosting-license',
          },
        ],
      },
      {
        text: 'APIs',
        items: [
          {
            text: 'Get the Latest App Version',
            link: '/apis/get-the-latest-app-version',
          },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yunusefendi52/distapp' }
    ]
  },
  ignoreDeadLinks: [
    // ignore all localhost links
    /^https?:\/\/localhost/,
  ]
})
