import { FormEvent, useMemo, useState } from 'react';
import { IdCard, Pencil, Phone, Trash2, Truck } from 'lucide-react';
import { useCatalogos } from '../hooks/useCatalogos';
import { useViajes } from '../hooks/useViajes';

interface ChoferFormState {
  nombre_completo: string;
  rut: string;
  telefono: string;
}

const EMPTY_CHOFER: ChoferFormState = {
  nombre_completo: '',
  rut: '',
  telefono: '',
};

export function ChoferesPage() {
  const {
    choferes,
    camiones,
    isLoading: isLoadingCatalogos,
    error: errorCatalogos,
    createChofer,
    updateChofer,
    deleteChofer,
  } = useCatalogos();
  const { viajes, isLoading: isLoadingViajes, error: errorViajes } = useViajes();

  const [choferForm, setChoferForm] = useState<ChoferFormState>(EMPTY_CHOFER);
  const [editingChoferId, setEditingChoferId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const asignaciones = useMemo(() => {
    return choferes.map((chofer) => {
      const viajesActivos = viajes.filter(
        (viaje) =>
          viaje.id_chofer_ref === chofer.id_chofer &&
          (viaje.estado === 'en_curso' || viaje.estado === 'programado'),
      );

      const camionAsignado = camiones.find(
        (camion) => camion.chofer_id === chofer.id_chofer,
      );

      return {
        chofer,
        camionAsignado,
        viajesActivos,
      };
    });
  }, [choferes, viajes, camiones]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!choferForm.nombre_completo.trim() || !choferForm.rut.trim()) {
      setSubmitError('Nombre y RUT son obligatorios.');
      return;
    }

    try {
      if (editingChoferId) {
        await updateChofer(editingChoferId, {
          nombre_completo: choferForm.nombre_completo.trim(),
          rut: choferForm.rut.trim(),
          telefono: choferForm.telefono.trim(),
        });
      } else {
        await createChofer({
          nombre_completo: choferForm.nombre_completo.trim(),
          rut: choferForm.rut.trim(),
          telefono: choferForm.telefono.trim(),
          activo: true,
        });
      }

      setChoferForm(EMPTY_CHOFER);
      setEditingChoferId(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo guardar el chofer.');
    }
  };

  const handleEdit = (idChofer: string) => {
    const chofer = choferes.find((item) => item.id_chofer === idChofer);

    if (!chofer) {
      return;
    }

    setChoferForm({
      nombre_completo: chofer.nombre_completo,
      rut: chofer.rut,
      telefono: chofer.telefono,
    });
    setEditingChoferId(idChofer);
  };

  const handleDelete = async (idChofer: string) => {
    setSubmitError(null);

    try {
      await deleteChofer(idChofer);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo eliminar el chofer.');
    }
  };

  if (isLoadingCatalogos || isLoadingViajes) {
    return <p className="text-slate-500">Cargando choferes desde Supabase...</p>;
  }

  const error = errorCatalogos ?? errorViajes;

  if (error) {
    return <p className="text-red-600">Error cargando choferes: {error}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Choferes</h2>
        <p className="text-slate-500 text-sm mt-1">Gestion de personal y asignaciones actuales.</p>
      </div>

      {submitError && <p className="text-sm font-medium text-red-600">{submitError}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <input
          value={choferForm.nombre_completo}
          onChange={(event) => setChoferForm((prev) => ({ ...prev, nombre_completo: event.target.value }))}
          placeholder="Nombre completo"
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900"
        />
        <input
          value={choferForm.rut}
          onChange={(event) => setChoferForm((prev) => ({ ...prev, rut: event.target.value }))}
          placeholder="RUT"
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900"
        />
        <input
          value={choferForm.telefono}
          onChange={(event) => setChoferForm((prev) => ({ ...prev, telefono: event.target.value }))}
          placeholder="Telefono"
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900"
        />
        <button type="submit" className="bg-slate-900 text-white rounded-lg px-3 py-2 text-sm font-medium">
          {editingChoferId ? 'Guardar cambios' : 'Agregar chofer'}
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {asignaciones.map(({ chofer, camionAsignado, viajesActivos }) => (
          <article key={chofer.id_chofer} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{chofer.nombre_completo}</h3>
                <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                  <IdCard className="w-4 h-4" />
                  <span>{chofer.rut}</span>
                </div>
                <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4" />
                  <span>{chofer.telefono || 'Sin telefono'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(chofer.id_chofer)}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700"
                >
                  <Pencil className="w-3 h-3" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(chofer.id_chofer)}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-red-100 text-red-700"
                >
                  <Trash2 className="w-3 h-3" /> Eliminar
                </button>
              </div>
            </header>

            <section>
              <h4 className="font-medium text-slate-800 mb-2">Asignaciones Actuales</h4>
              {camionAsignado ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
                  <Truck className="w-3.5 h-3.5" />
                  Camion: {camionAsignado.marca} {camionAsignado.modelo} - {camionAsignado.patente}
                </div>
              ) : (
                <p className="text-sm text-slate-500 mb-3">Sin camion fijo asignado.</p>
              )}

              {viajesActivos.length === 0 ? (
                <p className="text-sm text-slate-500">Sin viajes activos.</p>
              ) : (
                <div className="space-y-2">
                  {viajesActivos.map((viaje) => (
                    <div key={viaje.id_viaje} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                      <p className="font-medium text-slate-900 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        {viaje.id_camion}
                      </p>
                      <p className="text-slate-600 mt-1">{viaje.lugar_inicio} - {viaje.lugar_llegada}</p>
                      <p className="text-xs text-slate-500 mt-1">Estado: {viaje.estado.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </article>
        ))}
      </div>
    </div>
  );
}
