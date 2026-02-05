
import React, { useState } from 'react';
import { Reagent } from '../types';
import { Plus, Trash2, X, Pencil } from 'lucide-react';

interface Props {
  reagents: Reagent[];
  onAdd: (r: Reagent) => void;
  onDelete: (id: string) => void;
}

const ReagentsManager: React.FC<Props> = ({ reagents, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [useCustomUnit, setUseCustomUnit] = useState(false);
  const [form, setForm] = useState({ name: '', initialConcentration: '', unit: 'X', lotNumber: '' });

  const startEdit = (r: Reagent) => {
    setForm({
      name: r.name,
      initialConcentration: r.initialConcentration.toString(),
      unit: r.unit,
      lotNumber: r.lotNumber
    });
    setEditingId(r.id);
    
    // Verificar si la unidad es custom
    const standardUnits = ['X', 'mM', 'uM', 'ng/uL', 'U/uL'];
    setUseCustomUnit(!standardUnits.includes(r.unit));
    
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.initialConcentration) return;

    onAdd({
      id: editingId || crypto.randomUUID(), // Usar ID existente si se edita, o nuevo si se crea
      name: form.name,
      initialConcentration: parseFloat(form.initialConcentration),
      unit: form.unit,
      lotNumber: form.lotNumber || 'N/A'
    });
    
    // Resetear formulario
    setForm({ name: '', initialConcentration: '', unit: 'X', lotNumber: '' });
    setUseCustomUnit(false);
    setEditingId(null);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setForm({ name: '', initialConcentration: '', unit: 'X', lotNumber: '' });
    setUseCustomUnit(false);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleUnitChange = (val: string) => {
    if (val === 'CUSTOM') {
      setUseCustomUnit(true);
      setForm({ ...form, unit: '' });
    } else {
      setUseCustomUnit(false);
      setForm({ ...form, unit: val });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Inventario de Reactivos</h2>
        {!isAdding && (
          <button onClick={() => { setEditingId(null); setForm({ name: '', initialConcentration: '', unit: 'X', lotNumber: '' }); setIsAdding(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-md">
            <Plus className="w-4 h-4" /> Nuevo Reactivo
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg space-y-4 animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-slate-800">{editingId ? 'Editar Reactivo' : 'Registrar Reactivo Stock'}</h3>
            <button type="button" onClick={cancelEdit}><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">Nombre del Reactivo</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-slate-200 p-2 rounded-lg" placeholder="ej. Taq Polymerase" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">Lote (Batch)</label>
              <input type="text" value={form.lotNumber} onChange={e => setForm({...form, lotNumber: e.target.value})} className="w-full border border-slate-200 p-2 rounded-lg" placeholder="ej. L2024-05" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">Concentración Stock</label>
              <div className="flex gap-2">
                <input type="number" step="0.0001" value={form.initialConcentration} onChange={e => setForm({...form, initialConcentration: e.target.value})} className="flex-1 border border-slate-200 p-2 rounded-lg" placeholder="10" required />
                
                {!useCustomUnit ? (
                  <select 
                    value={form.unit} 
                    onChange={e => handleUnitChange(e.target.value)} 
                    className="border border-slate-200 p-2 rounded-lg bg-slate-50"
                  >
                    <option value="X">X</option>
                    <option value="mM">mM</option>
                    <option value="uM">uM</option>
                    <option value="ng/uL">ng/uL</option>
                    <option value="U/uL">U/uL</option>
                    <option value="CUSTOM">Otra...</option>
                  </select>
                ) : (
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={form.unit} 
                      onChange={e => setForm({...form, unit: e.target.value})}
                      placeholder="Unidad (ej. mg/mL)"
                      className="w-full border border-slate-200 p-2 rounded-lg pr-8"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setUseCustomUnit(false)}
                      className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={cancelEdit} className="px-4 py-2 text-slate-400 font-medium">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold">
              {editingId ? 'Actualizar Reactivo' : 'Guardar Reactivo'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Reactivo</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Lote</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Concentración Inicial</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reagents.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic">No hay reactivos registrados</td></tr>
            ) : (
              reagents.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800">{r.name}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-sm">{r.lotNumber}</td>
                  <td className="px-6 py-4 text-emerald-700 font-medium">{r.initialConcentration} {r.unit}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(r)} className="text-slate-300 hover:text-indigo-500 transition-colors p-1" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(r.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReagentsManager;
