# Migrações do Banco de Dados - Sistema de Agendamento Robusto

## Conectar o app Next.js ao banco

1. Copie o arquivo de exemplo de variáveis de ambiente:
   ```bash
   cp .env.local.example .env.local
   ```
2. Abra **Supabase Dashboard** → seu projeto → **Settings** → **API**.
3. Em **.env.local**, preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` — já vem com a URL do projeto (ou use **Project URL** do Dashboard).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — copie o **anon public** key do Dashboard.
4. Reinicie o servidor de desenvolvimento (`npm run dev`). O app passa a poder usar o cliente em `src/lib/supabase.ts` para ler/escrever no banco. As telas ainda usam dados mock; para usar dados reais, é preciso trocar os mocks por chamadas ao Supabase (ex.: `supabase.from('clientes').select()`).

---

## Supabase ativado no Cursor – como vincular e aplicar

1. **Pegue o Reference ID do seu projeto**
   - Abra [app.supabase.com](https://app.supabase.com) → seu projeto
   - **Project Settings** (ícone de engrenagem) → **General**
   - Copie o **Reference ID** (ex: `abcdefghijklmnop`)

2. **Faça login no CLI** (se ainda não fez): `npx supabase login`

3. **Vincule o projeto no terminal** (na pasta do projeto):
   ```bash
   npx supabase link --project-ref hwsfqwmjyytqzsyqftvd
   ```
   Quando pedir, use a **database password** do projeto (a mesma que você definiu ao criar o projeto; se esqueceu, em **Settings → Database** pode redefinir).

4. **Envie as migrações para o banco remoto**:
   ```bash
   npx supabase db push
   ```

Se preferir **não usar o CLI**, use o arquivo **`run_all_migrations.sql`**: abra o **SQL Editor** no Dashboard do Supabase, cole o conteúdo desse arquivo e execute (Run). Use isso em projeto novo, sem tabelas criadas ainda.

---

## Ordem das migrações

Execute na ordem (Supabase aplica por nome):

1. **001_initial_schema.sql** – Config empresa, horários, clientes, profissionais, serviços, agendamentos, bloqueios, financeiro, inteligência, automação, analytics, RLS e triggers.
2. **002_unidades_salas_categorias_servicos.sql** – Unidades, salas, categorias de serviço, serviços avançados (buffer, sinal, preço dinâmico), servicos_profissionais, pacotes.
3. **003_agenda_lista_espera_alertas.sql** – Agenda (sala_id, risco_nivel, status aguardando_pagamento), lista de espera, alertas, sugestões de encaixe.
4. **004_clientes_scores_financeiro_meta.sql** – Clientes (scores, LTV, segmentos), cliente_eventos, financeiro_meta, config_pagamentos.
5. **005_config_notificacoes_permissoes_plano.sql** – Notificações (canais, templates), perfis e usuários, integrações, políticas, planos e assinatura.
6. **006_views_funcoes_agenda_inteligente.sql** – Views (agenda dia, ocupação, receita, indicadores, lista espera, alertas) e funções (slots livres, conflito de agendamento + trigger).
7. **007_seed_minimo.sql** – Seed: 1 empresa, 1 unidade, 1 sala, 1 categoria, horários padrão, categorias financeiras, plano e políticas.
8. **008_permissoes_unidades_responsavel.sql** – Responsável por unidade, perfis admin/gerente/recepção/profissional.
9. **009_config_usuarios_profissional_id.sql** – Vínculo usuário–profissional.
10. **010_ia_metricas_inteligencia_aplicada.sql** – Tabela `ia_metricas` (faltas evitadas, receita recuperada, encaixes, performance) e `inteligencia_insights` com empresa_id/profissional_id; seed dos 4 insights (aumento_preco, alta_demanda, baixa_ocupacao, perda_ociosidade).

## Como aplicar (Supabase)

### Opção 1: Supabase CLI (recomendado)

```bash
# Na raiz do projeto
npx supabase db push
# ou
supabase migration up
```

### Opção 2: Dashboard Supabase

1. Acesse o projeto no [Supabase Dashboard](https://app.supabase.com).
2. **SQL Editor** → New query.
3. Cole e execute cada arquivo na ordem acima (001 … 007).

### Opção 3: psql

```bash
psql "postgresql://postgres:[SENHA]@db.[PROJECT_REF].supabase.co:5432/postgres" -f supabase/migrations/001_initial_schema.sql
# Repita para 002, 003, 004, 005, 006, 007.
```

## Principais tabelas e uso

| Área | Tabelas | Uso |
|------|--------|-----|
| **Agenda** | `agendamentos`, `agenda_bloqueios`, `salas`, `lista_espera`, `sugestoes_encaixe` | Agenda por profissional/sala, bloqueios, lista de espera e sugestões de encaixe. |
| **Alertas** | `alertas` | Alertas de horários, ocupação, risco, receita (dashboard). |
| **Clientes** | `clientes`, `cliente_eventos` | Cadastro e scores (confiabilidade, no-show, LTV, segmentos). |
| **Profissionais** | `profissionais`, `profissionais_horarios`, `servicos_profissionais` | Cadastro, horários por dia e preço/duração por serviço. |
| **Serviços** | `servicos`, `categorias_servico`, `pacotes`, `pacote_itens`, `servicos_preco_dinamico` | Serviços, categorias, pacotes e preço dinâmico. |
| **Financeiro** | `financeiro_movimentacoes`, `financeiro_categorias`, `financeiro_meta`, `config_pagamentos` | Movimentações, metas e regras de pagamento. |
| **Config** | `config_empresa`, `config_horarios`, `config_notificacoes_*`, `config_perfis`, `config_usuarios`, `config_integracoes`, `config_politicas`, `config_planos`, `config_assinatura` | Empresa, horários, notificações, permissões, integrações, políticas e plano. |
| **Automação** | `automacao_regras`, `automacao_execucoes` | Regras por gatilho e log de execuções. |

## Views e funções (agenda inteligente)

- **v_agendamentos_dia** – Agendamentos do dia com cliente, profissional, serviço, sala e unidade.
- **v_ocupacao_profissional_dia** – Ocupação e receita por profissional por dia.
- **v_receita_por_dia** – Receita por dia e status.
- **v_indicadores_dia** – Total de agendamentos, receita prevista e risco no-show do dia.
- **v_lista_espera** – Lista de espera com nomes (cliente, serviço, unidade, profissional).
- **v_alertas_nao_lidos** – Alertas não lidos e não expirados.
- **v_resumo_financeiro_mes** – Resumo financeiro do mês (confirmados, previstos, cancelados, no-show).
- **fn_slots_livres_profissional(profissional_id, dia, intervalo_min)** – Slots livres do profissional no dia.
- **fn_agendamento_tem_conflito(profissional_id, inicio, fim, agendamento_id_excluir)** – Verifica conflito com outros agendamentos ou bloqueios.
- **Trigger** em `agendamentos`: antes de INSERT/UPDATE valida conflito de horário.

## Observações

- RLS está habilitado nas tabelas principais; as políticas atuais permitem tudo (`USING (true)`). Ajuste depois para multi-tenant ou por perfil.
- O trigger de conflito em `agendamentos` evita sobrepor horários do mesmo profissional.
- Para multi-tenant, use `empresa_id` (ou equivalente) em todas as tabelas e nas políticas RLS.
