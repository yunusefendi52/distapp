# Get the Latest App Version

We provide an API to get the latest version of your app. Since we don't offer an SDK, it's up to you how you implement the version check. We recommend calling this API on a daily or hourly basis. We may enforce limit this API in the future for certain subscription.

## Request sample

Here is a curl example to check the latest version of spesific group.

> `curl -L "https://distapp.app/api/apps/app-version?orgId=YOUR_ORG_ID&appId=YOUR_APP_ID&group=private"`

```bash
# Sample Response
{
  "appName": "Habit Tool - Android",
  "orgName": "YeDev",
  "groupName": "private",
  "releaseId": 1,
  "platform": "android",
  "versionCode": "26",
  "versionName": "2.2",
  "installLink": "/install/yedev/apps/habit-tool-android/private?artifactId=019695a0-777b-7a64-9273-c0cd7019ef64"
}
```

Remove the `group` parameter to check the latest version of all releases.

You can get the `Org Id` and `App Id` from `App Info` in `App Settings` page.

Since we can't automatically know the domain, you need to add your self to `installLink` i.e `https://distapp.app/install/yedev/apps/habit-tool-android/private?artifactId=019695a0-777b-7a64-9273-c0cd7019ef64`