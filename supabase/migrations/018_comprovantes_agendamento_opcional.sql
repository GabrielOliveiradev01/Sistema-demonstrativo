-- Torna agendamento_id opcional em comprovantes_pagamento

ALTER TABLE comprovantes_pagamento
  ALTER COLUMN agendamento_id DROP NOT NULL;

