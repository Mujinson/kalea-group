
UPDATE public.sales
SET
  vat_included = true,
  subtotal_amount = ROUND(1645.60 / 1.22, 2),
  vat_amount      = ROUND(1645.60 - (1645.60 / 1.22), 2),
  total_amount    = 1645.60,
  margin_amount   = ROUND( (1645.60 / 1.22) - (subtotal_amount - margin_amount), 2),
  margin_percentage = ROUND( ( ( (1645.60/1.22) - (subtotal_amount - margin_amount) ) / (1645.60/1.22) ) * 100, 2),
  balance_amount  = ROUND(1645.60 - COALESCE(deposit_amount,0), 2)
WHERE id = 'db40b617-705f-4878-8876-2677be522b06';
