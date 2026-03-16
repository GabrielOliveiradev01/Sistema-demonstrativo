-- Permitir múltiplos horários por dia (ex: 12:30-14:00 e 16:00-20:00 no mesmo dia)
-- Remove UNIQUE e adiciona ordem para distinguir faixas no mesmo dia
ALTER TABLE profissionais_horarios DROP CONSTRAINT IF EXISTS profissionais_horarios_profissional_id_dia_semana_key;
ALTER TABLE profissionais_horarios ADD COLUMN IF NOT EXISTS ordem SMALLINT DEFAULT 0;

-- Atualiza função de slots livres para considerar todas as faixas do dia
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
  v_dia_semana SMALLINT;
BEGIN
  v_dia_semana := EXTRACT(DOW FROM p_dia)::SMALLINT;

  RETURN QUERY
  WITH RECURSIVE faixas AS (
    SELECT ph.abre, ph.fecha
    FROM profissionais_horarios ph
    WHERE ph.profissional_id = p_profissional_id
      AND ph.dia_semana = v_dia_semana
      AND ph.fechado = false
      AND ph.abre IS NOT NULL
      AND ph.fecha IS NOT NULL
  ),
  slots_gerados AS (
    SELECT f.abre AS ini, f.fecha AS fim_faixa FROM faixas f
    UNION ALL
    SELECT (sg.ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME, sg.fim_faixa
    FROM slots_gerados sg
    WHERE (sg.ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME < sg.fim_faixa
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
    sg.ini AS inicio_slot,
    (sg.ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME AS fim_slot,
    p_intervalo_min AS duracao_min
  FROM slots_gerados sg
  WHERE (sg.ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME <= sg.fim_faixa
    AND NOT EXISTS (
      SELECT 1 FROM agendados ag
      WHERE sg.ini < ag.fim_ag AND (sg.ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME > ag.ini_ag
    )
    AND NOT EXISTS (
      SELECT 1 FROM bloqueios bl
      WHERE sg.ini < bl.fim_bl AND (sg.ini + (p_intervalo_min || ' minutes')::INTERVAL)::TIME > bl.ini_bl
    );
END;
$$ LANGUAGE plpgsql STABLE;
