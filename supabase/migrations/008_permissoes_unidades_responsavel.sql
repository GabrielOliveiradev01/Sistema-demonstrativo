-- Responsável por unidade
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES config_usuarios(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_unidades_responsavel ON unidades(responsavel_id);

-- Seed perfis com permissões de abas (permissoes_extra)
-- admin: vê tudo | gerente: vê tudo | recepcao: sem financeiro/inteligencia/analytics | profissional: só agenda e dashboard
-- Estrutura: {"abas": ["dashboard","agenda",...], "config_secoes": ["perfil","unidades","horarios","permissoes","politicas","plano"]}

INSERT INTO config_perfis (empresa_id, nome, slug, ver_financeiro, editar_preco, cancelar_agendamento, dar_desconto, ver_relatorios, gerenciar_usuarios, permissoes_extra)
SELECT e.id, 'Admin', 'admin', true, true, true, true, true, true,
  '{"abas":["dashboard","agenda","clientes","profissionais","servicos","financeiro","inteligencia","automacao","analytics","configuracoes"],"config_secoes":["perfil","unidades","horarios","permissoes","politicas","plano"]}'::jsonb
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM config_perfis WHERE empresa_id = e.id AND slug = 'admin')
LIMIT 1;

INSERT INTO config_perfis (empresa_id, nome, slug, ver_financeiro, editar_preco, cancelar_agendamento, dar_desconto, ver_relatorios, gerenciar_usuarios, permissoes_extra)
SELECT e.id, 'Gerente', 'gerente', true, true, true, true, true, false,
  '{"abas":["dashboard","agenda","clientes","profissionais","servicos","financeiro","inteligencia","automacao","analytics","configuracoes"],"config_secoes":["perfil","unidades","horarios","permissoes","politicas","plano"]}'::jsonb
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM config_perfis WHERE empresa_id = e.id AND slug = 'gerente')
LIMIT 1;

INSERT INTO config_perfis (empresa_id, nome, slug, ver_financeiro, editar_preco, cancelar_agendamento, dar_desconto, ver_relatorios, gerenciar_usuarios, permissoes_extra)
SELECT e.id, 'Recepção', 'recepcao', false, false, true, false, false, false,
  '{"abas":["dashboard","agenda","clientes","profissionais","servicos"],"config_secoes":["perfil","unidades","horarios"]}'::jsonb
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM config_perfis WHERE empresa_id = e.id AND slug = 'recepcao')
LIMIT 1;

INSERT INTO config_perfis (empresa_id, nome, slug, ver_financeiro, editar_preco, cancelar_agendamento, dar_desconto, ver_relatorios, gerenciar_usuarios, permissoes_extra)
SELECT e.id, 'Profissional', 'profissional', false, false, false, false, false, false,
  '{"abas":["dashboard","agenda"],"config_secoes":[]}'::jsonb
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM config_perfis WHERE empresa_id = e.id AND slug = 'profissional')
LIMIT 1;
