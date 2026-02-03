
import React, { useState } from 'react';
import { MixTemplate, Reagent, MixReagentRequirement } from '../types';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface Props {
  reagents: Reagent[];
  templates: MixTemplate[];
  onAdd: (t: MixTemplate) => void;
  onDelete: (id: string) => void;
}

const MixTemplates: React.FC<Props> = ({ reagents, templates, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [mixName, setMixName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedReagents, setSelectedReagents] = useState<(MixReagentRequirement & { rawValue: string })[]>([]);

  const handleAddReagentToMix = () => {
    if (reagents.length === 0) return;
    setSelectedReagents([...selectedReagents, { 
      reagentId: reagents[0].id, 
      targetFinalConcentration: 0,
      rawValue: '0' 
    }]);
  };

  const updateSelected = (index: number, field: string, value: string) => {
    const next = [...selectedReagents];
    if (field === 'targetFinalConcentration') {
      next[index].rawValue = value;
      next[index].targetFinalConcentration = parseFloat(value) || 0;
    } else {
      (next[index] as any)[field] = value;
    }
    setSelectedReagents(next);
  };

  const removeSelected = (index: number) => {
    setSelectedReagents(selectedReagents.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mixName || selectedReagents.length === 0) return;
    
    onAdd({
      id: crypto.randomUUID(),
      name: mixName,
      description,
      reagents: selectedReagents.map(({rawValue, ...rest}) => rest),
      createdAt: Date.now()
    });
    setMixName('');
    setDescription('');
    setSelectedReagents([]);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Plantillas de Mix</h2>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95">
            <Plus className="w-5 h-5" /> Crear Plantilla
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-extrabold text-slate-800">Nueva Configuración de Mix</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nombre del Mix</label>
              <input type="text" value={mixName} onChange={e => setMixName(e.target.value)} placeholder="Ej. MasterMix COVID-19" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Descripción / Notas</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Protocolo interno v2.1" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Componentes de la Mezcla</label>
              <button type="button" onClick={handleAddReagentToMix} className="text-blue-600 text-sm font-bold bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">+ Añadir Reactivo</button>
            </div>

            <div className="space-y-3">
              {selectedReagents.map((sel, idx) => {
                const rInfo = reagents.find(r => r.id === sel.reagentId);
                return (
                  <div key={idx} className="flex flex-col md:flex-row gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-left-2">
                    <select 
                      value={sel.reagentId} 
                      onChange={e => updateSelected(idx, 'reagentId', e.target.value)}
                      className="w-full md:flex-1 p-3 bg-white border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {reagents.map(r => (
                        <option key={r.id} value={r.id}>{r.name} (Stock: {r.initialConcentration} {r.unit})</option>
                      ))}
                    </select>
                    <div className="w-full md:w-48 relative">
                      <input 
                        type="text" 
                        inputMode="decimal"
                        placeholder="C. Final" 
                        value={sel.rawValue}
                        onChange={e => updateSelected(idx, 'targetFinalConcentration', e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl pr-14 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">{rInfo?.unit}</span>
                    </div>
                    <button type="button" onClick={() => removeSelected(idx)} className="self-end md:self-center text-red-400 p-3 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors">Cancelar</button>
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-blue-700 transition-all active:scale-95">
              <Save className="w-5 h-5" /> Guardar Mix
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map(t => (
          <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all border-l-4 border-l-blue-500">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{t.name}</h3>
                <button onClick={() => onDelete(t.id)} className="text-slate-200 hover:text-red-500 p-1 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2">{t.description || 'Sin descripción adicional'}</p>
              <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl">
                {t.reagents.map((req, i) => {
                  const r = reagents.find(re => re.id === req.reagentId);
                  return (
                    <div key={i} className="flex justify-between text-xs py-1.5 border-b border-slate-100 last:border-0 items-center">
                      <span className="text-slate-600 font-bold">{r?.name || 'Reactivo ?'}</span>
                      <span className="text-blue-700 font-black bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">Objetivo: {req.targetFinalConcentration} {r?.unit}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-300">
            <p className="text-lg font-bold">No hay plantillas de mix configuradas.</p>
            <p className="text-sm">Empieza creando una arriba.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MixTemplates;
