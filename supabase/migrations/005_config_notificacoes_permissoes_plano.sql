-- ============================================================
-- SISTEMA DE AGENDAMENTO ROBUSTO - Config: Notificações, Permissões, Integrações, Políticas, Plano
-- Depende de: 001, 002
-- ============================================================

-- ============================================================
-- 1. CONFIG NOTIFICAÇÕES (canais e templates)
-- ============================================================
CREATE TABLE config_notificacoes_canal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  canal TEXT NOT NULL, -- 'whatsapp', 'email', 'sms', 'push'
  ativo BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, canal)
);

CREATE TABLE config_notificacoes_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'confirmacao', 'lembrete', 'cancelamento', 'pos_atendimento'
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

-- ============================================================
-- 2. PERFIS DE PERMISSÃO
-- ============================================================
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

-- Usuários do sistema (vinculados ao Supabase Auth)
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

-- ============================================================
-- 3. INTEGRAÇÕES
-- ============================================================
CREATE TABLE config_integracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES config_empresa(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'api', 'webhook', 'google_calendar', 'meta_ads'
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, tipo)
);

-- ============================================================
-- 4. POLÍTICAS DE NEGÓCIO
-- ============================================================
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

-- ============================================================
-- 5. PLANO E ASSINATURA
-- ============================================================
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

-- ============================================================
-- 6. RLS
-- ============================================================
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

-- ============================================================
-- Triggers
-- ============================================================
CREATE TRIGGER config_notif_canal_updated_at BEFORE UPDATE ON config_notificacoes_canal FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER config_templates_updated_at BEFORE UPDATE ON config_notificacoes_templates FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER config_perfis_updated_at BEFORE UPDATE ON config_perfis FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER config_usuarios_updated_at BEFORE UPDATE ON config_usuarios FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER config_integracoes_updated_at BEFORE UPDATE ON config_integracoes FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER config_politicas_updated_at BEFORE UPDATE ON config_politicas FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER config_assinatura_updated_at BEFORE UPDATE ON config_assinatura FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
