-- ============================================================
-- SISTEMA DE AGENDAMENTO ROBUSTO - Views e Funções para Agenda Inteligente
-- Depende de: 001, 002, 003
-- ============================================================

-- Timezone padrão para cálculos de dia
SET timezone = 'America/Sao_Paulo';

-- ============================================================
-- 1. VIEW: Agendamentos do dia (para agenda visual)
-- ============================================================
CREATE OR REPLACE VIEW v_agendamentos_dia AS
SELECT
  a.id,
  a.cliente_id,
  c.nome AS cliente_nome,
  a.profissional_id,
  p.nome AS profissional_nome,
  p.cor_agenda AS profissional_cor,
  a.servico_id,
  s.nome AS servico_nome,
  a.sala_id,
  sal.nome AS sala_nome,
  u.nome AS unidade_nome,
  a.inicio,
  a.fim,
  a.status,
  a.risco_nivel,
  a.valor,
  a.valor_sinal,
  a.sinal_pago,
  a.notas,
  a.titulo,
  a.lembrete_enviado,
  DATE(a.inicio AT TIME ZONE 'America/Sao_Paulo') AS dia
FROM agendamentos a
JOIN clientes c ON c.id = a.cliente_id
JOIN profissionais p ON p.id = a.profissional_id
LEFT JOIN servicos s ON s.id = a.servico_id
LEFT JOIN salas sal ON sal.id = a.sala_id
LEFT JOIN unidades u ON u.id = sal.unidade_id
WHERE a.status NOT IN ('cancelado', 'no_show');

-- ============================================================
-- 2. VIEW: Ocupação por profissional por dia
-- ============================================================
CREATE OR REPLACE VIEW v_ocupacao_profissional_dia AS
SELECT
  p.id AS profissional_id,
  p.nome AS profissional_nome,
  DATE(a.inicio AT TIME ZONE 'America/Sao_Paulo') AS dia,
  COUNT(a.id) AS total_agendamentos,
  COALESCE(SUM(a.valor), 0) AS receita_dia,
  COALESCE(SUM(EXTRACT(EPOCH FROM (a.fim - a.inicio)) / 60), 0)::INTEGER AS minutos_ocupados
FROM profissionais p
LEFT JOIN agendamentos a ON a.profissional_id = p.id
  AND a.status NOT IN ('cancelado', 'no_show')
  AND a.inicio >= NOW() - INTERVAL '1 year'
GROUP BY p.id, p.nome, DATE(a.inicio AT TIME ZONE 'America/Sao_Paulo');

-- ============================================================
-- 3. VIEW: Receita por dia (para gráficos)
-- ============================================================
CREATE OR REPLACE VIEW v_receita_por_dia AS
SELECT
  DATE(inicio AT TIME ZONE 'America/Sao_Paulo') AS dia,
  status,
  COUNT(*) AS total_agendamentos,
  COALESCE(SUM(valor), 0) AS valor_total
FROM agendamentos
WHERE status NOT IN ('cancelado', 'no_show')
GROUP BY DATE(inicio AT TIME ZONE 'America/Sao_Paulo'), status;

-- ============================================================
-- 4. VIEW: Indicadores do dia (dashboard agenda)
-- ============================================================
CREATE OR REPLACE VIEW v_indicadores_dia AS
WITH dia_atual AS (
  SELECT DATE(NOW() AT TIME ZONE 'America/Sao_Paulo') AS hoje
),
agendamentos_hoje AS (
  SELECT a.id, a.profissional_id, a.valor, a.risco_nivel
  FROM agendamentos a, dia_atual d
  WHERE DATE(a.inicio AT TIME ZONE 'America/Sao_Paulo') = d.hoje
    AND a.status NOT IN ('cancelado', 'no_show')
),
profissionais_ativos AS (
  SELECT COUNT(DISTINCT ph.profissional_id) AS total
  FROM profissionais_horarios ph
  JOIN profissionais p ON p.id = ph.profissional_id
  WHERE p.ativo AND ph.fechado = false
    AND ph.dia_semana = EXTRACT(DOW FROM (SELECT hoje FROM dia_atual))::SMALLINT
),
minutos_previstos AS (
  SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (a.fim - a.inicio)) / 60), 0)::NUMERIC AS minutos
  FROM agendamentos a, dia_atual d
  WHERE DATE(a.inicio AT TIME ZONE 'America/Sao_Paulo') = d.hoje
    AND a.status NOT IN ('cancelado', 'no_show')
)
SELECT
  (SELECT COUNT(*) FROM agendamentos_hoje) AS total_agendamentos,
  (SELECT COALESCE(SUM(valor), 0) FROM agendamentos_hoje) AS receita_prevista_dia,
  (SELECT COUNT(*) FROM agendamentos_hoje WHERE risco_nivel = 'alto') AS risco_noshow_hoje,
  (SELECT total FROM profissionais_ativos) AS profissionais_ativos;

-- ============================================================
-- 5. FUNÇÃO: Slots livres por profissional em um dia
-- ============================================================
CREATE OR REPLACE FUNCTION fn_slots_livres_profissional(
  p_profissional_id UUID,
  p_dia DATE,
  p_intervalo_min INTEGER DEFAULT 30
)
RETURNS TABLE (
  inicio_slot TIME,
  fim_slot TIME,
  duracao_min INTEGER
) AS $$
DECLARE
  v_abre TIME := '08:00';
  v_fecha TIME := '18:00';
  v_dia_semana SMALLINT;
BEGIN
  v_dia_semana := EXTRACT(DOW FROM p_dia)::SMALLINT;

  SELECT ph.abre, ph.fecha INTO v_abre, v_fecha
  FROM profissionais_horarios ph
  WHERE ph.profissional_id = p_profissional_id AND ph.dia_semana = v_dia_semana AND ph.fechado = false
  LIMIT 1;

  IF v_abre IS NULL THEN
    v_abre := '08:00';
    v_fecha := '18:00';
  END IF;

  RETURN QUERY
  WITH RECURSIVE slots AS (
    SELECT v_abre AS ini
    UNION ALL
    SELECT (ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME
    FROM slots
    WHERE (ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME < v_fecha
  ),
  agendados AS (
    SELECT (a.inicio AT TIME ZONE 'America/Sao_Paulo')::TIME AS ini_ag,
           (a.fim AT TIME ZONE 'America/Sao_Paulo')::TIME AS fim_ag
    FROM agendamentos a
    WHERE a.profissional_id = p_profissional_id
      AND DATE(a.inicio AT TIME ZONE 'America/Sao_Paulo') = p_dia
      AND a.status NOT IN ('cancelado', 'no_show')
  ),
  bloqueios AS (
    SELECT (b.inicio AT TIME ZONE 'America/Sao_Paulo')::TIME AS ini_bl,
           (b.fim AT TIME ZONE 'America/Sao_Paulo')::TIME AS fim_bl
    FROM agenda_bloqueios b
    WHERE b.profissional_id = p_profissional_id
      AND DATE(b.inicio AT TIME ZONE 'America/Sao_Paulo') = p_dia
  )
  SELECT
    s.ini AS inicio_slot,
    (s.ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME AS fim_slot,
    p_intervalo_min AS duracao_min
  FROM slots s
  WHERE NOT EXISTS (
    SELECT 1 FROM agendados ag
    WHERE s.ini < ag.fim_ag AND (s.ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME > ag.ini_ag
  )
  AND NOT EXISTS (
    SELECT 1 FROM bloqueios bl
    WHERE s.ini < bl.fim_bl AND (s.ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME > bl.ini_bl
  )
  AND (s.ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME <= v_fecha;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- 6. FUNÇÃO: Conflitos de agendamento (validação)
-- ============================================================
CREATE OR REPLACE FUNCTION fn_agendamento_tem_conflito(
  p_profissional_id UUID,
  p_inicio TIMESTAMPTZ,
  p_fim TIMESTAMPTZ,
  p_agendamento_id_excluir UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM agendamentos a
    WHERE a.profissional_id = p_profissional_id
      AND (p_agendamento_id_excluir IS NULL OR a.id != p_agendamento_id_excluir)
      AND a.status NOT IN ('cancelado', 'no_show')
      AND (a.inicio, a.fim) OVERLAPS (p_inicio, p_fim)
  )
  OR EXISTS (
    SELECT 1 FROM agenda_bloqueios b
    WHERE b.profissional_id = p_profissional_id
      AND (b.inicio, b.fim) OVERLAPS (p_inicio, p_fim)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- 7. TRIGGER: Validar conflito ao inserir/atualizar agendamento
-- ============================================================
CREATE OR REPLACE FUNCTION trg_agendamento_check_conflito()
RETURNS TRIGGER AS $$
BEGIN
  IF fn_agendamento_tem_conflito(
    NEW.profissional_id,
    NEW.inicio,
    NEW.fim,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.id ELSE NULL END
  ) THEN
    RAISE EXCEPTION 'Conflito de horário: profissional já possui agendamento ou bloqueio neste período.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agendamento_check_conflito ON agendamentos;
CREATE TRIGGER agendamento_check_conflito
  BEFORE INSERT OR UPDATE OF profissional_id, inicio, fim ON agendamentos
  FOR EACH ROW EXECUTE PROCEDURE trg_agendamento_check_conflito();

-- ============================================================
-- 8. VIEW: Lista de espera com nomes (para UI)
-- ============================================================
CREATE OR REPLACE VIEW v_lista_espera AS
SELECT
  le.id,
  le.cliente_id,
  c.nome AS cliente_nome,
  le.servico_id,
  s.nome AS servico_nome,
  le.unidade_id,
  u.nome AS unidade_nome,
  le.profissional_id,
  p.nome AS profissional_nome,
  le.prioridade,
  le.probabilidade_aceite,
  le.atendido,
  le.agendamento_id,
  le.created_at
FROM lista_espera le
JOIN clientes c ON c.id = le.cliente_id
LEFT JOIN servicos s ON s.id = le.servico_id
LEFT JOIN unidades u ON u.id = le.unidade_id
LEFT JOIN profissionais p ON p.id = le.profissional_id
WHERE le.atendido = false
ORDER BY le.prioridade ASC, le.created_at ASC;

-- ============================================================
-- 9. VIEW: Alertas não lidos (para dashboard)
-- ============================================================
CREATE OR REPLACE VIEW v_alertas_nao_lidos AS
SELECT *
FROM alertas
WHERE lido = false
  AND (expira_em IS NULL OR expira_em > NOW())
ORDER BY prioridade DESC, created_at DESC;

-- ============================================================
-- 10. VIEW: Resumo financeiro do mês (para dashboard)
-- ============================================================
CREATE OR REPLACE VIEW v_resumo_financeiro_mes AS
SELECT
  DATE_TRUNC('month', a.inicio AT TIME ZONE 'America/Sao_Paulo')::DATE AS mes,
  COUNT(*) FILTER (WHERE a.status IN ('confirmado', 'em_atendimento', 'concluido')) AS total_confirmados,
  COALESCE(SUM(a.valor) FILTER (WHERE a.status IN ('confirmado', 'em_atendimento', 'concluido')), 0) AS receita_confirmada,
  COALESCE(SUM(a.valor) FILTER (WHERE a.status = 'pendente' OR a.status = 'aguardando_pagamento'), 0) AS receita_prevista,
  COUNT(*) FILTER (WHERE a.status = 'cancelado') AS total_cancelados,
  COALESCE(SUM(a.valor) FILTER (WHERE a.status = 'no_show'), 0) AS receita_perdida_noshow
FROM agendamentos a
WHERE a.inicio >= DATE_TRUNC('month', CURRENT_DATE)
  AND a.inicio < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY DATE_TRUNC('month', a.inicio AT TIME ZONE 'America/Sao_Paulo');

-- ============================================================
-- 11. VIEW: Profissionais com salas (para filtros agenda)
-- ============================================================
CREATE OR REPLACE VIEW v_profissionais_unidade AS
SELECT
  p.id,
  p.nome,
  p.cor_agenda,
  p.unidade_id,
  u.nome AS unidade_nome,
  p.especialidade,
  p.ativo
FROM profissionais p
LEFT JOIN unidades u ON u.id = p.unidade_id
WHERE p.ativo = true;

-- ============================================================
-- 12. VIEW: Serviços com categoria (para filtros)
-- ============================================================
CREATE OR REPLACE VIEW v_servicos_categoria AS
SELECT
  s.id,
  s.nome,
  s.duracao_minutos,
  s.valor_base,
  s.categoria_id,
  cat.nome AS categoria_nome,
  cat.cor AS categoria_cor,
  s.ativo
FROM servicos s
LEFT JOIN categorias_servico cat ON cat.id = s.categoria_id
WHERE s.ativo = true;
