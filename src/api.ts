import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'
import { AuthData, JWT_KEY } from './models'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import { generateId, getStorageKeys, normalizeName } from './utils'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand, PutObjectCommand, S3, S3Client, S3ClientConfig } from '@aws-sdk/client-s3'

export const api = new Hono<{ Variables: Variables, }>()

type Variables = {
    prisma: PrismaClient
    s3: S3
    s3Client: S3Client
    auth: AuthData
}

api.use(async (c, next) => {
    const appAuth = getCookie(c, 'app-auth')
    if (appAuth) {
        const verifiedData = await verify(appAuth, JWT_KEY)
        if (!verifiedData) {
            console.log('Not verified')
            deleteCookie(c, 'app-auth')
        }
        // @ts-ignore
        const userId = verifiedData.userId
        c.set('auth', {
            userId: userId,
        })
    } else {
        c.set('auth', {
            userId: '8ed444b048964c7d915f834581261078',
        })
    }
    await next()
})

api.use(async (c, next) => {
    const envAny = c.env as any
    const adapter = new PrismaD1(envAny.DB as D1Database);
    const prisma = new PrismaClient({ adapter });
    c.set('prisma', prisma)

    const s3Config: S3ClientConfig = {
        credentials: {
            accessKeyId: 'niMVVLTJtujejdnkkceX',
            secretAccessKey: 'n8FRdjEn7mAKKSq2hpnXAShu6GhqSj8PqQ0IGl9H'
        },
        endpoint: 'http://127.0.0.1:9000',
        forcePathStyle: true,
        region: 'us-east-1',
    }
    const s3Client = new S3Client(s3Config)
    const s3 = new S3(s3Config)

    c.set('s3', s3)
    c.set('s3Client', s3Client)

    await next()
})

api.get('list-apps', async (c) => {
    const userId = c.get('auth').userId
    const prisma = c.get('prisma')
    const { search, orgName } = c.req.query()
    const userOrgs = await prisma.organizations.findMany({
        include: {
            OrganizationsPeople: true,
        },
        where: {
            OrganizationsPeople: {
                every: {
                    userId: userId,
                    organization: {
                        name: orgName,
                    },
                },
            },
        },
    });
    const apps = await prisma.apps.findMany({
        include: {
            Organization: true,
        },
        where: {
            OR: userOrgs.map(e => e.id).map(e => ({
                organizationsId: e,
            })),
            displayName: {
                contains: search,
            },
        },
        orderBy: {
            name: 'asc',
        },
    });
    return c.json(apps);
})

api.get('list-orgs', async (c) => {
    const userId = c.get('auth').userId
    const prisma = c.get('prisma')
    const orgs = await prisma.organizations.findMany({
        where: {
            OrganizationsPeople: {
                every: {
                    userId: userId,
                },
            },
        },
    })
    return c.json(orgs)
})

api.get('detail-app', async (c) => {
    const prisma = c.get('prisma')
    const { appName, orgName } = c.req.query()
    const app = await prisma.apps.findFirstOrThrow({
        include: {
            Organization: true,
        },
        where: {
            name: appName!.toString(),
            Organization: {
                name: orgName!.toString(),
            },
        },
    })
    return c.json(app)
})

api.get('create-user', async (c) => {
    const userId = c.get('auth').userId
    const prisma = c.get('prisma')
    await prisma.user.create({
        data: {
            id: userId,
            name: 'User 1',
        }
    })
    return c.text('ok')
})

api.post('create-org', async c => {
    const userId = c.get('auth').userId
    const prisma = c.get('prisma')
    const { name, displayName } = await c.req.json()
    const orgId = generateId()
    await prisma.$transaction([
        prisma.organizations.create({
            data: {
                id: orgId,
                name: normalizeName(name),
                displayName: displayName,
            },
        }),
        prisma.organizationsPeople.create({
            data: {
                userId: userId,
                organizationId: orgId,
            },
        })
    ])
    return c.json({ ok: true })
})

api.post('create-app', async c => {
    const userId = c.get('auth').userId
    const prisma = c.get('prisma')
    const request = await c.req.json()
    const userOrg = await prisma.organizations.findFirstOrThrow({
        include: {
            OrganizationsPeople: true,
        },
        where: {
            OrganizationsPeople: {
                every: {
                    userId: userId,
                },
            },
        },
    })
    await prisma.apps.create({
        data: {
            id: generateId(),
            displayName: request.name,
            name: normalizeName(request.name),
            osType: request.osType,
            organizationsId: request.orgId,
        },
    })
    return c.json({ ok: true })
})

api.get('add-me-to-org', async c => {
    const userId = c.get('auth').userId
    const org = await c.get('prisma').organizations.findFirstOrThrow()
    await c.get('prisma').organizationsPeople.create({
        data: {
            organizationId: org.id,
            userId: userId,
        },
    })
    return c.json({})
})

const groups = new Hono<{ Variables: Variables, }>()

groups.get('list-groups', async c => {
    const { appName, orgName } = c.req.query()
    const groups = await c.get('prisma').artifactsGroups.findMany({
        // include: {
        //     apps: true,
        // },
        where: {
            apps: {
                name: appName?.toString(),
                Organization: {
                    name: orgName?.toString(),
                    OrganizationsPeople: {
                        every: {
                            userId: c.get('auth').userId,
                        },
                    },
                },
            }
        }
    })
    return c.json(groups)
})

groups.post('new-group', async c => {
    const { appName, orgName, groupName } = await c.req.json()
    const app = await c.get('prisma').apps.findFirstOrThrow({
        include: {
            Organization: true,
        },
        where: {
            name: appName,
            Organization: {
                name: orgName,
                OrganizationsPeople: {
                    every: {
                        userId: c.get('auth').userId,
                    },
                },
            },
        },
    })
    await c.get('prisma').artifactsGroups.create({
        data: {
            id: generateId(),
            name: normalizeName(groupName),
            appsId: app.id,
        }
    })
    return c.json({
        ok: true,
    })
})

api.route('groups', groups)

api.post('auth/signin', async c => {
    const token = await sign({
        name: 'Yunus',
        userId: 'd04317d667e747df9b4fd6848cbcc11d',
    }, JWT_KEY)
    setCookie(c, 'app-auth', token, {
        httpOnly: false,
        secure: true,
        sameSite: 'Lax',
    })
    return c.json({
        ok: true,
    })
})

const artifacts = new Hono<{ Variables: Variables, }>()

artifacts.get('detail-artifact', async c => {
    const prisma = c.get('prisma')
    const { appName, orgName, releaseId } = c.req.query()
    const r = await prisma.artifacts.findFirstOrThrow({
        include: {
            apps: true,
        },
        where: {
            releaseId: parseInt(releaseId?.toString() ?? ''),
            apps: {
                name: appName?.toString(),
                Organization: {
                    name: orgName?.toString(),
                    OrganizationsPeople: {
                        every: {
                            userId: c.get('auth').userId,
                        },
                    },
                },
            },
        },
    })
    return c.json(r)
})

artifacts.get('download-artifact', async c => {
    const { fileObjectKey } = c.req.query()
    const { assets } = getStorageKeys(c.get('auth'), fileObjectKey?.toString()!)
    const signedUrl = await getSignedUrl(c.get('s3Client'), new GetObjectCommand({
        Bucket: 'app-deployin',
        Key: assets,
    }))

    c.redirect(signedUrl)
})

artifacts.get('list-artifacts', async c => {
    const prisma = c.get('prisma')
    const { appName, orgName } = c.req.query()
    const r = await prisma.artifacts.findMany({
        include: {
            apps: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
        where: {
            apps: {
                name: appName?.toString(),
                Organization: {
                    name: orgName?.toString(),
                    OrganizationsPeople: {
                        every: {
                            userId: c.get('auth').userId,
                        },
                    },
                },
            },
        },
    })
    return c.json(r)
})

artifacts.post('upload-artifact-url', async c => {
    const { key, appName, orgName, releaseNotes } = await c.req.json()
    const auth = c.get('auth')
    const { temp, assets } = getStorageKeys(auth, key)
    const prisma = c.get('prisma')
    const s3 = c.get('s3')
    const app = await prisma.apps.findFirstOrThrow({
        include: {
            Organization: true,
        },
        where: {
            name: appName,
            Organization: {
                name: orgName,
                OrganizationsPeople: {
                    every: {
                        userId: auth.userId,
                    },
                },
            },
        },
    })
    const lastArtifact = await prisma.artifacts.findFirst({
        orderBy: {
            releaseId: 'desc',
        },
        select: {
            releaseId: true,
        },
        where: {
            apps: {
                name: appName,
                Organization: {
                    name: orgName,
                    OrganizationsPeople: {
                        every: {
                            userId: auth.userId,
                        },
                    },
                },
            },
        },
    })
    const newReleaseId = (lastArtifact?.releaseId ?? 0) + 1
    const now = new Date()
    const artifactId = generateId()
    await prisma.artifacts.create({
        data: {
            id: artifactId,
            createdAt: now,
            updatedAt: now,
            fileObjectKey: key,
            versionCode: '1',
            versionName: '1.0.0',
            appsId: app.id,
            releaseNotes: releaseNotes,
            releaseId: newReleaseId,
        },
    })
    await s3.copyObject({
        CopySource: `app-deployin/${temp}`,
        Bucket: 'app-deployin',
        Key: assets,
    })
    await s3.deleteObject({
        Bucket: 'app-deployin',
        Key: temp,
    })
})

artifacts.post('upload-artifact', async c => {
    const key = generateId()
    var expires = new Date(); expires.setMinutes(expires.getMinutes() + 30);
    const { temp } = getStorageKeys(c.get('auth'), key)
    const signedUrl = await getSignedUrl(c.get('s3Client'), new PutObjectCommand({
        Bucket: 'app-deployin',
        Key: temp,
        // Expires: expires, // TODO: epxiry here
        ContentType: 'application/vnd.android.package-archive',
    }))
    return c.json({
        file: key,
        url: signedUrl,
    })
})

api.route('artifacts', artifacts)

export default api
