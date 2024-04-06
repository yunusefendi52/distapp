import { Hono } from 'hono'
import api from './api'
import { swaggerUI } from '@hono/swagger-ui'
import { serveStatic } from 'hono/cloudflare-workers'
// @ts-ignore
import manifest from '__STATIC_CONTENT_MANIFEST'

const app = new Hono()

app.route('/api', api)

app.get('/swagger', swaggerUI({ url: '/doc' }))

app.get('/*', serveStatic({ root: './', manifest }))

export default app
