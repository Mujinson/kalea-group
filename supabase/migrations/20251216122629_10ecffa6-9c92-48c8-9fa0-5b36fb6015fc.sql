-- Enum per i ruoli utente
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Tabella ruoli utente
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Funzione per verificare ruoli (security definer per evitare ricorsione RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: solo admin possono vedere i ruoli
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tabella costi statici (FOB, dazi, ecc.)
CREATE TABLE public.static_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_type TEXT NOT NULL, -- 'MgO' o 'CWC'
    fob_cost DECIMAL(10,2) NOT NULL, -- €/mq
    duty_percentage DECIMAL(5,2) NOT NULL DEFAULT 1.7, -- %
    vat_percentage DECIMAL(5,2) NOT NULL DEFAULT 22, -- %
    import_logistics_cost DECIMAL(10,2) NOT NULL DEFAULT 0.49, -- €/mq
    internal_transport_cost DECIMAL(10,2) DEFAULT 0, -- €/mq
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.static_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage static_costs"
ON public.static_costs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabella vendite
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_type TEXT NOT NULL, -- 'MgO' o 'CWC'
    quantity_sqm DECIMAL(10,2) NOT NULL, -- mq venduti
    sale_price DECIMAL(10,2) NOT NULL, -- €/mq
    channel TEXT NOT NULL DEFAULT 'B2B', -- 'B2B' o 'B2C'
    customer_name TEXT,
    notes TEXT,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sales"
ON public.sales
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabella magazzino
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_type TEXT NOT NULL, -- 'MgO' o 'CWC'
    quantity_sqm DECIMAL(10,2) NOT NULL, -- mq in stock
    purchase_cost DECIMAL(10,2) NOT NULL, -- €/mq costo acquisto
    movement_type TEXT NOT NULL DEFAULT 'IN', -- 'IN' o 'OUT'
    notes TEXT,
    movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inventory"
ON public.inventory
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabella pagamenti fornitore (accordo differito)
CREATE TABLE public.supplier_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_name TEXT NOT NULL DEFAULT 'Fornitore Terni',
    total_debt DECIMAL(12,2) NOT NULL, -- debito totale iniziale
    payment_amount DECIMAL(12,2) NOT NULL, -- importo pagato
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage supplier_payments"
ON public.supplier_payments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabella accordi pagamento (per tracciare il debito iniziale)
CREATE TABLE public.payment_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_name TEXT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL, -- €89.100
    start_date DATE NOT NULL,
    end_date DATE NOT NULL, -- data scadenza (365 giorni)
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment_agreements"
ON public.payment_agreements
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_static_costs_updated_at
BEFORE UPDATE ON public.static_costs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_agreements_updated_at
BEFORE UPDATE ON public.payment_agreements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();