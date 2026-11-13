# Migração do banco: Neon → servidor da ATI-PE

O CMS só conhece o banco pela variável `DATABASE_URL`. Nenhum código depende do Neon.
Migrar = preparar um PostgreSQL novo, copiar os dados e trocar essa variável.

## Requisitos para a ATI-PE
- PostgreSQL **16** (14+ funciona; o desenvolvimento foi testado em 16).
- Um banco dedicado (ex.: `ipem_cms`) e um usuário dono dele, com permissão de criar tabelas/índices
  (as migrations rodam com esse usuário). Não é preciso superusuário nem extensões.
- Acesso de rede da aplicação ao banco (porta 5432) e, se possível, TLS (`?sslmode=require`).
- Encoding UTF-8.
- Backup agendado do banco **e** da pasta de mídia (ver abaixo).
- Node.js 22+ no servidor da aplicação, com HTTPS na frente (proxy reverso).

## Passo a passo
1. **Congelar edições** no CMS durante a janela de migração.
2. **Exportar do Neon** (use a URL *direta*, sem `-pooler`):
   `pg_dump --no-owner --no-privileges --format=custom -f ipem_cms.dump "<URL_NEON_DIRETA>"`
3. **Criar o banco** na ATI-PE e **restaurar**:
   `pg_restore --no-owner --no-privileges -d "<URL_ATI>" ipem_cms.dump`
   (Alternativa para banco ainda vazio: apenas `npm run migrate` cria o esquema; depois importe os dados.)
4. **Conferir** o esquema: `DATABASE_URL=<URL_ATI> npm run migrate:status` — todas as migrations devem constar como `Ran: Yes`.
5. **Trocar `DATABASE_URL`** no ambiente da aplicação e reiniciar. Não há mais nada a alterar no código.
6. **Validar**: login no `/admin`, abrir uma notícia, conferir a API pública (`/api/news`).
7. Manter o Neon intacto por alguns dias como plano de retorno; depois desativar.

## Mídia (imagens e PDFs)
O banco guarda apenas os metadados; os arquivos ficam fora dele.
- Padrão: pasta `media/` no servidor (ou `MEDIA_DIR`). **Copie essa pasta junto** na migração e inclua no backup.
- Alternativa: armazenamento S3-compatível (MinIO, Ceph, S3). Defina `S3_BUCKET`, `S3_ENDPOINT`,
  `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`. Ao trocar de disco para S3, é preciso copiar os arquivos
  existentes para o bucket.

## Pontos de atenção
- **Neon (pooler):** a URL com `-pooler` usa PgBouncer; para `pg_dump` e migrations use a URL direta.
- **TLS:** controlado pela própria URL (`sslmode=`). Se a ATI usar certificado interno, ajustar conforme a política deles.
- **Pool:** `DATABASE_POOL_MAX` (padrão 10). Combine com o limite de conexões do servidor.
- **Cookies seguros:** em produção os cookies de login exigem HTTPS. Atrás de proxy, garanta `X-Forwarded-Proto`.
- **Migrations em produção:** sempre `npm run migrate` antes de iniciar uma nova versão. `DATABASE_PUSH` deve ficar `false`.
