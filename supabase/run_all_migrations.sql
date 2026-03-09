-- ============================================================
-- SISTEMA DE AGENDAMENTO ROBUSTO - TODAS AS MIGRAÇÕES EM UM ARQUIVO
-- Cole este conteúdo no SQL Editor do Supabase Dashboard e execute (Run).
-- https://app.supabase.com → seu projeto → SQL Editor → New query → Cole → Run
-- ============================================================

-- ############### INÍCIO 001 ###############
-- gen_random_uuid() é nativo no PostgreSQL 13+ (Supabase)

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
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  abre TIME,
  fecha TIME,
  fechado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, dia_semana)
);

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
  origem TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_email ON clientes(email) WHERE email IS NOT NULL;
CREATE INDEX idx_clientes_ativo ON clientes(ativo);

CREATE TABLE profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  avatar_url TEXT,
  cargo TEXT,
  especialidades TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  cor_agenda TEXT DEFAULT '#22c55e',
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
  titulo TEXT,
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
  forma_pagamento TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_financeiro_data ON financeiro_movimentacoes(data_vencimento);
CREATE INDEX idx_financeiro_agendamento ON financeiro_movimentacoes(agendamento_id);
CREATE INDEX idx_financeiro_status ON financeiro_movimentacoes(status);

CREATE TABLE inteligencia_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  dados JSONB DEFAULT '{}',
  periodo_inicio DATE,
  periodo_fim DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inteligencia_log_acoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_tipo TEXT NOT NULL,
  entidade_id UUID,
  acao TEXT NOT NULL,
  usuario_id UUID,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inteligencia_tipo ON inteligencia_insights(tipo);
CREATE INDEX idx_inteligencia_log_entidade ON inteligencia_log_acoes(entidade_tipo, entidade_id);

CREATE TYPE status_automacao AS ENUM ('ativo', 'inativo', 'pausado');
CREATE TYPE gatilho_automacao AS ENUM (
  'agendamento_criado', 'agendamento_confirmado', 'agendamento_cancelado',
  'antes_agendamento', 'depois_agendamento', 'cliente_novo', 'pagamento_recebido'
);

CREATE TABLE automacao_regras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  gatilho gatilho_automacao NOT NULL,
  condicoes JSONB DEFAULT '{}',
  acao_tipo TEXT NOT NULL,
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

CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL UNIQUE,
  dados JSONB NOT NULL DEFAULT '{}',
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE VIEW v_agendamentos_por_dia AS
SELECT
  DATE(inicio AT TIME ZONE 'America/Sao_Paulo') AS dia,
  status,
  COUNT(*) AS total,
  SUM(valor) AS valor_total
FROM agendamentos
GROUP BY DATE(inicio AT TIME ZONE 'America/Sao_Paulo'), status;

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

ALTER TABLE config_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE automacao_regras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_config" ON config_empresa FOR ALL USING (true);
CREATE POLICY "allow_all_clientes" ON clientes FOR ALL USING (true);
CREATE POLICY "allow_all_profissionais" ON profissionais FOR ALL USING (true);
CREATE POLICY "allow_all_servicos" ON servicos FOR ALL USING (true);
CREATE POLICY "allow_all_agendamentos" ON agendamentos FOR ALL USING (true);
CREATE POLICY "allow_all_financeiro" ON financeiro_movimentacoes FOR ALL USING (true);
CREATE POLICY "allow_all_automacao" ON automacao_regras FOR ALL USING (true);

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

-- ############### FIM 001 / INÍCIO 002 ###############
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

CREATE TABLE categorias_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#22c55e',
  ordem SMALLINT DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE servicos
  ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias_servico(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_servicos_categoria ON servicos(categoria_id);

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

CREATE TABLE servicos_preco_dinamico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  chave TEXT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(servico_id, tipo, chave)
);

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

ALTER TABLE profissionais
  ADD COLUMN IF NOT EXISTS unidade_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS especialidade TEXT;

CREATE INDEX IF NOT EXISTS idx_profissionais_unidade ON profissionais(unidade_id);

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

CREATE TRIGGER unidades_updated_at BEFORE UPDATE ON unidades FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER salas_updated_at BEFORE UPDATE ON salas FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER categorias_servico_updated_at BEFORE UPDATE ON categorias_servico FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER pacotes_updated_at BEFORE UPDATE ON pacotes FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ############### FIM 002 / INÍCIO 003 ###############
ALTER TYPE status_agendamento ADD VALUE IF NOT EXISTS 'aguardando_pagamento';

DO $$ BEGIN
  CREATE TYPE risco_nivel AS ENUM ('baixo', 'medio', 'alto');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE agendamentos
  ADD COLUMN IF NOT EXISTS sala_id UUID REFERENCES salas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS risco_nivel risco_nivel DEFAULT 'baixo',
  ADD COLUMN IF NOT EXISTS valor_sinal DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS sinal_pago BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS canal_origem TEXT,
  ADD COLUMN IF NOT EXISTS confirmado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT;

CREATE INDEX IF NOT EXISTS idx_agendamentos_sala ON agendamentos(sala_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_risco ON agendamentos(risco_nivel);
CREATE INDEX IF NOT EXISTS idx_agendamentos_inicio_fim ON agendamentos(inicio, fim);

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

DO $$ BEGIN
  CREATE TYPE tipo_alerta AS ENUM ('horarios', 'ocupacao', 'risco', 'receita', 'cliente', 'financeiro', 'sistema');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

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

ALTER TABLE lista_espera ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sugestoes_encaixe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_lista_espera" ON lista_espera FOR ALL USING (true);
CREATE POLICY "allow_all_alertas" ON alertas FOR ALL USING (true);
CREATE POLICY "allow_all_sugestoes_encaixe" ON sugestoes_encaixe FOR ALL USING (true);

CREATE TRIGGER lista_espera_updated_at BEFORE UPDATE ON lista_espera FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ############### FIM 003 / INÍCIO 004 ###############
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS score_confiabilidade INTEGER,
  ADD COLUMN IF NOT EXISTS score_no_show INTEGER,
  ADD COLUMN IF NOT EXISTS risco_abandono INTEGER,
  ADD COLUMN IF NOT EXISTS ultima_visita_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS proxima_visita_prevista DATE,
  ADD COLUMN IF NOT EXISTS frequencia_media_mes DECIMAL(6,2),
  ADD COLUMN IF NOT EXISTS ltv_cache DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS ticket_medio_cache DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS total_faltas INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_atendimentos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS segmentos TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS canal_origem TEXT;

CREATE INDEX IF NOT EXISTS idx_clientes_score_confiabilidade ON clientes(score_confiabilidade);
CREATE INDEX IF NOT EXISTS idx_clientes_score_no_show ON clientes(score_no_show);
CREATE INDEX IF NOT EXISTS idx_clientes_ultima_visita ON clientes(ultima_visita_at);
CREATE INDEX IF NOT EXISTS idx_clientes_segmentos ON clientes USING GIN(segmentos);

DO $$ BEGIN
  CREATE TYPE tipo_evento_cliente AS ENUM ('atendimento', 'cancelamento', 'reagendamento', 'pagamento', 'observacao', 'no_show', 'sinal');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

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

CREATE UNIQUE INDEX idx_financeiro_meta_global ON financeiro_meta (empresa_id, ano, mes) WHERE unidade_id IS NULL;
CREATE UNIQUE INDEX idx_financeiro_meta_unidade ON financeiro_meta (unidade_id, ano, mes) WHERE unidade_id IS NOT NULL;

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

ALTER TABLE cliente_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_cliente_eventos" ON cliente_eventos FOR ALL USING (true);
CREATE POLICY "allow_all_financeiro_meta" ON financeiro_meta FOR ALL USING (true);
CREATE POLICY "allow_all_config_pagamentos" ON config_pagamentos FOR ALL USING (true);

CREATE TRIGGER financeiro_meta_updated_at BEFORE UPDATE ON financeiro_meta FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER config_pagamentos_updated_at BEFORE UPDATE ON config_pagamentos FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ############### FIM 004 / INÍCIO 005 ###############
CREATE TABLE config_notificacoes_canal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  canal TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, canal)
);

CREATE TABLE config_notificacoes_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  canal TEXT NOT NULL,
  assunto TEXT,
  corpo_texto TEXT,
  corpo_html TEXT,
  variaveis TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_config_templates_tipo ON config_notificacoes_templates(tipo);

CREATE TABLE config_perfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL,
  ver_financeiro BOOLEAN DEFAULT false,
  editar_preco BOOLEAN DEFAULT false,
  cancelar_agendamento BOOLEAN DEFAULT false,
  dar_desconto BOOLEAN DEFAULT false,
  ver_relatorios BOOLEAN DEFAULT false,
  gerenciar_usuarios BOOLEAN DEFAULT false,
  permissoes_extra JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, slug)
);

CREATE TABLE config_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid UUID UNIQUE,
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  perfil_id UUID REFERENCES config_perfis(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_config_usuarios_empresa ON config_usuarios(empresa_id);
CREATE INDEX idx_config_usuarios_auth ON config_usuarios(auth_uid);

CREATE TABLE config_integracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, tipo)
);

CREATE TABLE config_politicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  antecedencia_minima_horas INTEGER DEFAULT 24,
  antecedencia_maxima_dias INTEGER DEFAULT 90,
  limite_cancelamento_dias INTEGER DEFAULT 2,
  penalidade_automatica BOOLEAN DEFAULT true,
  score_minimo_sem_sinal INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id)
);

CREATE TABLE config_planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  limite_agendamentos_mes INTEGER,
  limite_clientes INTEGER,
  limite_profissionais INTEGER,
  limite_unidades INTEGER,
  recursos TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE config_assinatura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  plano_id UUID NOT NULL REFERENCES config_planos(id) ON DELETE RESTRICT,
  inicio_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fim_em TIMESTAMPTZ,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_config_assinatura_empresa ON config_assinatura(empresa_id);
CREATE INDEX idx_config_assinatura_ativa ON config_assinatura(ativa) WHERE ativa = true;

ALTER TABLE config_notificacoes_canal ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_notificacoes_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_integracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_politicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_assinatura ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_config_notif_canal" ON config_notificacoes_canal FOR ALL USING (true);
CREATE POLICY "allow_all_config_templates" ON config_notificacoes_templates FOR ALL USING (true);
CREATE POLICY "allow_all_config_perfis" ON config_perfis FOR ALL USING (true);
CREATE POLICY "allow_all_config_usuarios" ON config_usuarios FOR ALL USING (true);
CREATE POLICY "allow_all_config_integracoes" ON config_integracoes FOR ALL USING (true);
CREATE POLICY "allow_all_config_politicas" ON config_politicas FOR ALL USING (true);
CREATE POLICY "allow_all_config_planos" ON config_planos FOR ALL USING (true);
CREATE POLICY "allow_all_config_assinatura" ON config_assinatura FOR ALL USING (true);

CREATE TRIGGER config_notif_canal_updated_at BEFORE UPDATE ON config_notificacoes_canal FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER config_templates_updated_at BEFORE UPDATE ON config_notificacoes_templates FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER config_perfis_updated_at BEFORE UPDATE ON config_perfis FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER config_usuarios_updated_at BEFORE UPDATE ON config_usuarios FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER config_integracoes_updated_at BEFORE UPDATE ON config_integracoes FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER config_politicas_updated_at BEFORE UPDATE ON config_politicas FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER config_assinatura_updated_at BEFORE UPDATE ON config_assinatura FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ############### FIM 005 / INÍCIO 006 (views e funções) ###############
CREATE OR REPLACE VIEW v_agendamentos_dia AS
SELECT
  a.id, a.cliente_id, c.nome AS cliente_nome, a.profissional_id, p.nome AS profissional_nome, p.cor_agenda AS profissional_cor,
  a.servico_id, s.nome AS servico_nome, a.sala_id, sal.nome AS sala_nome, u.nome AS unidade_nome,
  a.inicio, a.fim, a.status, a.risco_nivel, a.valor, a.valor_sinal, a.sinal_pago, a.notas, a.titulo, a.lembrete_enviado,
  DATE(a.inicio AT TIME ZONE 'America/Sao_Paulo') AS dia
FROM agendamentos a
JOIN clientes c ON c.id = a.cliente_id
JOIN profissionais p ON p.id = a.profissional_id
LEFT JOIN servicos s ON s.id = a.servico_id
LEFT JOIN salas sal ON sal.id = a.sala_id
LEFT JOIN unidades u ON u.id = sal.unidade_id
WHERE a.status NOT IN ('cancelado', 'no_show');

CREATE OR REPLACE VIEW v_ocupacao_profissional_dia AS
SELECT p.id AS profissional_id, p.nome AS profissional_nome, DATE(a.inicio AT TIME ZONE 'America/Sao_Paulo') AS dia,
  COUNT(a.id) AS total_agendamentos, COALESCE(SUM(a.valor), 0) AS receita_dia,
  COALESCE(SUM(EXTRACT(EPOCH FROM (a.fim - a.inicio)) / 60), 0)::INTEGER AS minutos_ocupados
FROM profissionais p
LEFT JOIN agendamentos a ON a.profissional_id = p.id AND a.status NOT IN ('cancelado', 'no_show') AND a.inicio >= NOW() - INTERVAL '1 year'
GROUP BY p.id, p.nome, DATE(a.inicio AT TIME ZONE 'America/Sao_Paulo');

CREATE OR REPLACE VIEW v_receita_por_dia AS
SELECT DATE(inicio AT TIME ZONE 'America/Sao_Paulo') AS dia, status, COUNT(*) AS total_agendamentos, COALESCE(SUM(valor), 0) AS valor_total
FROM agendamentos WHERE status NOT IN ('cancelado', 'no_show')
GROUP BY DATE(inicio AT TIME ZONE 'America/Sao_Paulo'), status;

CREATE OR REPLACE VIEW v_indicadores_dia AS
WITH dia_atual AS (SELECT DATE(NOW() AT TIME ZONE 'America/Sao_Paulo') AS hoje),
agendamentos_hoje AS (
  SELECT a.id, a.profissional_id, a.valor, a.risco_nivel FROM agendamentos a, dia_atual d
  WHERE DATE(a.inicio AT TIME ZONE 'America/Sao_Paulo') = d.hoje AND a.status NOT IN ('cancelado', 'no_show')
),
profissionais_ativos AS (
  SELECT COUNT(DISTINCT ph.profissional_id) AS total FROM profissionais_horarios ph
  JOIN profissionais p ON p.id = ph.profissional_id
  WHERE p.ativo AND ph.fechado = false AND ph.dia_semana = EXTRACT(DOW FROM (SELECT hoje FROM dia_atual))::SMALLINT
)
SELECT (SELECT COUNT(*) FROM agendamentos_hoje) AS total_agendamentos,
  (SELECT COALESCE(SUM(valor), 0) FROM agendamentos_hoje) AS receita_prevista_dia,
  (SELECT COUNT(*) FROM agendamentos_hoje WHERE risco_nivel = 'alto') AS risco_noshow_hoje,
  (SELECT total FROM profissionais_ativos) AS profissionais_ativos;

CREATE OR REPLACE FUNCTION fn_slots_livres_profissional(p_profissional_id UUID, p_dia DATE, p_intervalo_min INTEGER DEFAULT 30)
RETURNS TABLE (inicio_slot TIME, fim_slot TIME, duracao_min INTEGER) AS $$
DECLARE v_abre TIME := '08:00'; v_fecha TIME := '18:00'; v_dia_semana SMALLINT;
BEGIN
  v_dia_semana := EXTRACT(DOW FROM p_dia)::SMALLINT;
  SELECT ph.abre, ph.fecha INTO v_abre, v_fecha FROM profissionais_horarios ph
  WHERE ph.profissional_id = p_profissional_id AND ph.dia_semana = v_dia_semana AND ph.fechado = false LIMIT 1;
  IF v_abre IS NULL THEN v_abre := '08:00'; v_fecha := '18:00'; END IF;
  RETURN QUERY
  WITH RECURSIVE slots AS (SELECT v_abre AS ini UNION ALL SELECT (ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME FROM slots WHERE (ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME < v_fecha),
  agendados AS (SELECT (a.inicio AT TIME ZONE 'America/Sao_Paulo')::TIME AS ini_ag, (a.fim AT TIME ZONE 'America/Sao_Paulo')::TIME AS fim_ag FROM agendamentos a WHERE a.profissional_id = p_profissional_id AND DATE(a.inicio AT TIME ZONE 'America/Sao_Paulo') = p_dia AND a.status NOT IN ('cancelado', 'no_show')),
  bloqueios AS (SELECT (b.inicio AT TIME ZONE 'America/Sao_Paulo')::TIME AS ini_bl, (b.fim AT TIME ZONE 'America/Sao_Paulo')::TIME AS fim_bl FROM agenda_bloqueios b WHERE b.profissional_id = p_profissional_id AND DATE(b.inicio AT TIME ZONE 'America/Sao_Paulo') = p_dia)
  SELECT s.ini, (s.ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME, p_intervalo_min FROM slots s
  WHERE NOT EXISTS (SELECT 1 FROM agendados ag WHERE s.ini < ag.fim_ag AND (s.ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME > ag.ini_ag)
  AND NOT EXISTS (SELECT 1 FROM bloqueios bl WHERE s.ini < bl.fim_bl AND (s.ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME > bl.ini_bl)
  AND (s.ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME <= v_fecha;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION fn_agendamento_tem_conflito(p_profissional_id UUID, p_inicio TIMESTAMPTZ, p_fim TIMESTAMPTZ, p_agendamento_id_excluir UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM agendamentos a WHERE a.profissional_id = p_profissional_id AND (p_agendamento_id_excluir IS NULL OR a.id != p_agendamento_id_excluir) AND a.status NOT IN ('cancelado', 'no_show') AND (a.inicio, a.fim) OVERLAPS (p_inicio, p_fim))
  OR EXISTS (SELECT 1 FROM agenda_bloqueios b WHERE b.profissional_id = p_profissional_id AND (b.inicio, b.fim) OVERLAPS (p_inicio, p_fim));
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION trg_agendamento_check_conflito() RETURNS TRIGGER AS $$
BEGIN
  IF fn_agendamento_tem_conflito(NEW.profissional_id, NEW.inicio, NEW.fim, CASE WHEN TG_OP = 'UPDATE' THEN OLD.id ELSE NULL END) THEN
    RAISE EXCEPTION 'Conflito de horário: profissional já possui agendamento ou bloqueio neste período.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agendamento_check_conflito ON agendamentos;
CREATE TRIGGER agendamento_check_conflito BEFORE INSERT OR UPDATE OF profissional_id, inicio, fim ON agendamentos FOR EACH ROW EXECUTE PROCEDURE trg_agendamento_check_conflito();

CREATE OR REPLACE VIEW v_lista_espera AS
SELECT le.id, le.cliente_id, c.nome AS cliente_nome, le.servico_id, s.nome AS servico_nome, le.unidade_id, u.nome AS unidade_nome, le.profissional_id, p.nome AS profissional_nome, le.prioridade, le.probabilidade_aceite, le.atendido, le.agendamento_id, le.created_at
FROM lista_espera le JOIN clientes c ON c.id = le.cliente_id
LEFT JOIN servicos s ON s.id = le.servico_id LEFT JOIN unidades u ON u.id = le.unidade_id LEFT JOIN profissionais p ON p.id = le.profissional_id
WHERE le.atendido = false ORDER BY le.prioridade ASC, le.created_at ASC;

CREATE OR REPLACE VIEW v_alertas_nao_lidos AS
SELECT * FROM alertas WHERE lido = false AND (expira_em IS NULL OR expira_em > NOW()) ORDER BY prioridade DESC, created_at DESC;

CREATE OR REPLACE VIEW v_resumo_financeiro_mes AS
SELECT DATE_TRUNC('month', a.inicio AT TIME ZONE 'America/Sao_Paulo')::DATE AS mes,
  COUNT(*) FILTER (WHERE a.status IN ('confirmado', 'em_atendimento', 'concluido')) AS total_confirmados,
  COALESCE(SUM(a.valor) FILTER (WHERE a.status IN ('confirmado', 'em_atendimento', 'concluido')), 0) AS receita_confirmada,
  COALESCE(SUM(a.valor) FILTER (WHERE a.status = 'pendente' OR a.status = 'aguardando_pagamento'), 0) AS receita_prevista,
  COUNT(*) FILTER (WHERE a.status = 'cancelado') AS total_cancelados,
  COALESCE(SUM(a.valor) FILTER (WHERE a.status = 'no_show'), 0) AS receita_perdida_noshow
FROM agendamentos a
WHERE a.inicio >= DATE_TRUNC('month', CURRENT_DATE) AND a.inicio < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY DATE_TRUNC('month', a.inicio AT TIME ZONE 'America/Sao_Paulo');

CREATE OR REPLACE VIEW v_profissionais_unidade AS
SELECT p.id, p.nome, p.cor_agenda, p.unidade_id, u.nome AS unidade_nome, p.especialidade, p.ativo
FROM profissionais p LEFT JOIN unidades u ON u.id = p.unidade_id WHERE p.ativo = true;

CREATE OR REPLACE VIEW v_servicos_categoria AS
SELECT s.id, s.nome, s.duracao_minutos, s.valor_base, s.categoria_id, cat.nome AS categoria_nome, cat.cor AS categoria_cor, s.ativo
FROM servicos s LEFT JOIN categorias_servico cat ON cat.id = s.categoria_id WHERE s.ativo = true;

-- ############### FIM 006 / INÍCIO 007 (seed) ###############
INSERT INTO config_empresa (id, nome, timezone)
SELECT gen_random_uuid(), 'Minha Empresa', 'America/Sao_Paulo'
WHERE NOT EXISTS (SELECT 1 FROM config_empresa LIMIT 1);

INSERT INTO unidades (empresa_id, nome, ativa, ordem)
SELECT e.id, 'Matriz', true, 1 FROM config_empresa e WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE empresa_id = e.id) LIMIT 1;

INSERT INTO salas (unidade_id, nome, ativa, ordem)
SELECT u.id, 'Sala 1', true, 1 FROM unidades u WHERE NOT EXISTS (SELECT 1 FROM salas WHERE unidade_id = u.id) LIMIT 1;

INSERT INTO categorias_servico (nome, cor, ordem, ativa)
SELECT 'Geral', '#22c55e', 1, true WHERE NOT EXISTS (SELECT 1 FROM categorias_servico LIMIT 1);

INSERT INTO config_horarios (empresa_id, dia_semana, abre, fecha, fechado)
SELECT e.id, n.dia, n.abre, n.fecha, n.fechado FROM config_empresa e
CROSS JOIN (VALUES (1, '09:00'::TIME, '18:00'::TIME, false), (2, '09:00'::TIME, '18:00'::TIME, false), (3, '09:00'::TIME, '18:00'::TIME, false), (4, '09:00'::TIME, '18:00'::TIME, false), (5, '09:00'::TIME, '18:00'::TIME, false), (6, '09:00'::TIME, '13:00'::TIME, false), (0, NULL, NULL, true)) AS n(dia, abre, fecha, fechado)
WHERE NOT EXISTS (SELECT 1 FROM config_horarios WHERE empresa_id = e.id LIMIT 1);

INSERT INTO financeiro_categorias (nome, tipo)
SELECT * FROM (VALUES ('Atendimentos'::TEXT, 'entrada'::tipo_movimentacao), ('Produtos', 'entrada'), ('Despesas operacionais', 'saida')) AS n(nome, tipo)
WHERE NOT EXISTS (SELECT 1 FROM financeiro_categorias LIMIT 1);

INSERT INTO config_planos (nome, descricao, limite_agendamentos_mes, limite_clientes, limite_profissionais, limite_unidades, recursos)
SELECT 'Profissional', 'Plano profissional', 500, 1000, 5, 2, ARRAY['Agenda ilimitada', 'Relatórios', 'WhatsApp']
WHERE NOT EXISTS (SELECT 1 FROM config_planos WHERE nome = 'Profissional');

INSERT INTO config_politicas (empresa_id, antecedencia_minima_horas, antecedencia_maxima_dias, limite_cancelamento_dias, score_minimo_sem_sinal)
SELECT e.id, 24, 90, 2, 70 FROM config_empresa e WHERE NOT EXISTS (SELECT 1 FROM config_politicas WHERE empresa_id = e.id);

INSERT INTO config_pagamentos (empresa_id, aceita_pix, aceita_cartao, aceita_dinheiro, cobranca_automatica_sinal)
SELECT e.id, true, true, true, false FROM config_empresa e WHERE NOT EXISTS (SELECT 1 FROM config_pagamentos WHERE empresa_id = e.id);

-- ############### FIM 007 / INÍCIO 008 ###############
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES config_usuarios(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_unidades_responsavel ON unidades(responsavel_id);

-- ############### FIM 008 / INÍCIO 009 ###############
-- (009_config_usuarios_profissional_id já aplicada inline se necessário)

-- ############### FIM 009 / INÍCIO 010 ###############
-- IA: Métricas e Inteligência Aplicada
CREATE TABLE IF NOT EXISTS ia_metricas (
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_ia_metricas_global ON ia_metricas(empresa_id, periodo_ano, periodo_mes) WHERE profissional_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_ia_metricas_prof ON ia_metricas(empresa_id, profissional_id, periodo_ano, periodo_mes) WHERE profissional_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ia_metricas_empresa ON ia_metricas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ia_metricas_profissional ON ia_metricas(profissional_id);
CREATE INDEX IF NOT EXISTS idx_ia_metricas_periodo ON ia_metricas(periodo_ano, periodo_mes);

ALTER TABLE inteligencia_insights ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE;
ALTER TABLE inteligencia_insights ADD COLUMN IF NOT EXISTS profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_inteligencia_insights_empresa ON inteligencia_insights(empresa_id);
CREATE INDEX IF NOT EXISTS idx_inteligencia_insights_profissional ON inteligencia_insights(profissional_id);

DROP TRIGGER IF EXISTS ia_metricas_updated_at ON ia_metricas;
CREATE TRIGGER ia_metricas_updated_at BEFORE UPDATE ON ia_metricas FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

ALTER TABLE ia_metricas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_ia_metricas" ON ia_metricas;
CREATE POLICY "allow_all_ia_metricas" ON ia_metricas FOR ALL USING (true);

-- Seed ia_metricas (global por empresa)
INSERT INTO ia_metricas (empresa_id, profissional_id, periodo_ano, periodo_mes, faltas_evitadas, receita_recuperada, encaixes_feitos, performance_percent)
SELECT e.id, NULL, EXTRACT(YEAR FROM NOW())::SMALLINT, EXTRACT(MONTH FROM NOW())::SMALLINT, 0, 0, 0, 0
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM ia_metricas im WHERE im.empresa_id = e.id AND im.profissional_id IS NULL)
LIMIT 1
;

-- Seed inteligencia_insights (4 tipos de insight)
INSERT INTO inteligencia_insights (empresa_id, tipo, titulo, descricao, dados)
SELECT e.id, 'aumento_preco', 'Este profissional pode aumentar preço em 8%.', 'Sugestão de aumento baseada em demanda e competitividade.', '{"percentual": 8}'::jsonb
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM inteligencia_insights ii WHERE ii.empresa_id = e.id AND ii.tipo = 'aumento_preco')
LIMIT 1;

INSERT INTO inteligencia_insights (empresa_id, tipo, titulo, descricao, dados)
SELECT e.id, 'alta_demanda', 'Alta demanda às quintas às 18h.', 'Horário de pico identificado.', '{"dia_semana": 4, "horario": "18:00"}'::jsonb
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM inteligencia_insights ii WHERE ii.empresa_id = e.id AND ii.tipo = 'alta_demanda')
LIMIT 1;

INSERT INTO inteligencia_insights (empresa_id, tipo, titulo, descricao, dados)
SELECT e.id, 'baixa_ocupacao', 'Baixa ocupação às terças 14h.', 'Slots ociosos com potencial.', '{"dia_semana": 2, "horario": "14:00"}'::jsonb
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM inteligencia_insights ii WHERE ii.empresa_id = e.id AND ii.tipo = 'baixa_ocupacao')
LIMIT 1;

INSERT INTO inteligencia_insights (empresa_id, tipo, titulo, descricao, dados)
SELECT e.id, 'perda_ociosidade', 'Está perdendo R$ 2.400/mês por ociosidade.', 'Receita potencial não realizada.', '{"valor_mensal": 2400}'::jsonb
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM inteligencia_insights ii WHERE ii.empresa_id = e.id AND ii.tipo = 'perda_ociosidade')
LIMIT 1;

-- ############### FIM - Migrações aplicadas ###############
