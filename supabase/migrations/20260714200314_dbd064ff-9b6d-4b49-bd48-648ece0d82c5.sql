
CREATE TABLE public._import_stg_prices (
  brand text,
  name text,
  format text,
  p1 numeric,
  p2 numeric,
  p3 numeric,
  flag_note text,
  csv_row jsonb
);
GRANT ALL ON public._import_stg_prices TO service_role, authenticated;
