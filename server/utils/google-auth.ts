import { decodeProtectedHeader, jwtVerify } from "jose"
import { importX509 } from "jose"

// https://github.com/kriasoft/web-auth-library/issues/17
async function importPublicKey(options: any) {
    const keyId = options.keyId;
    const certificateURL = options.certificateURL ?? "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
    async function fetchKey() {
        const res = await fetch(certificateURL);
        if (!res.ok) {
            const error = await res
                .json()
                .then((data) => data.error.message)
                .catch(() => undefined);
            throw new error ?? "Failed to fetch the public key", {
                response: res,
            };
        }
        const data = await res.json();
        const x509 = data[keyId];
        if (!x509) {
            throw new Error(`Public key "${keyId}" not found.`);
        }
        const key = await importX509(x509, "RS256");
        // // Resolve the expiration time of the key
        // const maxAge = res.headers.get("cache-control")?.match(/max-age=(\d+)/)?.[1]; // prettier-ignore
        // const expires = Date.now() + Number(maxAge ?? "3600") * 1000;
        return key;
    }
    const key = await fetchKey()
    return key
}

export async function verifyGoogleIdToken(options: GoogleAuthOption) {
    if (!options?.idToken) {
        throw new TypeError(`Missing "idToken"`);
    }
    let clientId = options?.clientId;
    if (clientId === undefined) {
        throw new TypeError(`Missing "clientId"`);
    }
    const header = decodeProtectedHeader(options.idToken);
    const now = Math.floor(Date.now() / 1000);
    const key = await importPublicKey({
        keyId: header.kid,
        certificateURL: "https://www.googleapis.com/oauth2/v1/certs",
    });
    const { payload } = await jwtVerify(options.idToken, key, {
        audience: clientId,
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
        maxTokenAge: "1h",
        clockTolerance: '5m',
    })
    if (!payload.sub) {
        throw new Error(`Missing "sub" claim`);
    }
    if (typeof payload.auth_time === "number" && payload.auth_time > now) {
        throw new Error(`Unexpected "auth_time" claim value`);
    }
    return payload;
}

export type GoogleAuthOption = {
    idToken: string
    clientId: string
}