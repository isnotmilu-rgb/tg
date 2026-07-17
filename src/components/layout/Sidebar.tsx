import { LayoutDashboard, Truck, Users, FileText, ReceiptText, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className = '', onNavigate }: SidebarProps) {
  const { session, logout } = useAuth();
  const isAdmin = session?.role === 'admin';

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, to: '/app' },
    { name: 'Viajes', icon: FileText, to: '/app/viajes' },
    { name: 'Flota', icon: Truck, to: '/app/flota' },
    { name: 'Facturas', icon: ReceiptText, to: '/app/facturas' },
    ...(isAdmin
      ? [
          { name: 'Choferes', icon: Users, to: '/app/choferes' },
          { name: 'Configuracion', icon: Settings, to: '/app/configuracion' },
        ]
      : []),
  ];

  const initials = (session?.choferNombre ?? 'Usuario')
    .split(' ')
    .map((chunk) => chunk[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className={`w-64 h-screen bg-slate-900 text-slate-100 flex flex-col ${className}`}>
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight">Transportes Gallardo</h1>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white border-r-2 border-emerald-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3">
            <span className="text-sm font-bold">{initials}</span>
          </div>
          <div className="text-sm flex-1">
            <p className="font-medium">{session?.choferNombre ?? 'Usuario'}</p>
            <p className="text-slate-400 capitalize">{session?.role ?? 'Invitado'}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            Salir
          </button>
        </div>
      </div>
    </aside>
  );
}
