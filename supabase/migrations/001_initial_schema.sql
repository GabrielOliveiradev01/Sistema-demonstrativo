-- ============================================================
-- SISTEMA DE AGENDAMENTO ROBUSTO - Schema inicial
-- Compatível com Supabase (PostgreSQL)
-- ============================================================

-- gen_random_uuid() é nativo no PostgreSQL 13+ (Supabase)

-- ============================================================
-- 1. CONFIGURAÇÕES (base para outros módulos)
-- ============================================================
CREATE TABLE config_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnpj TEXT,
  email TEXT,
  telefone TEXT,
  endereco JSONB DEFAULT '{}',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE config_horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=domingo
  abre TIME,
  fecha TIME,
  fechado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, dia_semana)
);

-- ============================================================
-- 2. CLIENTES
-- ============================================================
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cpf TEXT,
  data_nascimento DATE,
  endereco JSONB DEFAULT '{}',
  notas TEXT,
  ativo BOOLEAN DEFAULT true,
  origem TEXT, -- indicação, site, etc.
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_email ON clientes(email) WHERE email IS NOT NULL;
CREATE INDEX idx_clientes_ativo ON clientes(ativo);

-- ============================================================
-- 3. PROFISSIONAIS
-- ============================================================
CREATE TABLE profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  avatar_url TEXT,
  cargo TEXT,
  especialidades TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  cor_agenda TEXT DEFAULT '#22c55e', -- para exibição na agenda
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profissionais_horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  abre TIME,
  fecha TIME,
  fechado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profissional_id, dia_semana)
);

CREATE INDEX idx_profissionais_ativo ON profissionais(ativo);

-- ============================================================
-- 4. SERVIÇOS
-- ============================================================
CREATE TABLE servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao_minutos INTEGER NOT NULL DEFAULT 60,
  valor_base DECIMAL(12,2) NOT NULL DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  categoria TEXT,
  cor TEXT DEFAULT '#22c55e',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE servicos_profissionais (
  servico_id UUID REFERENCES servicos(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
  PRIMARY KEY (servico_id, profissional_id)
);

CREATE INDEX idx_servicos_ativo ON servicos(ativo);

-- ============================================================
-- 5. AGENDA (Agendamentos)
-- ============================================================
CREATE TYPE status_agendamento AS ENUM (
  'pendente', 'confirmado', 'em_atendimento', 'concluido', 'cancelado', 'no_show'
);

CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE RESTRICT,
  servico_id UUID REFERENCES servicos(id) ON DELETE SET NULL,
  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ NOT NULL,
  status status_agendamento DEFAULT 'pendente',
  valor DECIMAL(12,2),
  notas TEXT,
  titulo TEXT, -- opcional, sobrescreve nome do serviço
  lembrete_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT chk_fim_apos_inicio CHECK (fim > inicio)
);

CREATE INDEX idx_agendamentos_inicio ON agendamentos(inicio);
CREATE INDEX idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX idx_agendamentos_profissional ON agendamentos(profissional_id);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);

-- Bloqueios de agenda (folga, almoço, etc.)
CREATE TABLE agenda_bloqueios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ NOT NULL,
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_bloqueio_fim_apos_inicio CHECK (fim > inicio)
);

CREATE INDEX idx_agenda_bloqueios_profissional ON agenda_bloqueios(profissional_id);

-- ============================================================
-- 6. FINANCEIRO
-- ============================================================
CREATE TYPE tipo_movimentacao AS ENUM ('entrada', 'saida', 'transferencia');
CREATE TYPE status_pagamento AS ENUM ('pendente', 'pago', 'parcial', 'cancelado', 'estornado');

CREATE TABLE financeiro_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo tipo_movimentacao NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE financeiro_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  categoria_id UUID REFERENCES financeiro_categorias(id) ON DELETE SET NULL,
  tipo tipo_movimentacao NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  data_vencimento DATE,
  data_pagamento TIMESTAMPTZ,
  status status_pagamento DEFAULT 'pendente',
  descricao TEXT,
  forma_pagamento TEXT, -- pix, cartao, dinheiro, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_financeiro_data ON financeiro_movimentacoes(data_vencimento);
CREATE INDEX idx_financeiro_agendamento ON financeiro_movimentacoes(agendamento_id);
CREATE INDEX idx_financeiro_status ON financeiro_movimentacoes(status);

-- ============================================================
-- 7. INTELIGÊNCIA (insights, histórico, sugestões)
-- ============================================================
CREATE TABLE inteligencia_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL, -- 'ocupacao', 'receita', 'cliente_frequente', 'horario_pico', etc.
  titulo TEXT NOT NULL,
  descricao TEXT,
  dados JSONB DEFAULT '{}',
  periodo_inicio DATE,
  periodo_fim DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inteligencia_log_acoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_tipo TEXT NOT NULL, -- 'agendamento', 'cliente', etc.
  entidade_id UUID,
  acao TEXT NOT NULL,
  usuario_id UUID,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inteligencia_tipo ON inteligencia_insights(tipo);
CREATE INDEX idx_inteligencia_log_entidade ON inteligencia_log_acoes(entidade_tipo, entidade_id);

-- ============================================================
-- 8. AUTOMAÇÃO
-- ============================================================
CREATE TYPE status_automacao AS ENUM ('ativo', 'inativo', 'pausado');
CREATE TYPE gatilho_automacao AS ENUM (
  'agendamento_criado', 'agendamento_confirmado', 'agendamento_cancelado',
  'antes_agendamento', 'depois_agendamento', 'cliente_novo', 'pagamento_recebido'
);

CREATE TABLE automacao_regras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  gatilho gatilho_automacao NOT NULL,
  condicoes JSONB DEFAULT '{}', -- ex: { "horas_antes": 24 }
  acao_tipo TEXT NOT NULL, -- 'email', 'sms', 'notificacao', 'webhook'
  acao_config JSONB DEFAULT '{}',
  status status_automacao DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE automacao_execucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regra_id UUID REFERENCES automacao_regras(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  executado_em TIMESTAMPTZ DEFAULT NOW(),
  sucesso BOOLEAN,
  mensagem_erro TEXT
);

CREATE INDEX idx_automacao_gatilho ON automacao_regras(gatilho);
CREATE INDEX idx_automacao_status ON automacao_regras(status);

-- ============================================================
-- 9. ANALYTICS (dados agregados / views úteis)
-- ============================================================
CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL UNIQUE,
  dados JSONB NOT NULL DEFAULT '{}',
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- View: resumo por dia (para gráficos)
CREATE OR REPLACE VIEW v_agendamentos_por_dia AS
SELECT
  DATE(inicio AT TIME ZONE 'America/Sao_Paulo') AS dia,
  status,
  COUNT(*) AS total,
  SUM(valor) AS valor_total
FROM agendamentos
GROUP BY DATE(inicio AT TIME ZONE 'America/Sao_Paulo'), status;

-- View: ocupação por profissional
CREATE OR REPLACE VIEW v_profissional_ocupacao AS
SELECT
  p.id AS profissional_id,
  p.nome AS profissional_nome,
  DATE(a.inicio AT TIME ZONE 'America/Sao_Paulo') AS dia,
  COUNT(a.id) AS total_agendamentos,
  SUM(a.valor) AS receita_dia
FROM profissionais p
LEFT JOIN agendamentos a ON a.profissional_id = p.id AND a.status NOT IN ('cancelado', 'no_show')
GROUP BY p.id, p.nome, DATE(a.inicio AT TIME ZONE 'America/Sao_Paulo');

-- ============================================================
-- 10. RLS (Row Level Security) - preparado para Supabase Auth
-- ============================================================
ALTER TABLE config_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE automacao_regras ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir tudo para autenticados - ajustar depois)
CREATE POLICY "allow_all_config" ON config_empresa FOR ALL USING (true);
CREATE POLICY "allow_all_clientes" ON clientes FOR ALL USING (true);
CREATE POLICY "allow_all_profissionais" ON profissionais FOR ALL USING (true);
CREATE POLICY "allow_all_servicos" ON servicos FOR ALL USING (true);
CREATE POLICY "allow_all_agendamentos" ON agendamentos FOR ALL USING (true);
CREATE POLICY "allow_all_financeiro" ON financeiro_movimentacoes FOR ALL USING (true);
CREATE POLICY "allow_all_automacao" ON automacao_regras FOR ALL USING (true);

-- ============================================================
-- Triggers updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER config_empresa_updated_at BEFORE UPDATE ON config_empresa FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER profissionais_updated_at BEFORE UPDATE ON profissionais FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER servicos_updated_at BEFORE UPDATE ON servicos FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER agendamentos_updated_at BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER financeiro_updated_at BEFORE UPDATE ON financeiro_movimentacoes FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER automacao_updated_at BEFORE UPDATE ON automacao_regras FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
