# Armazenamento de imagens (S3-compatível)

O CMS guarda imagens e PDFs em qualquer serviço que fale o protocolo S3 (Cloudflare R2, Amazon S3, Backblaze B2,
MinIO...). Sem as variáveis `S3_*`, grava em disco local (`media/`), o que serve para desenvolvimento no
computador, **mas não funciona na Vercel** (o disco dela é apagado a cada deploy).

## Variáveis
| Variável | Exemplo | Observação |
|---|---|---|
| `S3_BUCKET` | `ipem-media` | Ativa o S3. Vazio = disco local. |
| `S3_ENDPOINT` | `https://<conta>.r2.cloudflarestorage.com` | Vazio no Amazon S3. Em MinIO: `https://minio.ati.pe.gov.br`. |
| `S3_REGION` | `auto` (R2) / `sa-east-1` (AWS) | |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | | Chave com permissão de leitura e escrita **só neste bucket**. |
| `S3_FORCE_PATH_STYLE` | `true` | Deixe `true` (MinIO exige; R2 aceita). |
| `S3_CLIENT_UPLOADS` | `true` | Envio direto do navegador ao bucket. **Padrão: ligado na Vercel**, desligado fora dela. |

## Por que o envio direto (`S3_CLIENT_UPLOADS`)
A Vercel recusa requisições maiores que ~4,5 MB, e fotos de câmera costumam passar disso. Com o envio direto, o
navegador manda o arquivo ao bucket por uma URL assinada e temporária (10 minutos), emitida só para usuários
autenticados com perfil de criar mídia. O limite de 10 MB do CMS continua valendo (vai na assinatura).
**Exige CORS no bucket** (abaixo). Fora da Vercel (ex.: servidor da ATI) pode ficar desligado: o arquivo passa pelo CMS.

## Passo a passo (exemplo: Cloudflare R2)
1. Crie o bucket (ex.: `ipem-media`) e **mantenha-o privado**: o CMS entrega as imagens pelo endereço `/api/media/file/...`.
2. Crie uma chave de API (Object Read & Write) restrita a esse bucket e anote Access Key, Secret e o endpoint da conta.
3. Configure o **CORS** do bucket para permitir o envio a partir do CMS. Conteúdo necessário:
   origem `https://cms-ipem-pe.vercel.app` (e `http://127.0.0.1:3000` se testar localmente), método `PUT`,
   cabeçalhos permitidos `*`, expor `ETag`. O formato do JSON varia entre provedores; o conteúdo é esse.
4. Na Vercel (projeto do CMS), defina as variáveis acima e `NEXT_PUBLIC_SERVER_URL=https://cms-ipem-pe.vercel.app`.
5. **Rode as migrations no banco antes do deploy**: `npm run migrate` com `DATABASE_URL` apontando para o Neon.
   Há uma migration nova (`media_storage_fields`) que só adiciona duas colunas opcionais à tabela de mídia.
6. Faça deploy e teste enviando uma imagem **maior que 5 MB** no painel.

## Trocar de provedor (Neon/R2 → ATI)
Nenhum código muda: troque as variáveis `S3_*` e copie o conteúdo do bucket inteiro, como está
(`rclone sync` ou `mc mirror`). Os endereços das imagens passam pelo CMS (`/api/media/file/...`), então as notícias
já publicadas não quebram. Se a ATI preferir disco local, remova `S3_BUCKET` e copie os arquivos para `media/`
(nesse caso, arquivos enviados com envio direto ficam em subpastas por identificador; copie a árvore completa).

## Pontos de atenção
- Quem tem login de equipe pode obter uma URL assinada para qualquer tipo de arquivo; porém o CMS só registra
  como mídia o que passa pela validação (imagem/PDF) e processamento. Para não acumular arquivos órfãos, configure
  no bucket uma regra de ciclo de vida para expirar objetos antigos não referenciados, se o provedor oferecer.
- Alterou coleções ou plugins? Regenere o importMap com `npm run payload:generate:importmap` (o script já liga o S3
  durante a geração, para o componente de envio direto constar no arquivo versionado).
