-- ============================================================
-- SISTEMA DE AGENDAMENTO ROBUSTO - IA: Métricas e Inteligência Aplicada
-- Tabelas para persistir: Faltas evitadas, Receita recuperada, Encaixes, Performance
-- e insights estratégicos (aumento preço, alta demanda, baixa ocupação, perda ociosidade)
-- ============================================================

-- ============================================================
-- 1. IA MÉTRICAS (Bloco de IA Operacional - 4 cards)
-- Faltas evitadas pela IA | Receita recuperada automaticamente | Encaixes feitos pela IA | Performance da IA
-- ============================================================
CREATE TABLE ia_metricas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
  periodo_ano SMALLINT NOT NULL,
  periodo_mes SMALLINT NOT NULL CHECK (periodo_mes BETWEEN 1 AND 12),
  faltas_evitadas INTEGER DEFAULT 0,
  receita_recuperada DECIMAL(12,2) DEFAULT 0,
  encaixes_feitos INTEGER DEFAULT 0,
  performance_percent DECIMAL(5,2) DEFAULT 0 CHECK (performance_percent >= 0 AND performance_percent <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_ia_metricas_global ON ia_metricas(empresa_id, periodo_ano, periodo_mes) WHERE profissional_id IS NULL;
CREATE UNIQUE INDEX idx_ia_metricas_prof ON ia_metricas(empresa_id, profissional_id, periodo_ano, periodo_mes) WHERE profissional_id IS NOT NULL;

CREATE INDEX idx_ia_metricas_empresa ON ia_metricas(empresa_id);
CREATE INDEX idx_ia_metricas_profissional ON ia_metricas(profissional_id);
CREATE INDEX idx_ia_metricas_periodo ON ia_metricas(periodo_ano, periodo_mes);

-- ============================================================
-- 2. INTELIGÊNCIA INSIGHTS - adicionar empresa_id e profissional_id
-- Para insights "4. Inteligência aplicada": aumento_preco, alta_demanda, baixa_ocupacao, perda_ociosidade
-- ============================================================
ALTER TABLE inteligencia_insights ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE;
ALTER TABLE inteligencia_insights ADD COLUMN IF NOT EXISTS profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_inteligencia_insights_empresa ON inteligencia_insights(empresa_id);
CREATE INDEX IF NOT EXISTS idx_inteligencia_insights_profissional ON inteligencia_insights(profissional_id);

-- ============================================================
-- 3. Trigger updated_at para ia_metricas
-- ============================================================
CREATE TRIGGER ia_metricas_updated_at BEFORE UPDATE ON ia_metricas FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ============================================================
-- 4. RLS para ia_metricas (compatível com políticas existentes)
-- ============================================================
ALTER TABLE ia_metricas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_ia_metricas" ON ia_metricas FOR ALL USING (true);

-- ============================================================
-- 5. Seed: métricas e insights iniciais (exemplo por empresa)
-- Os 4 tipos de insight: aumento_preco | alta_demanda | baixa_ocupacao | perda_ociosidade
-- ============================================================
INSERT INTO ia_metricas (empresa_id, profissional_id, periodo_ano, periodo_mes, faltas_evitadas, receita_recuperada, encaixes_feitos, performance_percent)
SELECT e.id, NULL, EXTRACT(YEAR FROM NOW())::SMALLINT, EXTRACT(MONTH FROM NOW())::SMALLINT, 0, 0, 0, 0
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM ia_metricas WHERE empresa_id = e.id AND profissional_id IS NULL LIMIT 1)
LIMIT 1;

-- Inserir os 4 insights de exemplo (uma vez por empresa)
INSERT INTO inteligencia_insights (empresa_id, tipo, titulo, descricao, dados)
SELECT e.id, 'aumento_preco', 'Este profissional pode aumentar preço em 8%.', 'Sugestão de aumento baseada em demanda e competitividade.', '{"percentual": 8}'::jsonb
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM inteligencia_insights WHERE empresa_id = e.id AND tipo = 'aumento_preco' LIMIT 1)
LIMIT 1;

INSERT INTO inteligencia_insights (empresa_id, tipo, titulo, descricao, dados)
SELECT e.id, 'alta_demanda', 'Alta demanda às quintas às 18h.', 'Horário de pico identificado.', '{"dia_semana": 4, "horario": "18:00"}'::jsonb
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM inteligencia_insights WHERE empresa_id = e.id AND tipo = 'alta_demanda' LIMIT 1)
LIMIT 1;

INSERT INTO inteligencia_insights (empresa_id, tipo, titulo, descricao, dados)
SELECT e.id, 'baixa_ocupacao', 'Baixa ocupação às terças 14h.', 'Slots ociosos com potencial.', '{"dia_semana": 2, "horario": "14:00"}'::jsonb
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM inteligencia_insights WHERE empresa_id = e.id AND tipo = 'baixa_ocupacao' LIMIT 1)
LIMIT 1;

INSERT INTO inteligencia_insights (empresa_id, tipo, titulo, descricao, dados)
SELECT e.id, 'perda_ociosidade', 'Está perdendo R$ 2.400/mês por ociosidade.', 'Receita potencial não realizada.', '{"valor_mensal": 2400}'::jsonb
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM inteligencia_insights WHERE empresa_id = e.id AND tipo = 'perda_ociosidade' LIMIT 1)
LIMIT 1;
