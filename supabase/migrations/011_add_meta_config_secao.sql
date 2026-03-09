-- Adiciona "meta" às config_secoes dos perfis admin e gerente (se ainda não tiver)
UPDATE config_perfis
SET permissoes_extra = jsonb_set(
  COALESCE(permissoes_extra, '{}'::jsonb),
  '{config_secoes}',
  COALESCE(permissoes_extra->'config_secoes', '["perfil","unidades","horarios","permissoes","politicas","plano"]'::jsonb) || '["meta"]'::jsonb
)
WHERE slug IN ('admin', 'gerente')
  AND (permissoes_extra->'config_secoes' IS NULL OR NOT (permissoes_extra->'config_secoes' @> '["meta"]'));
