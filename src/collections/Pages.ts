import type { CollectionConfig } from 'payload'
import {
  contentAccess,
  enforcePublishWorkflow,
  slugField,
  slugFromTitle,
  workflowFields,
} from '../lib/workflow'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Página institucional', plural: 'Páginas institucionais' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    group: 'Conteúdo',
  },
  access: contentAccess,
  versions: { maxPerDoc: 30 },
  hooks: { beforeValidate: [slugFromTitle], beforeChange: [enforcePublishWorkflow] },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Título' },
    slugField,
    { name: 'summary', type: 'textarea', maxLength: 300, label: 'Resumo' },
    { name: 'content', type: 'richText', required: true, label: 'Conteúdo' },
    { name: 'coverImage', type: 'upload', relationTo: 'media', label: 'Imagem de destaque' },
    { name: 'imageAlt', type: 'text', label: 'Descrição da imagem (acessibilidade)' },
    {
      type: 'row',
      fields: [
        { name: 'showInMenu', type: 'checkbox', defaultValue: false, label: 'Exibir no menu do portal' },
        { name: 'menuOrder', type: 'number', defaultValue: 0, label: 'Ordem no menu' },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'Buscadores (SEO)',
      fields: [
        { name: 'metaTitle', type: 'text', maxLength: 70, label: 'Título para buscadores' },
        { name: 'metaDescription', type: 'textarea', maxLength: 160, label: 'Descrição para buscadores' },
      ],
    },
    ...workflowFields,
  ],
}
