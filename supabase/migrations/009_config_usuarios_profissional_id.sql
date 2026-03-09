-- Vincular config_usuarios ao profissional (quando o login é do próprio profissional)
ALTER TABLE config_usuarios ADD COLUMN IF NOT EXISTS profissional_id UUID REFERENCES profissionais(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_config_usuarios_profissional ON config_usuarios(profissional_id);
