import _ from 'lodash'
import { takeUniqueOrThrow } from './detail-app.get'
import { getArtifactLinkFromPublicIdAndReleaseId } from './install/download.get'
import { getArtifactFromInternal } from './artifacts/download-artifact.get'

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const data = JSON.parse(atob(query.data!.toString()))
	const publicId = data.publicLink
	const releaseId = data.releaseId

	// Param from logged in user (without public id)
	const orgName = data.orgName
	const appName = data.appName

	const { signedUrl, app, detailArtifact: artifact } = publicId ?
		await getArtifactLinkFromPublicIdAndReleaseId(event, publicId, releaseId)
		: await getArtifactFromInternal(
			event,
			orgName!.toString(),
			appName!.toString(),
			releaseId!.toString())
	const plist = `
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
					<string>${_.escape(signedUrl)}</string>
				</dict>
			</array>
			<key>metadata</key>
			<dict>
				<key>bundle-identifier</key>
				<string>${artifact.packageName}</string>
				<key>bundle-version</key>
				<string>${artifact.versionName2}</string>
				<key>kind</key>
				<string>software</string>
				<key>title</key>
				<string>${app.displayName}</string>
			</dict>
		</dict>
	</array>
</dict>
</plist>
    `
	setResponseHeader(event, 'Content-Type', "text/xml plist")
	return plist
})
