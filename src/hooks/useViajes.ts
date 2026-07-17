import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Viaje } from '../types';

export function useViajes() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('viajes')
      .select('*')
      .order('fecha', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setViajes([]);
      setIsLoading(false);
      return;
    }

    setViajes((data as Viaje[]) ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    viajes,
    isLoading,
    error,
    refresh,
  };
}
