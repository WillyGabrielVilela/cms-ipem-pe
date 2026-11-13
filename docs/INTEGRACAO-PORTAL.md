# Integração com o portal institucional (Next.js)

O portal consome a API REST do CMS. Conteúdo **publicado** é público; rascunhos nunca saem sem login.

## Configuração
- No CMS: `FRONTEND_URL=https://portal.exemplo.pe.gov.br` (várias origens separadas por vírgula).
- No portal: `CMS_URL=https://cms.exemplo.pe.gov.br`.

## Endpoints públicos (somente leitura)
| Conteúdo | Endpoint |
|---|---|
| Lista de notícias | `GET /api/news?sort=-publishedAt&limit=20&depth=1` |
| Notícia por slug | `GET /api/news?where[slug][equals]=SLUG&limit=1&depth=1` |
| Páginas do menu | `GET /api/pages?where[showInMenu][equals]=true&sort=menuOrder` |
| Página por slug | `GET /api/pages?where[slug][equals]=SLUG&limit=1&depth=1` |
| Configurações | `GET /api/globals/site-settings?depth=1` |
| Imagens | campo `url` (absoluto, se `NEXT_PUBLIC_SERVER_URL` estiver definido) |

A API já filtra: sem login, só retorna itens com `status = published`. O campo `author` aparece só como ID.

## Exemplo (Server Component do portal)
```ts
export async function getNews() {
  const res = await fetch(`${process.env.CMS_URL}/api/news?sort=-publishedAt&limit=20&depth=1`, {
    next: { revalidate: 60 }, // atualiza a cada 60 s
  })
  if (!res.ok) throw new Error('Falha ao carregar notícias')
  return (await res.json()).docs
}
```

## Texto das páginas (Lexical)
O campo `content` das **páginas** é rich text em JSON (Lexical). No portal, use
`@payloadcms/richtext-lexical/react` (`RichText`) para renderizar. O campo `content` das **notícias** é texto
simples, com parágrafos separados por linha em branco.
