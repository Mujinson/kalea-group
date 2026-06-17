
-- =========================================
-- Catalogo Woodco strutturato
-- =========================================

-- COLLEZIONI
CREATE TABLE public.wc_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wc_collections TO authenticated;
GRANT ALL ON public.wc_collections TO service_role;
ALTER TABLE public.wc_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read wc_collections" ON public.wc_collections FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage wc_collections" ON public.wc_collections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_wc_collections_upd BEFORE UPDATE ON public.wc_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FORMATI
CREATE TABLE public.wc_formats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  dimensions text,
  thickness_mm numeric,
  top_layer_mm numeric,
  unit text NOT NULL DEFAULT 'mq',
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wc_formats TO authenticated;
GRANT ALL ON public.wc_formats TO service_role;
ALTER TABLE public.wc_formats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read wc_formats" ON public.wc_formats FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage wc_formats" ON public.wc_formats FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_wc_formats_upd BEFORE UPDATE ON public.wc_formats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FINITURE (scelta)
CREATE TABLE public.wc_finishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wc_finishes TO authenticated;
GRANT ALL ON public.wc_finishes TO service_role;
ALTER TABLE public.wc_finishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read wc_finishes" ON public.wc_finishes FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage wc_finishes" ON public.wc_finishes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ESSENZE
CREATE TABLE public.wc_essences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  surface_treatment text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wc_essences TO authenticated;
GRANT ALL ON public.wc_essences TO service_role;
ALTER TABLE public.wc_essences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read wc_essences" ON public.wc_essences FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage wc_essences" ON public.wc_essences FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_wc_essences_upd BEFORE UPDATE ON public.wc_essences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PREZZI (matrice)
CREATE TABLE public.wc_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.wc_collections(id) ON DELETE CASCADE,
  essence_id uuid NOT NULL REFERENCES public.wc_essences(id) ON DELETE CASCADE,
  finish_id uuid NOT NULL REFERENCES public.wc_finishes(id) ON DELETE CASCADE,
  format_id uuid NOT NULL REFERENCES public.wc_formats(id) ON DELETE CASCADE,
  list_price numeric(10,2) NOT NULL,
  supplier_discount_pct numeric(5,2) NOT NULL DEFAULT 55,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(collection_id, essence_id, finish_id, format_id)
);
CREATE INDEX idx_wc_prices_lookup ON public.wc_prices(collection_id, essence_id, finish_id, format_id);
GRANT SELECT ON public.wc_prices TO authenticated;
GRANT ALL ON public.wc_prices TO service_role;
ALTER TABLE public.wc_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read wc_prices" ON public.wc_prices FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage wc_prices" ON public.wc_prices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_wc_prices_upd BEFORE UPDATE ON public.wc_prices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ACCESSORI
CREATE TABLE public.wc_accessories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  category text NOT NULL,
  name text NOT NULL,
  description text,
  unit text NOT NULL DEFAULT 'pz',
  list_price numeric(10,2) NOT NULL DEFAULT 0,
  supplier_discount_pct numeric(5,2) NOT NULL DEFAULT 55,
  compatible_collections text[] DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wc_accessories TO authenticated;
GRANT ALL ON public.wc_accessories TO service_role;
ALTER TABLE public.wc_accessories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read wc_accessories" ON public.wc_accessories FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage wc_accessories" ON public.wc_accessories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_wc_accessories_upd BEFORE UPDATE ON public.wc_accessories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- SEED
-- =========================================

-- Collezioni
INSERT INTO public.wc_collections(code,name,sort_order) VALUES
  ('DREAM','Parquet Dream',1),
  ('SLIM','Parquet Slim',2),
  ('SENSE','Parquet Sense',3),
  ('ELEMENT','Parquet Element',4),
  ('GROUND','Parquet Ground',5),
  ('IMPRESSION','Parquet Impression',6),
  ('STAR','Parquet Star',7),
  ('HER','Parquet Her',8),
  ('HIM','Parquet Him',9),
  ('SIGNATURE','Signature',10);

-- Finiture
INSERT INTO public.wc_finishes(code,name,sort_order) VALUES
  ('NATURAL','Natural',1),
  ('SPIRIT','Spirit',2),
  ('WILD','Wild',3),
  ('SATINATA','Levigata vernice satinata',4);

-- Formati (Dream/Sense/Element/Ground)
INSERT INTO public.wc_formats(code,name,dimensions,thickness_mm,top_layer_mm,unit,sort_order) VALUES
  ('T2_160','Tavola 2 strati 160','160×1200/2200 mm',14,4,'mq',1),
  ('T2_180','Tavola 2 strati 180','180×1200/2200 mm',14,4,'mq',2),
  ('T3_160','Tavola 3 strati 160','160×1200/2200 mm',15,4,'mq',3),
  ('T3_180','Tavola 3 strati 180','180×1200/2200 mm',15,4,'mq',4),
  ('T3_220','Tavola 3 strati 220','220×1200/2200 mm',15,4,'mq',5),
  ('LIST_70','Listoncino 70','70×420/700 mm',10,3,'mq',6),
  ('LIST_90','Listoncino 90','90×600/1200 mm',10,3,'mq',7),
  ('SPINA_IT_70','Spina italiana 70','70×490 mm',10,3,'mq',8),
  ('SPINA_IT_90_500','Spina italiana 90','90×500 mm',10,3,'mq',9),
  ('SPINA_IT_90_600','Spina italiana 90','90×600 mm',10,3,'mq',10),
  ('SPINA_UNG_52','Spina ungherese 52°','90×590 mm',12,4,'mq',11),
  ('SPINA_FR_45','Spina francese 45°','90×610 mm',12,4,'mq',12),
  ('SLIM_120','Slim 120','120×800/1200 mm',10,2.5,'mq',13),
  ('SLIM_180','Slim 180','180×1200/2200 mm',10,2.5,'mq',14);

-- Essenze (collezione Dream / 2 STRATI)
INSERT INTO public.wc_essences(code,name,surface_treatment,sort_order) VALUES
  ('ROV_NATURALE','Rovere Naturale','Spazzolata vernice extra opaca',1),
  ('ROV_NATURALE_LEV','Rovere Naturale (Levigata)','Levigata vernice satinata',2),
  ('ROV_CREMA','Rovere Crema','Spazzolata vernice extra opaca',3),
  ('ROV_SABBIA','Rovere Sabbia','Spazzolata vernice extra opaca',4),
  ('ROV_COGNAC','Rovere Cognac','Spazzolata vernice extra opaca',5),
  ('ROV_CUMINO','Rovere Cumino','Spazzolata vernice extra opaca',6),
  ('ROV_CUOIO','Rovere Cuoio','Spazzolata vernice extra opaca',7),
  ('ROV_MALTO','Rovere Malto','Spazzolata vernice extra opaca',8),
  ('ROV_MANDORLA','Rovere Mandorla','Fumé spazzolata vernice extra opaca',9),
  ('ROV_MIELE','Rovere Miele','Spazzolata vernice extra opaca',10),
  ('ROV_ALPACA','Rovere Alpaca','Spazzolata vernice extra opaca',11),
  ('ROV_CORTECCIA','Rovere Corteccia','Spazzolata vernice extra opaca',12),
  ('ROV_MAGGESE','Rovere Maggese','Spazzolata vernice extra opaca',13),
  ('ROV_SALE','Rovere Sale','Spazzolata vernice extra opaca',14),
  ('ROV_INCENSO','Rovere Incenso','Spazzolata vernice extra opaca',15),
  ('ROV_NEBBIA','Rovere Nebbia','Spazzolata vernice extra opaca',16),
  ('ROV_TERRA_OMBRA','Rovere Terra d''Ombra','Spazzolata vernice extra opaca',17);

-- Prezzi DREAM (matrice da listino aprile 2026)
-- Helpers WITH per evitare lookup ripetuti
WITH
  c AS (SELECT id FROM public.wc_collections WHERE code='DREAM'),
  fmts AS (SELECT code, id FROM public.wc_formats),
  fins AS (SELECT code, id FROM public.wc_finishes),
  ess AS (SELECT code, id FROM public.wc_essences),
  data(essence,finish,format,price) AS (VALUES
    -- Rovere Naturale LEVIGATA SATINATA
    ('ROV_NATURALE_LEV','SATINATA','LIST_70',102.70),
    ('ROV_NATURALE_LEV','SATINATA','LIST_90',118.80),
    ('ROV_NATURALE_LEV','SATINATA','SPINA_IT_70',105.90),
    ('ROV_NATURALE_LEV','SATINATA','SPINA_IT_90_500',123.60),
    ('ROV_NATURALE_LEV','SATINATA','SPINA_IT_90_600',125.60),
    -- Rovere Naturale NATURAL
    ('ROV_NATURALE','NATURAL','T2_160',152.20),('ROV_NATURALE','NATURAL','T2_180',165.20),
    ('ROV_NATURALE','NATURAL','T3_160',152.20),('ROV_NATURALE','NATURAL','T3_180',165.20),('ROV_NATURALE','NATURAL','T3_220',180.70),
    ('ROV_NATURALE','NATURAL','LIST_70',106.70),('ROV_NATURALE','NATURAL','LIST_90',122.80),
    ('ROV_NATURALE','NATURAL','SPINA_IT_70',109.90),('ROV_NATURALE','NATURAL','SPINA_IT_90_500',127.60),('ROV_NATURALE','NATURAL','SPINA_IT_90_600',129.60),
    ('ROV_NATURALE','NATURAL','SPINA_UNG_52',161.90),('ROV_NATURALE','NATURAL','SPINA_FR_45',161.90),
    -- Rovere Naturale SPIRIT
    ('ROV_NATURALE','SPIRIT','T2_160',142.40),('ROV_NATURALE','SPIRIT','T2_180',148.90),
    ('ROV_NATURALE','SPIRIT','T3_160',142.40),('ROV_NATURALE','SPIRIT','T3_180',148.90),('ROV_NATURALE','SPIRIT','T3_220',166.10),
    ('ROV_NATURALE','SPIRIT','LIST_70',92.60),('ROV_NATURALE','SPIRIT','LIST_90',111.10),
    ('ROV_NATURALE','SPIRIT','SPINA_IT_70',95.00),('ROV_NATURALE','SPIRIT','SPINA_IT_90_500',117.00),('ROV_NATURALE','SPIRIT','SPINA_IT_90_600',119.00),
    ('ROV_NATURALE','SPIRIT','SPINA_UNG_52',154.80),('ROV_NATURALE','SPIRIT','SPINA_FR_45',154.80),
    -- Rovere Naturale WILD
    ('ROV_NATURALE','WILD','T2_160',122.30),('ROV_NATURALE','WILD','T2_180',133.30),
    ('ROV_NATURALE','WILD','T3_160',122.30),('ROV_NATURALE','WILD','T3_180',133.30),('ROV_NATURALE','WILD','T3_220',144.20),
    ('ROV_NATURALE','WILD','LIST_90',107.20),
    ('ROV_NATURALE','WILD','SPINA_IT_90_500',113.00),('ROV_NATURALE','WILD','SPINA_IT_90_600',115.00),
    ('ROV_NATURALE','WILD','SPINA_UNG_52',148.30),('ROV_NATURALE','WILD','SPINA_FR_45',148.30),
    -- Rovere Crema NATURAL
    ('ROV_CREMA','NATURAL','T2_160',175.00),('ROV_CREMA','NATURAL','T2_180',188.30),
    ('ROV_CREMA','NATURAL','T3_160',175.00),('ROV_CREMA','NATURAL','T3_180',188.30),('ROV_CREMA','NATURAL','T3_220',204.30),
    ('ROV_CREMA','NATURAL','LIST_70',126.70),('ROV_CREMA','NATURAL','LIST_90',138.80),
    ('ROV_CREMA','NATURAL','SPINA_IT_70',133.70),('ROV_CREMA','NATURAL','SPINA_IT_90_500',146.00),('ROV_CREMA','NATURAL','SPINA_IT_90_600',148.00),
    ('ROV_CREMA','NATURAL','SPINA_UNG_52',180.20),('ROV_CREMA','NATURAL','SPINA_FR_45',180.20),
    -- Rovere Sabbia NATURAL (= Crema)
    ('ROV_SABBIA','NATURAL','T2_160',175.00),('ROV_SABBIA','NATURAL','T2_180',188.30),
    ('ROV_SABBIA','NATURAL','T3_160',175.00),('ROV_SABBIA','NATURAL','T3_180',188.30),('ROV_SABBIA','NATURAL','T3_220',204.30),
    ('ROV_SABBIA','NATURAL','LIST_70',126.70),('ROV_SABBIA','NATURAL','LIST_90',138.80),
    ('ROV_SABBIA','NATURAL','SPINA_IT_70',133.70),('ROV_SABBIA','NATURAL','SPINA_IT_90_500',146.00),('ROV_SABBIA','NATURAL','SPINA_IT_90_600',148.00),
    ('ROV_SABBIA','NATURAL','SPINA_UNG_52',180.20),('ROV_SABBIA','NATURAL','SPINA_FR_45',180.20),
    -- Gruppo SPIRIT (Cognac, Cumino, Cuoio, Malto, Mandorla, Miele) tutti uguali
    ('ROV_COGNAC','SPIRIT','T2_160',164.90),('ROV_COGNAC','SPIRIT','T2_180',171.60),
    ('ROV_COGNAC','SPIRIT','T3_160',164.90),('ROV_COGNAC','SPIRIT','T3_180',171.60),('ROV_COGNAC','SPIRIT','T3_220',189.30),
    ('ROV_COGNAC','SPIRIT','LIST_70',115.00),('ROV_COGNAC','SPIRIT','LIST_90',133.10),
    ('ROV_COGNAC','SPIRIT','SPINA_IT_70',120.70),('ROV_COGNAC','SPIRIT','SPINA_IT_90_500',138.30),('ROV_COGNAC','SPIRIT','SPINA_IT_90_600',140.30),
    ('ROV_COGNAC','SPIRIT','SPINA_UNG_52',173.20),('ROV_COGNAC','SPIRIT','SPINA_FR_45',173.20),
    ('ROV_CUMINO','SPIRIT','T2_160',164.90),('ROV_CUMINO','SPIRIT','T2_180',171.60),
    ('ROV_CUMINO','SPIRIT','T3_160',164.90),('ROV_CUMINO','SPIRIT','T3_180',171.60),('ROV_CUMINO','SPIRIT','T3_220',189.30),
    ('ROV_CUMINO','SPIRIT','LIST_70',115.00),('ROV_CUMINO','SPIRIT','LIST_90',133.10),
    ('ROV_CUMINO','SPIRIT','SPINA_IT_70',120.70),('ROV_CUMINO','SPIRIT','SPINA_IT_90_500',138.30),('ROV_CUMINO','SPIRIT','SPINA_IT_90_600',140.30),
    ('ROV_CUMINO','SPIRIT','SPINA_UNG_52',173.20),('ROV_CUMINO','SPIRIT','SPINA_FR_45',173.20),
    ('ROV_CUOIO','SPIRIT','T2_160',164.90),('ROV_CUOIO','SPIRIT','T2_180',171.60),
    ('ROV_CUOIO','SPIRIT','T3_160',164.90),('ROV_CUOIO','SPIRIT','T3_180',171.60),('ROV_CUOIO','SPIRIT','T3_220',189.30),
    ('ROV_CUOIO','SPIRIT','LIST_70',115.00),('ROV_CUOIO','SPIRIT','LIST_90',133.10),
    ('ROV_CUOIO','SPIRIT','SPINA_IT_70',120.70),('ROV_CUOIO','SPIRIT','SPINA_IT_90_500',138.30),('ROV_CUOIO','SPIRIT','SPINA_IT_90_600',140.30),
    ('ROV_CUOIO','SPIRIT','SPINA_UNG_52',173.20),('ROV_CUOIO','SPIRIT','SPINA_FR_45',173.20),
    ('ROV_MALTO','SPIRIT','T2_160',164.90),('ROV_MALTO','SPIRIT','T2_180',171.60),
    ('ROV_MALTO','SPIRIT','T3_160',164.90),('ROV_MALTO','SPIRIT','T3_180',171.60),('ROV_MALTO','SPIRIT','T3_220',189.30),
    ('ROV_MALTO','SPIRIT','LIST_70',115.00),('ROV_MALTO','SPIRIT','LIST_90',133.10),
    ('ROV_MALTO','SPIRIT','SPINA_IT_70',120.70),('ROV_MALTO','SPIRIT','SPINA_IT_90_500',138.30),('ROV_MALTO','SPIRIT','SPINA_IT_90_600',140.30),
    ('ROV_MALTO','SPIRIT','SPINA_UNG_52',173.20),('ROV_MALTO','SPIRIT','SPINA_FR_45',173.20),
    ('ROV_MANDORLA','SPIRIT','T2_160',164.90),('ROV_MANDORLA','SPIRIT','T2_180',171.60),
    ('ROV_MANDORLA','SPIRIT','T3_160',164.90),('ROV_MANDORLA','SPIRIT','T3_180',171.60),('ROV_MANDORLA','SPIRIT','T3_220',189.30),
    ('ROV_MANDORLA','SPIRIT','LIST_70',115.00),('ROV_MANDORLA','SPIRIT','LIST_90',133.10),
    ('ROV_MANDORLA','SPIRIT','SPINA_IT_70',120.70),('ROV_MANDORLA','SPIRIT','SPINA_IT_90_500',138.30),('ROV_MANDORLA','SPIRIT','SPINA_IT_90_600',140.30),
    ('ROV_MANDORLA','SPIRIT','SPINA_UNG_52',173.20),('ROV_MANDORLA','SPIRIT','SPINA_FR_45',173.20),
    ('ROV_MIELE','SPIRIT','T2_160',164.90),('ROV_MIELE','SPIRIT','T2_180',171.60),
    ('ROV_MIELE','SPIRIT','T3_160',164.90),('ROV_MIELE','SPIRIT','T3_180',171.60),('ROV_MIELE','SPIRIT','T3_220',189.30),
    ('ROV_MIELE','SPIRIT','LIST_70',115.00),('ROV_MIELE','SPIRIT','LIST_90',133.10),
    ('ROV_MIELE','SPIRIT','SPINA_IT_70',120.70),('ROV_MIELE','SPIRIT','SPINA_IT_90_500',138.30),('ROV_MIELE','SPIRIT','SPINA_IT_90_600',140.30),
    ('ROV_MIELE','SPIRIT','SPINA_UNG_52',173.20),('ROV_MIELE','SPIRIT','SPINA_FR_45',173.20),
    -- Gruppo NATURAL premium (Alpaca, Corteccia, Maggese, Sale)
    ('ROV_ALPACA','NATURAL','T2_160',182.40),('ROV_ALPACA','NATURAL','T2_180',195.80),
    ('ROV_ALPACA','NATURAL','T3_160',182.40),('ROV_ALPACA','NATURAL','T3_180',195.80),('ROV_ALPACA','NATURAL','T3_220',211.70),
    ('ROV_ALPACA','NATURAL','LIST_70',131.50),('ROV_ALPACA','NATURAL','LIST_90',146.10),
    ('ROV_ALPACA','NATURAL','SPINA_IT_70',138.60),('ROV_ALPACA','NATURAL','SPINA_IT_90_500',153.60),('ROV_ALPACA','NATURAL','SPINA_IT_90_600',155.60),
    ('ROV_ALPACA','NATURAL','SPINA_UNG_52',187.50),('ROV_ALPACA','NATURAL','SPINA_FR_45',187.50),
    ('ROV_CORTECCIA','NATURAL','T2_160',182.40),('ROV_CORTECCIA','NATURAL','T2_180',195.80),
    ('ROV_CORTECCIA','NATURAL','T3_160',182.40),('ROV_CORTECCIA','NATURAL','T3_180',195.80),('ROV_CORTECCIA','NATURAL','T3_220',211.70),
    ('ROV_CORTECCIA','NATURAL','LIST_70',131.50),('ROV_CORTECCIA','NATURAL','LIST_90',146.10),
    ('ROV_CORTECCIA','NATURAL','SPINA_IT_70',138.60),('ROV_CORTECCIA','NATURAL','SPINA_IT_90_500',153.60),('ROV_CORTECCIA','NATURAL','SPINA_IT_90_600',155.60),
    ('ROV_CORTECCIA','NATURAL','SPINA_UNG_52',187.50),('ROV_CORTECCIA','NATURAL','SPINA_FR_45',187.50),
    ('ROV_MAGGESE','NATURAL','T2_160',182.40),('ROV_MAGGESE','NATURAL','T2_180',195.80),
    ('ROV_MAGGESE','NATURAL','T3_160',182.40),('ROV_MAGGESE','NATURAL','T3_180',195.80),('ROV_MAGGESE','NATURAL','T3_220',211.70),
    ('ROV_MAGGESE','NATURAL','LIST_70',131.50),('ROV_MAGGESE','NATURAL','LIST_90',146.10),
    ('ROV_MAGGESE','NATURAL','SPINA_IT_70',138.60),('ROV_MAGGESE','NATURAL','SPINA_IT_90_500',153.60),('ROV_MAGGESE','NATURAL','SPINA_IT_90_600',155.60),
    ('ROV_MAGGESE','NATURAL','SPINA_UNG_52',187.50),('ROV_MAGGESE','NATURAL','SPINA_FR_45',187.50),
    ('ROV_SALE','NATURAL','T2_160',182.40),('ROV_SALE','NATURAL','T2_180',195.80),
    ('ROV_SALE','NATURAL','T3_160',182.40),('ROV_SALE','NATURAL','T3_180',195.80),('ROV_SALE','NATURAL','T3_220',211.70),
    ('ROV_SALE','NATURAL','LIST_70',131.50),('ROV_SALE','NATURAL','LIST_90',146.10),
    ('ROV_SALE','NATURAL','SPINA_IT_70',138.60),('ROV_SALE','NATURAL','SPINA_IT_90_500',153.60),('ROV_SALE','NATURAL','SPINA_IT_90_600',155.60),
    ('ROV_SALE','NATURAL','SPINA_UNG_52',187.50),('ROV_SALE','NATURAL','SPINA_FR_45',187.50),
    -- Gruppo SPIRIT fumé (Incenso, Nebbia, Terra d'Ombra)
    ('ROV_INCENSO','SPIRIT','T2_160',172.40),('ROV_INCENSO','SPIRIT','T2_180',179.10),
    ('ROV_INCENSO','SPIRIT','T3_160',172.40),('ROV_INCENSO','SPIRIT','T3_180',179.10),('ROV_INCENSO','SPIRIT','T3_220',196.80),
    ('ROV_INCENSO','SPIRIT','LIST_70',119.70),('ROV_INCENSO','SPIRIT','LIST_90',139.50),
    ('ROV_INCENSO','SPIRIT','SPINA_IT_70',125.60),('ROV_INCENSO','SPIRIT','SPINA_IT_90_500',145.90),('ROV_INCENSO','SPIRIT','SPINA_IT_90_600',147.90),
    ('ROV_INCENSO','SPIRIT','SPINA_UNG_52',180.50),('ROV_INCENSO','SPIRIT','SPINA_FR_45',180.50),
    ('ROV_NEBBIA','SPIRIT','T2_160',172.40),('ROV_NEBBIA','SPIRIT','T2_180',179.10),
    ('ROV_NEBBIA','SPIRIT','T3_160',172.40),('ROV_NEBBIA','SPIRIT','T3_180',179.10),('ROV_NEBBIA','SPIRIT','T3_220',196.80),
    ('ROV_NEBBIA','SPIRIT','LIST_70',119.70),('ROV_NEBBIA','SPIRIT','LIST_90',139.50),
    ('ROV_NEBBIA','SPIRIT','SPINA_IT_70',125.60),('ROV_NEBBIA','SPIRIT','SPINA_IT_90_500',145.90),('ROV_NEBBIA','SPIRIT','SPINA_IT_90_600',147.90),
    ('ROV_NEBBIA','SPIRIT','SPINA_UNG_52',180.50),('ROV_NEBBIA','SPIRIT','SPINA_FR_45',180.50),
    ('ROV_TERRA_OMBRA','SPIRIT','T2_160',172.40),('ROV_TERRA_OMBRA','SPIRIT','T2_180',179.10),
    ('ROV_TERRA_OMBRA','SPIRIT','T3_160',172.40),('ROV_TERRA_OMBRA','SPIRIT','T3_180',179.10),('ROV_TERRA_OMBRA','SPIRIT','T3_220',196.80),
    ('ROV_TERRA_OMBRA','SPIRIT','LIST_70',119.70),('ROV_TERRA_OMBRA','SPIRIT','LIST_90',139.50),
    ('ROV_TERRA_OMBRA','SPIRIT','SPINA_IT_70',125.60),('ROV_TERRA_OMBRA','SPIRIT','SPINA_IT_90_500',145.90),('ROV_TERRA_OMBRA','SPIRIT','SPINA_IT_90_600',147.90),
    ('ROV_TERRA_OMBRA','SPIRIT','SPINA_UNG_52',180.50),('ROV_TERRA_OMBRA','SPIRIT','SPINA_FR_45',180.50)
  )
INSERT INTO public.wc_prices(collection_id,essence_id,finish_id,format_id,list_price)
SELECT c.id, ess.id, fins.id, fmts.id, data.price
FROM data
CROSS JOIN c
JOIN ess ON ess.code = data.essence
JOIN fins ON fins.code = data.finish
JOIN fmts ON fmts.code = data.format;

-- Accessori coordinati (categorie placeholder con esempi — completare da admin)
INSERT INTO public.wc_accessories(category,name,unit,list_price,sort_order) VALUES
  ('Battiscopa d''arredo','Battiscopa d''arredo verniciato bianco H80','ml',18.50,1),
  ('Battiscopa d''arredo','Battiscopa d''arredo impiallacciato H80','ml',24.90,2),
  ('Battiscopa alluminio','Battiscopa alluminio anodizzato H40','ml',16.80,10),
  ('Battiscopa alluminio','Battiscopa alluminio nero opaco H60','ml',22.40,11),
  ('Sottopavimenti','Sottopavimento XPS Silenzia 2mm','mq',4.20,20),
  ('Sottopavimenti','Sottopavimento sughero 3mm','mq',6.50,21),
  ('Profili','Profilo di raccordo alluminio','ml',8.90,30),
  ('Profili','Profilo terminale','ml',7.50,31),
  ('ClipLT','ClipLT sistema di posa','pz',1.20,40),
  ('Manutenzione','Olio rigenerante 1L','pz',32.00,50),
  ('Manutenzione','Detergente specifico parquet 1L','pz',18.00,51),
  ('Manutenzione','Kit ritocco vernice','pz',45.00,52);
