import { escape } from 'es-toolkit'
import { getArtifactFromInternal } from './artifacts/download-artifact.get'

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const data = JSON.parse(atob(query.data!.toString()))
	if (import.meta.dev) {
		console.log('datatamanifest', data)
	}
	const publicId: string = data.publicLink
	const orgName: string = data.orgName
	const appName: string = data.appName
	const releaseId = data.releaseId
	const { signedUrl, app, detailArtifact: artifact } = await getArtifactFromInternal(event, orgName, appName, releaseId, publicId, false)
	const plist = generatePlist(
		signedUrl,
		artifact.packageName!,
		artifact.versionName2,
		app.displayName)
	setResponseHeader(event, 'Content-Type', "text/xml plist")
	return plist
})

const generatePlist = (
	signedUrl: string,
	packageName: string,
	versionName: string,
	displayName: string) => {
	return `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>items</key>
	<array>
		<dict>
			<key>assets</key>
			<array>
				<dict>
					<key>kind</key>
					<string>software-package</string>
					<key>url</key>
					<string>${escape(signedUrl)}</string>
				</dict>
			</array>
			<key>metadata</key>
			<dict>
				<key>bundle-identifier</key>
				<string>${packageName}</string>
				<key>bundle-version</key>
				<string>${versionName}</string>
				<key>kind</key>
				<string>software</string>
				<key>title</key>
				<string>${displayName}</string>
			</dict>
		</dict>
	</array>
</dict>
</plist>
    `
}