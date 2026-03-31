-- ============================================================
-- Atualiza horários padrão da agenda: 07:00 às 20:00 (Seg-Sex), 07:00 às 13:00 (Sáb)
-- ============================================================

UPDATE config_horarios
SET abre = '07:00'::TIME, fecha = '20:00'::TIME
WHERE fechado = false AND dia_semana BETWEEN 1 AND 5;

UPDATE config_horarios
SET abre = '07:00'::TIME, fecha = '13:00'::TIME
WHERE fechado = false AND dia_semana = 6;
