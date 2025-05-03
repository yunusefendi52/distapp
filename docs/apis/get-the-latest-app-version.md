# Get the Latest App Version

We provide an API to get the latest version of your app. Since we don't offer an SDK, it's up to you how you implement the version check. We recommend calling this API on a daily or hourly basis.

## Request sample

Here is a curl example to check the latest version of spesific group.

> `curl -L "https://distapp.lhf.my.id/api/apps/app-version?orgId=YOUR_ORG_ID&appId=YOUR_APP_ID&group=private"`

```bash
# Sample Response
{
  "name": "Habit Tool - Android",
  "groupName": "private",
  "releaseId": 2,
  "platform": "android",
  "versionCode": "26",
  "versionName": "2.2",
  "releaseNotes": "Release notes"
}
```

Remove the `group` parameter to check the latest version of all releases.

You can get the `Org Id` and `App Id` from `App Info` in `App Settings` page.