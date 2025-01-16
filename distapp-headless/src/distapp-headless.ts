import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { generateBundleHandler } from "../../server/services/generateBundleHandler.js"
import { downloadFile } from "../../server/services/downloadFile.js"
import * as jose from 'jose'
import promises from 'node:fs/promises'
import { join } from 'node:path'

const app = new Hono()
app.use('*', async (c, next) => {
  const corsMiddlewareHandler = cors({
    origin: '*',
  })
  return corsMiddlewareHandler(c, next)
})

app.get('/genbndl', async (c) => {
  const requestData = c.req.query('r')
  if (!requestData) {
    c.status(400)
    c.text('Invalid requst, check again')
    return
  }
  const publicKeyStr: string = await promises.readFile(join(process.cwd(), 'src', 'keys', 'svc.pub'), { encoding: 'utf8' })
  const publicKey = await jose.importSPKI(publicKeyStr, 'EdDSA')
  const request = (await jose.jwtVerify(requestData, publicKey)).payload as {
    signedUrl: string,
    orgId: string,
    appId: string,
    keystorePass: string,
    keystoreAlias: string,
    keystoreUrl: string,
    apkSignedUrl: string,
    apkFileKey: string,
    uploadIdHeadless: string,
  }
  // if (process.env.DEV) {
  //   console.info('Request', {
  //     request,
  //     requestData,
  //   })
  // }
  await generateBundleHandler(request.signedUrl,
    request.orgId,
    request.appId,
    request.keystorePass,
    request.keystoreAlias,
    request.keystoreUrl,
    request.apkSignedUrl, async (keystoreFile) => {
      await downloadFile(request.keystoreUrl, keystoreFile)
    })

  return c.json({
    headlessApkFileKey: request.apkFileKey,
    headlessUploadIdHeadless: request.uploadIdHeadless,
  }, 200)
})

app.get('/healthz', (c) => {
  return c.text('ok')
})

const port = process.env.PORT || '3010'
const hostname = process.env.HOST || '127.0.0.1'

serve({
  fetch: app.fetch,
  hostname: hostname,
  port: parseInt(port),
}, (i) => {
  console.log(`Server is running on ${i.address} - port ${i.port}`)
})
