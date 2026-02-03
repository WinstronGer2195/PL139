
import React from 'react';
import { SyncConfig } from '../types';
import { CloudSync, HelpCircle, ShieldCheck, Copy, Check, Database, FileSpreadsheet } from 'lucide-react';

interface Props {
  config: SyncConfig;
  onUpdate: (c: SyncConfig) => void;
}

const Integrations: React.FC<Props> = ({ config, onUpdate }) => {
  const [copied, setCopied] = React.useState(false);

  const scriptCode = `function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = data.type === 'preparation_created' ? 'Preparaciones' : 'Inventario';
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Tipo", "Nombre", "Detalles", "JSON"]);
  }
  
  sheet.appendRow([
    new Date(), 
    data.type, 
    data.data.templateName || data.data.name, 
    JSON.stringify(data.data.reagents || data.data),
    e.postData.contents
  ]);
  
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Sincronización Híbrida</h2>
        <p className="text-slate-500">Conecta Supabase para múltiples dispositivos y Google Sheets para auditoría.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Columna Izquierda: Configuraciones */}
        <div className="space-y-6">
          
          {/* Configuración Supabase */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-indigo-600 font-bold uppercase text-xs tracking-widest">
              <Database className="w-5 h-5" /> Base de Datos (Multidispositivo)
            </div>
            <p className="text-xs text-slate-500">
              Conecta tu proyecto de Supabase para compartir datos entre tablet, móvil y PC en tiempo real.
            </p>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Supabase URL</label>
              <input 
                type="text" 
                value={config.supabaseUrl || ''}
                onChange={e => onUpdate({ ...config, supabaseUrl: e.target.value })}
                placeholder="https://xyz.supabase.co"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Supabase Anon Key</label>
              <input 
                type="password" 
                value={config.supabaseKey || ''}
                onChange={e => onUpdate({ ...config, supabaseKey: e.target.value })}
                placeholder="eyJhbGci..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
              />
            </div>
          </div>

          {/* Configuración Google Sheets */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 font-bold uppercase text-xs tracking-widest">
              <FileSpreadsheet className="w-5 h-5" /> Auditoría Excel (Google Sheets)
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Google Web App URL</label>
              <input 
                type="url" 
                value={config.webhookUrl}
                onChange={e => onUpdate({ ...config, webhookUrl: e.target.value })}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mt-2">
              <input 
                type="checkbox" 
                id="syncEnabled"
                checked={config.enabled}
                onChange={e => onUpdate({ ...config, enabled: e.target.checked })}
                className="w-5 h-5 accent-emerald-600"
              />
              <label htmlFor="syncEnabled" className="text-sm font-bold text-slate-700 cursor-pointer">
                Activar Sincronización Automática
              </label>
            </div>
            
            {config.lastSync && (
              <p className="text-[10px] text-slate-400 italic">
                Último envío a Excel: {new Date(config.lastSync).toLocaleString()}
              </p>
            )}
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
            <ShieldCheck className="w-10 h-10 text-blue-500 shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900">Estado de Conexión</h4>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <div className={`w-2 h-2 rounded-full ${config.supabaseUrl && config.supabaseKey ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                  <span>Supabase: {config.supabaseUrl ? 'Configurado' : 'Sin configurar'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <div className={`w-2 h-2 rounded-full ${config.webhookUrl ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <span>Excel: {config.webhookUrl ? 'Configurado' : 'Sin configurar'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Instrucciones Google */}
        <div className="bg-slate-900 text-slate-300 p-6 rounded-3xl shadow-xl space-y-4 overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <HelpCircle className="w-4 h-4" /> Script para Google Sheets
            </div>
            <button 
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado' : 'Copiar Código'}
            </button>
          </div>

          <ol className="text-xs space-y-3 list-decimal list-inside text-slate-400 leading-relaxed">
            <li>Abre una <span className="text-white font-medium underline">Google Sheet</span> nueva.</li>
            <li>Ve a <span className="text-white font-medium">Extensiones &gt; Apps Script</span>.</li>
            <li>Pega el código de abajo (reemplazando todo).</li>
            <li>Haz clic en <span className="text-white font-medium">Implementar &gt; Nueva implementación</span>.</li>
            <li>Tipo: <span className="text-white font-medium">Aplicación web</span>.</li>
            <li>Quién tiene acceso: <span className="text-white font-medium">Cualquiera</span>.</li>
            <li>Copia la URL generada y pégala en el panel de la izquierda (Auditoría Excel).</li>
          </ol>

          <pre className="bg-slate-950 p-4 rounded-xl text-[10px] font-mono text-emerald-400 overflow-x-auto border border-slate-800 h-64">
            {scriptCode}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
