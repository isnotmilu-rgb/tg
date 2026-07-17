import { useState } from 'react';
import { Viaje } from '../../types';

interface HojaVidaTableProps {
  viajes: Viaje[];
}

export function HojaVidaTable({ viajes }: HojaVidaTableProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const viajesFiltrados = viajes.filter(v => 
    filtroEstado === 'todos' ? true : v.estado === filtroEstado
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden w-full">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-900">Hoja de Vida de Viajes</h2>
        <select 
          className="border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-slate-900"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="programado">Programados</option>
          <option value="en_curso">En Curso</option>
          <option value="completado">Completados</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-medium">
            <tr>
              <th className="px-6 py-3 border-b border-slate-200">ID / Ruta</th>
              <th className="px-6 py-3 border-b border-slate-200">Fecha Salida</th>
              <th className="px-6 py-3 border-b border-slate-200">Estado</th>
              <th className="px-6 py-3 border-b border-slate-200 text-right">Monto</th>
              <th className="px-6 py-3 border-b border-slate-200 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {viajesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No hay viajes que mostrar
                </td>
              </tr>
            ) : (
              viajesFiltrados.map((viaje) => (
                <tr key={viaje.id_viaje} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 truncate max-w-[150px]">{viaje.lugar_inicio} → {viaje.lugar_llegada}</p>
                    <p className="text-xs text-slate-400">ID: {viaje.id_viaje.substring(0,8)}...</p>
                  </td>
                  <td className="px-6 py-4">{new Date(viaje.fecha).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      viaje.estado === 'completado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      viaje.estado === 'en_curso' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {viaje.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">${viaje.dinero_recibido.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">${viaje.saldo_a_rendir.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
