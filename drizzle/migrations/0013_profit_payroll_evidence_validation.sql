ALTER TABLE public.profit_cost_allocations DROP CONSTRAINT profit_cost_allocations_scope_check;
ALTER TABLE public.profit_cost_allocations ADD CONSTRAINT profit_cost_allocations_scope_check CHECK (scope IN ('job','general','inventory','duplicate','payroll_evidence'));
CREATE OR REPLACE FUNCTION public.validate_profit_allocation() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE available numeric; used numeric;
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
 IF NEW.scope='duplicate' AND (NEW.amount<>available OR used<>0) THEN RAISE EXCEPTION 'La riconciliazione deve coprire l’intero documento, senza altre attribuzioni'; END IF;
 IF NEW.scope<>'duplicate' AND EXISTS(SELECT 1 FROM public.profit_cost_allocations WHERE source_key=NEW.source_key AND id<>NEW.id AND scope='duplicate') THEN RAISE EXCEPTION 'Documento già riconciliato'; END IF;
 IF NEW.scope='duplicate' AND EXISTS(SELECT 1 FROM public.profit_cost_allocations WHERE source_key=NEW.duplicate_of AND scope='duplicate') THEN RAISE EXCEPTION 'Non sono ammesse catene di duplicati'; END IF;
 IF EXISTS(SELECT 1 FROM public.profit_cost_allocations WHERE duplicate_of=NEW.source_key) AND NEW.scope='duplicate' THEN RAISE EXCEPTION 'Questa fonte giustifica già un altro documento'; END IF;
 IF NEW.scope='payroll_evidence' AND NEW.category NOT IN ('stipendi','contributi_tasse') THEN RAISE EXCEPTION 'Usa Stipendi o Contributi e tasse per i costi già inclusi nel costo mensile operaio'; END IF;
 RETURN NEW;
END $$;