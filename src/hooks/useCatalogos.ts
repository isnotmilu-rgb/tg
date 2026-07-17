import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Camion, Chofer, Ciudad } from '../types';

export function useCatalogos() {
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [camiones, setCamiones] = useState<Camion[]>([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [ciudadesResp, camionesResp, choferesResp] = await Promise.all([
      supabase.from('ciudades').select('*').order('nombre_ciudad'),
      supabase.from('camiones').select('*').order('patente'),
      supabase.from('choferes').select('*').order('nombre_completo'),
    ]);

    const firstError = ciudadesResp.error ?? camionesResp.error ?? choferesResp.error;

    if (firstError) {
      setError(firstError.message);
      setCiudades([]);
      setCamiones([]);
      setChoferes([]);
      setIsLoading(false);
      return;
    }

    setCiudades((ciudadesResp.data as Ciudad[]) ?? []);
    setCamiones((camionesResp.data as Camion[]) ?? []);
    setChoferes((choferesResp.data as Chofer[]) ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    const channel = supabase
      .channel('catalogos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ciudades' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'camiones' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'choferes' }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const createCiudad = async (payload: Pick<Ciudad, 'nombre_ciudad' | 'activo'>) => {
    const { error: createError } = await supabase.from('ciudades').insert([payload]);

    if (createError) {
      throw createError;
    }

    await refresh();
  };

  const updateCiudad = async (
    idCiudad: string,
    updates: Partial<Pick<Ciudad, 'nombre_ciudad' | 'activo'>>,
  ) => {
    const { error: updateError } = await supabase
      .from('ciudades')
      .update(updates)
      .eq('id_ciudad', idCiudad);

    if (updateError) {
      throw updateError;
    }

    await refresh();
  };

  const deleteCiudad = async (idCiudad: string) => {
    const { error: deleteError } = await supabase
      .from('ciudades')
      .delete()
      .eq('id_ciudad', idCiudad);

    if (deleteError) {
      throw deleteError;
    }

    await refresh();
  };

  const createCamion = async (
    payload: Pick<
      Camion,
      'patente' | 'marca' | 'modelo' | 'capacidad_toneladas' | 'chofer_id' | 'activo'
    >,
  ) => {
    const { error: createError } = await supabase.from('camiones').insert([payload]);

    if (createError) {
      throw createError;
    }

    await refresh();
  };

  const updateCamion = async (
    idCamion: string,
    updates: Partial<
      Pick<Camion, 'patente' | 'marca' | 'modelo' | 'capacidad_toneladas' | 'chofer_id' | 'activo'>
    >,
  ) => {
    const { error: updateError } = await supabase
      .from('camiones')
      .update(updates)
      .eq('id_camion', idCamion);

    if (updateError) {
      throw updateError;
    }

    await refresh();
  };

  const retirarCamion = async (idCamion: string) => {
    const { error: updateError } = await supabase
      .from('camiones')
      .update({ activo: false })
      .eq('id_camion', idCamion);

    if (updateError) {
      throw updateError;
    }

    await refresh();
  };

  const createChofer = async (
    payload: Pick<Chofer, 'nombre_completo' | 'rut' | 'telefono' | 'activo'>,
  ) => {
    const { error: createError } = await supabase.from('choferes').insert([payload]);

    if (createError) {
      throw createError;
    }

    await refresh();
  };

  const updateChofer = async (
    idChofer: string,
    updates: Partial<Pick<Chofer, 'nombre_completo' | 'rut' | 'telefono' | 'activo'>>,
  ) => {
    const { error: updateError } = await supabase
      .from('choferes')
      .update(updates)
      .eq('id_chofer', idChofer);

    if (updateError) {
      throw updateError;
    }

    await refresh();
  };

  const deleteChofer = async (idChofer: string) => {
    const { error: deleteError } = await supabase
      .from('choferes')
      .delete()
      .eq('id_chofer', idChofer);

    if (deleteError) {
      throw deleteError;
    }

    await refresh();
  };

  return {
    ciudades,
    camiones,
    choferes,
    isLoading,
    error,
    refresh,
    createCiudad,
    updateCiudad,
    deleteCiudad,
    createCamion,
    updateCamion,
    retirarCamion,
    createChofer,
    updateChofer,
    deleteChofer,
  };
}
