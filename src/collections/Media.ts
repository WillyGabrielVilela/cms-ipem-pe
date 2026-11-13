import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'
import { isReviewer, isStaff } from '../access/index'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** Pasta local dos arquivos (usada quando o armazenamento S3 não está habilitado). */
const mediaDir = process.env.MEDIA_DIR
  ? path.resolve(process.env.MEDIA_DIR)
  : path.resolve(dirname, '../../media')

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Arquivo de mídia', plural: 'Biblioteca de mídia' },
  admin: { group: 'Conteúdo' },
  access: { read: () => true, create: isStaff, update: isStaff, delete: isReviewer },
  upload: {
    staticDir: mediaDir,
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumbnail', width: 480 },
      { name: 'card', width: 900 },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
      admin: { description: 'Descreva a imagem para leitores de tela (acessibilidade).' },
    },
    { name: 'caption', type: 'text', label: 'Legenda' },
  ],
}
