import { CheckCircle, Activity, FileText, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Viaje } from '../../types';

interface TravelTableProps {
  viajes: Viaje[];
  choferesById?: Record<string, string>;
}

export function TravelTable({ viajes, choferesById = {} }: TravelTableProps) {
  const exportXlsx = () => {
    const rows = viajes.map((viaje) => ({
      Fecha: new Date(viaje.fecha).toLocaleDateString('es-CL'),
      Camion: viaje.id_camion,
      Chofer: choferesById[viaje.id_chofer_ref] ?? viaje.id_chofer_ref,
      Origen: viaje.lugar_inicio,
      Destino: viaje.lugar_llegada,
      Ruta: `${viaje.lugar_inicio} -> ${viaje.lugar_llegada}`,
      'Total Km': viaje.km_total,
      Concepto: viaje.concepto_gasto,
      'Dinero Recibido': viaje.dinero_recibido,
      'Monto Gasto': viaje.monto_gasto,
      'Saldo a Rendir': viaje.saldo_a_rendir,
      Estado: viaje.estado,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: [
        'Fecha',
        'Camion',
        'Chofer',
        'Origen',
        'Destino',
        'Ruta',
        'Total Km',
        'Concepto',
        'Dinero Recibido',
        'Monto Gasto',
        'Saldo a Rendir',
        'Estado',
      ],
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Viajes');

    const today = new Date().toISOString().split('T')[0];
    const fileName = `TG_Viajes_${today}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-400" />
          Hoja de Vida de Viajes (TG)
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Filtrar:</label>
          <select className="text-sm border border-slate-300 rounded-lg py-1.5 px-3 bg-white outline-none focus:border-[#0f172a] shadow-sm">
            <option>Todos</option>
            <option>En Curso</option>
            <option>Completado</option>
          </select>
          <button
            type="button"
            onClick={exportXlsx}
            className="inline-flex items-center gap-2 bg-emerald-600/90 text-white text-sm font-semibold px-3.5 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar XLSX
          </button>
        </div>
      </div>

      {/* Dense Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Camion</th>
              <th className="px-6 py-3">Chofer</th>
              <th className="px-6 py-3">Ruta</th>
              <th className="px-6 py-3 text-right">Km Total</th>
              <th className="px-6 py-3">Concepto</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Dinero</th>
              <th className="px-6 py-3 text-right">Gasto</th>
              <th className="px-6 py-3 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {viajes.map((viaje) => (
              <tr key={viaje.id_viaje} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 text-slate-600">
                  {new Date(viaje.fecha).toLocaleDateString('es-CL')}
                </td>
                <td className="px-6 py-4 font-medium text-slate-800">{viaje.id_camion}</td>
                <td className="px-6 py-4 text-slate-600">{choferesById[viaje.id_chofer_ref] ?? viaje.id_chofer_ref}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{viaje.lugar_inicio} → {viaje.lugar_llegada}</div>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">#{viaje.id_viaje.substring(0,8).toUpperCase()}</div>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">{viaje.km_total.toLocaleString('es-CL')}</td>
                <td className="px-6 py-4 text-slate-600">{viaje.concepto_gasto}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    viaje.estado === 'completado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    viaje.estado === 'en_curso' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {viaje.estado === 'completado' && <CheckCircle className="w-3.5 h-3.5" />}
                    {viaje.estado === 'en_curso' && <Activity className="w-3.5 h-3.5" />}
                    {viaje.estado === 'completado' ? 'Completado' : 
                     viaje.estado === 'en_curso' ? 'En Curso' : 'Programado'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">
                  ${viaje.dinero_recibido.toLocaleString('es-CL')}
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">
                  ${viaje.monto_gasto.toLocaleString('es-CL')}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`font-bold ${
                    viaje.saldo_a_rendir > 0 ? 'text-emerald-600' : 
                    viaje.saldo_a_rendir < 0 ? 'text-red-600' : 'text-slate-400'
                  }`}>
                    ${viaje.saldo_a_rendir.toLocaleString('es-CL')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
        <span>Mostrando {viajes.length} registros recientes</span>
        <button className="text-[#0f172a] font-medium hover:underline">Ver Historial Completo →</button>
      </div>
    </div>
  );
}
