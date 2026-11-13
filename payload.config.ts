import path from 'path'
import { fileURLToPath } from 'url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { en } from '@payloadcms/translations/languages/en'
import { pt } from '@payloadcms/translations/languages/pt'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Media } from './src/collections/Media'
import { News } from './src/collections/News'
import { Pages } from './src/collections/Pages'
import { Users } from './src/collections/Users'
import { SiteSettings } from './src/globals/SiteSettings'
import { env } from './src/lib/env'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Origens permitidas para CORS/CSRF: portal + o próprio CMS (+ localhost apenas fora de produção).
const allowedOrigins = [
  ...env.frontendOrigins,
  ...(env.serverURL ? [env.serverURL] : []),
  ...(env.isProduction ? [] : ['http://localhost:3000', 'http://127.0.0.1:3000']),
]

export default buildConfig({
  secret: env.secret,
  serverURL: env.serverURL,
  admin: {
    user: Users.slug,
    meta: { titleSuffix: '- CMS IPEM-PE' },
    importMap: { baseDir: path.resolve(dirname) },
  },
  i18n: { supportedLanguages: { pt, en }, fallbackLanguage: 'pt' },
  editor: lexicalEditor(),
  collections: [Users, News, Pages, Media],
  globals: [SiteSettings],
  // O banco é configurado exclusivamente por variáveis de ambiente: trocar de Neon para
  // o servidor da ATI-PE exige apenas alterar DATABASE_URL (e rodar as migrations).
  db: postgresAdapter({
    pool: {
      connectionString: env.databaseUrl,
      max: env.databasePoolMax,
      connectionTimeoutMillis: 15_000, // tolera "cold start" de bancos serverless
    },
    migrationDir: path.resolve(dirname, 'src/migrations'),
    push: env.databasePush,
  }),
  sharp,
  plugins: [
    // Mídia: disco local por padrão; S3-compatível (MinIO, Ceph, S3) se S3_BUCKET estiver definido.
    s3Storage({
      enabled: Boolean(env.s3.bucket),
      collections: { media: true },
      bucket: env.s3.bucket,
      config: {
        region: env.s3.region,
        endpoint: env.s3.endpoint,
        forcePathStyle: env.s3.forcePathStyle,
        credentials: { accessKeyId: env.s3.accessKeyId, secretAccessKey: env.s3.secretAccessKey },
      },
    }),
  ],
  upload: { limits: { fileSize: 10 * 1024 * 1024 } },
  graphQL: { disable: true }, // integração via REST; reduz a superfície de ataque
  typescript: { outputFile: path.resolve(dirname, 'src/payload-types.ts') },
  cors: allowedOrigins,
  csrf: allowedOrigins,
})
