begin;

-- 1) Bucket publico para PDFs de facturas SII
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'facturas_pdf',
  'facturas_pdf',
  true,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2) Politicas de acceso al bucket
alter table storage.objects enable row level security;

drop policy if exists facturas_pdf_read on storage.objects;
create policy facturas_pdf_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'facturas_pdf');

drop policy if exists facturas_pdf_insert on storage.objects;
create policy facturas_pdf_insert
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'facturas_pdf');

drop policy if exists facturas_pdf_update on storage.objects;
create policy facturas_pdf_update
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'facturas_pdf')
with check (bucket_id = 'facturas_pdf');

drop policy if exists facturas_pdf_delete on storage.objects;
create policy facturas_pdf_delete
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'facturas_pdf');

-- 3) Columna URL de archivo en facturas
alter table public.facturas
  add column if not exists archivo_url text;

commit;
