-- ============================================================
-- SISTEMA DE AGENDAMENTO ROBUSTO - Clientes (scores, eventos), Financeiro (meta, sinais)
-- Depende de: 001, 002, 003
-- ============================================================

-- ============================================================
-- 1. CLIENTES - Campos de score e inteligência
-- ============================================================
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS score_confiabilidade INTEGER CHECK (score_confiabilidade IS NULL OR (score_confiabilidade >= 0 AND score_confiabilidade <= 100)),
  ADD COLUMN IF NOT EXISTS score_no_show INTEGER CHECK (score_no_show IS NULL OR (score_no_show >= 0 AND score_no_show <= 100)),
  ADD COLUMN IF NOT EXISTS risco_abandono INTEGER CHECK (risco_abandono IS NULL OR (risco_abandono >= 0 AND risco_abandono <= 100)),
  ADD COLUMN IF NOT EXISTS ultima_visita_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS proxima_visita_prevista DATE,
  ADD COLUMN IF NOT EXISTS frequencia_media_mes DECIMAL(6,2),
  ADD COLUMN IF NOT EXISTS ltv_cache DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS ticket_medio_cache DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS total_faltas INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_atendimentos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS segmentos TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS canal_origem TEXT;

CREATE INDEX idx_clientes_score_confiabilidade ON clientes(score_confiabilidade);
CREATE INDEX idx_clientes_score_no_show ON clientes(score_no_show);
CREATE INDEX idx_clientes_ultima_visita ON clientes(ultima_visita_at);
CREATE INDEX idx_clientes_segmentos ON clientes USING GIN(segmentos);

-- ============================================================
-- 2. EVENTOS DO CLIENTE (histórico estruturado)
-- ============================================================
CREATE TYPE tipo_evento_cliente AS ENUM (
  'atendimento', 'cancelamento', 'reagendamento', 'pagamento', 'observacao', 'no_show', 'sinal'
);

CREATE TABLE cliente_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo tipo_evento_cliente NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  movimentacao_id UUID REFERENCES financeiro_movimentacoes(id) ON DELETE SET NULL,
  valor DECIMAL(12,2),
  ocorrido_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cliente_eventos_cliente ON cliente_eventos(cliente_id);
CREATE INDEX idx_cliente_eventos_tipo ON cliente_eventos(tipo);
CREATE INDEX idx_cliente_eventos_ocorrido ON cliente_eventos(ocorrido_em DESC);
CREATE INDEX idx_cliente_eventos_agendamento ON cliente_eventos(agendamento_id);

-- ============================================================
-- 3. FINANCEIRO - Meta e tipo sinal
-- ============================================================
ALTER TYPE tipo_movimentacao ADD VALUE IF NOT EXISTS 'sinal';

CREATE TABLE financeiro_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  unidade_id UUID REFERENCES unidades(id) ON DELETE CASCADE,
  ano SMALLINT NOT NULL,
  mes SMALLINT NOT NULL CHECK (mes >= 1 AND mes <= 12),
  valor_meta DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uma meta global por empresa/ano/mês (unidade_id NULL)
CREATE UNIQUE INDEX idx_financeiro_meta_global ON financeiro_meta (empresa_id, ano, mes) WHERE unidade_id IS NULL;
-- Uma meta por unidade/ano/mês
CREATE UNIQUE INDEX idx_financeiro_meta_unidade ON financeiro_meta (unidade_id, ano, mes) WHERE unidade_id IS NOT NULL;

-- ============================================================
-- 4. CONFIGURAÇÃO DE PAGAMENTOS (formas e regras)
-- ============================================================
CREATE TABLE config_pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  aceita_cartao BOOLEAN DEFAULT true,
  aceita_pix BOOLEAN DEFAULT true,
  aceita_dinheiro BOOLEAN DEFAULT true,
  link_pagamento BOOLEAN DEFAULT false,
  cobranca_automatica_sinal BOOLEAN DEFAULT false,
  multa_cancelamento_percent DECIMAL(5,2) DEFAULT 0,
  reembolso_automatico BOOLEAN DEFAULT false,
  parcelamento_max SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. RLS
-- ============================================================
ALTER TABLE cliente_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_cliente_eventos" ON cliente_eventos FOR ALL USING (true);
CREATE POLICY "allow_all_financeiro_meta" ON financeiro_meta FOR ALL USING (true);
CREATE POLICY "allow_all_config_pagamentos" ON config_pagamentos FOR ALL USING (true);

-- ============================================================
-- Triggers
-- ============================================================
CREATE TRIGGER financeiro_meta_updated_at BEFORE UPDATE ON financeiro_meta FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER config_pagamentos_updated_at BEFORE UPDATE ON config_pagamentos FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
