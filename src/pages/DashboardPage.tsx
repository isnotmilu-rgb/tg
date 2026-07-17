import { DashboardSummary } from '../components/dashboard/DashboardSummary';
import { useAuth } from '../auth/AuthContext';
import { useViajes } from '../hooks/useViajes';

export function DashboardPage() {
  const { session } = useAuth();
  const { viajes, isLoading, error } = useViajes();

  const viajesVisibles =
    session?.role === 'chofer' && session.choferId
      ? viajes.filter((viaje) => viaje.id_chofer_ref === session.choferId)
      : viajes;

  const stats = {
    ingresosMes: viajesVisibles.reduce((acc, viaje) => acc + viaje.dinero_recibido, 0),
    egresosMes: viajesVisibles.reduce((acc, viaje) => acc + viaje.monto_gasto, 0),
    viajesActivos: viajesVisibles.filter((viaje) => viaje.estado === 'en_curso').length,
  };

  if (isLoading) {
    return <p className="text-slate-500">Cargando dashboard desde Supabase...</p>;
  }

  if (error) {
    return <p className="text-red-600">Error cargando dashboard: {error}</p>;
  }

  return <DashboardSummary stats={stats} viajesRecientes={viajesVisibles} />;
}
