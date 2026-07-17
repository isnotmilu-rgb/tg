import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Ciudad } from '../../types';

interface CitySelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  ciudades: Ciudad[];
  onAddCity: (nombre: string) => Promise<void>;
}

export function CitySelect({ label, name, value, onChange, error, ciudades, onAddCity }: CitySelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newCityName.trim()) return;
    setIsAdding(true);
    try {
      await onAddCity(newCityName.trim());
      setIsModalOpen(false);
      setNewCityName('');
    } catch (e) {
      console.error('Error al agregar ciudad', e);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex gap-2">
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 p-2.5 bg-white border rounded-lg text-sm outline-none transition-colors appearance-none ${
            error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-slate-900'
          }`}
        >
          <option value="">Selecciona una ciudad...</option>
          {ciudades.map((c) => (
            <option key={c.id_ciudad} value={c.id_ciudad}>
              {c.nombre_ciudad}
            </option>
          ))}
        </select>
        
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="p-2.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center whitespace-nowrap"
          title="Agregar nueva ciudad"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Modal para agregar ciudad */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Nueva Ciudad</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-500 mb-4">
                Ingresa el nombre de la ciudad o sector (Ej: Quellón, Chonchi).
              </p>
              <input
                type="text"
                autoFocus
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="Nombre de la ciudad"
                className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-slate-900 mb-4"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={isAdding || !newCityName.trim()}
                className="w-full bg-[#0f172a] text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {isAdding ? 'Guardando...' : 'Guardar Ciudad'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
