
import React, { useState } from 'react';
import { PreparationRecord } from '../types';
import { Search, Calendar, User, ChevronDown, ChevronUp, FileText, HardDrive } from 'lucide-react';

interface Props {
  history: PreparationRecord[];
}

const AuditLog: React.FC<Props> = ({ history }) => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = history.filter(h => 
    h.templateName.toLowerCase().includes(search.toLowerCase()) ||
    h.analyst.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Bitácora de Auditoría</h2>
          <p className="text-slate-500">Historial inmutable de preparaciones certificadas.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por mix o analista..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(record => (
          <div key={record.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div 
              className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpanded(expanded === record.id ? null : record.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{record.templateName}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(record.timestamp).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {record.analyst}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-8 items-center">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Volumen Total</p>
                  <p className="font-bold text-emerald-600">{record.totalVolume.toFixed(1)} uL</p>
                </div>
                {expanded === record.id ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
              </div>
            </div>

            {expanded === record.id && (
              <div className="px-4 pb-4 animate-in slide-in-from-top-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Reactivos */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 overflow-x-auto">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reactivos y Volúmenes</p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-400 text-left border-b border-slate-200">
                          <th className="pb-2">REACTIVO</th>
                          <th className="pb-2 text-right">VOL (uL)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {record.reagents.map((r, idx) => (
                          <tr key={idx}>
                            <td className="py-2">
                              <span className="font-bold text-slate-700">{r.name}</span>
                              <span className="ml-2 text-[9px] text-slate-400">L:{r.lotNumber}</span>
                            </td>
                            <td className="py-2 text-right font-bold text-emerald-600">{r.totalVolume.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Equipos */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 overflow-x-auto">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <HardDrive className="w-3 h-3" /> Equipos Utilizados
                    </p>
                    <div className="grid grid-cols-1 gap-1">
                      {record.equipment && record.equipment.length > 0 ? record.equipment.map((eq, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0 text-[11px]">
                          <span className="font-bold text-slate-600">{eq.category}:</span>
                          <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-mono">{eq.name}</span>
                        </div>
                      )) : (
                        <p className="text-[11px] text-slate-400 italic">No se registraron equipos.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-between items-center px-1">
                  <span className="text-[9px] text-slate-300 font-mono uppercase">ID: {record.id}</span>
                  <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded uppercase tracking-tighter">
                    Trazabilidad Certificada
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-300 italic">
            No se encontraron registros en el historial.
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
