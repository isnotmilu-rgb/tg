begin;

alter table public.camiones
  add column if not exists chofer_id uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'camiones_chofer_id_fkey'
      and conrelid = 'public.camiones'::regclass
  ) then
    alter table public.camiones
      add constraint camiones_chofer_id_fkey
      foreign key (chofer_id)
      references public.choferes(id_chofer)
      on update cascade
      on delete set null;
  end if;
end $$;

create index if not exists idx_camiones_chofer_id on public.camiones(chofer_id);

update public.camiones c
set chofer_id = ch.id_chofer
from public.choferes ch
where c.patente = 'CFLJ13'
  and ch.nombre_completo = 'Cristobal Gallardo';

update public.camiones c
set chofer_id = ch.id_chofer
from public.choferes ch
where c.patente = 'HFST75'
  and ch.nombre_completo = 'Fabian Gallardo';

update public.camiones c
set chofer_id = ch.id_chofer
from public.choferes ch
where c.patente = 'BFKR43'
  and ch.nombre_completo = 'Nelson Gallardo';

update public.camiones c
set chofer_id = ch.id_chofer
from public.choferes ch
where c.patente = 'GPRG56'
  and ch.nombre_completo = 'Victor Rios';

commit;
