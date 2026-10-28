CREATE TABLE public.profit_cost_allocations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 source_key text NOT NULL,
 scope text NOT NULL CHECK (scope IN ('job','general','inventory','duplicate')),
 quote_id uuid REFERENCES public.quotes(id),
 sale_id uuid REFERENCES public.sales(id),
 category text NOT NULL DEFAULT 'other',
 amount numeric(14,2) NOT NULL CHECK (amount >= 0),
 replaced_estimate numeric(14,2) NOT NULL DEFAULT 0 CHECK (replaced_estimate >= 0),
 competence_date date NOT NULL,
 duplicate_of text,
 net_verified boolean NOT NULL DEFAULT false,
 note text,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (scope <> 'job' OR quote_id IS NOT NULL OR sale_id IS NOT NULL),
 CHECK (scope <> 'duplicate' OR (duplicate_of IS NOT NULL AND duplicate_of <> source_key)),
 CHECK (scope = 'job' OR replaced_estimate = 0)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profit_cost_allocations TO authenticated;
GRANT ALL ON public.profit_cost_allocations TO service_role;
ALTER TABLE public.profit_cost_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY profit_allocations_admin ON public.profit_cost_allocations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX profit_allocations_source_idx ON public.profit_cost_allocations(source_key);
CREATE TABLE public.profit_job_closures (
 quote_id uuid PRIMARY KEY REFERENCES public.quotes(id), costs_complete boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profit_job_closures TO authenticated;
GRANT ALL ON public.profit_job_closures TO service_role;
ALTER TABLE public.profit_job_closures ENABLE ROW LEVEL SECURITY;
CREATE POLICY profit_closures_admin ON public.profit_job_closures FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TABLE public.profit_payroll_months (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), worker_id uuid NOT NULL REFERENCES public.workers(id),
 month date NOT NULL CHECK (extract(day from month)=1), amount numeric(14,2) NOT NULL CHECK(amount>=0),
 confirmed boolean NOT NULL DEFAULT false, UNIQUE(worker_id,month)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profit_payroll_months TO authenticated;
GRANT ALL ON public.profit_payroll_months TO service_role;
ALTER TABLE public.profit_payroll_months ENABLE ROW LEVEL SECURITY;
CREATE POLICY profit_payroll_admin ON public.profit_payroll_months FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.validate_profit_allocation() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE available numeric; used numeric; other_scope text;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW.source_key,0));
 CASE split_part(NEW.source_key,':',1)
 WHEN 'supplier' THEN SELECT subtotal INTO available FROM public.supplier_invoices WHERE id=split_part(NEW.source_key,':',2)::uuid;
 WHEN 'variable' THEN SELECT amount INTO available FROM public.variable_costs WHERE id=split_part(NEW.source_key,':',2)::uuid;
 WHEN 'fixed' THEN SELECT amount INTO available FROM public.fixed_costs WHERE id=split_part(NEW.source_key,':',2)::uuid;
 WHEN 'expense' THEN SELECT amount INTO available FROM public.site_expenses WHERE id=split_part(NEW.source_key,':',2)::uuid;
 WHEN 'daily' THEN SELECT labor+fuel+tolls+meals+hotel+other INTO available FROM public.site_daily_costs WHERE id=split_part(NEW.source_key,':',2)::uuid AND NOT is_estimate;
 ELSE RAISE EXCEPTION 'Fonte costo non valida';
 END CASE;
 IF available IS NULL THEN RAISE EXCEPTION 'Costo originale non trovato'; END IF;
 SELECT COALESCE(sum(amount),0) INTO used FROM public.profit_cost_allocations WHERE source_key=NEW.source_key AND id<>NEW.id;
 IF used+NEW.amount>available+0.001 THEN RAISE EXCEPTION 'La ripartizione supera il netto del costo originale'; END IF;
 IF NEW.scope='duplicate' AND EXISTS(SELECT 1 FROM public.profit_cost_allocations WHERE source_key=NEW.source_key AND id<>NEW.id AND scope<>'duplicate') THEN RAISE EXCEPTION 'Un documento riconciliato non può avere anche costi attribuiti'; END IF;
 IF NEW.scope<>'duplicate' AND EXISTS(SELECT 1 FROM public.profit_cost_allocations WHERE source_key=NEW.source_key AND id<>NEW.id AND scope='duplicate') THEN RAISE EXCEPTION 'Documento già riconciliato'; END IF;
 IF NEW.scope='duplicate' AND EXISTS(SELECT 1 FROM public.profit_cost_allocations WHERE source_key=NEW.duplicate_of AND scope='duplicate') THEN RAISE EXCEPTION 'Non sono ammesse catene di duplicati'; END IF;
 IF EXISTS(SELECT 1 FROM public.profit_cost_allocations WHERE duplicate_of=NEW.source_key) AND NEW.scope='duplicate' THEN RAISE EXCEPTION 'Questa fonte giustifica già un altro documento'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_profit_allocation BEFORE INSERT OR UPDATE ON public.profit_cost_allocations FOR EACH ROW EXECUTE FUNCTION public.validate_profit_allocation();