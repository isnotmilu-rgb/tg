import { FormEvent, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCatalogos } from '../hooks/useCatalogos';

type AccessMode = 'admin' | 'chofer';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, isReady, loginAsAdmin, loginAsChofer } = useAuth();
  const { choferes, isLoading, error } = useCatalogos();

  const [mode, setMode] = useState<AccessMode>('admin');
  const [password, setPassword] = useState('');
  const [selectedChoferId, setSelectedChoferId] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const choferesActivos = useMemo(() => choferes.filter((chofer) => chofer.activo), [choferes]);

  if (!isReady) {
    return <p className="p-6 text-slate-500">Cargando sesion...</p>;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    if (mode === 'admin') {
      const ok = loginAsAdmin(password);

      if (!ok) {
        setLoginError('Contrasena de administrador incorrecta.');
        return;
      }

      navigate('/');
      return;
    }

    if (!selectedChoferId) {
      setLoginError('Selecciona un chofer para continuar.');
      return;
    }

    const chofer = choferesActivos.find((item) => item.id_chofer === selectedChoferId);

    if (!chofer) {
      setLoginError('No se encontro el chofer seleccionado.');
      return;
    }

    loginAsChofer({ choferId: chofer.id_chofer, choferNombre: chofer.nombre_completo });
    navigate('/viajes');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TG Logistics</h1>
          <p className="text-slate-400 mt-1">Acceso al sistema operativo de Transportes Gallardo.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-800 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setMode('admin')}
            className={`rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === 'admin' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Ingresar como Administrador
          </button>
          <button
            type="button"
            onClick={() => setMode('chofer')}
            className={`rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === 'chofer' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            Ingresar como Chofer
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'admin' && (
            <div>
              <label className="block text-sm font-medium mb-1">Contrasena maestra</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ingresa contrasena"
                className="w-full border border-slate-700 bg-slate-950 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {mode === 'chofer' && (
            <div>
              <label className="block text-sm font-medium mb-1">Selecciona tu nombre</label>
              <select
                value={selectedChoferId}
                onChange={(event) => setSelectedChoferId(event.target.value)}
                disabled={isLoading}
                className="w-full border border-slate-700 bg-slate-950 rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
              >
                <option value="">Seleccionar chofer...</option>
                {choferesActivos.map((chofer) => (
                  <option key={chofer.id_chofer} value={chofer.id_chofer}>
                    {chofer.nombre_completo}
                  </option>
                ))}
              </select>
              {isLoading && <p className="text-xs text-slate-400 mt-1">Cargando choferes desde Supabase...</p>}
              {error && <p className="text-xs text-red-400 mt-1">Error: {error}</p>}
            </div>
          )}

          {loginError && <p className="text-sm text-red-400 font-medium">{loginError}</p>}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-lg py-2.5 font-semibold transition-colors"
          >
            Entrar al sistema
          </button>
        </form>
      </div>
    </div>
  );
}
