
-- 1) Assegna categorie a prodotti esistenti
WITH cats AS (
  SELECT
    (SELECT id FROM public.product_categories WHERE name='Pavimenti') AS pavimenti,
    (SELECT id FROM public.product_categories WHERE name='Ceramiche') AS ceramiche,
    (SELECT id FROM public.product_categories WHERE name='Accessori') AS accessori
)
UPDATE public.catalog_products cp
SET category_id = CASE
  WHEN cp.brand ILIKE '%Kronos%' AND (cp.name ILIKE '%battiscopa%' OR cp.name ILIKE '%profilo%' OR cp.name ILIKE '%pezzi speciali%') THEN (SELECT accessori FROM cats)
  WHEN cp.brand ILIKE '%Kronos%' THEN (SELECT ceramiche FROM cats)
  WHEN (
    cp.name ILIKE '%battiscopa%' OR cp.name ILIKE '%profilo%' OR cp.name ILIKE '%clip%' OR cp.name ILIKE '%vite%'
    OR cp.name ILIKE '%piedino%' OR cp.name ILIKE '%magatello%' OR cp.name ILIKE '%nastro%'
    OR cp.name ILIKE '%isoldrum%' OR cp.name ILIKE '%nylon%' OR cp.name ILIKE '%ardex%'
    OR cp.name ILIKE '%lastra%' OR cp.name ILIKE '%cleaner%' OR cp.name ILIKE '%care%'
    OR cp.name ILIKE '%scala%' OR cp.name ILIKE '%paragradino%' OR cp.name ILIKE '%giunto%'
    OR cp.name ILIKE '%fascia%' OR cp.name ILIKE '%tappo%' OR cp.name ILIKE '%livellatore%'
    OR cp.name ILIKE '%supporto%' OR cp.name ILIKE '%adesiv%' OR cp.name ILIKE '%collante%'
    OR cp.name ILIKE '%colla%' OR cp.name ILIKE '%foglio%' OR cp.name ILIKE '%materassino%'
    OR cp.name ILIKE '%sottofondo%' OR cp.name ILIKE '%primer%' OR cp.name ILIKE '%raccordo%'
    OR cp.name ILIKE '%finitura%' OR cp.name ILIKE '%barriera%'
  ) THEN (SELECT accessori FROM cats)
  ELSE (SELECT pavimenti FROM cats)
END
WHERE cp.category_id IS NULL;

-- 2) Externo: pavimenti + accessori + supporti (mancanti a catalogo)
WITH cats AS (
  SELECT
    (SELECT id FROM public.product_categories WHERE name='Pavimenti') AS pavimenti,
    (SELECT id FROM public.product_categories WHERE name='Accessori') AS accessori,
    (SELECT id FROM public.product_categories WHERE name='Servizi')   AS servizi
)
INSERT INTO public.catalog_products (product_code, name, brand, category_id, list_price, unit_of_measure, format, notes, is_active)
SELECT v.code, v.name, v.brand, v.cat_id, v.price, v.unit, v.fmt, v.notes, true FROM (VALUES
  -- Externo pavimenti
  ('EXT-SKUDO', 'Externo SKUDO',        'Externo', (SELECT pavimenti FROM cats), 94.40, 'mq', '2000×138×23 mm', 'Premium antimacchia — Ipe, Teak, Antique, Golden, Sand'),
  ('EXT-TRAD',  'Externo TRADITIONAL',  'Externo', (SELECT pavimenti FROM cats), 79.70, 'mq', '2000×140×25 mm', 'Composito standard — Light Brown, Dark Grey'),
  -- Externo struttura
  ('EXT-STR-SKUDO','Struttura completa con SKUDO','Externo',(SELECT accessori FROM cats),156.80,'mq',NULL,'Magatello 40×20 + giunzioni + clip + viti'),
  ('EXT-STR-TRAD', 'Struttura completa con TRADITIONAL','Externo',(SELECT accessori FROM cats),142.00,'mq',NULL,'Magatello 40×20 + giunzioni + clip + viti'),
  ('EXT-MAG-5030','Magatello alluminio 50×30×2000','Externo',(SELECT accessori FROM cats),15.60,'ml','50×30×2000 mm','Inc. media 3,5 ml/mq'),
  ('EXT-MAG-4020','Magatello alluminio 40×20×2000','Externo',(SELECT accessori FROM cats),12.40,'ml','40×20×2000 mm','Inc. media 3,5 ml/mq'),
  ('EXT-GIU-4025','Elemento giunzione 40×25×150','Externo',(SELECT accessori FROM cats),4.60,'pz','40×25×150 mm','Per magatelli 50×30 — inc. 1,5 pz/mq'),
  ('EXT-GIU-3015','Elemento giunzione 30×15×150','Externo',(SELECT accessori FROM cats),3.80,'pz','30×15×150 mm','Per magatelli 40×20 — inc. 1,5 pz/mq'),
  -- Externo accessori decking
  ('EXT-FASC-S','Fascia perimetrale SKUDO 115×9×2000','Externo',(SELECT accessori FROM cats),7.30,'ml',NULL,NULL),
  ('EXT-FASC-T','Fascia perimetrale TRADITIONAL 140×12×2000','Externo',(SELECT accessori FROM cats),9.40,'ml',NULL,NULL),
  ('EXT-L-S','Profilo a L 50×50×2000 (SKUDO)','Externo',(SELECT accessori FROM cats),6.40,'ml',NULL,NULL),
  ('EXT-L-T','Profilo a L 53×41×2000 (TRADITIONAL)','Externo',(SELECT accessori FROM cats),4.90,'ml',NULL,NULL),
  ('EXT-PART-S','Tavola partenza bordata SKUDO 138×23×2000','Externo',(SELECT accessori FROM cats),19.70,'ml',NULL,NULL),
  ('EXT-PART-T','Tavola partenza bordata TRAD 150×25×2000','Externo',(SELECT accessori FROM cats),20.20,'ml',NULL,NULL),
  ('EXT-TAPPO','Tappi di chiusura coordinati','Externo',(SELECT accessori FROM cats),0.80,'pz',NULL,NULL),
  ('EXT-CLIP-B','Clip bloccaggio acciaio','Externo',(SELECT accessori FROM cats),0.35,'pz',NULL,'Inc. 6 pz/mq'),
  ('EXT-CLIP-E','Clip espansione plastica','Externo',(SELECT accessori FROM cats),0.20,'pz',NULL,'Inc. 22 pz/mq'),
  ('EXT-VITE-39','Vite autoforante zincato 3,9×25 mm','Externo',(SELECT accessori FROM cats),0.18,'pz',NULL,NULL),
  ('EXT-CLIP-3F','Clip aggancio acciaio 3 fori','Externo',(SELECT accessori FROM cats),0.35,'pz',NULL,'Inc. 28 pz/mq'),
  ('EXT-CLEAN','Externo Cleaner 1 lt','Externo',(SELECT accessori FROM cats),26.70,'pz',NULL,NULL),
  -- Externo supporti
  ('EXT-SUP-1015','Primeup H.10-15 mm','Externo',(SELECT accessori FROM cats),2.60,'pz',NULL,'Inc. 10 pz/mq'),
  ('EXT-SUP-2540','Piedino H.25-40 mm','Externo',(SELECT accessori FROM cats),4.90,'pz',NULL,'Inc. 10 pz/mq'),
  ('EXT-SUP-4060','Piedino H.40-60 mm','Externo',(SELECT accessori FROM cats),5.40,'pz',NULL,'Inc. 10 pz/mq'),
  ('EXT-SUP-60100','Piedino H.60-100 mm','Externo',(SELECT accessori FROM cats),5.70,'pz',NULL,'Inc. 10 pz/mq'),
  ('EXT-SUP-100180','Piedino H.100-180 mm','Externo',(SELECT accessori FROM cats),6.30,'pz',NULL,'Inc. 10 pz/mq'),
  ('EXT-LIV-GOMMA','Livellatore gomma antishock','Externo',(SELECT accessori FROM cats),0.60,'pz',NULL,NULL),

  -- Servizi standard Kalēa
  ('SRV-LEV-PARQ','Levigatura pavimento in legno','Kalēa Servizi',(SELECT servizi FROM cats),22.00,'mq',NULL,'3 passaggi grana 40/80/120'),
  ('SRV-VER-PARQ','Verniciatura pavimento in legno','Kalēa Servizi',(SELECT servizi FROM cats),15.00,'mq',NULL,'2 mani vernice opaca'),
  ('SRV-VER-3M','Verniciatura pavimento — 3 mani','Kalēa Servizi',(SELECT servizi FROM cats),20.00,'mq',NULL,NULL),
  ('SRV-OLIO-PARQ','Oliatura pavimento in legno','Kalēa Servizi',(SELECT servizi FROM cats),18.00,'mq',NULL,'Olio-cera OSMO 2 mani'),
  ('SRV-SBIANC','Sbiancatura pavimento in legno','Kalēa Servizi',(SELECT servizi FROM cats),12.00,'mq',NULL,NULL),
  ('SRV-STUCC','Stuccatura pavimento in legno','Kalēa Servizi',(SELECT servizi FROM cats),5.00,'mq',NULL,'Rasatura fughe e nodi'),
  ('SRV-POSA-INC','Posa pavimento a colla','Kalēa Servizi',(SELECT servizi FROM cats),35.00,'mq',NULL,NULL),
  ('SRV-POSA-FLOT','Posa pavimento flottante','Kalēa Servizi',(SELECT servizi FROM cats),22.00,'mq',NULL,NULL),
  ('SRV-POSA-SPINA','Posa a spina di pesce','Kalēa Servizi',(SELECT servizi FROM cats),55.00,'mq',NULL,'Spina italiana o ungherese'),
  ('SRV-POSA-QUAD','Posa quadrotte / Versailles','Kalēa Servizi',(SELECT servizi FROM cats),65.00,'mq',NULL,NULL),
  ('SRV-POSA-CER','Posa pavimento ceramico','Kalēa Servizi',(SELECT servizi FROM cats),40.00,'mq',NULL,NULL),
  ('SRV-POSA-OUT','Posa outdoor a secco su piedini','Kalēa Servizi',(SELECT servizi FROM cats),45.00,'mq',NULL,NULL),
  ('SRV-POSA-VINIL','Posa pavimento vinilico / LVT','Kalēa Servizi',(SELECT servizi FROM cats),18.00,'mq',NULL,NULL),
  ('SRV-POSA-LAM','Posa pavimento laminato','Kalēa Servizi',(SELECT servizi FROM cats),15.00,'mq',NULL,NULL),
  ('SRV-BATT','Posa battiscopa','Kalēa Servizi',(SELECT servizi FROM cats),8.00,'ml',NULL,NULL),
  ('SRV-RIM','Rimozione vecchio pavimento','Kalēa Servizi',(SELECT servizi FROM cats),12.00,'mq',NULL,'Smaltimento escluso'),
  ('SRV-RASAT','Rasatura autolivellante massetto','Kalēa Servizi',(SELECT servizi FROM cats),18.00,'mq',NULL,'Spessore fino a 5 mm'),
  ('SRV-MASSETTO','Massetto tradizionale sabbia/cemento','Kalēa Servizi',(SELECT servizi FROM cats),32.00,'mq',NULL,'Spessore medio 6 cm'),
  ('SRV-PRIMER','Applicazione primer','Kalēa Servizi',(SELECT servizi FROM cats),4.50,'mq',NULL,NULL),
  ('SRV-BARR-VAP','Posa barriera vapore','Kalēa Servizi',(SELECT servizi FROM cats),3.50,'mq',NULL,NULL),
  ('SRV-PUL-CANT','Pulizia fine cantiere','Kalēa Servizi',(SELECT servizi FROM cats),6.00,'mq',NULL,NULL),
  ('SRV-PUL-STR','Pulizia straordinaria pavimenti in legno','Kalēa Servizi',(SELECT servizi FROM cats),8.00,'mq',NULL,NULL),
  ('SRV-MANUT','Manutenzione ordinaria pavimenti','Kalēa Servizi',(SELECT servizi FROM cats),10.00,'mq',NULL,'Rinfresco olio o vernice'),
  ('SRV-TRASP','Trasporto materiali','Kalēa Servizi',(SELECT servizi FROM cats),150.00,'a corpo',NULL,NULL),
  ('SRV-SOP','Sopralluogo tecnico','Kalēa Servizi',(SELECT servizi FROM cats),80.00,'a corpo',NULL,NULL),
  ('SRV-PROG','Progettazione e disegno posa','Kalēa Servizi',(SELECT servizi FROM cats),250.00,'a corpo',NULL,NULL),
  ('SRV-DIR-LAV','Direzione lavori','Kalēa Servizi',(SELECT servizi FROM cats),400.00,'a corpo',NULL,'Cantiere standard'),
  ('SRV-MANOD','Manodopera oraria','Kalēa Servizi',(SELECT servizi FROM cats),42.00,'ora',NULL,NULL)
) AS v(code, name, brand, cat_id, price, unit, fmt, notes)
WHERE NOT EXISTS (
  SELECT 1 FROM public.catalog_products cp WHERE cp.product_code = v.code
);
