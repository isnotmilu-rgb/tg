import { useEffect, useMemo, useState } from 'react';
import { FileDown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface CamionRef {
  patente: string;
  marca: string;
  modelo: string;
}

interface FacturaRow {
  id_factura: string;
  patente: string;
  folio: string;
  fecha: string;
  monto: number;
  descripcion: string;
  archivo_url?: string | null;
  camiones?: CamionRef | CamionRef[] | null;
}

function resolveCamion(factura: FacturaRow, camionesByPatente: Record<string, CamionRef>) {
  const related = Array.isArray(factura.camiones) ? factura.camiones[0] : factura.camiones;
  if (related?.patente) {
    return related;
  }

  return camionesByPatente[factura.patente];
}

export function FacturasPage() {
  const PAGE_SIZE = 10;

  const [facturas, setFacturas] = useState<FacturaRow[]>([]);
  const [camionesByPatente, setCamionesByPatente] = useState<Record<string, CamionRef>>({});
  const [selectedPatente, setSelectedPatente] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      const [facturasResp, camionesResp] = await Promise.all([
        supabase
          .from('facturas')
          .select('id_factura, patente, folio, fecha, monto, descripcion, archivo_url, camiones(patente, marca, modelo)')
          .order('fecha', { ascending: false }),
        supabase
          .from('camiones')
          .select('patente, marca, modelo')
          .order('patente', { ascending: true }),
      ]);

      if (facturasResp.error) {
        setError(facturasResp.error.message);
        setFacturas([]);
        setIsLoading(false);
        return;
      }

      const camionesList = (camionesResp.data as CamionRef[] | null) ?? [];
      const camionesMap = camionesList.reduce<Record<string, CamionRef>>((acc, camion) => {
        acc[camion.patente] = camion;
        return acc;
      }, {});

      setCamionesByPatente(camionesMap);
      setFacturas((facturasResp.data as FacturaRow[] | null) ?? []);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const patentesDisponibles = useMemo(() => {
    const fromFacturas = facturas.map((factura) => factura.patente).filter(Boolean);
    const fromCamiones = Object.keys(camionesByPatente);
    return Array.from(new Set([...fromFacturas, ...fromCamiones])).sort((a, b) => a.localeCompare(b));
  }, [camionesByPatente, facturas]);

  const facturasFiltradas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const byCamion =
      selectedPatente === 'todos'
        ? facturas
        : facturas.filter((factura) => factura.patente === selectedPatente);

    if (!term) {
      return byCamion;
    }

    return byCamion.filter((factura) => {
      const folio = factura.folio?.toLowerCase() ?? '';
      const descripcion = factura.descripcion?.toLowerCase() ?? '';
      return folio.includes(term) || descripcion.includes(term);
    });
  }, [facturas, searchTerm, selectedPatente]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(facturasFiltradas.length / PAGE_SIZE)),
    [facturasFiltradas.length],
  );

  const facturasPaginadas = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return facturasFiltradas.slice(start, start + PAGE_SIZE);
  }, [currentPage, facturasFiltradas]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPatente, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startResult = facturasFiltradas.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endResult = Math.min(currentPage * PAGE_SIZE, facturasFiltradas.length);

  const goPrev = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPage >= totalPages - 2) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  }, [currentPage, totalPages]);

  if (isLoading) {
    return <p className="text-slate-500">Cargando facturas desde Supabase...</p>;
  }

  if (error) {
    return <p className="text-red-600">Error cargando facturas: {error}</p>;
  }

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Gestion de Facturas</h2>
          <p className="text-slate-500 text-sm mt-1">Consulta y control de facturas vinculadas por camion.</p>
        </div>

        <div className="w-full md:w-auto grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-2">
          <div className="w-full md:w-80">
            <label htmlFor="facturas-busqueda" className="block text-xs font-semibold text-slate-600 mb-1">
              Buscar por folio o descripcion
            </label>
            <input
              id="facturas-busqueda"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ej: 4521 o combustible"
              className="h-11 w-full border border-slate-300 rounded-lg px-3 bg-white text-sm outline-none focus:border-slate-900"
            />
          </div>

          <div className="w-full md:w-72">
            <label htmlFor="facturas-camion-filter" className="block text-xs font-semibold text-slate-600 mb-1">
              Filtrar por camion
            </label>
            <select
              id="facturas-camion-filter"
              value={selectedPatente}
              onChange={(event) => setSelectedPatente(event.target.value)}
              className="h-11 w-full border border-slate-300 rounded-lg px-3 bg-white text-sm outline-none focus:border-slate-900"
            >
              <option value="todos">Todos los camiones</option>
              {patentesDisponibles.map((patente) => (
                <option key={patente} value={patente}>
                  {patente}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Mostrando {startResult}-{endResult} de {facturasFiltradas.length} facturas.
      </p>

      <div className="md:hidden space-y-3">
        {facturasPaginadas.map((factura) => {
          const camion = resolveCamion(factura, camionesByPatente);

          return (
            <article key={factura.id_factura} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">Folio {factura.folio}</p>
                <p className="font-bold text-slate-900">${factura.monto.toLocaleString('es-CL')}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1">{new Date(factura.fecha).toLocaleDateString('es-CL')}</p>
              <p className="text-sm text-slate-700 mt-2">{factura.descripcion}</p>
              <p className="text-xs text-slate-500 mt-2">
                Camion: {camion ? `${camion.patente} (${camion.marca} ${camion.modelo})` : factura.patente}
              </p>
              <div className="mt-3">
                {factura.archivo_url ? (
                  <a
                    href={factura.archivo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                  >
                    <FileDown className="h-3 w-3" /> Ver PDF
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Sin PDF</span>
                )}
              </div>
            </article>
          );
        })}

        {facturasPaginadas.length === 0 && (
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
            No hay facturas para los filtros aplicados.
          </p>
        )}
      </div>

      <div className="hidden md:block max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Folio</th>
              <th className="px-4 py-3 text-left">Camion</th>
              <th className="px-4 py-3 text-right">Monto</th>
              <th className="px-4 py-3 text-left">Descripcion</th>
              <th className="px-4 py-3 text-left">PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {facturasPaginadas.map((factura) => {
              const camion = resolveCamion(factura, camionesByPatente);

              return (
                <tr key={factura.id_factura} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{factura.folio}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {camion ? `${camion.patente} (${camion.marca} ${camion.modelo})` : factura.patente}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    ${factura.monto.toLocaleString('es-CL')}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{factura.descripcion}</td>
                  <td className="px-4 py-3">
                    {factura.archivo_url ? (
                      <a
                        href={factura.archivo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                      >
                        <FileDown className="h-3 w-3" /> Ver PDF
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Sin PDF</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {facturasPaginadas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No hay facturas para los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-slate-500">
          Pagina {currentPage} de {totalPages}
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-md border border-slate-300 bg-white text-sm text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={`h-9 min-w-9 px-2 rounded-md border text-sm ${
                currentPage === page
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={goNext}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-md border border-slate-300 bg-white text-sm text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
