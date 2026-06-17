
-- New formats
INSERT INTO public.wc_formats(code,name,dimensions,unit,sort_order,active) VALUES
('IMPRESSION_189','189×1800/1900','189x1800/1900 mm','mq',300,true),
('GROUND_180_190','180/190×1800/1900','180/190x1800/1900 mm','mq',400,true)
ON CONFLICT (code) DO NOTHING;

-- New finishes
INSERT INTO public.wc_finishes(code,name,sort_order) VALUES
('FUME_PIALL_OLIO_CERA','Fumé piallata a mano e spazzolata - olio-cera Osmo',40),
('FUME_SPAZZ_OPACA','Fumé spazzolata - vernice opaca',50),
('LEGG_SPAZZ_OPACA','Leggermente spazzolata - vernice opaca',60)
ON CONFLICT (code) DO NOTHING;

-- New essences (Impression + Ground)
INSERT INTO public.wc_essences(code,name,surface_treatment,sort_order,active) VALUES
('ROV_KALIKA','Rovere Kalika','Fumé',300,true),
('ROV_LIMO','Rovere Limo',NULL,400,true),
('ROV_LAGUNA','Rovere Laguna','Limo AB',401,true),
('ROV_SAVANA','Rovere Savana',NULL,402,true),
('ROV_SELVA','Rovere Selva',NULL,403,true),
('ROV_CALANCA','Rovere Calanca',NULL,404,true),
('ROV_TORBA','Rovere Torba','Fumé',405,true),
('ROV_TUNDRA','Rovere Tundra','Fumé',406,true),
('ROV_DUNE','Rovere Dune','Fumé',407,true),
('ROV_SOTTOBOSCO','Rovere Sottobosco',NULL,408,true),
('ROV_CAMPO','Rovere Campo','Fumé',409,true),
('ROV_ARTICO','Rovere Artico','Fumé',410,true),
('NOCE_AMERICANO','Noce Americano',NULL,411,true)
ON CONFLICT (code) DO NOTHING;

-- Prices: Impression
INSERT INTO public.wc_prices(collection_id,essence_id,finish_id,format_id,list_price,supplier_discount_pct)
SELECT c.id, e.id, f.id, fm.id, 119.40, 40
FROM wc_collections c, wc_essences e, wc_finishes f, wc_formats fm
WHERE c.code='IMPRESSION' AND e.code='ROV_KALIKA' AND f.code='FUME_PIALL_OLIO_CERA' AND fm.code='IMPRESSION_189'
ON CONFLICT DO NOTHING;

-- Prices: Ground
INSERT INTO public.wc_prices(collection_id,essence_id,finish_id,format_id,list_price,supplier_discount_pct)
SELECT c.id, e.id, f.id, fm.id, v.price, 40
FROM wc_collections c, wc_essences e, wc_finishes f, wc_formats fm,
(VALUES
 ('ROV_LIMO','SPAZZ_OPACA',93.60),
 ('ROV_LAGUNA','SPAZZ_OPACA',116.80),
 ('ROV_SAVANA','SPAZZ_OPACA',83.90),
 ('ROV_SELVA','SPAZZ_OPACA',77.70),
 ('ROV_CALANCA','SPAZZ_OPACA',91.10),
 ('ROV_TORBA','FUME_SPAZZ_OPACA',91.10),
 ('ROV_TUNDRA','FUME_SPAZZ_OPACA',91.10),
 ('ROV_DUNE','FUME_SPAZZ_OPACA',91.10),
 ('ROV_SOTTOBOSCO','SPAZZ_OPACA',81.70),
 ('ROV_CAMPO','FUME_SPAZZ_OPACA',81.70),
 ('ROV_ARTICO','FUME_SPAZZ_OPACA',81.70),
 ('NOCE_AMERICANO','LEGG_SPAZZ_OPACA',144.20)
) AS v(ess,fin,price)
WHERE c.code='GROUND' AND fm.code='GROUND_180_190'
  AND e.code=v.ess AND f.code=v.fin
ON CONFLICT DO NOTHING;
