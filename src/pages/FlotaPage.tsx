import { FormEvent, useMemo, useState } from 'react';
import { ChevronDown, CircleHelp, ClipboardList, FileDown, Fuel, Paperclip, Pencil, Trash2, Truck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useCatalogos } from '../hooks/useCatalogos';
import { useFacturas } from '../hooks/useFacturas';
import { useViajes } from '../hooks/useViajes';
import { supabase } from '../lib/supabaseClient';

interface CamionFormState {
  patente: string;
  marca: string;
  modelo: string;
  capacidad_toneladas: number;
  chofer_id: string;
}

interface FacturaFormState {
  folio: string;
  fecha: string;
  monto: number;
  descripcion: string;
  archivo_url: string;
}

const EMPTY_CAMION: CamionFormState = {
  patente: '',
  marca: '',
  modelo: '',
  capacidad_toneladas: 0,
  chofer_id: '',
};

const EMPTY_FACTURA: FacturaFormState = {
  folio: '',
  fecha: '',
  monto: 0,
  descripcion: '',
  archivo_url: '',
};

function HelpTooltip({ text }: { text: string }) {
  return (
    <span className="absolute right-2 top-2 z-20">
      <span className="group relative inline-flex items-center">
        <CircleHelp className="h-3.5 w-3.5 text-slate-400 transition-colors hover:text-slate-500" aria-hidden="true" />
        <span className="pointer-events-none absolute right-0 top-5 hidden w-52 rounded-md border border-slate-200 bg-slate-900 px-2 py-1.5 text-[11px] leading-snug text-white shadow-lg group-hover:block">
          {text}
        </span>
      </span>
    </span>
  );
}

export function FlotaPage() {
  const { session } = useAuth();
  const {
    camiones,
    choferes,
    isLoading: isLoadingCatalogos,
    error: errorCatalogos,
    createCamion,
    updateCamion,
    retirarCamion,
  } = useCatalogos();
  const { viajes, isLoading: isLoadingViajes, error: errorViajes } = useViajes();
  const {
    facturas,
    isLoading: isLoadingFacturas,
    error: errorFacturas,
    createFactura,
    updateFactura,
    deleteFactura,
  } = useFacturas();

  const [camionSeleccionado, setCamionSeleccionado] = useState('');
  const [camionForm, setCamionForm] = useState<CamionFormState>(EMPTY_CAMION);
  const [isCamionFormOpen, setIsCamionFormOpen] = useState(false);
  const [editingCamionId, setEditingCamionId] = useState<string | null>(null);
  const [facturaForm, setFacturaForm] = useState<FacturaFormState>(EMPTY_FACTURA);
  const [facturaPdfFile, setFacturaPdfFile] = useState<File | null>(null);
  const [editingFacturaId, setEditingFacturaId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isAdmin = session?.role === 'admin';

  const viajesVisibles =
    session?.role === 'chofer' && session.choferId
      ? viajes.filter((viaje) => viaje.id_chofer_ref === session.choferId)
      : viajes;

  const camionesVisibles = useMemo(() => {
    if (isAdmin) {
      return camiones;
    }

    const allowed = new Set(viajesVisibles.map((viaje) => viaje.id_camion));

    return camiones.filter(
      (camion) => allowed.has(camion.id_camion) || allowed.has(camion.patente),
    );
  }, [camiones, isAdmin, viajesVisibles]);

  const camionSeleccionadoResuelto =
    camionSeleccionado ||
    camionesVisibles.find((camion) => camion.activo)?.patente ||
    camionesVisibles[0]?.patente ||
    '';

  const viajesDelCamion = useMemo(
    () =>
      viajesVisibles.filter(
        (viaje) =>
          viaje.id_camion === camionSeleccionadoResuelto ||
          camionesVisibles.some(
            (camion) => camion.patente === camionSeleccionadoResuelto && camion.id_camion === viaje.id_camion,
          ),
      ),
    [camionSeleccionadoResuelto, viajesVisibles, camionesVisibles],
  );

  const facturasDelCamion = useMemo(
    () => facturas.filter((factura) => factura.patente === camionSeleccionadoResuelto),
    [camionSeleccionadoResuelto, facturas],
  );

  const resumen = useMemo(() => {
    return {
      km: viajesDelCamion.reduce((acc, viaje) => acc + viaje.km_total, 0),
      gastos: viajesDelCamion.reduce((acc, viaje) => acc + viaje.monto_gasto, 0),
    };
  }, [viajesDelCamion]);

  const handleCamionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!isAdmin) {
      setSubmitError('Solo el administrador puede gestionar camiones.');
      return;
    }

    if (!camionForm.patente.trim() || !camionForm.marca.trim() || !camionForm.modelo.trim()) {
      setSubmitError('Completa patente, marca y modelo del camion.');
      return;
    }

    if (camionForm.capacidad_toneladas <= 0) {
      setSubmitError('La capacidad debe ser mayor que 0.');
      return;
    }

    try {
      if (editingCamionId) {
        await updateCamion(editingCamionId, {
          patente: camionForm.patente.trim().toUpperCase(),
          marca: camionForm.marca.trim(),
          modelo: camionForm.modelo.trim(),
          capacidad_toneladas: camionForm.capacidad_toneladas,
          chofer_id: camionForm.chofer_id || null,
        });
      } else {
        await createCamion({
          patente: camionForm.patente.trim().toUpperCase(),
          marca: camionForm.marca.trim(),
          modelo: camionForm.modelo.trim(),
          capacidad_toneladas: camionForm.capacidad_toneladas,
          chofer_id: camionForm.chofer_id || null,
          activo: true,
        });
      }

      setCamionForm(EMPTY_CAMION);
      setEditingCamionId(null);
      setIsCamionFormOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo guardar el camion.');
    }
  };

  const handleEditCamion = (idCamion: string) => {
    const camion = camiones.find((item) => item.id_camion === idCamion);

    if (!camion) {
      return;
    }

    setCamionForm({
      patente: camion.patente,
      marca: camion.marca,
      modelo: camion.modelo,
      capacidad_toneladas: camion.capacidad_toneladas,
      chofer_id: camion.chofer_id ?? '',
    });
    setIsCamionFormOpen(true);
    setEditingCamionId(idCamion);
  };

  const handleToggleCamionForm = () => {
    if (isCamionFormOpen) {
      setEditingCamionId(null);
      setCamionForm(EMPTY_CAMION);
    }

    setIsCamionFormOpen((prev) => !prev);
  };

  const handleRetirarCamion = async (idCamion: string) => {
    setSubmitError(null);

    if (!isAdmin) {
      setSubmitError('Solo el administrador puede retirar camiones.');
      return;
    }

    try {
      await retirarCamion(idCamion);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo retirar el camion.');
    }
  };

  const handleFacturaSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!isAdmin) {
      setSubmitError('Solo el administrador puede gestionar facturas.');
      return;
    }

    if (!camionSeleccionadoResuelto) {
      setSubmitError('Selecciona un camion para asociar la factura.');
      return;
    }

    if (!facturaForm.folio.trim() || !facturaForm.descripcion.trim() || !facturaForm.fecha) {
      setSubmitError('Completa folio, fecha y descripcion de la factura.');
      return;
    }

    if (facturaForm.monto <= 0) {
      setSubmitError('El monto de la factura debe ser mayor que 0.');
      return;
    }

    try {
      let archivoUrl = facturaForm.archivo_url || '';

      if (facturaPdfFile) {
        const isPdf =
          facturaPdfFile.type === 'application/pdf' ||
          facturaPdfFile.name.toLowerCase().endsWith('.pdf');

        if (!isPdf) {
          setSubmitError('Solo se permiten archivos PDF.');
          return;
        }

        const safeFolio = facturaForm.folio.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filePath = `${camionSeleccionadoResuelto}/${safeFolio || 'sin_folio'}-${timestamp}.pdf`;

        const uploadResp = await supabase.storage
          .from('facturas_pdf')
          .upload(filePath, facturaPdfFile, {
            upsert: true,
            contentType: 'application/pdf',
          });

        if (uploadResp.error) {
          throw uploadResp.error;
        }

        const publicResp = supabase.storage
          .from('facturas_pdf')
          .getPublicUrl(filePath);

        archivoUrl = publicResp.data.publicUrl;
      }

      if (!archivoUrl) {
        setSubmitError('Debes adjuntar un PDF de la factura para guardar el registro.');
        return;
      }

      if (editingFacturaId) {
        await updateFactura(editingFacturaId, {
          folio: facturaForm.folio.trim().toUpperCase(),
          fecha: facturaForm.fecha,
          monto: facturaForm.monto,
          descripcion: facturaForm.descripcion.trim(),
          patente: camionSeleccionadoResuelto,
          archivo_url: archivoUrl,
        });
      } else {
        await createFactura({
          folio: facturaForm.folio.trim().toUpperCase(),
          fecha: facturaForm.fecha,
          monto: facturaForm.monto,
          descripcion: facturaForm.descripcion.trim(),
          patente: camionSeleccionadoResuelto,
          archivo_url: archivoUrl,
        });
      }

      setFacturaForm(EMPTY_FACTURA);
      setFacturaPdfFile(null);
      setEditingFacturaId(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo guardar la factura.');
    }
  };

  const handleEditFactura = (idFactura: string) => {
    const factura = facturas.find((item) => item.id_factura === idFactura);

    if (!factura) {
      return;
    }

    setFacturaForm({
      folio: factura.folio,
      fecha: factura.fecha,
      monto: factura.monto,
      descripcion: factura.descripcion,
      archivo_url: factura.archivo_url ?? '',
    });
    setFacturaPdfFile(null);
    setEditingFacturaId(idFactura);
  };

  const handleDeleteFactura = async (idFactura: string) => {
    setSubmitError(null);

    if (!isAdmin) {
      setSubmitError('Solo el administrador puede eliminar facturas.');
      return;
    }

    try {
      await deleteFactura(idFactura);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo eliminar la factura.');
    }
  };

  if (isLoadingCatalogos || isLoadingViajes || isLoadingFacturas) {
    return <p className="text-slate-500">Cargando flota desde Supabase...</p>;
  }

  const error = errorCatalogos ?? errorViajes ?? errorFacturas;

  if (error) {
    return <p className="text-red-600">Error cargando flota: {error}</p>;
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Flota</h2>
        <p className="text-slate-500 text-sm mt-1">
          {isAdmin
            ? 'Gestion completa de camiones y facturas vinculadas.'
            : 'Vista simplificada de camion asignado y viajes del chofer.'}
        </p>
      </div>

      {submitError && <p className="text-sm font-medium text-red-600">{submitError}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-full overflow-hidden">
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4 max-w-full overflow-hidden">
          <h3 className="font-semibold text-slate-900">Camiones TG</h3>

          {isAdmin && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleToggleCamionForm}
                className="w-full border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl px-4 py-3 text-left flex items-center justify-between transition-colors"
              >
                <span className="font-medium text-slate-800">
                  {editingCamionId ? 'Editar camion' : 'Agregar nuevo camion'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                    isCamionFormOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isCamionFormOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <form onSubmit={handleCamionSubmit} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 mt-1">
                    <input
                      value={camionForm.patente}
                      onChange={(event) => setCamionForm((prev) => ({ ...prev, patente: event.target.value }))}
                      placeholder="Patente"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900"
                    />
                    <input
                      value={camionForm.marca}
                      onChange={(event) => setCamionForm((prev) => ({ ...prev, marca: event.target.value }))}
                      placeholder="Marca"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900"
                    />
                    <input
                      value={camionForm.modelo}
                      onChange={(event) => setCamionForm((prev) => ({ ...prev, modelo: event.target.value }))}
                      placeholder="Modelo"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900"
                    />
                    <label className="block text-xs font-medium text-slate-600">
                      Chofer Asignado
                    </label>
                    <select
                      value={camionForm.chofer_id}
                      onChange={(event) =>
                        setCamionForm((prev) => ({
                          ...prev,
                          chofer_id: event.target.value,
                        }))
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900 bg-white"
                    >
                      <option value="">Sin asignar</option>
                      {choferes.map((chofer) => (
                        <option key={chofer.id_chofer} value={chofer.id_chofer}>
                          {chofer.nombre_completo}
                        </option>
                      ))}
                    </select>
                    <label className="block text-xs font-medium text-slate-600">
                      Capacidad Estanque (L)
                    </label>
                    <input
                      type="number"
                      value={camionForm.capacidad_toneladas === 0 ? '' : camionForm.capacidad_toneladas}
                      min={1}
                      onChange={(event) =>
                        setCamionForm((prev) => ({
                          ...prev,
                          capacidad_toneladas: Number(event.target.value) || 0,
                        }))
                      }
                      placeholder="Ej: 450"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-900"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-slate-900 text-white rounded-lg py-2 text-sm font-medium">
                        {editingCamionId ? 'Guardar cambios' : 'Agregar camion'}
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleCamionForm}
                        className="px-3 py-2 text-sm rounded-lg border border-slate-300"
                      >
                        {editingCamionId ? 'Cancelar' : 'Ocultar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-[30rem] overflow-y-auto">
            {camionesVisibles.map((camion) => (
              <div
                key={camion.id_camion}
                className={`p-3 rounded-xl border ${
                  camionSeleccionadoResuelto === camion.patente ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCamionSeleccionado(camion.patente)}
                  className="w-full text-left"
                >
                  <p className="font-semibold">{camion.patente}</p>
                  <p className={`text-sm ${camionSeleccionadoResuelto === camion.patente ? 'text-slate-300' : 'text-slate-500'}`}>
                    {camion.marca} {camion.modelo} - {camion.capacidad_toneladas}T
                  </p>
                  <p className={`text-xs mt-1 ${camionSeleccionadoResuelto === camion.patente ? 'text-slate-400' : 'text-slate-500'}`}>
                    Chofer: {choferes.find((chofer) => chofer.id_chofer === camion.chofer_id)?.nombre_completo ?? 'Sin asignar'}
                  </p>
                  <p className={`text-xs mt-1 ${camion.activo ? 'text-emerald-500' : 'text-red-500'}`}>
                    {camion.activo ? 'Activo' : 'Retirado'}
                  </p>
                </button>

                {isAdmin && (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditCamion(camion.id_camion)}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700"
                    >
                      <Pencil className="w-3 h-3" /> Editar
                    </button>
                    {camion.activo && (
                      <button
                        type="button"
                        onClick={() => handleRetirarCamion(camion.id_camion)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-red-100 text-red-700"
                      >
                        <Trash2 className="w-3 h-3" /> Retirar
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6 max-w-full overflow-hidden">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Ficha Tecnica del Camion {camionSeleccionadoResuelto || '-'}</h3>
            <p className="text-sm text-slate-500">Historial operativo y financiero por patente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-300">KM Totales</p>
                <Truck className="w-4 h-4 text-slate-300" />
              </div>
              <p className="text-3xl font-bold">{resumen.km.toLocaleString('es-CL')} km</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-red-700">Gastos Totales</p>
                <Fuel className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-700">${resumen.gastos.toLocaleString('es-CL')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Historial de Viajes
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Ruta</th>
                    <th className="px-4 py-2 text-right">KM</th>
                    <th className="px-4 py-2 text-right">Gasto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viajesDelCamion.map((viaje) => (
                    <tr key={viaje.id_viaje}>
                      <td className="px-4 py-2">{new Date(viaje.fecha).toLocaleDateString('es-CL')}</td>
                      <td className="px-4 py-2">{viaje.lugar_inicio} - {viaje.lugar_llegada}</td>
                      <td className="px-4 py-2 text-right">{viaje.km_total}</td>
                      <td className="px-4 py-2 text-right">${viaje.monto_gasto.toLocaleString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Facturas Vinculadas</h4>

            {isAdmin && (
              <form onSubmit={handleFacturaSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 max-w-full overflow-hidden">
                <div className="relative min-w-0">
                  <HelpTooltip text="Numero de folio de la factura emitido por el SII" />
                  <input
                    value={facturaForm.folio}
                    onChange={(event) => setFacturaForm((prev) => ({ ...prev, folio: event.target.value }))}
                    placeholder="Folio"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-8 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div className="relative min-w-0">
                  <HelpTooltip text="Fecha de emision de la factura segun el documento SII" />
                  <input
                    type="date"
                    value={facturaForm.fecha}
                    onChange={(event) => setFacturaForm((prev) => ({ ...prev, fecha: event.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-8 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div className="relative min-w-0">
                  <HelpTooltip text="Monto total bruto de la factura en pesos chilenos" />
                  <input
                    type="number"
                    value={facturaForm.monto === 0 ? '' : facturaForm.monto}
                    min={1}
                    onChange={(event) => setFacturaForm((prev) => ({ ...prev, monto: Number(event.target.value) || 0 }))}
                    placeholder="Monto ($)"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-8 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div className="relative min-w-0">
                  <HelpTooltip text="Breve detalle de los servicios o productos facturados" />
                  <input
                    value={facturaForm.descripcion}
                    onChange={(event) => setFacturaForm((prev) => ({ ...prev, descripcion: event.target.value }))}
                    placeholder="Descripcion"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-8 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div className="relative min-w-0">
                  <HelpTooltip text="Haz clic para subir el archivo PDF descargado desde el portal del SII" />
                  <label className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-600 cursor-pointer hover:border-slate-400 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                    <Paperclip className="w-4 h-4" />
                    {facturaPdfFile ? 'PDF cargado' : 'PDF SII'}
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        setFacturaPdfFile(file);
                      }}
                    />
                  </label>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white rounded-lg px-3 py-2 text-sm font-medium">
                  {editingFacturaId ? 'Guardar' : 'Agregar'}
                </button>
              </form>
            )}

            <div className="space-y-2">
              {facturasDelCamion.map((factura) => (
                <div
                  key={factura.id_factura}
                  className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 break-words">{factura.folio} - {factura.descripcion}</p>
                    <p className="text-xs text-slate-500">{new Date(factura.fecha).toLocaleDateString('es-CL')}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-bold text-slate-900">${factura.monto.toLocaleString('es-CL')}</p>
                    {factura.archivo_url ? (
                      <a
                        href={factura.archivo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700"
                      >
                        <FileDown className="w-3 h-3" /> PDF
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Sin PDF</span>
                    )}
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEditFactura(factura.id_factura)}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700"
                        >
                          <Pencil className="w-3 h-3" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFactura(factura.id_factura)}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-red-100 text-red-700"
                        >
                          <Trash2 className="w-3 h-3" /> Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
