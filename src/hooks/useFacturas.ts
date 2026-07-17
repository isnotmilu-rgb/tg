import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface FacturaCamion {
  id_factura: string;
  patente: string;
  folio: string;
  fecha: string;
  monto: number;
  descripcion: string;
  archivo_url?: string | null;
}

export function useFacturas() {
  const [facturas, setFacturas] = useState<FacturaCamion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('facturas')
      .select('*')
      .order('fecha', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setFacturas([]);
      setIsLoading(false);
      return;
    }

    setFacturas((data as FacturaCamion[]) ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    const channel = supabase
      .channel('facturas-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'facturas' }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const createFactura = async (payload: Omit<FacturaCamion, 'id_factura'>) => {
    const { error: createError } = await supabase.from('facturas').insert([payload]);

    if (createError) {
      throw createError;
    }

    await refresh();
  };

  const updateFactura = async (
    idFactura: string,
    updates: Partial<
      Pick<FacturaCamion, 'patente' | 'folio' | 'fecha' | 'monto' | 'descripcion' | 'archivo_url'>
    >,
  ) => {
    const { error: updateError } = await supabase
      .from('facturas')
      .update(updates)
      .eq('id_factura', idFactura);

    if (updateError) {
      throw updateError;
    }

    await refresh();
  };

  const deleteFactura = async (idFactura: string) => {
    const { error: deleteError } = await supabase
      .from('facturas')
      .delete()
      .eq('id_factura', idFactura);

    if (deleteError) {
      throw deleteError;
    }

    await refresh();
  };

  return {
    facturas,
    isLoading,
    error,
    refresh,
    createFactura,
    updateFactura,
    deleteFactura,
  };
}
