-- ============================================================
-- SISTEMA DE AGENDAMENTO ROBUSTO - Seed mínimo (1 empresa, 1 unidade, 1 sala, 1 categoria)
-- Opcional: execute após aplicar as migrações para ter dados iniciais
-- ============================================================

-- Só insere se não existir nenhuma empresa (evita duplicar em re-runs)
INSERT INTO config_empresa (id, nome, timezone)
SELECT gen_random_uuid(), 'Minha Empresa', 'America/Sao_Paulo'
WHERE NOT EXISTS (SELECT 1 FROM config_empresa LIMIT 1);

-- Uma unidade vinculada à primeira empresa
INSERT INTO unidades (empresa_id, nome, ativa, ordem)
SELECT e.id, 'Matriz', true, 1
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE empresa_id = e.id)
LIMIT 1;

-- Uma sala na primeira unidade
INSERT INTO salas (unidade_id, nome, ativa, ordem)
SELECT u.id, 'Sala 1', true, 1
FROM unidades u
WHERE NOT EXISTS (SELECT 1 FROM salas WHERE unidade_id = u.id)
LIMIT 1;

-- Uma categoria de serviço
INSERT INTO categorias_servico (nome, cor, ordem, ativa)
SELECT 'Geral', '#22c55e', 1, true
WHERE NOT EXISTS (SELECT 1 FROM categorias_servico LIMIT 1);

-- Horários padrão da empresa (Seg-Sáb 09-18, Dom fechado)
INSERT INTO config_horarios (empresa_id, dia_semana, abre, fecha, fechado)
SELECT e.id, n.dia, n.abre, n.fecha, n.fechado
FROM config_empresa e
CROSS JOIN (VALUES
  (1, '09:00'::TIME, '18:00'::TIME, false),
  (2, '09:00'::TIME, '18:00'::TIME, false),
  (3, '09:00'::TIME, '18:00'::TIME, false),
  (4, '09:00'::TIME, '18:00'::TIME, false),
  (5, '09:00'::TIME, '18:00'::TIME, false),
  (6, '09:00'::TIME, '13:00'::TIME, false),
  (0, NULL, NULL, true)
) AS n(dia, abre, fecha, fechado)
WHERE NOT EXISTS (SELECT 1 FROM config_horarios WHERE empresa_id = e.id LIMIT 1);

-- Categorias financeiras básicas
INSERT INTO financeiro_categorias (nome, tipo)
SELECT * FROM (VALUES
  ('Atendimentos'::TEXT, 'entrada'::tipo_movimentacao),
  ('Produtos', 'entrada'),
  ('Despesas operacionais', 'saida')
) AS n(nome, tipo)
WHERE NOT EXISTS (SELECT 1 FROM financeiro_categorias LIMIT 1);

-- Plano padrão (para config_assinatura)
INSERT INTO config_planos (nome, descricao, limite_agendamentos_mes, limite_clientes, limite_profissionais, limite_unidades, recursos)
SELECT 'Profissional', 'Plano profissional', 500, 1000, 5, 2, ARRAY['Agenda ilimitada', 'Relatórios', 'WhatsApp']
WHERE NOT EXISTS (SELECT 1 FROM config_planos WHERE nome = 'Profissional');

-- Políticas padrão (uma por empresa)
INSERT INTO config_politicas (empresa_id, antecedencia_minima_horas, antecedencia_maxima_dias, limite_cancelamento_dias, score_minimo_sem_sinal)
SELECT e.id, 24, 90, 2, 70
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM config_politicas WHERE empresa_id = e.id);

-- Config pagamentos (uma por empresa)
INSERT INTO config_pagamentos (empresa_id, aceita_pix, aceita_cartao, aceita_dinheiro, cobranca_automatica_sinal)
SELECT e.id, true, true, true, false
FROM config_empresa e
WHERE NOT EXISTS (SELECT 1 FROM config_pagamentos WHERE empresa_id = e.id);
