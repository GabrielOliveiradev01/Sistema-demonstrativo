-- ============================================================
-- SISTEMA DE AGENDAMENTO ROBUSTO - Agenda completa, Lista de espera, Alertas
-- Depende de: 001, 002
-- ============================================================

-- ============================================================
-- 1. NOVOS VALORES NO ENUM status_agendamento
-- ============================================================
ALTER TYPE status_agendamento ADD VALUE IF NOT EXISTS 'aguardando_pagamento';

-- ============================================================
-- 2. ENUM risco_nivel (para agendamento e cliente)
-- ============================================================
DO $$ BEGIN
  CREATE TYPE risco_nivel AS ENUM ('baixo', 'medio', 'alto');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 3. ALTERAR AGENDAMENTOS (sala, risco, valor obrigatório)
-- ============================================================
ALTER TABLE agendamentos
  ADD COLUMN IF NOT EXISTS sala_id UUID REFERENCES salas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS risco_nivel risco_nivel DEFAULT 'baixo',
  ADD COLUMN IF NOT EXISTS valor_sinal DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS sinal_pago BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS canal_origem TEXT,
  ADD COLUMN IF NOT EXISTS confirmado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT;

-- Garantir valor como não nulo para agendamentos confirmados/concluídos
-- (deixamos nullable para permitir criar antes de definir preço)

CREATE INDEX idx_agendamentos_sala ON agendamentos(sala_id);
CREATE INDEX idx_agendamentos_risco ON agendamentos(risco_nivel);
CREATE INDEX idx_agendamentos_inicio_fim ON agendamentos(inicio, fim);

-- ============================================================
-- 4. LISTA DE ESPERA (waitlist)
-- ============================================================
CREATE TABLE lista_espera (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES servicos(id) ON DELETE SET NULL,
  unidade_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE SET NULL,
  prioridade SMALLINT DEFAULT 0,
  probabilidade_aceite DECIMAL(5,2),
  notas TEXT,
  atendido BOOLEAN DEFAULT false,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lista_espera_cliente ON lista_espera(cliente_id);
CREATE INDEX idx_lista_espera_servico ON lista_espera(servico_id);
CREATE INDEX idx_lista_espera_atendido ON lista_espera(atendido) WHERE atendido = false;

-- ============================================================
-- 5. ALERTAS (dashboard e operacional)
-- ============================================================
CREATE TYPE tipo_alerta AS ENUM (
  'horarios',      -- horários vazios
  'ocupacao',     -- profissional/subutilizado
  'risco',        -- cancelamento, no-show
  'receita',      -- oportunidade de faturamento
  'cliente',      -- cliente em risco abandono
  'financeiro',   -- meta, inadimplência
  'sistema'       -- erros, integração
);

CREATE TABLE alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo tipo_alerta NOT NULL,
  titulo TEXT NOT NULL,
  texto TEXT,
  acao_label TEXT,
  acao_link TEXT,
  acao_payload JSONB DEFAULT '{}',
  prioridade SMALLINT DEFAULT 0,
  lido BOOLEAN DEFAULT false,
  lido_em TIMESTAMPTZ,
  expira_em TIMESTAMPTZ,
  entidade_tipo TEXT,
  entidade_id UUID,
  dados JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alertas_tipo ON alertas(tipo);
CREATE INDEX idx_alertas_lido ON alertas(lido) WHERE lido = false;
CREATE INDEX idx_alertas_created ON alertas(created_at DESC);

-- ============================================================
-- 6. SUGESTÕES DE ENCAIXE (cache da IA / regras)
-- ============================================================
CREATE TABLE sugestoes_encaixe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  sala_id UUID REFERENCES salas(id) ON DELETE SET NULL,
  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ NOT NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  servico_id UUID REFERENCES servicos(id) ON DELETE SET NULL,
  probabilidade_aceite DECIMAL(5,2),
  desconto_sugerido DECIMAL(5,2),
  receita_potencial DECIMAL(12,2),
  gerado_em TIMESTAMPTZ DEFAULT NOW(),
  expira_em TIMESTAMPTZ,
  utilizado BOOLEAN DEFAULT false,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  CONSTRAINT chk_encaixe_fim_apos_inicio CHECK (fim > inicio)
);

CREATE INDEX idx_sugestoes_encaixe_prof ON sugestoes_encaixe(profissional_id);
CREATE INDEX idx_sugestoes_encaixe_inicio ON sugestoes_encaixe(inicio);
CREATE INDEX idx_sugestoes_encaixe_utilizado ON sugestoes_encaixe(utilizado) WHERE utilizado = false;

-- ============================================================
-- 7. RLS
-- ============================================================
ALTER TABLE lista_espera ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sugestoes_encaixe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_lista_espera" ON lista_espera FOR ALL USING (true);
CREATE POLICY "allow_all_alertas" ON alertas FOR ALL USING (true);
CREATE POLICY "allow_all_sugestoes_encaixe" ON sugestoes_encaixe FOR ALL USING (true);

-- ============================================================
-- Trigger lista_espera updated_at
-- ============================================================
CREATE TRIGGER lista_espera_updated_at BEFORE UPDATE ON lista_espera FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
