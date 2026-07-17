import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { TravelTable } from '../components/tables/TravelTable';
import { useAuth } from '../auth/AuthContext';
import { useCatalogos } from '../hooks/useCatalogos';
import { useViajes } from '../hooks/useViajes';

export function ViajesPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Viajes</h2>
          <p className="text-slate-500 text-sm mt-1">Vista maestra de viajes registrados en TG.</p>
        </div>
        {session?.role === 'admin' && (
          <Link
            to="/viajes/nuevo"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Registrar Nuevo Viaje
          </Link>
        )}
      </div>

      {isLoading && <p className="text-slate-500">Cargando viajes desde Supabase...</p>}
      {error && <p className="text-red-600">Error cargando viajes: {error}</p>}
      {!isLoading && !error && <TravelTable viajes={viajesVisibles} choferesById={choferesById} />}
    </div>
  );
}
