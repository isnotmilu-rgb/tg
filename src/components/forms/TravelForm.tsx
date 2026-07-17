import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Ciudad, Camion, Chofer } from '../../types';
import { ChevronDown, MapPin, Truck, DollarSign, Save, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface TravelFormProps {
  ciudades: Ciudad[];
  camiones: Camion[];
  choferes: Chofer[];
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

interface TravelFormData {
  id_camion: string;
  id_chofer_ref: string;
  fecha: string;
  lugar_inicio: string;
  lugar_llegada: string;
  km_ruta: number;
  km_ajuste: number;
  litros_cargados: number;
  dinero_recibido: number;
  gasto_consolidado: number;
}

interface GastoItem {
  id: string;
  concepto: 'Combustible' | 'Peaje' | 'Viatico' | 'Transbordador';
  monto: number;
}

export function TravelForm({ ciudades, camiones, choferes, onSubmitSuccess, onCancel }: TravelFormProps) {
  const [activeSection, setActiveSection] = useState<'general' | 'route' | 'finance'>('general');
  const [useBreakdown, setUseBreakdown] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [gastosDetalle, setGastosDetalle] = useState<GastoItem[]>([
    { id: 'gasto-1', concepto: 'Combustible', monto: 0 },
  ]);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { isSubmitting } } = useForm<TravelFormData>({
    defaultValues: {
      km_ruta: 0,
      km_ajuste: 0,
      litros_cargados: 0,
      dinero_recibido: 0,
      gasto_consolidado: 0,
    }
  });

  const lugarInicio = watch('lugar_inicio');
  const lugarLlegada = watch('lugar_llegada');
  const camionSeleccionado = watch('id_camion');
  const kmRuta = watch('km_ruta') || 0;
  const kmAjuste = watch('km_ajuste') || 0;
  const dineroRecibido = watch('dinero_recibido') || 0;
  const gastoConsolidado = watch('gasto_consolidado') || 0;

  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[^\x00-\x7F]/g, '')
      .toLowerCase();

  // Lógica de distancias operativas
  useEffect(() => {
    if (lugarInicio && lugarLlegada) {
      const inicio = normalize(lugarInicio);
      const llegada = normalize(lugarLlegada);
      const ruta = `${inicio}-${llegada}`;
      const rutaInversa = `${llegada}-${inicio}`;
      let calculoKm = 0;
      
      if (ruta === 'quellon-puerto montt' || rutaInversa === 'quellon-puerto montt') calculoKm = 510;
      else if (ruta === 'chonchi-puerto montt' || rutaInversa === 'chonchi-puerto montt') calculoKm = 380;
      else if (ruta === 'castro-puerto montt' || rutaInversa === 'castro-puerto montt') calculoKm = 420;
      else if (ruta === 'ancud-puerto montt' || rutaInversa === 'ancud-puerto montt') calculoKm = 330;
      
      setValue('km_ruta', calculoKm);
    }
  }, [lugarInicio, lugarLlegada, setValue]);

  // Autofill editable: al elegir camion, precarga su chofer asignado por defecto.
  useEffect(() => {
    if (!camionSeleccionado) {
      return;
    }

    const camion = camiones.find((item) => item.id_camion === camionSeleccionado);

    if (!camion?.chofer_id) {
      return;
    }

    setValue('id_chofer_ref', camion.chofer_id);
  }, [camionSeleccionado, camiones, setValue]);

  const kmTotal = kmRuta + kmAjuste;
  const totalGastosDetalle = gastosDetalle.reduce((acc, item) => acc + item.monto, 0);
  const totalGastos = useBreakdown ? totalGastosDetalle : gastoConsolidado;
  const saldoARendir = dineroRecibido - totalGastos;

  const addGasto = () => {
    const id = `gasto-${Date.now()}`;
    setGastosDetalle((prev) => [...prev, { id, concepto: 'Peaje', monto: 0 }]);
  };

  const removeGasto = (id: string) => {
    setGastosDetalle((prev) => prev.filter((item) => item.id !== id));
  };

  const updateGasto = (id: string, updates: Partial<GastoItem>) => {
    setGastosDetalle((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const onSubmit = async (data: TravelFormData) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const detalleTexto = useBreakdown
        ? gastosDetalle.map((item) => `${item.concepto}:${item.monto}`).join(' | ')
        : 'Consolidado';

      const payload = {
        ...data,
        km_total: kmTotal,
        concepto_gasto: detalleTexto,
        monto_gasto: totalGastos,
        saldo_a_rendir: saldoARendir,
        estado: 'programado',
      };

      const { error } = await supabase.from('viajes').insert([payload]);

      if (error) {
        throw error;
      }

      setSubmitSuccess('Viaje guardado en Supabase.');
      reset();
      setGastosDetalle([{ id: 'gasto-1', concepto: 'Combustible', monto: 0 }]);
      onSubmitSuccess();
    } catch (e) {
      console.error('Error guardando viaje en Supabase:', e);
      setSubmitError('No se pudo guardar el viaje en Supabase. Revisa permisos y columnas de la tabla.');
    }
  };

  const SectionHeader = ({ title, id, icon: Icon }: { title: string, id: typeof activeSection, icon: any }) => (
    <button type="button" onClick={() => setActiveSection(id)} className={`w-full flex items-center justify-between p-4 text-left font-medium transition-colors ${activeSection === id ? 'bg-slate-50 text-[#0f172a]' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
      <div className="flex items-center gap-3"><Icon className={`w-5 h-5 ${activeSection === id ? 'text-[#0f172a]' : 'text-slate-400'}`} />{title}</div>
      <ChevronDown className={`w-5 h-5 transition-transform ${activeSection === id ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Registrar Nuevo Viaje (TG)</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* 1. DATOS GENERALES */}
        <div className="border-b border-slate-100">
          <SectionHeader title="Datos Generales" id="general" icon={Truck} />
          {activeSection === 'general' && (
            <div className="p-4 space-y-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                  <input type="date" {...register('fecha', { required: 'Requerido' })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#0f172a]"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Camión (Patente)</label>
                  <select {...register('id_camion', { required: 'Requerido' })} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-[#0f172a]">
                    <option value="">Seleccionar...</option>
                    {camiones.map(c => <option key={c.id_camion} value={c.id_camion}>{c.patente} ({c.modelo})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chofer</label>
                  <select {...register('id_chofer_ref', { required: 'Requerido' })} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-[#0f172a]">
                    <option value="">Seleccionar...</option>
                    {choferes.map(c => <option key={c.id_chofer} value={c.id_chofer}>{c.nombre_completo}</option>)}
                  </select>
                </div>
              </div>
              <button type="button" onClick={() => setActiveSection('route')} className="w-full mt-4 py-3 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">Siguiente</button>
            </div>
          )}
        </div>

        {/* 2. RUTA Y LOGÍSTICA */}
        <div className="border-b border-slate-100">
          <SectionHeader title="Ruta y Logística" id="route" icon={MapPin} />
          {activeSection === 'route' && (
            <div className="p-4 space-y-5 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Origen</label>
                  <select {...register('lugar_inicio')} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-[#0f172a]">
                    <option value="">Seleccionar...</option>
                    {ciudades.map(c => <option key={c.id_ciudad} value={c.nombre_ciudad}>{c.nombre_ciudad}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Destino</label>
                  <select {...register('lugar_llegada')} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-[#0f172a]">
                    <option value="">Seleccionar...</option>
                    {ciudades.map(c => <option key={c.id_ciudad} value={c.nombre_ciudad}>{c.nombre_ciudad}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Km Ruta</label>
                  <input type="number" readOnly value={kmRuta} className="w-full p-2.5 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg text-sm outline-none"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Km Ajuste</label>
                  <input type="number" {...register('km_ajuste', { valueAsNumber: true })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#0f172a]"/>
                </div>
                <div className="flex flex-col justify-end">
                  <div className="bg-[#0f172a] text-white p-2.5 rounded-lg flex justify-between items-center"><span className="text-xs font-medium text-slate-300">Total:</span><span className="font-bold">{kmTotal} km</span></div>
                </div>
              </div>
              <button type="button" onClick={() => setActiveSection('finance')} className="w-full py-3 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">Siguiente</button>
            </div>
          )}
        </div>

        {/* 3. FINANZAS */}
        <div>
          <SectionHeader title="Finanzas" id="finance" icon={DollarSign} />
          {activeSection === 'finance' && (
            <div className="p-4 space-y-5 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dinero Pagado ($)</label>
                    <input type="number" {...register('dinero_recibido', { required: 'Requerido', valueAsNumber: true })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#0f172a]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Litros Cargados</label>
                    <input type="number" {...register('litros_cargados', { valueAsNumber: true })} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#0f172a]"/>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-red-800 text-sm">Gestor de Gastos Dinamicos</h4>
                    <button
                      type="button"
                      onClick={() => setUseBreakdown((prev) => !prev)}
                      className="text-xs bg-white border border-red-200 rounded-lg px-2.5 py-1.5 font-medium text-red-700 hover:bg-red-100"
                    >
                      {useBreakdown ? 'Usar Consolidado' : 'Desglosar Gastos'}
                    </button>
                  </div>

                  {!useBreakdown && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Total Consolidado ($)</label>
                      <input
                        type="number"
                        {...register('gasto_consolidado', { valueAsNumber: true })}
                        className="w-full p-2.5 border border-red-200 rounded-lg text-sm outline-none bg-white"
                      />
                    </div>
                  )}

                  {useBreakdown && (
                    <div className="space-y-3">
                      {gastosDetalle.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                          <select
                            value={item.concepto}
                            onChange={(event) =>
                              updateGasto(item.id, {
                                concepto: event.target.value as GastoItem['concepto'],
                              })
                            }
                            className="col-span-7 p-2.5 border border-red-200 rounded-lg text-sm outline-none bg-white"
                          >
                            <option value="Combustible">Combustible</option>
                            <option value="Peaje">Peaje</option>
                            <option value="Viatico">Viatico</option>
                            <option value="Transbordador">Transbordador</option>
                          </select>
                          <input
                            type="number"
                            value={item.monto}
                            onChange={(event) =>
                              updateGasto(item.id, {
                                monto: Number(event.target.value) || 0,
                              })
                            }
                            className="col-span-4 p-2.5 border border-red-200 rounded-lg text-sm outline-none bg-white"
                            placeholder="Monto"
                          />
                          <button
                            type="button"
                            onClick={() => removeGasto(item.id)}
                            disabled={gastosDetalle.length === 1}
                            className="col-span-1 p-2 text-red-600 hover:text-red-700 disabled:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addGasto}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 border border-dashed border-red-200 rounded-lg text-sm text-red-700 hover:bg-red-100"
                      >
                        <Plus className="w-4 h-4" />
                        + Agregar Concepto
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-500 font-medium">Saldo a Rendir</p>
                <div className={`text-2xl font-bold ${saldoARendir >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${saldoARendir.toLocaleString()}
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={onCancel} className="w-1/3 py-3 rounded-lg font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="w-2/3 bg-emerald-600 text-white py-3 rounded-lg flex justify-center items-center gap-2 font-semibold hover:bg-emerald-700 disabled:opacity-50"><Save className="w-5 h-5" /> Guardar</button>
              </div>

              {submitError && <p className="text-sm font-medium text-red-600">{submitError}</p>}
              {submitSuccess && <p className="text-sm font-medium text-emerald-600">{submitSuccess}</p>}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
