create policy "Admins can read supplier invoice files"
on storage.objects for select to authenticated
using (bucket_id = 'supplier-invoices' and public.has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can upload supplier invoice files"
on storage.objects for insert to authenticated
with check (bucket_id = 'supplier-invoices' and public.has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can update supplier invoice files"
on storage.objects for update to authenticated
using (bucket_id = 'supplier-invoices' and public.has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can delete supplier invoice files"
on storage.objects for delete to authenticated
using (bucket_id = 'supplier-invoices' and public.has_role(auth.uid(), 'admin'::app_role));