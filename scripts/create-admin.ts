/**
 * Cria o primeiro Administrador sem expor a tela pública de "primeiro cadastro".
 * Uso: ADMIN_NAME="Fulano" ADMIN_EMAIL=a@b.gov.br ADMIN_PASSWORD='...' npm run create-admin
 * Credenciais vêm somente do ambiente; nada é gravado em arquivo.
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const name = process.env.ADMIN_NAME?.trim()
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD

if (!name || !email || !password) {
  console.error('Defina ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD no ambiente.')
  process.exit(1)
}

const payload = await getPayload({ config })
const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, overrideAccess: true })

if (existing.totalDocs > 0) {
  console.log('Já existe um usuário com este e-mail. Nada a fazer.')
} else {
  await payload.create({ collection: 'users', data: { name, email, password, role: 'admin' }, overrideAccess: true })
  console.log(`Administrador criado: ${email}`)
}
process.exit(0)
