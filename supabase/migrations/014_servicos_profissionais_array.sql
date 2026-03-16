-- Adiciona coluna profissionais na tabela servicos (array de IDs ou nomes)
-- profissional_ids: array de UUIDs (referência aos profissionais)
-- profissional_nomes: array de TEXT (nomes, útil para exibição/backup)
ALTER TABLE servicos
  ADD COLUMN IF NOT EXISTS profissional_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS profissional_nomes TEXT[] DEFAULT '{}';

COMMENT ON COLUMN servicos.profissional_ids IS 'IDs dos profissionais vinculados ao serviço';
COMMENT ON COLUMN servicos.profissional_nomes IS 'Nomes dos profissionais (opcional, para exibição sem JOIN)';
