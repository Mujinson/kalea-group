-- =====================================================
-- CRM COMPLETO - SCHEMA DATABASE
-- =====================================================

-- 1. TABELLA COMMERCIALI (Salespeople)
CREATE TABLE public.salespeople (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  commission_rate NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.salespeople ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage salespeople" ON public.salespeople
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. TABELLA FORNITORI (Suppliers)
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  country TEXT DEFAULT 'Italia',
  vat_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage suppliers" ON public.suppliers
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. CATEGORIE COSTI FISSI (Enum)
CREATE TYPE public.fixed_cost_category AS ENUM (
  'stipendi',
  'affitto_magazzino',
  'utenze',
  'software_saas',
  'assicurazioni',
  'spese_bancarie',
  'altri_costi_fissi'
);

-- 4. FREQUENZA COSTI (Enum)
CREATE TYPE public.cost_frequency AS ENUM (
  'mensile',
  'trimestrale',
  'annuale',
  'una_tantum'
);

-- 5. CATEGORIE COSTI VARIABILI (Enum)
CREATE TYPE public.variable_cost_category AS ENUM (
  'trasporti',
  'logistica',
  'campionature',
  'marketing',
  'spese_commerciali',
  'altri'
);

-- 6. TABELLA COSTI FISSI
CREATE TABLE public.fixed_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  category fixed_cost_category NOT NULL,
  amount NUMERIC NOT NULL,
  frequency cost_frequency NOT NULL DEFAULT 'mensile',
  cost_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_paid BOOLEAN DEFAULT false,
  paid_date DATE,
  notes TEXT,
  person_name TEXT, -- For stipendi category
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage fixed_costs" ON public.fixed_costs
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 7. TABELLA COSTI VARIABILI
CREATE TABLE public.variable_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  category variable_cost_category NOT NULL,
  amount NUMERIC NOT NULL,
  frequency cost_frequency NOT NULL DEFAULT 'una_tantum',
  cost_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_paid BOOLEAN DEFAULT false,
  paid_date DATE,
  notes TEXT,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.variable_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage variable_costs" ON public.variable_costs
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 8. STATO FATTURA COMMERCIALE (Enum)
CREATE TYPE public.invoice_status AS ENUM (
  'da_pagare',
  'pagata',
  'scaduta'
);

-- 9. TABELLA FATTURE COMMERCIALI
CREATE TABLE public.commercial_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  invoice_number TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  commission_percentage NUMERIC NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'da_pagare',
  due_date DATE,
  paid_date DATE,
  notes TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.commercial_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage commercial_invoices" ON public.commercial_invoices
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 10. TABELLA COLLEGAMENTO FATTURE-VENDITE
CREATE TABLE public.invoice_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.commercial_invoices(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invoice_sales" ON public.invoice_sales
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 11. TABELLA COLLEGAMENTO VENDITE-COMMERCIALI (con percentuale)
CREATE TABLE public.sale_salespeople (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  commission_percentage NUMERIC NOT NULL DEFAULT 0,
  commission_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sale_salespeople ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sale_salespeople" ON public.sale_salespeople
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 12. STATO CLIENTE (Enum)
CREATE TYPE public.customer_status AS ENUM (
  'lead',
  'attivo',
  'inattivo'
);

-- 13. AGGIUNGERE CAMPI A CUSTOMERS
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS status customer_status DEFAULT 'lead',
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS assigned_salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS total_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_margin NUMERIC DEFAULT 0;

-- 14. TABELLA VISITE COMMERCIALI
CREATE TABLE public.customer_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE SET NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_type TEXT, -- visita, telefonata, email, videochiamata
  notes TEXT,
  outcome TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage customer_visits" ON public.customer_visits
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 15. TABELLA REMINDER FOLLOW-UP
CREATE TABLE public.customer_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE SET NULL,
  reminder_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage customer_reminders" ON public.customer_reminders
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 16. TABELLA ACTION LOG (Audit)
CREATE TABLE public.customer_action_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_email TEXT,
  action_type TEXT NOT NULL, -- creazione, modifica, vendita, visita, nota
  action_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage customer_action_logs" ON public.customer_action_logs
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 17. STATO CONTRATTO (Enum)
CREATE TYPE public.contract_status AS ENUM (
  'in_corso',
  'completato',
  'annullato'
);

-- 18. TABELLA CONTRATTI CLIENTE
CREATE TABLE public.customer_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  contract_type TEXT, -- preventivo, contratto, documento_lavori
  status contract_status DEFAULT 'in_corso',
  document_url TEXT,
  signed_date DATE,
  start_date DATE,
  end_date DATE,
  value NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage customer_contracts" ON public.customer_contracts
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 19. AGGIUNGERE CAMPI A SALES (payment status)
ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS paid_date DATE,
ADD COLUMN IF NOT EXISTS margin_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS margin_percentage NUMERIC DEFAULT 0;

-- 20. AGGIUNGERE CAMPI A INVENTORY (supplier link)
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS sale_id_link UUID REFERENCES public.sales(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS exit_price NUMERIC DEFAULT 0;

-- 21. TABELLA VALORE STOCK TERNI (sostituisce debito)
CREATE TABLE public.stock_valuation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL DEFAULT 'Stock pavimento Terni',
  total_value NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  last_updated DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_valuation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage stock_valuation" ON public.stock_valuation
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default stock valuation
INSERT INTO public.stock_valuation (description, total_value, notes)
VALUES ('Costo totale stock pavimento a Terni', 89100, 'Valore inventario - modificabile manualmente');

-- 22. TRIGGERS FOR updated_at
CREATE TRIGGER update_salespeople_updated_at BEFORE UPDATE ON public.salespeople
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fixed_costs_updated_at BEFORE UPDATE ON public.fixed_costs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_variable_costs_updated_at BEFORE UPDATE ON public.variable_costs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commercial_invoices_updated_at BEFORE UPDATE ON public.commercial_invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_visits_updated_at BEFORE UPDATE ON public.customer_visits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_reminders_updated_at BEFORE UPDATE ON public.customer_reminders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_contracts_updated_at BEFORE UPDATE ON public.customer_contracts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_valuation_updated_at BEFORE UPDATE ON public.stock_valuation
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();