import type { GlobalConfig } from 'payload'
import { isReviewer } from '../access/index'

/** Dados institucionais reutilizados pelo portal (rodapé, contato, redes). */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Configurações do portal',
  admin: { group: 'Administração' },
  access: { read: () => true, update: isReviewer },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'IPEM-PE', label: 'Nome do órgão' },
    { name: 'description', type: 'textarea', label: 'Descrição institucional' },
    { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logotipo' },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', label: 'Telefone' },
        { name: 'email', type: 'email', label: 'E-mail de contato' },
      ],
    },
    { name: 'address', type: 'textarea', label: 'Endereço' },
    { name: 'openingHours', type: 'text', label: 'Horário de atendimento' },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Redes sociais',
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Rede' },
        { name: 'url', type: 'text', required: true, label: 'Endereço (URL)' },
      ],
    },
    { name: 'footerText', type: 'textarea', label: 'Texto do rodapé' },
  ],
}
