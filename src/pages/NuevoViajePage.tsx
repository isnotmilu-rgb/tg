import { useNavigate } from 'react-router-dom';
import { TravelForm } from '../components/forms/TravelForm';
import { useCatalogos } from '../hooks/useCatalogos';

export function NuevoViajePage() {
  const navigate = useNavigate();
  const { ciudades, camiones, choferes, isLoading, error } = useCatalogos();

  if (isLoading) {
    return <p className="text-slate-500">Cargando catalogos desde Supabase...</p>;
  }

  if (error) {
    return <p className="text-red-600">Error cargando catalogos: {error}</p>;
  }

  return (
    <TravelForm
      ciudades={ciudades}
      camiones={camiones}
      choferes={choferes}
      onSubmitSuccess={() => navigate('/viajes')}
      onCancel={() => navigate('/viajes')}
    />
  );
}
