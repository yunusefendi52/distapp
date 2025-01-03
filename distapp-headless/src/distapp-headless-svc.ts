import { Elysia } from "elysia"
import { generateBundleHandler } from "../../server/api/artifacts/generateBundleHandler.js"
import { downloadFile } from "../../server/services/downloadFile.js"
import { cors } from '@elysiajs/cors'
import * as jose from 'jose'

const app = new Elysia()
  .use(cors())
  .get('/gb', async ({ query }) => {
    try {
      const verifierUrl = query.verifierUrl!
      const publicKeyStr = await fetch(verifierUrl, {
        cache: 'default',
      }).then(e => e.text())
      const publicKey = await jose.importSPKI(publicKeyStr, 'EdDSA')
      const requestData = query.r!
      const request = (await jose.jwtVerify(requestData, publicKey)).payload as {
        signedUrl: string,
        orgId: string,
        appId: string,
        keystorePass: string,
        keystoreAlias: string,
        keystoreUrl: string,
        apkSignedUrl: string,
      }
      console.debug('Request', {
        request,
        requestData,
      })
      await generateBundleHandler(request.signedUrl,
        request.orgId,
        request.appId,
        request.keystorePass,
        request.keystoreAlias,
        request.keystoreUrl,
        request.apkSignedUrl, async (keystoreFile) => {
          await downloadFile(request.keystoreUrl, keystoreFile)
        })
    } catch (e) {
      console.error(e)
      throw e
    }
  })
  .listen(process.env.PORT || 3010)

export default app.fetch

console.log(
  `Server is running at ${app.server?.hostname}:${app.server?.port}`
)
