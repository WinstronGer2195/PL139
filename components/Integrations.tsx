
import React from 'react';
import { SyncConfig } from '../types';
import { CloudSync, HelpCircle, ShieldCheck, Copy, Check, Database, FileSpreadsheet } from 'lucide-react';

interface Props {
  config: SyncConfig;
  onUpdate: (c: SyncConfig) => void;
}

const Integrations: React.FC<Props> = ({ config, onUpdate }) => {
  const [copied, setCopied] = React.useState(false);

  // --- SCRIPT AVANZADO PARA GOOGLE SHEETS ---
  const scriptCode = `function doPost(e) {
  var raw = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var timestamp = new Date();

  // 1. SIEMPRE registrar en Auditoría (Log crudo)
  recordAudit(ss, raw, timestamp);

  // 2. Gestionar Hojas Específicas (Cuaderno Electrónico)
  try {
    switch (raw.type) {
      case 'reagent_upsert':
        handleInventory(ss, raw.data);
        break;
      case 'reagent_delete':
        deleteRowById(ss, 'Inventario', raw.data.id);
        break;
      case 'equipment_upsert':
        handleEquipment(ss, raw.data);
        break;
      case 'equipment_delete':
        deleteRowById(ss, 'Equipos', raw.data.id);
        break;
      case 'template_upsert':
        handleTemplates(ss, raw.data);
        break;
      case 'template_delete':
        deleteRowById(ss, 'Protocolos', raw.data.id);
        break;
      case 'preparation_created':
        handlePreparation(ss, raw.data, timestamp);
        break;
    }
  } catch (err) {
    // Si falla la lógica visual, al menos tenemos la auditoría
  }

  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}

// --- MANEJO DE INVENTARIO ---
function handleInventory(ss, item) {
  var sheet = getSheet(ss, 'Inventario', ['ID', 'Nombre', 'Lote', 'Conc. Inicial', 'Unidad']);
  var rowData = [item.id, item.name, item.lotNumber, item.initialConcentration, item.unit];
  upsertRow(sheet, item.id, rowData);
}

// --- MANEJO DE EQUIPOS ---
function handleEquipment(ss, item) {
  var sheet = getSheet(ss, 'Equipos', ['ID', 'Categoría', 'Nombre / Identificación']);
  var rowData = [item.id, item.category, item.name];
  upsertRow(sheet, item.id, rowData);
}

// --- MANEJO DE PROTOCOLOS (MIXES) ---
function handleTemplates(ss, item) {
  var sheet = getSheet(ss, 'Protocolos', ['ID', 'Nombre', 'Descripción', 'Detalle Reactivos']);
  // Formatear reactivos para lectura humana
  var details = item.reagents.map(function(r) {
    return "ID_Reactivo: " + r.reagentId + " (" + r.targetFinalConcentration + ")";
  }).join(" | ");
  
  var rowData = [item.id, item.name, item.description, details];
  upsertRow(sheet, item.id, rowData);
}

// --- MANEJO DE PREPARACIONES (RESULTADOS) ---
function handlePreparation(ss, item, ts) {
  var sheet = getSheet(ss, 'Preparaciones', ['Serial S#', 'Fecha', 'Analista', 'Mix', 'Vol. Total (uL)', 'Vol. Agua (uL)', 'Detalle Reactivos', 'Equipos Usados']);
  
  // Formato legible de reactivos usados
  var reagentsText = item.reagents.map(function(r) {
    return r.name + " (L:" + r.lotNumber + "): " + parseFloat(r.totalVolume).toFixed(2) + "uL";
  }).join("\\n");

  // Formato legible de equipos
  var equipText = (item.equipment || []).map(function(eq) {
    return eq.category + ": " + eq.name;
  }).join(" | ");

  sheet.appendRow([
    item.serialNumber || "---",
    ts,
    item.analyst,
    item.templateName,
    item.totalVolume,
    item.waterVolume,
    reagentsText,
    equipText
  ]);
}

// --- AUDITORÍA (LOG) ---
function recordAudit(ss, data, ts) {
  var sheet = getSheet(ss, 'Auditoria', ['Timestamp', 'Tipo Acción', 'Datos JSON']);
  sheet.appendRow([ts, data.type, JSON.stringify(data.data)]);
}

// --- UTILIDADES ---
function getSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e6f4ea");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function upsertRow(sheet, id, newValues) {
  var data = sheet.getDataRange().getValues();
  // Asumimos que la columna A (índice 0) es el ID
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      // Actualizar fila existente
      sheet.getRange(i + 1, 1, 1, newValues.length).setValues([newValues]);
      return;
    }
  }
  // Si no existe, crear nueva
  sheet.appendRow(newValues);
}

function deleteRowById(sheet, sheetName, id) {
  var sheet = getSheet(sheet, sheetName, []); // Headers no importan para borrar
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
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

          <div className="space-y-2 text-xs text-slate-400">
            <p className="text-emerald-400 font-bold">¡IMPORTANTE! Actualización de Script</p>
            <p>Este nuevo código organiza el Excel en pestañas: Inventario, Equipos, Protocolos y Preparaciones. Sigue estos pasos:</p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Ve a tu Google Sheet &gt; Extensiones &gt; Apps Script.</li>
              <li>Borra todo el código anterior y pega el nuevo.</li>
              <li>Dale a <strong>Guardar</strong>.</li>
              <li>Dale a <strong>Implementar &gt; Nueva implementación</strong> (¡Muy importante crear una NUEVA, no solo guardar!).</li>
              <li>Actualiza la URL en esta app si cambió (normalmente cambia).</li>
            </ol>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl text-[10px] font-mono text-emerald-400 overflow-x-auto border border-slate-800 h-64">
            {scriptCode}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
