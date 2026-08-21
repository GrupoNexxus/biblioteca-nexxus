# Biblioteca Nexxus — React

Versão em React (Vite) da Biblioteca Nexxus: tela de identificação/login,
catálogo de livros e o painel administrativo completo (dashboard,
colaboradores, livros, solicitações, empréstimos, histórico, relatórios,
configurações e emissão do Termo de Empréstimo em A4).

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com a URL e a anon key do seu projeto Supabase
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview   # serve o build localmente para conferir
```

## Estrutura

- `src/lib/supabaseClient.js` — cliente Supabase (lê as chaves de `.env`)
- `src/lib/helpers.js` — funções utilitárias compartilhadas (datas, status, categorias)
- `src/components/auth/` — telas de identificação/login/cadastro
- `src/components/catalog/` — acervo (grid, card, modal de solicitação)
- `src/components/admin/` — painel administrativo completo

Veja o `LEIA-ME-painel-admin.md` (na pasta que você recebeu junto com a
versão HTML) para o passo a passo do banco de dados (`schema-admin.sql`) e
da integração de e-mail via Hostweb (`supabase-send-email-function.ts`) —
esses dois arquivos valem tanto para a versão HTML quanto para esta em React.
