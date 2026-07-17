import { useMemo, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';

const TITLES: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/viajes': 'Viajes',
  '/app/viajes/nuevo': 'Registrar Nuevo Viaje',
  '/app/flota': 'Flota',
  '/app/choferes': 'Choferes',
  '/app/configuracion': 'Configuracion',
};

export default function App() {
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const title = useMemo(() => TITLES[location.pathname] ?? 'Transportes Gallardo', [location.pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {isMobileSidebarOpen && (
          <button
            type="button"
            aria-label="Cerrar menu"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/40"
          />
        )}

        <div
          className={`md:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-200 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
        </div>

        <header className="md:hidden bg-[#0f172a] text-white p-4 sticky top-0 z-20 shadow-md">
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label={isMobileSidebarOpen ? 'Cerrar menu' : 'Abrir menu'}
              onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-200 hover:bg-slate-800"
            >
              {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">TG</h1>
              <p className="text-slate-300 text-sm">{title}</p>
            </div>
            <div className="w-9" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
