-- Normaliza timestamps inseridos por integrações (n8n) quando chegarem como UTC (+00)
-- mas representarem horário local da clínica (America/Sao_Paulo).
--
-- Como o Postgres armazena TIMESTAMPTZ internamente em UTC, a forma mais robusta
-- é garantir que o n8n envie o horário correto (com offset -03:00 ou já convertido).
-- Este trigger é uma "rede de segurança" opcional: ele só atua quando:
-- - canal_origem = 'n8n'
-- - e o timestamp está com offset +00 (string termina em +00 ou +00:00)
--
-- Ajuste o intervalo se sua clínica não estiver em -03.

CREATE OR REPLACE FUNCTION public.normalize_agendamento_timezone_n8n()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  inicio_txt text;
  fim_txt text;
  is_utc boolean;
BEGIN
  IF NEW.canal_origem IS DISTINCT FROM 'n8n' THEN
    RETURN NEW;
  END IF;

  inicio_txt := NEW.inicio::text;
  fim_txt := NEW.fim::text;
  is_utc :=
    right(inicio_txt, 3) = '+00'
    OR right(inicio_txt, 6) = '+00:00';

  IF is_utc THEN
    -- Converte 09:00Z (interpretado como horário local enviado por engano em UTC)
    -- para 09:00-03 => 12:00Z, somando 3 horas.
    NEW.inicio := NEW.inicio + interval '3 hours';
    NEW.fim := NEW.fim + interval '3 hours';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_agendamento_timezone_n8n ON public.agendamentos;
CREATE TRIGGER trg_normalize_agendamento_timezone_n8n
BEFORE INSERT OR UPDATE OF inicio, fim, canal_origem
ON public.agendamentos
FOR EACH ROW
EXECUTE FUNCTION public.normalize_agendamento_timezone_n8n();

