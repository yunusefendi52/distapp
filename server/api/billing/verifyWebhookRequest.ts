const crypto = require('node:crypto')

export function verifyWebhookRequest(
    signaturePayload: string,
    secretKey: string,
    rawBody: string) {
    const hmac = crypto.createHmac('sha256', secretKey)
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
    const signature = Buffer.from(
        signaturePayload,
        'utf8'
    )

    if (crypto.timingSafeEqual(digest, signature)) {
        return true
    } else {
        return false
    }
}