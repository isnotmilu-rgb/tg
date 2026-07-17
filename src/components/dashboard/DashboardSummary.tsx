import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { KPIStats, Viaje } from '../../types';
import { TravelTable } from '../tables/TravelTable';
import { Tooltip } from '../ui/Tooltip';

interface DashboardSummaryProps {
  stats: KPIStats;
  viajesRecientes: Viaje[];
}

export function DashboardSummary({ stats, viajesRecientes }: DashboardSummaryProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard General</h2>
          <p className="text-slate-500 text-sm mt-1">Resumen de operaciones y finanzas TG.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0f172a] p-6 rounded-2xl shadow-md border border-slate-800 text-white">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-slate-400">Viajes Activos</p>
                <Tooltip text="Viajes que se encuentran actualmente en ruta." />
              </div>
              <div className="p-2 bg-slate-800 rounded-xl">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <h3 className="text-4xl font-bold mt-1 tracking-tight">{stats.viajesActivos}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-slate-500">Ingresos del Mes</p>
              <Tooltip text="Total de dinero facturado en el mes actual." />
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              ${stats.ingresosMes.toLocaleString('es-CL')}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-slate-500">Eficiencia de Flota (Gastos)</p>
              <Tooltip text="Relación entre gastos operativos y rendimiento de los camiones." />
            </div>
            <div className="p-2 bg-red-50 rounded-xl">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              ${stats.egresosMes.toLocaleString('es-CL')}
            </h3>
          </div>
        </div>
      </div>

      <TravelTable viajes={viajesRecientes} />
    </div>
  );
}
