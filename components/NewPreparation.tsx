
import React, { useState, useMemo } from 'react';
import { Reagent, MixTemplate, PreparationRecord, PreparationReagentResult, Equipment } from '../types';
import { Calculator, Save, User, Droplets, FlaskConical, HardDrive } from 'lucide-react';

interface Props {
  reagents: Reagent[];
  templates: MixTemplate[];
  equipment: Equipment[];
  onSave: (p: PreparationRecord) => void;
}

const NewPreparation: React.FC<Props> = ({ reagents, templates, equipment, onSave }) => {
  const [selectedMixId, setSelectedMixId] = useState('');
  const [numRxns, setNumRxns] = useState<number | string>(1);
  const [extraRxns, setExtraRxns] = useState<string>('0');
  const [rxnVolume, setRxnVolume] = useState<string>('20');
  const [analyst, setAnalyst] = useState('');

  const selectedMix = useMemo(() => templates.find(t => t.id === selectedMixId), [selectedMixId, templates]);
  
  const numRxnsVal = typeof numRxns === 'string' ? (parseInt(numRxns) || 0) : numRxns;
  const extraRxnsVal = parseFloat(extraRxns) || 0;
  const rxnVolumeVal = parseFloat(rxnVolume) || 0;
  const totalReactions = numRxnsVal + extraRxnsVal;

  const calculations = useMemo(() => {
    if (!selectedMix || totalReactions <= 0 || rxnVolumeVal <= 0) return { reagentResults: [], waterVolume: 0 };

    let usedVolumeSoFar = 0;
    const reagentResults: PreparationReagentResult[] = selectedMix.reagents.map(req => {
      const r = reagents.find(re => re.id === req.reagentId);
      if (!r) return null as any;

      const volPerRxn = (req.targetFinalConcentration * rxnVolumeVal) / r.initialConcentration;
      usedVolumeSoFar += volPerRxn;

      return {
        name: r.name,
        lotNumber: r.lotNumber,
        initialConcentration: r.initialConcentration,
        finalConcentration: req.targetFinalConcentration,
        unit: r.unit,
        volumePerReaction: volPerRxn,
        totalVolume: volPerRxn * totalReactions
      };
    }).filter(Boolean);

    const waterPerRxn = Math.max(0, rxnVolumeVal - usedVolumeSoFar);
    
    return {
      reagentResults,
      waterVolumePerRxn: waterPerRxn,
      totalWaterVolume: waterPerRxn * totalReactions
    };
  }, [selectedMix, reagents, rxnVolumeVal, totalReactions]);

  const handleSave = () => {
    if (!selectedMix || !analyst) return;
    
    onSave({
      id: crypto.randomUUID(),
      templateName: selectedMix.name,
      numReactions: numRxnsVal,
      extraReactions: extraRxnsVal,
      reactionVolume: rxnVolumeVal,
      totalVolume: totalReactions * rxnVolumeVal,
      reagents: calculations.reagentResults,
      equipment: equipment, // Se vinculan todos los equipos predefinidos por defecto
      waterVolume: calculations.totalWaterVolume || 0,
      timestamp: Date.now(),
      analyst: analyst.toUpperCase()
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="px-1">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Preparar Nueva Mezcla</h2>
        <p className="text-slate-500 font-medium">Calculadora de precisión para volúmenes de pipeteo.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-xl space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plantilla de Mix</label>
              <select 
                value={selectedMixId} 
                onChange={e => setSelectedMixId(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 appearance-none transition-all"
              >
                <option value="">Seleccionar protocolo...</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº Reacciones</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={numRxns} 
                  onChange={e => setNumRxns(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-center" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vol/Rxn (uL)</label>
                <input 
                  type="text"
                  inputMode="decimal"
                  value={rxnVolume} 
                  onChange={e => setRxnVolume(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-center" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Overage (Exceso Rxns)</label>
              <input 
                type="text"
                inputMode="decimal"
                value={extraRxns} 
                onChange={e => setExtraRxns(e.target.value)} 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Analista (Firma)</label>
              <div className="relative">
                <User className="absolute left-4 top-4 w-5 h-5 text-slate-300" />
                <input type="text" value={analyst} onChange={e => setAnalyst(e.target.value)} placeholder="INICIALES" className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl uppercase font-black outline-none focus:ring-2 focus:ring-emerald-500" required />
              </div>
            </div>
          </div>

          {/* Sección de Equipos en la Preparación */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-md">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <HardDrive className="w-4 h-4" /> Equipos Vinculados
            </h4>
            <div className="space-y-2">
              {equipment.length > 0 ? equipment.map(e => (
                <div key={e.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-bold text-slate-600">{e.category}</span>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">{e.name}</span>
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic">No hay equipos registrados en el sistema.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          {selectedMix ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-8 bg-emerald-600 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FlaskConical className="w-5 h-5 opacity-75" />
                    <h3 className="text-2xl font-black tracking-tight uppercase">{selectedMix.name}</h3>
                  </div>
                  <p className="text-emerald-100 font-medium">Batch calculado para {totalReactions.toFixed(2)} reacciones totales</p>
                </div>
                <div className="text-left md:text-right bg-emerald-700/40 p-4 rounded-3xl border border-emerald-500/30 min-w-[180px]">
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-1">Volumen Total MasterMix</p>
                  <p className="text-4xl font-black">{(totalReactions * rxnVolumeVal).toFixed(2)} <span className="text-xl">uL</span></p>
                </div>
              </div>

              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Componente / Lote</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Per Rxn</th>
                      <th className="px-8 py-5 text-[10px] font-black text-emerald-700 uppercase tracking-widest text-right bg-emerald-50/50">Total Pipeta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {calculations.reagentResults.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-extrabold text-slate-800 text-lg leading-tight">{r.name}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">LOTE: {r.lotNumber}</span>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase">{r.initialConcentration}{r.unit} &rarr; {r.finalConcentration}{r.unit}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right text-slate-500 font-bold tabular-nums">{r.volumePerReaction.toFixed(4)} uL</td>
                        <td className="px-8 py-6 text-right font-black text-emerald-700 bg-emerald-50/20 text-xl tabular-nums">{r.totalVolume.toFixed(3)} uL</td>
                      </tr>
                    ))}
                    {calculations.totalWaterVolume > 0 && (
                      <tr className="bg-blue-50/10">
                        <td className="px-8 py-6 border-t border-blue-50">
                          <div className="flex items-center gap-2 text-blue-600">
                            <Droplets className="w-5 h-5" />
                            <span className="font-extrabold text-lg uppercase tracking-tight">Agua Ultra Pura</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right text-blue-500 font-bold tabular-nums">{calculations.waterVolumePerRxn.toFixed(4)} uL</td>
                        <td className="px-8 py-6 text-right font-black text-blue-700 bg-blue-50/30 text-xl tabular-nums">{calculations.totalWaterVolume.toFixed(3)} uL</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-slate-400 font-medium italic">Se registrarán {equipment.length} equipos en la bitácora.</p>
                <button 
                  onClick={handleSave}
                  disabled={!analyst || totalReactions <= 0}
                  className={`w-full md:w-auto px-10 py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 ${
                    analyst && totalReactions > 0 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Save className="w-6 h-6" /> REGISTRAR Y GUARDAR
                </button>
              </div>
            </div>
          ) : (
            <div className="h-[500px] bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Calculator className="w-12 h-12 opacity-20" />
              </div>
              <p className="font-black text-xl text-slate-400 tracking-tight">Cálculos no disponibles</p>
              <p className="text-sm font-medium">Seleccione un Mix y defina reacciones para empezar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewPreparation;
