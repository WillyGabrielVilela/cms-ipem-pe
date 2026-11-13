import type { ReactNode } from 'react'

export const metadata = {
  title: 'CMS IPEM-PE',
  description: 'Painel administrativo de conteúdos do IPEM-PE',
  robots: { index: false, follow: false },
}

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
