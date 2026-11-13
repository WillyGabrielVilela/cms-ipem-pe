/**
 * Leitura centralizada das variáveis de ambiente.
 * Falha cedo, com mensagem clara, se algo obrigatório estiver ausente.
 * Durante o `next build` usa valores neutros (o build não acessa o banco).
 */
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

const required = (name: string): string => {
  const value = process.env[name]?.trim()
  if (value) return value
  if (isBuildPhase) return 'build-placeholder'
  throw new Error(
    `Variável de ambiente obrigatória ausente: ${name}. Copie .env.example para .env e preencha os valores.`,
  )
}

const list = (name: string): string[] =>
  (process.env[name] ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export const env = {
  secret: required('PAYLOAD_SECRET'),
  databaseUrl: required('DATABASE_URL'),
  databasePoolMax: Number(process.env.DATABASE_POOL_MAX || 10),
  /** Apenas para prototipagem local. Em homologação/produção use migrations. */
  databasePush: process.env.DATABASE_PUSH === 'true',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL?.trim() || undefined,
  /** Origens autorizadas a consumir a API (portal). Aceita lista separada por vírgula. */
  frontendOrigins: list('FRONTEND_URL'),
  isProduction: process.env.NODE_ENV === 'production',
  s3: {
    bucket: process.env.S3_BUCKET?.trim() || '',
    region: process.env.S3_REGION?.trim() || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT?.trim() || undefined,
    accessKeyId: process.env.S3_ACCESS_KEY_ID?.trim() || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY?.trim() || '',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
  },
}
