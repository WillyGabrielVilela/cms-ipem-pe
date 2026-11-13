import { APIError } from 'payload'
import type { Access, CollectionBeforeChangeHook, CollectionBeforeValidateHook, Field, Where } from 'payload'
import {
  hasRole,
  isReviewer,
  isReviewerField,
  isStaff,
  isStaffField,
  userOf,
} from '../access/index'
import { slugify } from './slugify'

/**
 * Fluxo editorial compartilhado por Notícias e Páginas:
 *   Comunicação  -> cria/edita os próprios rascunhos e envia para revisão;
 *   Editor/Admin -> revisa e publica; também pode excluir.
 * Conteúdo já publicado só pode ser alterado por Editor/Admin.
 */
export const contentAccess: {
  read: Access
  create: Access
  update: Access
  delete: Access
} = {
  read: ({ req }) => {
    const user = userOf(req)
    const published: Where = { status: { equals: 'published' } }
    if (!user) return published
    if (hasRole(user, ['admin', 'editor'])) return true
    const mine: Where = { or: [published, { author: { equals: user.id } }] }
    return mine
  },
  create: isStaff,
  update: ({ req }) => {
    const user = userOf(req)
    if (!user) return false
    if (hasRole(user, ['admin', 'editor'])) return true
    if (!hasRole(user, ['communication'])) return false
    const ownDrafts: Where = {
      and: [{ author: { equals: user.id } }, { status: { not_equals: 'published' } }],
    }
    return ownDrafts
  },
  delete: isReviewer,
}

/** Gera o slug a partir do título quando ele não é informado. */
export const slugFromTitle: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  if (!data) return data
  const current = typeof data.slug === 'string' ? data.slug.trim() : ''
  if (current) {
    data.slug = slugify(current)
  } else if (!originalDoc?.slug && typeof data.title === 'string') {
    data.slug = slugify(data.title)
  }
  if (!data.slug && !originalDoc?.slug) {
    throw new APIError('Não foi possível gerar o endereço (slug). Informe um título ou um slug.', 400, undefined, true)
  }
  return data
}

/** Impede que a Comunicação publique e preenche a data de publicação. */
export const enforcePublishWorkflow: CollectionBeforeChangeHook = ({ data, originalDoc, req, operation }) => {
  const user = userOf(req)
  const becomingPublished = data.status === 'published' && originalDoc?.status !== 'published'

  if (becomingPublished && !hasRole(user, ['admin', 'editor'])) {
    throw new APIError(
      'Apenas Editor ou Administrador pode publicar. Envie o conteúdo para revisão.',
      403,
      undefined,
      true,
    )
  }
  if (operation === 'create' && user && !data.author) data.author = user.id
  if (data.status === 'published' && !data.publishedAt && !originalDoc?.publishedAt) {
    data.publishedAt = new Date().toISOString()
  }
  return data
}

export const slugField: Field = {
  name: 'slug',
  type: 'text',
  unique: true,
  index: true,
  label: 'Endereço (slug)',
  admin: {
    position: 'sidebar',
    description: 'Deixe em branco para gerar automaticamente a partir do título.',
  },
}

/** status + publishedAt + author (na lateral do formulário). */
export const workflowFields: Field[] = [
  {
    name: 'status',
    type: 'select',
    required: true,
    defaultValue: 'draft',
    label: 'Situação',
    index: true,
    options: [
      { label: 'Rascunho', value: 'draft' },
      { label: 'Aguardando revisão', value: 'pending_review' },
      { label: 'Publicado', value: 'published' },
    ],
    access: { create: isStaffField, update: isStaffField },
    admin: {
      position: 'sidebar',
      description: 'A Comunicação envia para revisão; Editor/Administrador publica.',
    },
  },
  {
    name: 'publishedAt',
    type: 'date',
    label: 'Data de publicação',
    index: true,
    access: { create: isReviewerField, update: isReviewerField },
    admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
  },
  {
    name: 'author',
    type: 'relationship',
    relationTo: 'users',
    label: 'Autor',
    defaultValue: ({ user }: { user?: { id?: number | string } }) => user?.id,
    admin: { position: 'sidebar', readOnly: true },
  },
]
