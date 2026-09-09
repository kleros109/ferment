import { useState, useMemo } from 'react';
import {
  Thermometer,
  Waves,
  Hand,
  Sparkles,
  Info,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Flame,
  Snowflake,
  RotateCcw,
  SlidersHorizontal,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TempUnit } from '../types';
import {
  calculateDDTWaterTemp,
  fahrenheitToCelsius,
  celsiusToFahrenheit,
} from '../utils/fermentCalculations';

interface DDTCalculatorProps {
  tempUnit: TempUnit;
  onApplyDDTToDoughTemp?: (ddtInF: number) => void;
  className?: string;
  defaultDDT?: number;
}

export function DDTCalculator({
  tempUnit,
  onApplyDDTToDoughTemp,
  className = '',
  defaultDDT,
}: DDTCalculatorProps) {
  // Default values based on unit
  const [ddtF, setDdtF] = useState<number>(defaultDDT || 78);
  const [airTempF, setAirTempF] = useState<number>(72);
  const [flourTempF, setFlourTempF] = useState<number>(70);
  const [starterTempF, setStarterTempF] = useState<number>(72);
  const [includeStarter, setIncludeStarter] = useState<boolean>(false);
  const [customFrictionF, setCustomFrictionF] = useState<number>(0);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  const step = tempUnit === 'F' ? 1 : 0.5;
  const roundVal = (val: number) => tempUnit === 'F' ? Math.round(val) : Math.round(val * 2) / 2;

  // Active inputs in current unit
  const activeDDT = tempUnit === 'F' ? ddtF : fahrenheitToCelsius(ddtF);
  const activeAir = tempUnit === 'F' ? airTempF : fahrenheitToCelsius(airTempF);
  const activeFlour = tempUnit === 'F' ? flourTempF : fahrenheitToCelsius(flourTempF);
  const activeStarter = tempUnit === 'F' ? starterTempF : fahrenheitToCelsius(starterTempF);
  const activeFriction = tempUnit === 'F' ? customFrictionF : Math.round(((customFrictionF * 5) / 9) * 10) / 10;

  // Implied Water Temp calculation
  const calculation = useMemo(() => {
    return calculateDDTWaterTemp({
      desiredDoughTemp: activeDDT,
      airTemp: activeAir,
      flourTemp: activeFlour,
      starterTemp: includeStarter ? activeStarter : undefined,
      includeStarter,
      frictionFactor: activeFriction,
      unit: tempUnit,
    });
  }, [activeDDT, activeAir, activeFlour, activeStarter, includeStarter, activeFriction, tempUnit]);

  // Setters that convert appropriately
  const handleDdtChange = (val: number) => {
    setDdtF(tempUnit === 'F' ? val : celsiusToFahrenheit(val));
  };

  const handleAirChange = (val: number) => {
    setAirTempF(tempUnit === 'F' ? val : celsiusToFahrenheit(val));
  };

  const handleFlourChange = (val: number) => {
    setFlourTempF(tempUnit === 'F' ? val : celsiusToFahrenheit(val));
  };

  const handleStarterChange = (val: number) => {
    setStarterTempF(tempUnit === 'F' ? val : celsiusToFahrenheit(val));
  };

  // Presets for quick selection
  const presets = tempUnit === 'F'
    ? [
        { label: 'Cool 72°F', val: 72, desc: 'Slower ferment, high flavor' },
        { label: 'Moderate 75°F', val: 75, desc: 'Balanced commercial pace' },
        { label: 'Tartine 78°F', val: 78, desc: 'Standard Chad Robertson DDT' },
        { label: 'Warm 80°F', val: 80, desc: 'Fast, active sour bulk' },
      ]
    : [
        { label: 'Cool 22°C', val: 22.2, desc: 'Slower ferment, high flavor' },
        { label: 'Moderate 24°C', val: 24, desc: 'Balanced commercial pace' },
        { label: 'Tartine 25.5°C', val: 25.5, desc: 'Standard Chad Robertson DDT' },
        { label: 'Warm 26.7°C', val: 26.7, desc: 'Fast, active sour bulk' },
      ];

  const statusStylesMap = {
    optimal: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100',
      badge: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
      icon: CheckCircle2,
      accent: 'text-emerald-700 dark:text-emerald-400',
    },
    warm: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100',
      badge: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
      icon: Flame,
      accent: 'text-amber-700 dark:text-amber-400',
    },
    cool: {
      bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-950 dark:text-sky-100',
      badge: 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700',
      icon: Snowflake,
      accent: 'text-sky-700 dark:text-sky-400',
    },
    ice_required: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100',
      badge: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700',
      icon: Snowflake,
      accent: 'text-indigo-700 dark:text-indigo-400',
    },
    hot_warning: {
      bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-950 dark:text-orange-100',
      badge: 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700',
      icon: AlertTriangle,
      accent: 'text-orange-700 dark:text-orange-400',
    },
    danger_hot: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100',
      badge: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700',
      icon: AlertTriangle,
      accent: 'text-rose-700 dark:text-rose-400',
    },
  };

  const statusStyles = statusStylesMap[calculation.status] || statusStylesMap.optimal;
  const StatusIcon = statusStyles.icon;

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden ${className}`}>
      {/* Card Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-stone-900 to-stone-950 text-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono border border-amber-500/30">
              <Thermometer className="w-3.5 h-3.5" />
              Desired Dough Temperature (DDT)
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Waves className="w-5 h-5 text-amber-400" />
              Implied Water Temperature Calculator
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
              Calculate the exact water temperature needed to hit your target dough temperature.
              Pre-calibrated for <strong>hand-mixed dough</strong> with zero mechanical friction.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="px-3 py-1.5 rounded-xl bg-stone-800 border border-stone-700 flex items-center gap-2 text-xs font-mono text-stone-300">
              <Hand className="w-4 h-4 text-amber-400" />
              <span>Hand Mixed: <strong className="text-white">0°{tempUnit} Friction</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Quick DDT Preset Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Quick DDT Presets
            </label>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              Target for bulk fermentation
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((p) => {
              const isSelected = Math.abs(activeDDT - p.val) < 0.3;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleDdtChange(p.val)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 dark:bg-amber-500/20 border-amber-500 text-amber-950 dark:text-amber-200 font-bold shadow-sm ring-1 ring-amber-500/30'
                      : 'bg-stone-50/70 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{p.label}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400" />}
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 font-normal mt-0.5 leading-tight">
                    {p.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs Grid: DDT, Air Temp, Flour Temp */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Input 1: DDT */}
          <div className="p-4 bg-stone-50/80 dark:bg-stone-800/60 rounded-2xl border border-stone-200/90 dark:border-stone-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Desired Dough Temp (DDT)
              </label>
              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-semibold uppercase">Target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleDdtChange(roundVal(activeDDT - step))}
                className="w-10 h-10 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 active:scale-95 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-sm shrink-0"
                aria-label="Decrease target dough temperature"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  step={step}
                  value={activeDDT}
                  onChange={(e) => handleDdtChange(parseFloat(e.target.value) || 0)}
                  className="w-full text-center text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 px-2 py-2 rounded-xl border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 font-mono text-xs sm:text-sm font-semibold pointer-events-none">
                  °{tempUnit}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDdtChange(roundVal(activeDDT + step))}
                className="w-10 h-10 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 active:scale-95 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-sm shrink-0"
                aria-label="Increase target dough temperature"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              The internal temperature you want your mixed dough to achieve.
            </p>
          </div>

          {/* Input 2: Air Temp */}
          <div className="p-4 bg-stone-50/80 dark:bg-stone-800/60 rounded-2xl border border-stone-200/90 dark:border-stone-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                Air / Room Temp
              </label>
              <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 uppercase">Kitchen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAirChange(roundVal(activeAir - step))}
                className="w-10 h-10 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 active:scale-95 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-sm shrink-0"
                aria-label="Decrease room temperature"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  step={step}
                  value={activeAir}
                  onChange={(e) => handleAirChange(parseFloat(e.target.value) || 0)}
                  className="w-full text-center text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 px-2 py-2 rounded-xl border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 font-mono text-xs sm:text-sm font-semibold pointer-events-none">
                  °{tempUnit}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleAirChange(roundVal(activeAir + step))}
                className="w-10 h-10 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 active:scale-95 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-sm shrink-0"
                aria-label="Increase room temperature"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Current ambient temperature of your kitchen or proofing area.
            </p>
          </div>

          {/* Input 3: Flour Temp */}
          <div className="p-4 bg-stone-50/80 dark:bg-stone-800/60 rounded-2xl border border-stone-200/90 dark:border-stone-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                Flour Temp
              </label>
              <button
                type="button"
                onClick={() => handleFlourChange(activeAir)}
                className="text-[10px] text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-semibold underline p-1 -m-1"
                title="Pantry flour is typically equal to room temperature"
              >
                Match Air
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleFlourChange(roundVal(activeFlour - step))}
                className="w-10 h-10 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 active:scale-95 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-sm shrink-0"
                aria-label="Decrease flour temperature"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  step={step}
                  value={activeFlour}
                  onChange={(e) => handleFlourChange(parseFloat(e.target.value) || 0)}
                  className="w-full text-center text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 px-2 py-2 rounded-xl border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 font-mono text-xs sm:text-sm font-semibold pointer-events-none">
                  °{tempUnit}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleFlourChange(roundVal(activeFlour + step))}
                className="w-10 h-10 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 active:scale-95 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-sm shrink-0"
                aria-label="Increase flour temperature"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Probe dry flour bag. If in pantry, it usually equals room temp.
            </p>
          </div>
        </div>

        {/* Optional 4th Factor: Sourdough Starter & Advanced Tuning */}
        <div className="border-t border-stone-200 dark:border-stone-800 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-800 dark:text-stone-200">
              <input
                type="checkbox"
                checked={includeStarter}
                onChange={(e) => setIncludeStarter(e.target.checked)}
                className="w-4 h-4 accent-amber-600 rounded border-stone-300 dark:border-stone-600 cursor-pointer"
              />
              <span>Include Sourdough Starter / Levain (4-Factor Formula)</span>
            </label>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 flex items-center gap-1 font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {showAdvanced ? 'Hide Advanced Settings' : 'Advanced / Stand Mixer Tuning'}
            </button>
          </div>

          {/* Conditional Starter input */}
          {includeStarter && (
            <div className="mt-3 p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/80 dark:border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-stone-900 dark:text-stone-100">Sourdough Starter / Levain Temperature:</div>
                <div className="text-stone-600 dark:text-stone-400 text-[11px]">
                  Ripe starter accounts for ~20% of dough weight. If refreshed on counter, it matches room temp.
                </div>
              </div>
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleStarterChange(roundVal(activeStarter - step))}
                  className="w-9 h-9 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-200 active:scale-95 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-sm shrink-0"
                  aria-label="Decrease Starter Temp"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="relative w-28 flex-1 sm:flex-none">
                  <input
                    type="number"
                    step={step}
                    value={activeStarter}
                    onChange={(e) => handleStarterChange(parseFloat(e.target.value) || 0)}
                    className="w-full text-center text-base font-mono font-bold bg-white dark:bg-stone-800 px-2 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs pointer-events-none">
                    °{tempUnit}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleStarterChange(roundVal(activeStarter + step))}
                  className="w-9 h-9 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-200 active:scale-95 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-sm shrink-0"
                  aria-label="Increase Starter Temp"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStarterChange(activeAir)}
                  className="px-2.5 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg text-xs shrink-0 font-medium active:scale-95"
                >
                  Match Room
                </button>
              </div>
            </div>
          )}

          {/* Advanced friction settings */}
          {showAdvanced && (
            <div className="mt-3 p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900 dark:text-stone-100 block">Mixing Friction Factor:</span>
                  <span className="text-stone-500 dark:text-stone-400 text-[11px]">
                    Hand mixing has <strong>0° friction</strong>. Stand mixers (KitchenAid) add ~5°F to 10°F friction.
                  </span>
                </div>
                <div className="relative w-28">
                  <input
                    type="number"
                    step={tempUnit === 'F' ? 1 : 0.5}
                    value={activeFriction}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      setCustomFrictionF(tempUnit === 'F' ? v : Math.round((v * 9) / 5));
                    }}
                    className="w-full text-sm font-mono font-bold bg-white dark:bg-stone-800 px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">
                    °{tempUnit}
                  </span>
                </div>
              </div>
              {customFrictionF !== 0 && (
                <button
                  type="button"
                  onClick={() => setCustomFrictionF(0)}
                  className="text-amber-700 dark:text-amber-400 hover:underline text-[11px] font-medium"
                >
                  Reset to Hand Mixing (0° friction)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Primary Output Banner: Implied Water Temperature */}
        <div className={`p-6 rounded-2xl border transition-all ${statusStyles.bg} space-y-4 shadow-sm`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Calculated Result
                </span>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${statusStyles.badge} flex items-center gap-1`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {calculation.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-50 mt-1">
                {calculation.waterTemp}°{tempUnit}
                <span className="text-base sm:text-lg font-normal text-stone-500 dark:text-stone-400 font-sans ml-2">
                  ({tempUnit === 'F' ? `${calculation.waterTempC}°C` : `${calculation.waterTempF}°F`})
                </span>
              </h3>
              <p className="text-xs font-medium text-stone-700 dark:text-stone-300 mt-1">
                Implied Water Temperature to achieve your {activeDDT}°{tempUnit} DDT
              </p>
            </div>

            {/* Quick Action: Apply to Calculator */}
            {onApplyDDTToDoughTemp && (
              <button
                type="button"
                onClick={() => onApplyDDTToDoughTemp(calculation.waterTempF >= 0 ? ddtF : 75)}
                className="w-full sm:w-auto px-5 py-3 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 shrink-0 min-h-[48px]"
              >
                <Sparkles className="w-4 h-4 text-amber-400 dark:text-white" />
                Apply {activeDDT}°{tempUnit} as Dough Temp
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Message & Warning */}
          <div className="p-3 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-xl border border-stone-200/60 dark:border-stone-700/60 text-xs leading-relaxed text-stone-800 dark:text-stone-200">
            {calculation.statusMessage}
          </div>

          {/* Mathematical Proof & Formula Breakdown */}
          <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center justify-between w-full text-[11px] font-sans font-semibold text-stone-700 dark:text-stone-300 py-1 cursor-pointer"
            >
              <span>Mathematical Breakdown ({calculation.factorsCount}-Factor Hand Mix Formula)</span>
              <span className="flex items-center gap-1 text-stone-500 dark:text-stone-400 text-xs font-normal">
                {showBreakdown ? 'Hide' : 'Show'}
                {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>
            {showBreakdown && (
              <div className="mt-1.5 p-2.5 bg-white/70 dark:bg-stone-900/70 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed text-stone-600 dark:text-stone-400 border border-stone-200/40 dark:border-stone-800">
                <span>Implied Water Temp = ({calculation.factorsCount} × {activeDDT}°) - ({activeAir}° air + {activeFlour}° flour{includeStarter ? ` + ${activeStarter}° starter` : ''}{activeFriction ? ` + ${activeFriction}° friction` : ''})</span>
                <br />
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  = {calculation.totalTempSum}° - {calculation.subtotalKnown}° = {calculation.waterTemp}°{tempUnit}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pro Baker Tips for DDT Execution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
            <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Blender Tap Technique
            </div>
            <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
              If your tap hot water is 120°F and cold tap is 55°F, blend them in a pitcher and stir thoroughly with your instant-read digital probe thermometer before weighing into your bowl.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
            <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Protecting Starter Microbes
            </div>
            <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
              If your calculated water temperature exceeds 100°F (38°C) to warm up chilly flour, mix the warm water with the flour first (autolyse), then add your starter once the dough has stabilized below 90°F.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
