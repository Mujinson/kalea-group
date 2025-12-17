-- Enable realtime for main CRM tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fixed_costs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.variable_costs;