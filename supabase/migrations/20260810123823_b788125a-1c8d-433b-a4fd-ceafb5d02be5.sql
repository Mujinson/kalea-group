DROP TRIGGER IF EXISTS quote_commission_trigger ON public.quotes;
DROP FUNCTION IF EXISTS public.calculate_commission_on_quote_accept();