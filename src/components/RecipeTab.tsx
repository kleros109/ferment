import { useState, useMemo } from 'react';
import {
  Scale,
  Sparkles,
  Package,
  Layers,
  ArrowRight,
  Info,
  Check,
  Flame,
  Snowflake,
  Waves
} from 'lucide-react';
import { calculateTrueHydration, calculateStartingVolumeFromFlour } from '../utils/fermentCalculations';
import { VESSEL_RECOMMENDATIONS } from '../data/sourdoughData';

interface RecipeTabProps {
  onLoadRecipeIntoCalculator: (flourGrams: number, startingVolumeMl: number, initialMode?: 'two-factor' | 'ddt') => void;
}

export function RecipeTab({ onLoadRecipeIntoCalculator }: RecipeTabProps) {
  const [loafCount, setLoafCount] = useState<number>(1);
  const [flour1Pct, setFlour1Pct] = useState<number>(90);
  const [flour2Pct, setFlour2Pct] = useState<number>(10);
  const [waterPct, setWaterPct] = useState<number>(75);
  const [starterPct, setStarterPct] = useState<number>(20);
  const [saltPct, setSaltPct] = useState<number>(2);

  // Single loaf base flour weight
  const baseFlourGrams = 500;
  const totalFlourGrams = baseFlourGrams * loafCount;

  const flour1Grams = Math.round((totalFlourGrams * flour1Pct) / 100);
  const flour2Grams = Math.round((totalFlourGrams * flour2Pct) / 100);
  const waterGrams = Math.round((totalFlourGrams * waterPct) / 100);
  const starterGrams = Math.round((totalFlourGrams * starterPct) / 100);
  const saltGrams = Math.round((totalFlourGrams * saltPct) / 100);
  const totalDoughGrams = totalFlourGrams + waterGrams + starterGrams + saltGrams;

  const startingVolumeMl = calculateStartingVolumeFromFlour(totalFlourGrams);

  // Hydration calculations
  const hydration = useMemo(() => {
    return calculateTrueHydration(totalFlourGrams, waterGrams, starterGrams, 100);
  }, [totalFlourGrams, waterGrams, starterGrams]);

  // Find vessel recommendation
  const vesselRec = useMemo(() => {
    return (
      VESSEL_RECOMMENDATIONS.find((v) => v.loaves === loafCount) || {
        loaves: loafCount,
        flourWeightGrams: totalFlourGrams,
        startingVolumeMl,
        warmVesselSize: `${(startingVolumeMl * 1.6 / 1000).toFixed(1)} L`,
        coolVesselSize: `${(startingVolumeMl * 2.2 / 1000).toFixed(1)} L`,
      }
    );
  }, [loafCount, totalFlourGrams, startingVolumeMl]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          The Baseline Standard Recipe
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
          Standard Tartine Country Sourdough Formula
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
          The Sourdough Journey two-factor calculations are calibrated to Chad Robertson’s iconic 90/10 country loaf. Scale dough weights effortlessly and select the optimal fermentation vessel size.
        </p>

        {/* Loaf Selector Tabs */}
        <div className="pt-2">
          <span className="text-xs text-stone-400 block mb-1.5">Batch Size:</span>
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            {[1, 2, 3, 4].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setLoafCount(count)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all min-h-[40px] flex items-center justify-center active:scale-95 ${
                  loafCount === count
                    ? 'bg-amber-500 text-stone-950 shadow-sm ring-1 ring-amber-400'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {count} {count === 1 ? 'Loaf' : 'Loaves'} ({count * 500}g)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Recipe Builder & Hydration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recipe Ingredients Table */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-2xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
            <h2 className="font-bold text-stone-900 dark:text-white text-base flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Baker's Percentages & Grams
            </h2>
            <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
              Total Weight: <strong className="text-stone-900 dark:text-stone-100">{totalDoughGrams}g</strong>
            </span>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
            <table className="w-full text-left text-xs min-w-[320px]">
              <thead className="bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-700">
                <tr>
                  <th className="p-2.5">Ingredient</th>
                  <th className="p-2.5">Baker's %</th>
                  <th className="p-2.5 text-right">Weight (g)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono">
                <tr>
                  <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">
                    Flour 1: Bread Flour (12.5%+ protein)
                  </td>
                  <td className="p-2.5 text-stone-600 dark:text-stone-400">{flour1Pct}%</td>
                  <td className="p-2.5 text-right font-bold text-stone-900 dark:text-stone-100">{flour1Grams}g</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">
                    Flour 2: Whole Wheat Flour
                  </td>
                  <td className="p-2.5 text-stone-600 dark:text-stone-400">{flour2Pct}%</td>
                  <td className="p-2.5 text-right font-bold text-stone-900 dark:text-stone-100">{flour2Grams}g</td>
                </tr>
                <tr className="bg-amber-50/40 dark:bg-amber-950/20">
                  <td className="p-2.5 font-sans font-bold text-amber-950 dark:text-amber-300">
                    Total Flour Weight (Baseline)
                  </td>
                  <td className="p-2.5 font-bold text-amber-950 dark:text-amber-300">100%</td>
                  <td className="p-2.5 text-right font-bold text-amber-950 dark:text-amber-300">{totalFlourGrams}g</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span>Water</span>
                      <button
                        type="button"
                        onClick={() => onLoadRecipeIntoCalculator(totalFlourGrams, startingVolumeMl, 'ddt')}
                        className="inline-flex items-center gap-1 text-[10px] text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-800 px-2 py-1 rounded-md font-sans font-semibold transition-colors active:scale-95"
                        title="Calculate exact water temperature needed (DDT formula for hand mixing)"
                      >
                        <Waves className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                        Calc Temp (DDT)
                      </button>
                    </div>
                  </td>
                  <td className="p-2.5 text-stone-600 dark:text-stone-400">{waterPct}%</td>
                  <td className="p-2.5 text-right font-bold text-stone-900 dark:text-stone-100">{waterGrams}g</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">
                    Ripe Starter / Leaven (100% hydration)
                  </td>
                  <td className="p-2.5 text-stone-600 dark:text-stone-400">{starterPct}%</td>
                  <td className="p-2.5 text-right font-bold text-stone-900 dark:text-stone-100">{starterGrams}g</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">
                    Fine Sea Salt / Pink Himalayan Salt
                  </td>
                  <td className="p-2.5 text-stone-600 dark:text-stone-400">{saltPct}%</td>
                  <td className="p-2.5 text-right font-bold text-stone-900 dark:text-stone-100">{saltGrams}g</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Shorthand starting volume banner */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-stone-900 dark:text-stone-100 block">Mixed Dough Starting Volume:</span>
              <span className="text-stone-500 dark:text-stone-400 font-mono text-[11px]">
                {totalFlourGrams}g flour × 1.5 = <strong className="text-amber-800 dark:text-amber-400">{startingVolumeMl} mL</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => onLoadRecipeIntoCalculator(totalFlourGrams, startingVolumeMl)}
              className="w-full sm:w-auto px-4 py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0 min-h-[44px]"
            >
              Use in Calculator
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: True Hydration Analyzer & Sourdough Journey Appendix 1 Vessel Selection */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* True Hydration Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 dark:text-white text-sm">
                True Hydration Analyzer
              </h3>
              <span className="text-[11px] font-mono bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded font-bold">
                {hydration.trueHydration}% True
              </span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Standard recipes quote <strong className="text-stone-900 dark:text-white">{waterPct}%</strong> baker's hydration, but 100% hydration starter adds equal parts flour and water ({hydration.starterFlour}g flour + {hydration.starterWater}g water).
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <div className="p-2.5 bg-stone-50 dark:bg-stone-800/80 rounded-lg border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block uppercase">Baker's Hydration</span>
                <span className="text-base font-bold text-stone-900 dark:text-stone-100">{hydration.bakersHydration}%</span>
              </div>
              <div className="p-2.5 bg-sky-50 dark:bg-sky-950/30 rounded-lg border border-sky-200 dark:border-sky-800">
                <span className="text-[10px] text-sky-700 dark:text-sky-300 block uppercase">True Hydration</span>
                <span className="text-base font-bold text-sky-900 dark:text-sky-200">{hydration.trueHydration}%</span>
              </div>
            </div>
          </div>

          {/* Appendix 1: Selecting the Right Bulk Fermentation Vessel */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-700 dark:text-amber-400 font-bold mb-1">
                <Package className="w-3.5 h-3.5" />
                Appendix 1 Guide
              </div>
              <h3 className="font-bold text-stone-900 dark:text-white text-base">
                Fermentation Vessel Recommendation
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Size needed based on {loafCount} loaf batch ({totalFlourGrams}g flour)
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <div>
                    <div className="font-semibold text-amber-950 dark:text-amber-200">Warm Fermentation (75–80°F)</div>
                    <div className="text-[11px] text-amber-800 dark:text-amber-400">Target rise: 30% – 50%</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-stone-900 dark:text-stone-100 text-sm">
                  {vesselRec.warmVesselSize}
                </div>
              </div>

              <div className="p-3 bg-sky-50/70 dark:bg-sky-950/30 rounded-xl border border-sky-200 dark:border-sky-800/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Snowflake className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                  <div>
                    <div className="font-semibold text-sky-950 dark:text-sky-200">Cool Fermentation (&lt;75°F)</div>
                    <div className="text-[11px] text-sky-800 dark:text-sky-400">Target rise: 75% – 100%+</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-stone-900 dark:text-stone-100 text-sm">
                  {vesselRec.coolVesselSize}
                </div>
              </div>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
              <strong className="text-stone-900 dark:text-stone-100">DIY Calibration Trick: </strong>
              Place your clear container on a digital scale. Put tape vertically on outside wall. Pour 100g of water and draw a mark. Continue adding 100g (100g water = 100 mL volume exactly) to create your custom calibrated vessel!
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
