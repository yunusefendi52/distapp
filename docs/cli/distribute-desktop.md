# Distribute Desktop

Ensure you’ve created an app with "Desktop" platform before continuing.

Distributing the desktop app is supported through a ZIP file. Since we can't universally detect the installed version across all platforms, you'll need to manually specify the version.

```bash
distapp distribute \
    --file "$PATH_TO_ZIP" \
    --slug "$APP_SLUG" \
    --api-key "$API_KEY" \
    --version-name "1.0.0" \
    --version-code "1"
```
