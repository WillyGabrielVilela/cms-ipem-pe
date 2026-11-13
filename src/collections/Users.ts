import { APIError } from 'payload'
import type { CollectionBeforeDeleteHook, CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { hasRole, isAdmin, isAdminField, isAuthenticated, userOf } from '../access/index'

const MIN_PASSWORD_LENGTH = 10

/** Primeiro usuário vira Administrador; senha mínima; não deixa o portal sem administrador. */
const validateUser: CollectionBeforeValidateHook = async ({ data, originalDoc, req, operation }) => {
  if (!data) return data

  if (typeof data.password === 'string' && data.password.length < MIN_PASSWORD_LENGTH) {
    throw new APIError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`, 400, undefined, true)
  }

  if (operation === 'create') {
    const existing = await req.payload.count({ collection: 'users', overrideAccess: true, req })
    if (existing.totalDocs === 0) data.role = 'admin'
  }

  if (
    operation === 'update' &&
    originalDoc?.role === 'admin' &&
    data.role &&
    data.role !== 'admin'
  ) {
    const admins = await req.payload.count({
      collection: 'users',
      overrideAccess: true,
      req,
      where: { and: [{ role: { equals: 'admin' } }, { id: { not_equals: originalDoc.id } }] },
    })
    if (admins.totalDocs === 0) {
      throw new APIError('O portal precisa ter ao menos um Administrador.', 400, undefined, true)
    }
  }
  return data
}

const protectLastAdmin: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const target = await req.payload.findByID({ collection: 'users', id, overrideAccess: true, req, depth: 0 })
  if (target.role !== 'admin') return
  const admins = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
    where: { and: [{ role: { equals: 'admin' } }, { id: { not_equals: id } }] },
  })
  if (admins.totalDocs === 0) {
    throw new APIError('Não é possível excluir o último Administrador.', 400, undefined, true)
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuário', plural: 'Usuários' },
  auth: {
    tokenExpiration: 60 * 60 * 8, // sessão de 8 horas
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // bloqueio de 10 minutos
    cookies: {
      secure: process.env.AUTH_COOKIE_SECURE
        ? process.env.AUTH_COOKIE_SECURE === 'true'
        : process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
  },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'email', 'role'], group: 'Administração' },
  access: {
    admin: isAuthenticated,
    create: isAdmin,
    // Equipe interna precisa enxergar nomes (ex.: autor das notícias).
    read: isAuthenticated,
    // Cada usuário altera o próprio cadastro; Administrador altera todos.
    update: ({ req }) => {
      const user = userOf(req)
      if (!user) return false
      if (hasRole(user, ['admin'])) return true
      return { id: { equals: user.id } }
    },
    delete: isAdmin,
  },
  hooks: { beforeValidate: [validateUser], beforeDelete: [protectLastAdmin] },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nome completo' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'communication',
      label: 'Perfil',
      options: [
        { label: 'Comunicação', value: 'communication' },
        { label: 'Editor / Revisor', value: 'editor' },
        { label: 'Administrador do portal', value: 'admin' },
      ],
      access: { create: isAdminField, update: isAdminField },
    },
  ],
}
