import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { generateBundleHandler } from "../../server/api/artifacts/generateBundleHandler.js"
import { downloadFile } from "../../server/services/downloadFile.js"
import * as jose from 'jose'

const app = new Hono()
app.use('*', async (c, next) => {
  const corsMiddlewareHandler = cors({
    origin: '*',
  })
  return corsMiddlewareHandler(c, next)
})

app.get('/genbndl', async (c) => {
  const verifierKey = c.req.query('verifierKey')
  const requestData = c.req.query('r')
  if (!verifierKey || !requestData) {
    c.status(400)
    c.text('Invalid requst, check again')
    return
  }
  const publicKeyStr = `-----BEGIN PUBLIC KEY-----
  ${verifierKey}
  -----END PUBLIC KEY-----`
  const publicKey = await jose.importSPKI(publicKeyStr, 'EdDSA')
  const request = (await jose.jwtVerify(requestData, publicKey)).payload as {
    signedUrl: string,
    orgId: string,
    appId: string,
    keystorePass: string,
    keystoreAlias: string,
    keystoreUrl: string,
    apkSignedUrl: string,
  }
  if (process.env.DEV) {
    console.info('Request', {
      request,
      requestData,
    })
  }
  await generateBundleHandler(request.signedUrl,
    request.orgId,
    request.appId,
    request.keystorePass,
    request.keystoreAlias,
    request.keystoreUrl,
    request.apkSignedUrl, async (keystoreFile) => {
      await downloadFile(request.keystoreUrl, keystoreFile)
    })
  return c.text('ok')
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
