import { DOUGH_TEMP_GUIDE } from '../data/sourdoughData';
import { TempGuideEntry } from '../types';

export function fahrenheitToCelsius(f: number): number {
  return Math.round(((f - 32) * 5) / 9 * 10) / 10;
}

export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

/**
 * Looks up target percentage rise and planning window based on dough temperature.
 * Uses exact table entries from The Sourdough Journey.
 */
export function getGuideForTemperature(tempF: number): TempGuideEntry {
  const roundedF = Math.round(tempF);
  
  if (roundedF >= 80) {
    return DOUGH_TEMP_GUIDE[0]; // 80°F -> 30%
  }
  if (roundedF <= 65) {
    return DOUGH_TEMP_GUIDE[DOUGH_TEMP_GUIDE.length - 1]; // 65°F -> 100%
  }
  
  const match = DOUGH_TEMP_GUIDE.find((entry) => entry.tempF === roundedF);
  if (match) return match;
  
  // Fallback linear estimation between points
  const lower = DOUGH_TEMP_GUIDE.find((e) => e.tempF <= roundedF) || DOUGH_TEMP_GUIDE[0];
  return lower;
}

/**
 * Shorthand starting volume estimation:
 * Weight of dry flour (in grams) x 1.5 = Mixed dough volume (in milliliters)
 */
export function calculateStartingVolumeFromFlour(flourGrams: number): number {
  if (!flourGrams || flourGrams <= 0) return 0;
  return Math.round(flourGrams * 1.5);
}

/**
 * Calculates target volume given starting volume and target % rise.
 * Example: 750ml * 1.75 = 1,313ml.
 */
export function calculateTargetVolume(
  startingVolumeMl: number,
  targetRisePercent: number,
  roundToStep: number = 25
): { exact: number; rounded: number } {
  if (!startingVolumeMl || startingVolumeMl <= 0) {
    return { exact: 0, rounded: 0 };
  }
  const multiplier = 1 + targetRisePercent / 100;
  const exact = Math.round(startingVolumeMl * multiplier);
  const rounded = roundToStep > 0 ? Math.round(exact / roundToStep) * roundToStep : exact;
  return { exact, rounded };
}

/**
 * Sourdough Journey Dome Correction:
 * Low point: where dough touches container side wall.
 * High point: center crown of the dome.
 * Effective volume = (Low + High) / 2.
 */
export function calculateDomeVolume(lowPointMl: number, highPointMl: number): number {
  if (!lowPointMl && !highPointMl) return 0;
  if (!highPointMl) return lowPointMl;
  if (!lowPointMl) return highPointMl;
  return Math.round((lowPointMl + highPointMl) / 2);
}

/**
 * True hydration calculation considering standard 100% hydration sourdough starter
 * (50% water, 50% flour by weight).
 */
export function calculateTrueHydration(
  flourTotalGrams: number,
  waterGrams: number,
  starterGrams: number = 0,
  starterHydrationPercent: number = 100
): {
  bakersHydration: number;
  trueHydration: number;
  starterFlour: number;
  starterWater: number;
  totalFlour: number;
  totalWater: number;
} {
  const starterFlour = starterGrams / (1 + starterHydrationPercent / 100);
  const starterWater = starterGrams - starterFlour;

  const totalFlour = flourTotalGrams + starterFlour;
  const totalWater = waterGrams + starterWater;

  const bakersHydration = flourTotalGrams > 0 ? (waterGrams / flourTotalGrams) * 100 : 0;
  const trueHydration = totalFlour > 0 ? (totalWater / totalFlour) * 100 : 0;

  return {
    bakersHydration: Math.round(bakersHydration * 10) / 10,
    trueHydration: Math.round(trueHydration * 10) / 10,
    starterFlour: Math.round(starterFlour),
    starterWater: Math.round(starterWater),
    totalFlour: Math.round(totalFlour),
    totalWater: Math.round(totalWater),
  };
}

/**
 * Format minutes into "Xh Ym"
 */
export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export interface DDTCalculationResult {
  waterTemp: number;
  waterTempF: number;
  waterTempC: number;
  factorsCount: number; // 3 or 4
  totalTempSum: number;
  subtotalKnown: number;
  frictionFactor: number;
  status: 'optimal' | 'cool' | 'ice_required' | 'warm' | 'hot_warning' | 'danger_hot';
  statusMessage: string;
}

/**
 * Desired Dough Temperature (DDT) Water Calculator
 * For hand-mixed sourdough dough, friction factor = 0.
 *
 * 3-Factor Formula:
 * Implied Water Temp = (3 × DDT) - (Air Temp + Flour Temp + Friction)
 *
 * 4-Factor Formula (with Sourdough Starter / Preferment):
 * Implied Water Temp = (4 × DDT) - (Air Temp + Flour Temp + Starter Temp + Friction)
 */
export function calculateDDTWaterTemp(params: {
  desiredDoughTemp: number;
  airTemp: number;
  flourTemp: number;
  starterTemp?: number;
  includeStarter?: boolean;
  frictionFactor?: number;
  unit?: 'F' | 'C';
}): DDTCalculationResult {
  const {
    desiredDoughTemp,
    airTemp,
    flourTemp,
    starterTemp,
    includeStarter = false,
    frictionFactor = 0, // Hand mixed assumption: 0
    unit = 'F',
  } = params;

  const factorsCount = includeStarter && starterTemp !== undefined ? 4 : 3;
  const totalTempSum = factorsCount * desiredDoughTemp;
  
  const subtotalKnown =
    airTemp +
    flourTemp +
    (factorsCount === 4 && starterTemp !== undefined ? starterTemp : 0) +
    frictionFactor;

  const rawWaterTemp = totalTempSum - subtotalKnown;
  const waterTemp = Math.round(rawWaterTemp * 10) / 10;

  // Convert for unified status threshold checking
  const waterTempF = unit === 'F' ? waterTemp : Math.round((waterTemp * 9) / 5 + 32);
  const waterTempC = unit === 'C' ? waterTemp : Math.round(((waterTemp - 32) * 5) / 9 * 10) / 10;

  let status: DDTCalculationResult['status'] = 'optimal';
  let statusMessage = 'Water is in a comfortable warm range for active fermentation.';

  if (waterTempF <= 34) {
    status = 'ice_required';
    statusMessage = `Water temp is near or below freezing (${waterTemp}°${unit}). Use ice cubes or refrigerated water to avoid overheating the dough.`;
  } else if (waterTempF < 60) {
    status = 'cool';
    statusMessage = `Chilled water required (${waterTemp}°${unit}). Use cold refrigerated tap water to slow fermentation.`;
  } else if (waterTempF >= 60 && waterTempF <= 88) {
    status = 'optimal';
    statusMessage = `Comfortable lukewarm / room temperature water (${waterTemp}°${unit}). Ideal for easy hand incorporation.`;
  } else if (waterTempF > 88 && waterTempF <= 105) {
    status = 'warm';
    statusMessage = `Pleasantly warm water (${waterTemp}°${unit}). Helps kickstart fermentation in a cool kitchen.`;
  } else if (waterTempF > 105 && waterTempF <= 118) {
    status = 'hot_warning';
    statusMessage = `Caution: Water is quite hot (${waterTemp}°${unit}). Wild yeast and lactic acid bacteria may get stressed if mixed directly. Dissolve starter carefully or pre-mix water with flour first (autolyse).`;
  } else {
    status = 'danger_hot';
    statusMessage = `Danger: Water above 118°F / 48°C (${waterTemp}°${unit}) will kill wild yeast and damage gluten proteins. Warm your flour or ambient proofing station instead of using scalding water.`;
  }

  return {
    waterTemp,
    waterTempF,
    waterTempC,
    factorsCount,
    totalTempSum: Math.round(totalTempSum * 10) / 10,
    subtotalKnown: Math.round(subtotalKnown * 10) / 10,
    frictionFactor,
    status,
    statusMessage,
  };
}
