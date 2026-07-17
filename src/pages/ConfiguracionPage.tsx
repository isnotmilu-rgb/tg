import { FormEvent, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCatalogos } from '../hooks/useCatalogos';
import { useRutas } from '../hooks/useRutas';

interface CiudadFormState {
  nombre_ciudad: string;
}

interface RutaFormState {
  origen: string;
  destino: string;
  km: number;
}

export function ConfiguracionPage() {
  const {
    ciudades,
    isLoading: isLoadingCatalogos,
    error: errorCatalogos,
    createCiudad,
    updateCiudad,
    deleteCiudad,
  } = useCatalogos();
  const {
    rutas,
    isLoading: isLoadingRutas,
    error: errorRutas,
    createRuta,
    updateRuta,
    deleteRuta,
  } = useRutas();

  const [ciudadForm, setCiudadForm] = useState<CiudadFormState>({ nombre_ciudad: '' });
  const [editingCiudadId, setEditingCiudadId] = useState<string | null>(null);
  const [rutaForm, setRutaForm] = useState<RutaFormState>({ origen: '', destino: '', km: 0 });
  const [editingRutaId, setEditingRutaId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleCiudadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!ciudadForm.nombre_ciudad.trim()) {
      setSubmitError('El nombre de la ciudad es obligatorio.');
      return;
    }

    try {
      if (editingCiudadId) {
        await updateCiudad(editingCiudadId, { nombre_ciudad: ciudadForm.nombre_ciudad.trim() });
      } else {
        await createCiudad({ nombre_ciudad: ciudadForm.nombre_ciudad.trim(), activo: true });
      }

      setCiudadForm({ nombre_ciudad: '' });
      setEditingCiudadId(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo guardar la ciudad.');
    }
  };

  const handleRutaSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!rutaForm.origen.trim() || !rutaForm.destino.trim()) {
      setSubmitError('Origen y destino son obligatorios.');
      return;
    }

    if (rutaForm.origen.trim() === rutaForm.destino.trim()) {
      setSubmitError('Origen y destino no pueden ser iguales.');
      return;
    }

    if (rutaForm.km <= 0) {
      setSubmitError('El kilometraje debe ser mayor que 0.');
      return;
    }

    try {
      if (editingRutaId) {
        await updateRuta(editingRutaId, {
          origen: rutaForm.origen.trim(),
          destino: rutaForm.destino.trim(),
          km: rutaForm.km,
          activa: true,
        });
      } else {
        await createRuta({
          origen: rutaForm.origen.trim(),
          destino: rutaForm.destino.trim(),
          km: rutaForm.km,
          activa: true,
        });
      }

      setRutaForm({ origen: '', destino: '', km: 0 });
      setEditingRutaId(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo guardar la ruta.');
    }
  };

  if (isLoadingCatalogos || isLoadingRutas) {
    return <p className="text-slate-500">Cargando configuracion desde Supabase...</p>;
  }

  const error = errorCatalogos ?? errorRutas;

  if (error) {
    return <p className="text-red-600">Error cargando configuracion: {error}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Configuracion</h2>
        <p className="text-slate-500 text-sm mt-1">Gestion de catalogos operativos (ciudades y rutas).</p>
      </div>

      {submitError && <p className="text-sm font-medium text-red-600">{submitError}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Ciudades (CRUD)</h3>
          <form onSubmit={handleCiudadSubmit} className="flex gap-2 mb-4">
            <input
              value={ciudadForm.nombre_ciudad}
              onChange={(event) => setCiudadForm({ nombre_ciudad: event.target.value })}
              placeholder="Agregar ciudad operativa"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-slate-900"
            />
            <button type="submit" className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-900 text-white">
              <Plus className="w-4 h-4" /> {editingCiudadId ? 'Guardar' : 'Agregar'}
            </button>
          </form>

          <div className="space-y-2">
            {ciudades.map((ciudad) => (
              <div
                key={ciudad.id_ciudad}
                className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center"
              >
                <div>
                  <p className="text-slate-700 font-medium">{ciudad.nombre_ciudad}</p>
                  <p className={`text-xs ${ciudad.activo ? 'text-emerald-600' : 'text-red-600'}`}>
                    {ciudad.activo ? 'Activa' : 'Inactiva'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCiudadId(ciudad.id_ciudad);
                      setCiudadForm({ nombre_ciudad: ciudad.nombre_ciudad });
                    }}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700"
                  >
                    <Pencil className="w-3 h-3" /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCiudad(ciudad.id_ciudad)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-red-100 text-red-700"
                  >
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Rutas (CRUD)</h3>
          <form onSubmit={handleRutaSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
            <input
              value={rutaForm.origen}
              onChange={(event) => setRutaForm((prev) => ({ ...prev, origen: event.target.value }))}
              placeholder="Origen"
              className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-slate-900"
            />
            <input
              value={rutaForm.destino}
              onChange={(event) => setRutaForm((prev) => ({ ...prev, destino: event.target.value }))}
              placeholder="Destino"
              className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-slate-900"
            />
            <input
              type="number"
              value={rutaForm.km}
              min={1}
              onChange={(event) => setRutaForm((prev) => ({ ...prev, km: Number(event.target.value) || 0 }))}
              className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-slate-900"
              placeholder="KM"
            />
            <button type="submit" className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white">
              <Plus className="w-4 h-4" /> {editingRutaId ? 'Guardar' : 'Ruta'}
            </button>
          </form>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {rutas.map((ruta) => (
              <div
                key={ruta.id_ruta}
                className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-sm"
              >
                <div>
                  <p className="font-medium">{ruta.origen} - {ruta.destino}</p>
                  <p className="text-xs text-slate-500">{ruta.km} km</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRutaId(ruta.id_ruta);
                      setRutaForm({ origen: ruta.origen, destino: ruta.destino, km: ruta.km });
                    }}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700"
                  >
                    <Pencil className="w-3 h-3" /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRuta(ruta.id_ruta)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-red-100 text-red-700"
                  >
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
