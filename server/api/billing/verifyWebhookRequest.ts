const encoder = new TextEncoder()

// https://stackoverflow.com/a/67884134/7855627

export async function verifyWebhookRequest(
    signaturePayload: string,
    secretKey: string,
    rawBody: string) {
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    )
    const receivedMac = hexStringToArrayBuffer(signaturePayload)
    const verified = await crypto.subtle.verify(
        'HMAC',
        key,
        receivedMac!,
        encoder.encode(rawBody)
    )
    return verified
}

function hexStringToArrayBuffer(hexString: string) {
    hexString = hexString.replace(/^0x/, '')

    if (hexString.length % 2 != 0) {
        return
    }

    if (hexString.match(/[G-Z\s]/i)) {
        return
    }

    return new Uint8Array(
        hexString.match(/[\dA-F]{2}/gi)!.map(function (s) {
            return parseInt(s, 16)
        })
    ).buffer
}
