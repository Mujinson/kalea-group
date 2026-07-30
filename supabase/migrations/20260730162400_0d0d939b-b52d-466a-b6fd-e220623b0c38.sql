-- 1) brand_id da brand testuale
UPDATE public.catalog_products p
SET brand_id = b.id
FROM public.catalog_brands b
WHERE p.brand_id IS NULL
  AND p.brand IS NOT NULL
  AND lower(btrim(p.brand)) = lower(btrim(b.name));

-- 2) brand_id da collection/product_code (euristica per fornitori noti)
UPDATE public.catalog_products p
SET brand_id = b.id
FROM public.catalog_brands b
WHERE p.brand_id IS NULL
  AND (
    (lower(b.name) = 'flow' AND (lower(coalesce(p.collection,'')) LIKE 'flow%' OR p.product_code LIKE 'FLOW-%' OR p.product_code LIKE 'FL-%'))
    OR (lower(b.name) = 'woodco' AND (lower(coalesce(p.collection,'')) LIKE 'woodco%' OR p.product_code LIKE 'WOO-%' OR p.product_code LIKE 'WC-%'))
    OR (lower(b.name) = 'kronos ceramiche' AND (lower(coalesce(p.collection,'')) LIKE '%kronos%' OR lower(coalesce(p.name,'')) LIKE '%kronos%'))
    OR (lower(b.name) = 'berry alloc' AND (lower(coalesce(p.collection,'')) LIKE '%berry%' OR p.product_code LIKE 'BER-%'))
    OR (lower(b.name) = 'externo' AND (lower(coalesce(p.collection,'')) LIKE 'externo%' OR p.product_code LIKE 'EXT-%'))
  );

-- 3) allinea il testo brand al nome ufficiale
UPDATE public.catalog_products p
SET brand = b.name
FROM public.catalog_brands b
WHERE p.brand_id = b.id
  AND (p.brand IS NULL OR btrim(p.brand) <> b.name);