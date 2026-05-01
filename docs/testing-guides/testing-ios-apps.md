# Testing iOS Apps

## Troubleshooting

### "Untrusted Enterprise Developer" Error

To use the app, you must trust the developer's certificate:

1. Go to **Settings** → **General** → **Profiles** (or **Profiles & Device Management**)
2. Under **Enterprise App**, find the developer's profile
3. Tap the developer name and confirm trust
4. Launch the app

### When installing I got "Unable to Download App" Error

This error may occur due to:
- UDID not included in the provisioning profile
- Incorrectly signed build or broken entitlements
- Incompatible device or iOS version

This error can occur for a variety of reasons. Please contact the app developer for further assistance in resolving the issue.

### Installation Alert Never Shows

If you’ve previously installed the app from the App Store and the version you’re trying to install is the same, you won’t see a confirmation prompt. To work around this, uninstall the existing app first, then tap Install again.
