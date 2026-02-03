
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Reagent, MixTemplate, PreparationRecord, SyncConfig, Equipment } from './types';
import ReagentsManager from './components/ReagentsManager';
import MixTemplates from './components/MixTemplates';
import NewPreparation from './components/NewPreparation';
import AuditLog from './components/AuditLog';
import Integrations from './components/Integrations';
import EquipmentManager from './components/EquipmentManager';
import { History, PlusCircle, LayoutDashboard, Beaker, ClipboardList, CloudSync, Menu, X, ChevronRight, HardDrive, Wifi, CloudOff, RefreshCw } from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- CONFIGURACIÓN DE CONEXIÓN (LLENAR ANTES DE DESPLEGAR) ---
// Pega aquí tus credenciales para que la app inicie conectada automáticamente.
const DEFAULT_SUPABASE_URL = "https://wgrkegfpdkqssvyutczl.supabase.co"; // Ej: "https://tuproyecto.supabase.co"
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndncmtlZ2ZwZGtxc3N2eXV0Y3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTQ3NDIsImV4cCI6MjA4NTY5MDc0Mn0.X45t0H4mnSnYx5Cd_5axHx5kw490zX8GnRrepTN5rBs"; // Ej: "eyJhbGciOiJIUzI1NiIsIn..."
const DEFAULT_SHEET_URL = "https://script.google.com/macros/s/AKfycbzWow2_pXHAzb4JDzlpP9omYbvvfwofxjDgiMuCSVGB4cLzj8oiY1eznBEZ0n5sthOXTw/exec";    // Ej: "https://script.google.com/macros/s/.../exec"

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reagents' | 'templates' | 'new-prep' | 'audit' | 'sync' | 'equipment'>('dashboard');
  const [reagents, setReagents] = useState<Reagent[]>([]);
  const [templates, setTemplates] = useState<MixTemplate[]>([]);
  const [history, setHistory] = useState<PreparationRecord[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  
  // Inicializamos la configuración usando las constantes por defecto o lo que haya en localStorage
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(() => {
    const saved = localStorage.getItem('labmix_sync');
    if (saved) return JSON.parse(saved);
    return {
      webhookUrl: DEFAULT_SHEET_URL,
      enabled: !!DEFAULT_SHEET_URL,
      supabaseUrl: DEFAULT_SUPABASE_URL,
      supabaseKey: DEFAULT_SUPABASE_KEY
    };
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- Inicialización de Supabase ---
  const supabase: SupabaseClient | null = useMemo(() => {
    if (!syncConfig.supabaseUrl || !syncConfig.supabaseKey) return null;
    try {
      return createClient(syncConfig.supabaseUrl, syncConfig.supabaseKey);
    } catch (e) {
      console.error("Error creating Supabase client", e);
      return null;
    }
  }, [syncConfig.supabaseUrl, syncConfig.supabaseKey]);

  // --- Cargar datos locales al iniciar ---
  useEffect(() => {
    const savedReagents = localStorage.getItem('labmix_reagents');
    const savedTemplates = localStorage.getItem('labmix_templates');
    const savedHistory = localStorage.getItem('labmix_history');
    const savedEquipment = localStorage.getItem('labmix_equipment');

    if (savedReagents) setReagents(JSON.parse(savedReagents));
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedEquipment) setEquipment(JSON.parse(savedEquipment));
  }, []);

  // --- Sincronización DESDE la nube (Pull) ---
  const pullData = useCallback(async () => {
    if (!supabase) return;
    setIsSyncing(true);
    try {
      // 1. Reactivos
      const { data: reagentsData } = await supabase.from('reagents').select('*');
      if (reagentsData) {
        setReagents(reagentsData.map((r: any) => ({
          id: r.id,
          name: r.name,
          initialConcentration: parseFloat(r.initial_concentration),
          unit: r.unit,
          lotNumber: r.lot_number
        })));
      }

      // 2. Plantillas
      const { data: templatesData } = await supabase.from('templates').select('*');
      if (templatesData) {
        setTemplates(templatesData.map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          createdAt: t.created_at,
          reagents: t.reagents_json || []
        })));
      }

      // 3. Equipos
      const { data: equipmentData } = await supabase.from('equipment').select('*');
      if (equipmentData) {
        setEquipment(equipmentData.map((e: any) => ({
          id: e.id,
          category: e.category,
          name: e.name
        })));
      }

      // 4. Historial
      const { data: historyData } = await supabase.from('history').select('*').order('timestamp', { ascending: false }).limit(200);
      if (historyData) {
        setHistory(historyData.map((h: any) => ({
          id: h.id,
          templateName: h.template_name,
          totalVolume: parseFloat(h.total_volume),
          timestamp: h.timestamp,
          analyst: h.analyst,
          ...h.full_record_json // Spread el resto de detalles (reactivos, equipos, etc)
        })));
      }

    } catch (e) {
      console.error("Error al sincronizar desde Supabase:", e);
    } finally {
      setIsSyncing(false);
    }
  }, [supabase]);

  // Sincronizar al montar si hay cliente Supabase
  useEffect(() => {
    if (supabase) {
      pullData();
    }
  }, [supabase, pullData]);

  // --- Guardar datos locales ante cambios ---
  useEffect(() => {
    localStorage.setItem('labmix_reagents', JSON.stringify(reagents));
    localStorage.setItem('labmix_templates', JSON.stringify(templates));
    localStorage.setItem('labmix_history', JSON.stringify(history));
    localStorage.setItem('labmix_sync', JSON.stringify(syncConfig));
    localStorage.setItem('labmix_equipment', JSON.stringify(equipment));
  }, [reagents, templates, history, syncConfig, equipment]);

  // --- Sincronización HACIA Google Sheets (Auditoría) ---
  const syncToSheet = useCallback(async (type: string, data: any) => {
    if (!syncConfig.enabled || !syncConfig.webhookUrl) return;
    try {
      await fetch(syncConfig.webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, timestamp: new Date().toISOString() })
      });
      setSyncConfig(prev => ({ ...prev, lastSync: Date.now() }));
    } catch (e) {
      console.error("Sincronización a Sheet fallida", e);
    }
  }, [syncConfig]);

  // --- Handlers de Acción (Local + Supabase + Sheet) ---

  const handleAddReagent = async (r: Reagent) => {
    // 1. Local
    const updated = [r, ...reagents];
    setReagents(updated);
    
    // 2. Google Sheet
    syncToSheet('reagent_created', r);

    // 3. Supabase
    if (supabase) {
      await supabase.from('reagents').upsert({
        id: r.id,
        name: r.name,
        initial_concentration: r.initialConcentration,
        unit: r.unit,
        lot_number: r.lotNumber,
        json_data: r 
      });
    }
  };

  const handleDeleteReagent = async (id: string) => {
    setReagents(reagents.filter(r => r.id !== id));
    if (supabase) await supabase.from('reagents').delete().eq('id', id);
  };

  const handleAddTemplate = async (t: MixTemplate) => {
    // 1. Local
    setTemplates([t, ...templates]);
    
    // 2. Google Sheet
    syncToSheet('template_created', t);

    // 3. Supabase
    if (supabase) {
      await supabase.from('templates').upsert({
        id: t.id,
        name: t.name,
        description: t.description,
        reagents_json: t.reagents,
        created_at: t.createdAt
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    if (supabase) await supabase.from('templates').delete().eq('id', id);
  };

  const handleAddPreparation = async (p: PreparationRecord) => {
    // 1. Local
    setHistory([p, ...history]);
    setActiveTab('audit');
    
    // 2. Google Sheet
    syncToSheet('preparation_created', p);

    // 3. Supabase
    if (supabase) {
      await supabase.from('history').insert({
        id: p.id,
        template_name: p.templateName,
        analyst: p.analyst,
        total_volume: p.totalVolume,
        timestamp: p.timestamp,
        full_record_json: p 
      });
    }
  };

  const handleAddEquipment = async (e: Equipment) => {
    setEquipment([...equipment, e]);
    if (supabase) {
      await supabase.from('equipment').upsert({
        id: e.id,
        category: e.category,
        name: e.name
      });
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    setEquipment(equipment.filter(e => e.id !== id));
    if (supabase) await supabase.from('equipment').delete().eq('id', id);
  };

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'reagents', label: 'Inventario', icon: Beaker },
    { id: 'templates', label: 'Protocolos', icon: ClipboardList },
    { id: 'equipment', label: 'Equipos', icon: HardDrive },
    { id: 'new-prep', label: 'Nueva Mezcla', icon: PlusCircle },
    { id: 'audit', label: 'Auditoría', icon: History },
    { id: 'sync', label: 'Nube & Excel', icon: CloudSync },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <nav className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 transform
        md:translate-x-0 md:static md:inset-0
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
            <Beaker className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tighter uppercase">LabMix Pro</span>
        </div>

        <div className="flex-1 px-4 space-y-1 overflow-y-auto hide-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setIsMenuOpen(false); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-100 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50 font-medium'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
              {item.label}
              {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-slate-100 space-y-2">
          {/* Indicador Google Sheets */}
          <div className={`p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${syncConfig.enabled && syncConfig.webhookUrl ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${syncConfig.enabled && syncConfig.webhookUrl ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              {syncConfig.enabled && syncConfig.webhookUrl ? 'Excel Audit: ON' : 'Excel Audit: OFF'}
            </div>
          </div>

          {/* Indicador Supabase */}
          <div className={`p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex justify-between items-center ${supabase ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
            <div className="flex items-center gap-2">
              {supabase ? <Wifi className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
              {supabase ? 'Nube: Conectada' : 'Nube: Local'}
            </div>
            {supabase && (
              <button onClick={pullData} className={`p-1 rounded hover:bg-indigo-100 ${isSyncing ? 'animate-spin' : ''}`}>
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center safe-area-pt">
          <div className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-emerald-600" />
            <span className="font-black text-slate-800 tracking-tighter uppercase">LabMix Pro</span>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 bg-slate-100 rounded-lg">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {isMenuOpen && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMenuOpen(false)} />}

        <main className="flex-1 overflow-y-auto p-4 md:p-10 hide-scrollbar bg-slate-50/50">
          <div className="max-w-6xl mx-auto pb-20 md:pb-0">
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header>
                  <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Panel de Control</h2>
                  <p className="text-slate-500 font-medium">Gestión integral de preparaciones moleculares.</p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Reactivos', value: reagents.length, icon: Beaker, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Protocolos', value: templates.length, icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Equipos', value: equipment.length, icon: HardDrive, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Registros', value: history.length, icon: History, color: 'text-slate-600', bg: 'bg-white' },
                  ].map((card, i) => (
                    <div key={i} className={`p-8 rounded-[2.5rem] border border-slate-200 shadow-sm ${card.bg}`}>
                      <card.icon className={`w-8 h-8 ${card.color} mb-4 opacity-50`} />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                      <p className={`text-5xl font-black ${card.color} tracking-tighter`}>{card.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-8 text-center md:text-left">Flujo de Trabajo</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => setActiveTab('new-prep')} className="flex flex-col items-center gap-4 p-8 bg-emerald-600 text-white rounded-[2rem] hover:scale-105 transition-all shadow-xl shadow-emerald-100">
                      <PlusCircle className="w-10 h-10" /> <span className="font-bold">Nueva Mezcla</span>
                    </button>
                    <button onClick={() => setActiveTab('equipment')} className="flex flex-col items-center gap-4 p-8 bg-purple-50 text-purple-700 rounded-[2rem] hover:bg-purple-100 transition-all font-bold border border-purple-100">
                      <HardDrive className="w-10 h-10" /> <span>Equipos</span>
                    </button>
                    <button onClick={() => setActiveTab('reagents')} className="flex flex-col items-center gap-4 p-8 bg-blue-50 text-blue-700 rounded-[2rem] hover:bg-blue-100 transition-all font-bold border border-blue-100">
                      <Beaker className="w-10 h-10" /> <span>Stock</span>
                    </button>
                    <button onClick={() => setActiveTab('audit')} className="flex flex-col items-center gap-4 p-8 bg-slate-50 text-slate-700 rounded-[2rem] hover:bg-slate-100 transition-all font-bold border border-slate-200">
                      <History className="w-10 h-10" /> <span>Bitácora</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reagents' && <ReagentsManager reagents={reagents} onAdd={handleAddReagent} onDelete={handleDeleteReagent} />}
            {activeTab === 'templates' && <MixTemplates reagents={reagents} templates={templates} onAdd={handleAddTemplate} onDelete={handleDeleteTemplate} />}
            {activeTab === 'equipment' && <EquipmentManager equipment={equipment} onAdd={handleAddEquipment} onDelete={handleDeleteEquipment} />}
            {activeTab === 'new-prep' && <NewPreparation reagents={reagents} templates={templates} equipment={equipment} onSave={handleAddPreparation} />}
            {activeTab === 'audit' && <AuditLog history={history} />}
            {activeTab === 'sync' && <Integrations config={syncConfig} onUpdate={setSyncConfig} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
