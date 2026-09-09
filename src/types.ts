export type TempUnit = 'F' | 'C';

export interface TempGuideEntry {
  tempF: number;
  tempC: number;
  targetRise: number; // in percentage e.g. 75
  approxHours: string;
  planningMinHours: number;
  planningMaxHours: number;
  notes?: string;
}

export interface VesselRecommendation {
  loaves: number;
  flourWeightGrams: number;
  startingVolumeMl: number;
  warmVesselSize: string; // 75-80F (50% rise)
  coolVesselSize: string; // <75F (100% rise)
}

export interface BulkFoldRound {
  id: string;
  roundNumber: number;
  time: string;
  type: 'Stretch and Fold' | 'Coil Fold' | 'Lamination' | 'Other';
  doughTemp?: number;
  notes?: string;
}

export interface BakeSession {
  id: string;
  date: string;
  title: string;
  flour1Name: string;
  flour1Weight: number;
  flour2Name: string;
  flour2Weight: number;
  flour3Name: string;
  flour3Weight: number;
  totalFlourWeight: number;
  starterWeight: number;
  starterHydration: number;
  waterWeight: number;
  saltWeight: number;
  inclusionsWeight?: number;
  inclusionsNote?: string;
  calculatedHydration: number; // including starter
  
  // Two Factor inputs
  initialDoughTemp: number;
  endingDoughTemp: number;
  tempUnit: TempUnit;
  startingVolumeMl: number;
  targetRisePercent: number;
  targetVolumeMl: number;
  actualEndingVolumeMl?: number;
  isDomed?: boolean;
  domeLowPointMl?: number;
  domeHighPointMl?: number;
  
  // Timing
  mixTime: string;
  handlingRounds: BulkFoldRound[];
  bulkEndTime?: string;
  totalFermentDuration?: string;
  benchRestDurationMinutes?: number;
  
  // Cold retard
  fridgeTempF?: number;
  coldRetardHours?: number;
  postFridgeTempF?: number;
  
  // Bake
  preheatTempF?: number;
  bakeTempF?: number;
  lidOnMinutes?: number;
  lidOffMinutes?: number;
  
  // Assessment
  crumbOutcome?: 'underproofed' | 'perfect' | 'overproofed';
  crumbNotes?: string;
  calibrationAdjustmentPercent?: number; // e.g. +10 or -10
  status: 'planning' | 'in_progress' | 'completed';
}

export interface BulkOMaticCriterion {
  id: string;
  title: string;
  description: string;
  instruction: string;
  importance: 'critical' | 'strong' | 'supporting';
  category: 'visual' | 'tactile' | 'aroma';
}

export interface ReferenceLink {
  title: string;
  url: string;
  category: 'youtube' | 'weblink' | 'article' | 'framework';
  description: string;
  author: string;
  badge?: string;
  youtubeId?: string;
  bulletPoints?: string[];
}
