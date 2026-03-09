-- ============================================================
-- SISTEMA DE AGENDAMENTO ROBUSTO - Unidades, Salas, Categorias, Serviços avançados e Pacotes
-- Depende de: 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- 1. UNIDADES (multi-local)
-- ============================================================
CREATE TABLE unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  telefone TEXT,
  ativa BOOLEAN DEFAULT true,
  meta_mensal DECIMAL(12,2),
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  ordem SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_unidades_empresa ON unidades(empresa_id);
CREATE INDEX idx_unidades_ativa ON unidades(ativa);

-- ============================================================
-- 2. SALAS (por unidade)
-- ============================================================
CREATE TABLE salas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativa BOOLEAN DEFAULT true,
  ordem SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_salas_unidade ON salas(unidade_id);

-- ============================================================
-- 3. HORÁRIOS POR UNIDADE (opcional; sobrescreve config geral)
-- ============================================================
CREATE TABLE unidades_horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  abre TIME,
  fecha TIME,
  fechado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unidade_id, dia_semana)
);

-- ============================================================
-- 4. CATEGORIAS DE SERVIÇOS
-- ============================================================
CREATE TABLE categorias_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#22c55e',
  ordem SMALLINT DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. ALTERAR SERVIÇOS (campos avançados)
-- ============================================================
ALTER TABLE servicos
  ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias_servico(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS descricao TEXT,
  ADD COLUMN IF NOT EXISTS cor_calendario TEXT DEFAULT '#22c55e',
  ADD COLUMN IF NOT EXISTS buffer_antes_min INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS buffer_depois_min INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS exigir_sinal BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS percentual_sinal DECIMAL(5,2) DEFAULT 30,
  ADD COLUMN IF NOT EXISTS permitir_desconto BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS disponivel_online BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS antecedencia_minima_min INTEGER DEFAULT 60,
  ADD COLUMN IF NOT EXISTS antecedencia_maxima_dias INTEGER DEFAULT 90,
  ADD COLUMN IF NOT EXISTS limite_diario_atendimentos INTEGER,
  ADD COLUMN IF NOT EXISTS apenas_recorrentes BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS score_minimo INTEGER,
  ADD COLUMN IF NOT EXISTS recorrente BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS intervalo_dias INTEGER,
  ADD COLUMN IF NOT EXISTS gerar_proximos_automatico BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS limite_repeticoes INTEGER;

CREATE INDEX idx_servicos_categoria ON servicos(categoria_id);

-- ============================================================
-- 6. SERVIÇOS x PROFISSIONAIS (preço/duração/comissão por profissional)
-- ============================================================
DROP TABLE IF EXISTS servicos_profissionais;
CREATE TABLE servicos_profissionais (
  servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  preco_personalizado DECIMAL(12,2),
  duracao_personalizada_min INTEGER,
  comissao_percentual DECIMAL(5,2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (servico_id, profissional_id)
);

CREATE INDEX idx_servicos_prof_profissional ON servicos_profissionais(profissional_id);

-- ============================================================
-- 7. PREÇO DINÂMICO (por dia da semana ou faixa de horário)
-- ============================================================
CREATE TABLE servicos_preco_dinamico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'dia_semana' (0-6) ou 'faixa_horario' ('09:00-12:00')
  chave TEXT NOT NULL, -- '0' domingo ou 'sabado_10_14'
  valor DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(servico_id, tipo, chave)
);

-- ============================================================
-- 8. PACOTES / COMBOS
-- ============================================================
CREATE TABLE pacotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  valor_total DECIMAL(12,2) NOT NULL,
  duracao_total_min INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pacote_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pacote_id UUID NOT NULL REFERENCES pacotes(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  quantidade SMALLINT DEFAULT 1,
  ordem SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pacote_id, servico_id)
);

CREATE INDEX idx_pacote_itens_pacote ON pacote_itens(pacote_id);

-- ============================================================
-- 9. PROFISSIONAIS x UNIDADE
-- ============================================================
ALTER TABLE profissionais
  ADD COLUMN IF NOT EXISTS unidade_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS especialidade TEXT;

CREATE INDEX idx_profissionais_unidade ON profissionais(unidade_id);

-- ============================================================
-- 10. RLS
-- ============================================================
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos_profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos_preco_dinamico ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacote_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_unidades" ON unidades FOR ALL USING (true);
CREATE POLICY "allow_all_salas" ON salas FOR ALL USING (true);
CREATE POLICY "allow_all_unidades_horarios" ON unidades_horarios FOR ALL USING (true);
CREATE POLICY "allow_all_categorias_servico" ON categorias_servico FOR ALL USING (true);
CREATE POLICY "allow_all_servicos_profissionais" ON servicos_profissionais FOR ALL USING (true);
CREATE POLICY "allow_all_servicos_preco_dinamico" ON servicos_preco_dinamico FOR ALL USING (true);
CREATE POLICY "allow_all_pacotes" ON pacotes FOR ALL USING (true);
CREATE POLICY "allow_all_pacote_itens" ON pacote_itens FOR ALL USING (true);

-- ============================================================
-- Triggers updated_at
-- ============================================================
CREATE TRIGGER unidades_updated_at BEFORE UPDATE ON unidades FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER salas_updated_at BEFORE UPDATE ON salas FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER categorias_servico_updated_at BEFORE UPDATE ON categorias_servico FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER pacotes_updated_at BEFORE UPDATE ON pacotes FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
