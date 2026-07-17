import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabaseClient';
import { useState } from 'react';

// Estructura del formulario
interface ViajeFormData {
  origen: string;
  destino: string;
  fecha_salida: string;
  monto_total: number;
}

export function ViajeForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ViajeFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const onSubmit = async (data: ViajeFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Nota de Arquitectura: Esta version mantiene el flujo minimo de insercion.
      const payload = {
        ...data,
        estado: 'programado',
        saldo_pendiente: data.monto_total, 
        chofer_id: 'CH1',
        camion_id: 'CAM1',
      };

      const { error } = await supabase
        .from('viajes')
        .insert([payload]);

      if (error) throw error;

      setSubmitStatus('success');
      reset();
    } catch (error) {
      console.error('Error insertando viaje:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 w-full max-w-lg">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Registrar Nuevo Viaje</h2>
      
      {/* Origen */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Origen</label>
        <input 
          {...register('origen', { required: 'El origen es requerido' })}
          className={`w-full p-2 border rounded-lg outline-none transition-colors ${errors.origen ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900'}`}
          placeholder="Ej: Quellon"
        />
        {errors.origen && <p className="text-red-500 text-xs mt-1">{errors.origen.message}</p>}
      </div>

      {/* Destino */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Destino</label>
        <input 
          {...register('destino', { required: 'El destino es requerido' })}
          className={`w-full p-2 border rounded-lg outline-none transition-colors ${errors.destino ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900'}`}
          placeholder="Ej: Puerto Montt"
        />
        {errors.destino && <p className="text-red-500 text-xs mt-1">{errors.destino.message}</p>}
      </div>

      {/* Fecha Salida & Monto */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Salida</label>
          <input 
            type="date"
            {...register('fecha_salida', { required: 'Requerido' })}
            className={`w-full p-2 border rounded-lg outline-none transition-colors ${errors.fecha_salida ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900'}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Monto Total ($)</label>
          <input 
            type="number"
            {...register('monto_total', { required: 'Requerido', min: { value: 1, message: 'Mayor a 0' } })}
            className={`w-full p-2 border rounded-lg outline-none transition-colors ${errors.monto_total ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900'}`}
          />
        </div>
      </div>

      {/* Estado y Botón */}
      <div className="pt-4">
        {submitStatus === 'success' && <p className="text-emerald-600 text-sm mb-3">Viaje registrado exitosamente.</p>}
        {submitStatus === 'error' && <p className="text-red-600 text-sm mb-3">Ocurrió un error al registrar.</p>}
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-slate-900 text-white py-2 px-4 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Viaje'}
        </button>
      </div>
    </form>
  );
}
