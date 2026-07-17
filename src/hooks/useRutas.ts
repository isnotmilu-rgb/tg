import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface RutaOperativa {
  id_ruta: string;
  origen: string;
  destino: string;
  km: number;
  activa: boolean;
}

export function useRutas() {
  const [rutas, setRutas] = useState<RutaOperativa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('rutas')
      .select('*')
      .order('origen');

    if (fetchError) {
      setError(fetchError.message);
      setRutas([]);
      setIsLoading(false);
      return;
    }

    setRutas((data as RutaOperativa[]) ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    const channel = supabase
      .channel('rutas-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rutas' }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const createRuta = async (payload: Omit<RutaOperativa, 'id_ruta'>) => {
    const { error: createError } = await supabase.from('rutas').insert([payload]);

    if (createError) {
      throw createError;
    }

    await refresh();
  };

  const updateRuta = async (
    idRuta: string,
    updates: Partial<Pick<RutaOperativa, 'origen' | 'destino' | 'km' | 'activa'>>,
  ) => {
    const { error: updateError } = await supabase
      .from('rutas')
      .update(updates)
      .eq('id_ruta', idRuta);

    if (updateError) {
      throw updateError;
    }

    await refresh();
  };

  const deleteRuta = async (idRuta: string) => {
    const { error: deleteError } = await supabase
      .from('rutas')
      .delete()
      .eq('id_ruta', idRuta);

    if (deleteError) {
      throw deleteError;
    }

    await refresh();
  };

  return {
    rutas,
    isLoading,
    error,
    refresh,
    createRuta,
    updateRuta,
    deleteRuta,
  };
}
