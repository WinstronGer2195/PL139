
import React, { useState } from 'react';
import { Equipment } from '../types';
import { Plus, Trash2, X, HardDrive, Cpu, Pipette, Zap } from 'lucide-react';

interface Props {
  equipment: Equipment[];
  onAdd: (e: Equipment) => void;
  onDelete: (id: string) => void;
}

const EquipmentManager: React.FC<Props> = ({ equipment, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ category: 'Micropipeta', name: '' });

  const categories = [
    { id: 'Cabina', icon: HardDrive },
    { id: 'Micropipeta', icon: Pipette },
    { id: 'Vortex', icon: Zap },
    { id: 'Centrífuga', icon: Cpu },
    { id: 'Termociclador', icon: HardDrive },
    { id: 'Otro', icon: HardDrive },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    onAdd({
      id: crypto.randomUUID(),
      category: form.category,
      name: form.name
    });
    setForm({ ...form, name: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Equipos del Laboratorio</h2>
          <p className="text-slate-500 font-medium text-sm">Activos vinculados a las preparaciones de Mix.</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg font-bold">
            <Plus className="w-5 h-5" /> Registrar Equipo
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Nuevo Equipo</h3>
            <button type="button" onClick={() => setIsAdding(false)}><X className="text-slate-400" /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
              <select 
                value={form.category} 
                onChange={e => setForm({...form, category: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.id}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificación / Código</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                placeholder="Ej. CULAB Mi17" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                required 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 text-slate-400 font-bold">Cancelar</button>
            <button type="submit" className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg">Guardar Equipo</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {equipment.map(e => {
          const CatIcon = categories.find(c => c.id === e.category)?.icon || HardDrive;
          return (
            <div key={e.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <CatIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{e.category}</p>
                  <p className="text-lg font-black text-slate-800 tracking-tight">{e.name}</p>
                </div>
              </div>
              <button onClick={() => onDelete(e.id)} className="text-slate-200 hover:text-red-500 p-2 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
        {equipment.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-300">
            <p className="font-bold">No hay equipos registrados.</p>
            <p className="text-xs">Los equipos registrados aparecerán por defecto en cada preparación.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentManager;
