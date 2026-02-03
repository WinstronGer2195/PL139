
export interface Reagent {
  id: string;
  name: string;
  initialConcentration: number;
  unit: string;
  lotNumber: string;
}

export interface Equipment {
  id: string;
  category: string;
  name: string;
  lastCalibration?: string;
}

export interface MixReagentRequirement {
  reagentId: string;
  targetFinalConcentration: number;
}

export interface MixTemplate {
  id: string;
  name: string;
  description: string;
  reagents: MixReagentRequirement[];
  createdAt: number;
}

export interface PreparationReagentResult {
  name: string;
  lotNumber: string;
  initialConcentration: number;
  finalConcentration: number;
  unit: string;
  volumePerReaction: number;
  totalVolume: number;
}

export interface PreparationRecord {
  id: string;
  templateName: string;
  numReactions: number;
  extraReactions: number;
  reactionVolume: number;
  totalVolume: number;
  reagents: PreparationReagentResult[];
  equipment: Equipment[];
  waterVolume: number;
  timestamp: number;
  analyst: string;
}

export interface SyncConfig {
  webhookUrl: string; // Google Sheets
  enabled: boolean;
  lastSync?: number;
  supabaseUrl?: string; // New: Supabase
  supabaseKey?: string; // New: Supabase
}
