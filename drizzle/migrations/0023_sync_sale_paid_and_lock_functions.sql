CREATE OR REPLACE FUNCTION public.sync_sale_paid_from_schedules()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_sale uuid; v_tot int; v_open int; v_last date;
BEGIN
  v_sale := COALESCE(NEW.sale_id, OLD.sale_id);
  SELECT count(*), count(*) FILTER (WHERE NOT is_paid), max(paid_date)
    INTO v_tot, v_open, v_last FROM public.payment_schedules WHERE sale_id = v_sale;
  IF v_tot > 0 THEN
    UPDATE public.sales SET is_paid = (v_open = 0),
      paid_date = CASE WHEN v_open = 0 THEN COALESCE(v_last, CURRENT_DATE) ELSE NULL END
    WHERE id = v_sale AND (is_paid IS DISTINCT FROM (v_open = 0));
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_sync_sale_paid ON public.payment_schedules;
CREATE TRIGGER trg_sync_sale_paid AFTER INSERT OR UPDATE OR DELETE ON public.payment_schedules
FOR EACH ROW EXECUTE FUNCTION public.sync_sale_paid_from_schedules();

UPDATE public.sales s SET is_paid = x.all_paid,
  paid_date = CASE WHEN x.all_paid THEN x.last_paid ELSE NULL END
FROM (SELECT sale_id, bool_and(is_paid) all_paid, max(paid_date) last_paid FROM public.payment_schedules GROUP BY sale_id) x
WHERE x.sale_id = s.id;

REVOKE EXECUTE ON FUNCTION public.sync_sale_paid_from_schedules() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_invoice_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_site_from_accepted_quote() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_lead_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_catalog_audit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_catalog_price_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_lead_assignment() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_time_off() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_site_material_delivered() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_quote_reconversion() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalc_invoice_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_customer_on_quote_won() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_lead_on_quote_outcome() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_payment_schedule_paid() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_supplier_invoice_paid() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_site_copy_quote_attachments() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_profit_allocation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_quote_attachments_to_site(uuid, uuid) FROM PUBLIC, anon;