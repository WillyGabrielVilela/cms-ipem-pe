# CMS IPEM-PE (Payload 3 + Next.js + PostgreSQL)

Painel administrativo e API de conteúdo do IPEM-PE. É uma aplicação **independente**: o portal institucional
(Next.js, outro projeto) consome a API REST deste CMS. Guias: [`docs/INTEGRACAO-PORTAL.md`](docs/INTEGRACAO-PORTAL.md) e
[`docs/MIGRACAO-ATI-PE.md`](docs/MIGRACAO-ATI-PE.md).

## Tecnologia
Payload CMS 3.93 (versões pinadas), Next.js 16, TypeScript, PostgreSQL (driver `pg`, sem recursos do Neon),
editor Lexical, painel em português. Escolhido por: painel pronto, perfis de acesso, histórico de versões,
API REST, licença MIT e execução em servidor próprio sem dependência de nuvem.

## Conteúdo gerenciado
- **Notícias**, **Páginas institucionais** (rich text, menu, SEO), **Biblioteca de mídia**, **Usuários**,
  **Configurações do portal** (contato, redes, rodapé).
- Perfis: `communication` (cria rascunhos e envia para revisão), `editor` (revisa e publica), `admin` (tudo + usuários).
- Segurança: sessão de 8 h, bloqueio após 5 tentativas, senha mínima de 10 caracteres, CSRF/CORS por lista de origens,
  GraphQL desligado, proteção contra remover o último administrador.

## Rodando localmente
Requer Node.js 22+ e um PostgreSQL (Neon ou local; `docker compose up -d db` sobe um local).
```bash
cp .env.example .env        # preencha PAYLOAD_SECRET e DATABASE_URL
npm install
npm run migrate             # cria as tabelas no banco
npm run create-admin        # com ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD definidos no ambiente
npm run dev                 # http://127.0.0.1:3000/admin
```
Sem `create-admin`, o primeiro acesso ao `/admin` oferece criar o primeiro usuário (vira administrador).
Em ambiente exposto, prefira o script para não deixar essa tela aberta.

## Banco de dados
- Tudo vem de `DATABASE_URL`. Trocar de servidor = trocar essa variável e rodar `npm run migrate`.
- **Migrations versionadas** em `src/migrations` (sem `push` automático). Ao alterar coleções:
  `npm run migrate:create -- nome_da_mudanca` e depois `npm run migrate`. Versione os arquivos gerados.
- Neon: use a URL com `sslmode=require`; para migrations/dump prefira a URL direta (sem `-pooler`).

## Mídia
Disco local (`media/`, ou `MEDIA_DIR`) por padrão. Para S3-compatível (obrigatório na Vercel), defina `S3_BUCKET` e
credenciais. Guia completo, com CORS e troca de provedor: [`docs/ARMAZENAMENTO-S3.md`](docs/ARMAZENAMENTO-S3.md).

## Comandos
`dev` · `build` · `start` · `typecheck` · `lint` · `migrate` · `migrate:create` · `migrate:status` ·
`create-admin` · `payload:generate:types` · `payload:generate:importmap`
(regenere tipos e importMap sempre que mudar coleções ou campos).

## Antes de produção (pendências)
- Definir `FRONTEND_URL` e `NEXT_PUBLIC_SERVER_URL` reais e servir o CMS por HTTPS.
- E-mail (recuperação de senha) exige configurar um adaptador SMTP; hoje os e-mails saem no log.
- Política de backup do banco e da pasta de mídia; limite de requisições atrás do proxy (`rateLimit.trustProxy`).
