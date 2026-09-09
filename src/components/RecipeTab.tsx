import { useState, useMemo } from 'react';
import {
  Scale,
  Sparkles,
  Package,
  ArrowRight,
  Flame,
  Snowflake,
  Waves
} from 'lucide-react';
import { calculateTrueHydration, calculateStartingVolumeFromFlour } from '../utils/fermentCalculations';
import { VESSEL_RECOMMENDATIONS } from '../data/sourdoughData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface RecipeTabProps {
  onLoadRecipeIntoCalculator: (flourGrams: number, startingVolumeMl: number, initialMode?: 'two-factor' | 'ddt') => void;
}

export function RecipeTab({ onLoadRecipeIntoCalculator }: RecipeTabProps) {
  const [loafCount, setLoafCount] = useState<number>(1);
  const [flour1Pct] = useState<number>(90);
  const [flour2Pct] = useState<number>(10);
  const [waterPct] = useState<number>(75);
  const [starterPct] = useState<number>(20);
  const [saltPct] = useState<number>(2);

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
      {/* Sleek Batch Size Selector */}
      <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl p-4 sm:p-5 border border-stone-200/90 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
            Tartine 90/10 Country Formula
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Baseline standard for two-factor calculations
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {[1, 2, 3, 4].map((count) => (
            <Button
              key={count}
              type="button"
              variant={loafCount === count ? 'amber' : 'secondary'}
              onClick={() => setLoafCount(count)}
              className="font-mono text-xs font-bold h-8 px-3"
            >
              {count} {count === 1 ? 'Loaf' : 'Loaves'} ({count * 500}g)
            </Button>
          ))}
        </div>
      </div>

      {/* Main Grid: Recipe Builder & Hydration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recipe Ingredients Table */}
        <Card className="lg:col-span-7 border-stone-200 dark:border-stone-800 shadow-sm">
          <CardHeader className="p-5 sm:p-6 pb-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <CardTitle className="font-bold text-stone-900 dark:text-white text-base flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Baker's Percentages & Grams
              </CardTitle>
              <Badge variant="outline" className="text-xs font-mono">
                Total: <span className="font-bold ml-1 text-stone-900 dark:text-stone-100">{totalDoughGrams}g</span>
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 pt-0 space-y-4">
            <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
              <table className="w-full text-left text-xs min-w-[320px]">
                <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-700">
                  <tr>
                    <th className="p-2.5 rounded-l-lg">Ingredient</th>
                    <th className="p-2.5">Baker's %</th>
                    <th className="p-2.5 text-right rounded-r-lg">Weight (g)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono">
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">
                      Bread Flour
                    </td>
                    <td className="p-2.5 text-stone-600 dark:text-stone-400">{flour1Pct}%</td>
                    <td className="p-2.5 text-right font-bold text-stone-900 dark:text-stone-100">{flour1Grams}g</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">
                      Whole Wheat
                    </td>
                    <td className="p-2.5 text-stone-600 dark:text-stone-400">{flour2Pct}%</td>
                    <td className="p-2.5 text-right font-bold text-stone-900 dark:text-stone-100">{flour2Grams}g</td>
                  </tr>
                  <tr className="bg-amber-50/50 dark:bg-amber-950/20 font-semibold">
                    <td className="p-2.5 font-sans font-bold text-amber-950 dark:text-amber-300">
                      Total Flour
                    </td>
                    <td className="p-2.5 font-bold text-amber-950 dark:text-amber-300">100%</td>
                    <td className="p-2.5 text-right font-bold text-amber-950 dark:text-amber-300">{totalFlourGrams}g</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span>Water</span>
                        <Button
                          type="button"
                          variant="amber"
                          size="sm"
                          onClick={() => onLoadRecipeIntoCalculator(totalFlourGrams, startingVolumeMl, 'ddt')}
                          className="h-6 px-2 text-[10px] font-sans font-semibold gap-1"
                          title="Calculate exact water temperature needed (DDT formula for hand mixing)"
                        >
                          <Waves className="w-3 h-3" />
                          Calc Temp (DDT)
                        </Button>
                      </div>
                    </td>
                    <td className="p-2.5 text-stone-600 dark:text-stone-400">{waterPct}%</td>
                    <td className="p-2.5 text-right font-bold text-stone-900 dark:text-stone-100">{waterGrams}g</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">
                      Starter (100% Hydration)
                    </td>
                    <td className="p-2.5 text-stone-600 dark:text-stone-400">{starterPct}%</td>
                    <td className="p-2.5 text-right font-bold text-stone-900 dark:text-stone-100">{starterGrams}g</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">
                      Salt
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
                <span className="font-semibold text-stone-900 dark:text-stone-100 block">Mixed Starting Volume:</span>
                <span className="text-stone-500 dark:text-stone-400 font-mono text-[11px]">
                  {totalFlourGrams}g flour × 1.5 = <strong className="text-amber-800 dark:text-amber-400">{startingVolumeMl} mL</strong>
                </span>
              </div>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => onLoadRecipeIntoCalculator(totalFlourGrams, startingVolumeMl)}
                className="w-full sm:w-auto font-semibold text-xs gap-1.5 min-h-[38px]"
              >
                Use in Calculator
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: True Hydration Analyzer & Sourdough Journey Appendix 1 Vessel Selection */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* True Hydration Card */}
          <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-bold text-stone-900 dark:text-white text-sm">
                  Hydration Breakdown
                </CardTitle>
                <Badge variant="outline" className="text-[11px] font-mono bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800 font-bold">
                  {hydration.trueHydration}% True
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-2.5">
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2.5 bg-stone-50 dark:bg-stone-800/80 rounded-lg border border-stone-200 dark:border-stone-700">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block uppercase">Baker's</span>
                  <span className="text-base font-bold text-stone-900 dark:text-stone-100">{hydration.bakersHydration}%</span>
                </div>
                <div className="p-2.5 bg-sky-50 dark:bg-sky-950/30 rounded-lg border border-sky-200 dark:border-sky-800">
                  <span className="text-[10px] text-sky-700 dark:text-sky-300 block uppercase">True (+Starter)</span>
                  <span className="text-base font-bold text-sky-900 dark:text-sky-200">{hydration.trueHydration}%</span>
                </div>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                100% starter contributes {hydration.starterWater}g water and {hydration.starterFlour}g flour.
              </p>
            </CardContent>
          </Card>

          {/* Appendix 1: Selecting the Right Bulk Fermentation Vessel */}
          <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-700 dark:text-amber-400 font-bold mb-1">
                <Package className="w-3.5 h-3.5" />
                Vessel Sizing
              </div>
              <CardTitle className="font-bold text-stone-900 dark:text-white text-base">
                Fermentation Vessel Recommendation
              </CardTitle>
              <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
                For {loafCount} {loafCount === 1 ? 'loaf' : 'loaves'} ({totalFlourGrams}g flour)
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-3">
              <div className="space-y-2.5">
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <div>
                      <div className="font-semibold text-amber-950 dark:text-amber-200">Warm Ferment (75–80°F)</div>
                      <div className="text-[11px] text-amber-800 dark:text-amber-400">Rise: 30% – 50%</div>
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
                      <div className="font-semibold text-sky-950 dark:text-sky-200">Cool Ferment (&lt;75°F)</div>
                      <div className="text-[11px] text-sky-800 dark:text-sky-400">Rise: 75% – 100%+</div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {vesselRec.coolVesselSize}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                Tip: 100g water = 100 mL. Calibrate straight-sided clear containers using a digital scale and marker.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
