
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS client_name text;

-- Backfill client_name from matching preventivi (json_dati->cliente->nome)
UPDATE public.quotes q
SET client_name = COALESCE(
  NULLIF(p.json_dati->'cliente'->>'nome',''),
  NULLIF(p.cliente_nome,'')
)
FROM public.preventivi p
WHERE q.client_name IS NULL
  AND q.quote_number IS NOT NULL
  AND p.numero_preventivo = q.quote_number;
