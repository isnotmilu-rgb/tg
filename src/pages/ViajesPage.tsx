import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { TravelTable } from '../components/tables/TravelTable';
import { useAuth } from '../auth/AuthContext';
import { useCatalogos } from '../hooks/useCatalogos';
import { useViajes } from '../hooks/useViajes';

export function ViajesPage() {
  const [selectedCamionId, setSelectedCamionId] = useState('todos');
  const { session } = useAuth();
  const { viajes, isLoading, error } = useViajes();
  const { choferes } = useCatalogos();

  const choferesById = choferes.reduce<Record<string, string>>((acc, chofer) => {
    acc[chofer.id_chofer] = chofer.nombre_completo;
    return acc;
  }, {});

  const viajesVisibles =
    session?.role === 'chofer' && session.choferId
      ? viajes.filter((viaje) => viaje.id_chofer_ref === session.choferId)
      : viajes;

  const camionesDisponibles = useMemo(() => {
    const map = new Map<string, string>();

    viajesVisibles.forEach((viaje) => {
      const camionRelacion = Array.isArray(viaje.camiones) ? viaje.camiones[0] : viaje.camiones;
      const label = camionRelacion?.patente
        ? `${camionRelacion.patente} (${camionRelacion.marca} ${camionRelacion.modelo})`
        : viaje.id_camion;

      map.set(viaje.id_camion, label);
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [viajesVisibles]);

  const viajesFiltrados = useMemo(() => {
    if (selectedCamionId === 'todos') {
      return viajesVisibles;
    }

    return viajesVisibles.filter((viaje) => viaje.id_camion === selectedCamionId);
  }, [selectedCamionId, viajesVisibles]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Viajes</h2>
          <p className="text-slate-500 text-sm mt-1">Vista maestra de viajes registrados en TG.</p>
        </div>
        {session?.role === 'admin' && (
          <Link
            to="/app/viajes/nuevo"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar Nuevo Viaje
          </Link>
        )}
      </div>

      <div className="w-full md:w-72">
        <label htmlFor="viajes-camion-filter" className="block text-xs font-semibold text-slate-600 mb-1">
          Filtrar por camion
        </label>
        <select
          id="viajes-camion-filter"
          value={selectedCamionId}
          onChange={(event) => setSelectedCamionId(event.target.value)}
          className="h-11 w-full border border-slate-300 rounded-lg px-3 bg-white text-sm outline-none focus:border-slate-900"
        >
          <option value="todos">Todos los camiones</option>
          {camionesDisponibles.map((camion) => (
            <option key={camion.value} value={camion.value}>
              {camion.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-slate-500">Cargando viajes desde Supabase...</p>}
      {error && <p className="text-red-600">Error cargando viajes: {error}</p>}
      {!isLoading && !error && (
        <div className="max-w-full overflow-x-auto">
          <TravelTable viajes={viajesFiltrados} choferesById={choferesById} />
        </div>
      )}
    </div>
  );
}
