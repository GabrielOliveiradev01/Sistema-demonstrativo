-- Garantir que servicos tenha descricao e observacao
ALTER TABLE servicos
  ADD COLUMN IF NOT EXISTS descricao TEXT,
  ADD COLUMN IF NOT EXISTS observacao TEXT;

COMMENT ON COLUMN servicos.descricao IS 'Descrição geral do serviço/procedimento';
COMMENT ON COLUMN servicos.observacao IS 'Observações internas (ex: cuidados, materiais, notas)';
