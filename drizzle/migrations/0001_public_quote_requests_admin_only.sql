DROP POLICY IF EXISTS "Authenticated staff read quote requests" ON public.public_quote_requests;
DROP POLICY IF EXISTS "Authenticated staff update quote requests" ON public.public_quote_requests;
CREATE POLICY "Admins read quote requests" ON public.public_quote_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update quote requests" ON public.public_quote_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));