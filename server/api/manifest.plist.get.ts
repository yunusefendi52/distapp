import _ from 'lodash'
import { getArtifactLinkFromPublicIdAndReleaseId } from './install/download.get'
import { getArtifactFromInternal } from './artifacts/download-artifact.get'
import { S3AppClient } from '../services/S3AppClient'
import { GetObjectCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const data = JSON.parse(atob(query.data!.toString()))
	let publicId = data.publicLink
	const releaseId = data.releaseId

	var plist: string | undefined = undefined
	if (publicId) {
		const { signedUrl, app, detailArtifact: artifact } = await getArtifactLinkFromPublicIdAndReleaseId(event, publicId, releaseId)
		plist = generatePlist(
			signedUrl,
			artifact.packageName!,
			artifact.versionName2,
			app.displayName)
	} else {
		// Param from logged in user (without public id)
		const packageName = data.packageName
		const versionName = data.versionName
		const displayName = data.displayName
		const signedUrl = data.signedUrl
		plist = generatePlist(
			signedUrl,
			packageName,
			versionName,
			displayName,
		)
	}
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
					<string>${_.escape(signedUrl)}</string>
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