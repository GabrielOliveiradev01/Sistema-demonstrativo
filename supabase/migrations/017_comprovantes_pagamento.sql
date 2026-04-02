-- Comprovantes de pagamento vinculados a agendamentos

DO $$ BEGIN
  CREATE TYPE status_comprovante_pagamento AS ENUM ('pagamento_feito', 'nao_realizada');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS comprovantes_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
  data_pagamento TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status status_comprovante_pagamento NOT NULL DEFAULT 'pagamento_feito',
  valor_realizado DECIMAL(12,2),
  valor_comprovante DECIMAL(12,2),
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comprovantes_agendamento ON comprovantes_pagamento(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_comprovantes_data ON comprovantes_pagamento(data_pagamento DESC);
CREATE INDEX IF NOT EXISTS idx_comprovantes_status ON comprovantes_pagamento(status);

ALTER TABLE comprovantes_pagamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_comprovantes_pagamento" ON comprovantes_pagamento FOR ALL USING (true);

-- Trigger updated_at
DROP TRIGGER IF EXISTS comprovantes_pagamento_updated_at ON comprovantes_pagamento;
CREATE TRIGGER comprovantes_pagamento_updated_at
BEFORE UPDATE ON comprovantes_pagamento
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

