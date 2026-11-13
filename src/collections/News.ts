import type { CollectionConfig } from 'payload'
import {
  contentAccess,
  enforcePublishWorkflow,
  slugField,
  slugFromTitle,
  workflowFields,
} from '../lib/workflow'

export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'Notícia', plural: 'Notícias' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'author'],
    group: 'Conteúdo',
  },
  access: contentAccess,
  // Histórico de versões (sem o sistema de rascunhos nativo: o fluxo usa o campo "Situação").
  versions: { maxPerDoc: 30 },
  hooks: { beforeValidate: [slugFromTitle], beforeChange: [enforcePublishWorkflow] },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Título' },
    slugField,
    { name: 'summary', type: 'textarea', required: true, maxLength: 300, label: 'Resumo' },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Texto da notícia',
      admin: { rows: 14, description: 'Texto integral da notícia. Parágrafos separados por linha em branco.' },
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: 'Imagem de capa' },
    { name: 'imageAlt', type: 'text', label: 'Descrição da imagem (acessibilidade)' },
    { name: 'category', type: 'text', defaultValue: 'Notícias', label: 'Categoria' },
    ...workflowFields,
  ],
}
