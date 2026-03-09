# Sistema de Agendamento Robusto

Sistema de agendamento com Next.js 14 e Supabase.

## Deploy na Netlify

1. Acesse [app.netlify.com](https://app.netlify.com) e faça login (ou use GitHub).

2. **Importar projeto**:
   - Clique em **Add new site** → **Import an existing project**
   - Conecte ao **GitHub** e escolha o repositório `GabrielOliveiradev01/Sistema-demonstrativo`
   - Netlify detecta Next.js automaticamente.

3. **Variáveis de ambiente** (Settings → Environment variables) — **obrigatório para o app funcionar**:
   - `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto (ex: `https://xxx.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Chave anon (anon public)
   - `SUPABASE_SERVICE_ROLE_KEY` — Service role key (para criar usuários na API)

4. **Deploy**: Clique em **Deploy site**. O build usa `npm run build`.

## Desenvolvimento local

```bash
cp .env.local.example .env.local
# Edite .env.local com suas chaves do Supabase
npm install
npm run dev
```

## Banco de dados

Migrações em `supabase/migrations/`. Ver `supabase/README_MIGRATIONS.md`.
