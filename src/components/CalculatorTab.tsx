import { useState, useMemo, type CSSProperties } from 'react';
import {
  Thermometer,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  Play,
  Gauge,
  Waves,
  Minus,
  Plus,
  Info,
  CheckCircle2,
  Check
} from 'lucide-react';
import { TempUnit } from '../types';
import {
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  getGuideForTemperature,
  calculateStartingVolumeFromFlour,
  calculateTargetVolume,
  calculateDomeVolume,
} from '../utils/fermentCalculations';
import { DOUGH_TEMP_GUIDE } from '../data/sourdoughData';
import { DDTCalculator } from './DDTCalculator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

interface CalculatorTabProps {
  tempUnit: TempUnit;
  initialMode?: 'two-factor' | 'ddt';
  onStartBakeWithValues?: (data: {
    doughTempF: number;
    flourGrams: number;
    startingVolumeMl: number;
    targetRisePercent: number;
    targetVolumeMl: number;
  }) => void;
}

export function CalculatorTab({
  tempUnit,
  initialMode = 'two-factor',
  onStartBakeWithValues,
}: CalculatorTabProps) {
  const [activeMode, setActiveMode] = useState<'two-factor' | 'ddt'>(initialMode);
  const [ddtAppliedNotice, setDdtAppliedNotice] = useState<string | null>(null);
  const [showMobileBannerInfo, setShowMobileBannerInfo] = useState<boolean>(false);
  const [showMobileReferenceTable, setShowMobileReferenceTable] = useState<boolean>(false);

  // Dough temp state in Fahrenheit internally
  const [doughTempF, setDoughTempF] = useState<number>(75);
  const [flourGrams, setFlourGrams] = useState<number>(500);
  const [startingVolumeMl, setStartingVolumeMl] = useState<number>(750);
  const [useShorthand, setUseShorthand] = useState<boolean>(true);
  const [currentDoughVolume, setCurrentDoughVolume] = useState<number>(750);
  
  // Dome measurement state
  const [isDomed, setIsDomed] = useState<boolean>(false);
  const [domeLowPoint, setDomeLowPoint] = useState<number>(700);
  const [domeHighPoint, setDomeHighPoint] = useState<number>(800);

  // Temperature drift advisor state
  const [showDriftAdvisor, setShowDriftAdvisor] = useState<boolean>(false);
  const [mixedTempF, setMixedTempF] = useState<number>(78);
  const [roomTempF, setRoomTempF] = useState<number>(70);

  // Active guide calculations
  const currentGuide = useMemo(() => getGuideForTemperature(doughTempF), [doughTempF]);

  // Target volume calculation
  const targetCalc = useMemo(
    () => calculateTargetVolume(startingVolumeMl, currentGuide.targetRise, 50),
    [startingVolumeMl, currentGuide.targetRise]
  );

  // Effective volume if domed
  const effectiveCurrentVolume = useMemo(() => {
    if (!isDomed) return currentDoughVolume;
    return calculateDomeVolume(domeLowPoint, domeHighPoint);
  }, [isDomed, currentDoughVolume, domeLowPoint, domeHighPoint]);

  // Current % rise achieved
  const currentRisePercent = useMemo(() => {
    if (startingVolumeMl <= 0) return 0;
    const rise = ((effectiveCurrentVolume - startingVolumeMl) / startingVolumeMl) * 100;
    return Math.max(0, Math.round(rise));
  }, [effectiveCurrentVolume, startingVolumeMl]);

  // Progress to bulk cutoff target
  const progressToTarget = useMemo(() => {
    if (currentGuide.targetRise <= 0) return 0;
    const p = (currentRisePercent / currentGuide.targetRise) * 100;
    return Math.min(150, Math.round(p));
  }, [currentRisePercent, currentGuide.targetRise]);

  // Slider conversions
  const minTemp = tempUnit === 'F' ? 65 : 18;
  const maxTemp = tempUnit === 'F' ? 82 : 28;
  const displayTemp = tempUnit === 'F' ? doughTempF : fahrenheitToCelsius(doughTempF);
  const displayTempStep = tempUnit === 'F' ? 1 : 0.5;

  const handleTempSlider = (val: number) => {
    if (tempUnit === 'F') {
      setDoughTempF(val);
    } else {
      setDoughTempF(celsiusToFahrenheit(val));
    }
  };

  const handleFlourChange = (grams: number) => {
    setFlourGrams(grams);
    if (useShorthand) {
      const vol = calculateStartingVolumeFromFlour(grams);
      setStartingVolumeMl(vol);
      setCurrentDoughVolume(vol);
      setDomeLowPoint(vol - 50);
      setDomeHighPoint(vol + 50);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Method Banner Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-amber-900/10 to-stone-900/20 border-amber-500/30">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="amber" className="text-[11px] font-mono tracking-wide">
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  The Sourdough Journey
                </Badge>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:inline">
                  Tom Cucuzza Framework
                </span>
              </div>
              <h1 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-stone-900 dark:text-stone-50 tracking-tight">
                Two-Factor Fermentation Calculator
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Stop relying on <em className="italic text-amber-800 dark:text-amber-300 font-medium">"let it double"</em>. Synchronize your bulk rise cutoff with internal dough temperature, and use the DDT calculator to hit your target mixed temperature every time.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileBannerInfo(!showMobileBannerInfo)}
              className="sm:hidden self-start text-xs font-semibold gap-1 text-amber-800 dark:text-amber-300"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showMobileBannerInfo ? 'Hide Method' : 'How it Works'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expandable Mobile Method Explanation */}
      {showMobileBannerInfo && (
        <Alert variant="amber" className="sm:hidden animate-fade-in">
          <Info className="w-4 h-4" />
          <AlertTitle className="text-xs font-bold text-amber-900 dark:text-amber-200">
            The Two-Factor Method
          </AlertTitle>
          <AlertDescription className="text-xs text-stone-700 dark:text-stone-300 space-y-1.5 pt-1">
            <p>
              1. <strong>Dough Temperature:</strong> Warmer dough (80°F) continues fermenting fast during the 8-10 hour refrigerator cooling curve, requiring cutoff at only 30% rise. Cooler dough (68°F) needs 100% rise because it cools rapidly in the fridge.
            </p>
            <p>
              2. <strong>Starting Volume:</strong> Measure accurate volume using straight-sided containers or Tom's shorthand (Flour grams × 1.5 = mL).
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Mode Switcher: Two-Factor Fermentation vs DDT Water Calculator */}
      <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-900 p-1 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs">
        <Button
          variant={activeMode === 'two-factor' ? 'default' : 'ghost'}
          size="default"
          onClick={() => setActiveMode('two-factor')}
          className="flex-1 rounded-xl text-xs sm:text-sm font-semibold gap-2"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="truncate">Two-Factor Rise Guide</span>
        </Button>
        <Button
          variant={activeMode === 'ddt' ? 'default' : 'ghost'}
          size="default"
          onClick={() => setActiveMode('ddt')}
          className="flex-1 rounded-xl text-xs sm:text-sm font-semibold gap-2"
        >
          <Waves className="w-4 h-4 shrink-0" />
          <span className="truncate">DDT Water Temp</span>
        </Button>
      </div>

      {ddtAppliedNotice && (
        <Alert variant="emerald" className="shadow-xs animate-fade-in flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{ddtAppliedNotice}</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDdtAppliedNotice(null)}
            className="w-6 h-6 rounded-md hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 text-xs font-bold"
          >
            ✕
          </Button>
        </Alert>
      )}

      {activeMode === 'ddt' ? (
        <DDTCalculator
          tempUnit={tempUnit}
          defaultDDT={doughTempF}
          onApplyDDTToDoughTemp={(val) => {
            setDoughTempF(val);
            setActiveMode('two-factor');
            const displayVal = tempUnit === 'F' ? `${val}°F` : `${fahrenheitToCelsius(val)}°C`;
            setDdtAppliedNotice(`Applied ${displayVal} as Dough Temperature! Target rise set to ${getGuideForTemperature(val).targetRise}%.`);
            setTimeout(() => setDdtAppliedNotice(null), 6000);
          }}
        />
      ) : (
        /* Main Grid: Inputs on Left, Vessel Visualizer on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Left Column: Factor 1 & Factor 2 Controls + Results */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Factor 1: Dough Temperature */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-400 shrink-0 shadow-2xs">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base">
                      Factor 1: Dough Temperature
                    </CardTitle>
                    <CardDescription className="hidden sm:block">
                      Measure center dough temp with an instant-read probe
                    </CardDescription>
                  </div>
                </div>

                {/* Stepper & Big Temperature Readout */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleTempSlider(Math.max(minTemp, displayTemp - displayTempStep))}
                    aria-label="Decrease temperature"
                    className="w-8 h-8 sm:w-9 sm:h-9"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="text-center min-w-[4.8rem] sm:min-w-[5.6rem]">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400 leading-none">
                      {displayTemp}°{tempUnit}
                    </span>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                      ({tempUnit === 'F' ? `${fahrenheitToCelsius(doughTempF)}°C` : `${doughTempF}°F`})
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleTempSlider(Math.min(maxTemp, displayTemp + displayTempStep))}
                    aria-label="Increase temperature"
                    className="w-8 h-8 sm:w-9 sm:h-9"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Interactive Slider */}
              <div className="space-y-1.5 pt-1">
                <Slider
                  min={minTemp}
                  max={maxTemp}
                  step={displayTempStep}
                  value={displayTemp}
                  onValueChange={handleTempSlider}
                  aria-label="Dough temperature"
                />
                <div className="flex justify-between text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-mono select-none px-1">
                  <span>{tempUnit === 'F' ? '65°F (Cold)' : '18°C'}</span>
                  <span>{tempUnit === 'F' ? '70°F' : '21°C'}</span>
                  <span className="font-bold text-amber-800 dark:text-amber-400">{tempUnit === 'F' ? '75°F' : '24°C'}</span>
                  <span>{tempUnit === 'F' ? '78°F' : '25.5°C'}</span>
                  <span>{tempUnit === 'F' ? '82°F (Warm)' : '28°C'}</span>
                </div>
              </div>

              {/* Quick Temp Preset Pills */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[65, 70, 75, 78, 80].map((tF) => {
                  const isSelected = Math.round(doughTempF) === tF;
                  const displayValue = tempUnit === 'F' ? `${tF}°F` : `${fahrenheitToCelsius(tF)}°C`;
                  return (
                    <Button
                      key={tF}
                      size="sm"
                      variant={isSelected ? 'default' : 'secondary'}
                      onClick={() => setDoughTempF(tF)}
                      className={`h-8 font-mono text-xs font-bold transition-all ${
                        isSelected
                          ? 'shadow-xs ring-1 ring-amber-500'
                          : 'border border-stone-200/80 dark:border-stone-800'
                      }`}
                    >
                      {displayValue}
                    </Button>
                  );
                })}
              </div>

              {/* Quick link to DDT Calculator */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                <span className="text-stone-500 dark:text-stone-400 text-[11px]">Need to hit {displayTemp}°{tempUnit}?</span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setActiveMode('ddt')}
                  className="gap-1 text-amber-700 dark:text-amber-400 font-semibold"
                >
                  <Waves className="w-3.5 h-3.5" />
                  <span>Calculate Water Temp</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Warm Dough Notice if >= 76°F */}
              {doughTempF >= 76 && (
                <Alert variant="amber">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="text-xs font-bold text-amber-950 dark:text-amber-200">
                    Warm Dough Advisory
                  </AlertTitle>
                  <AlertDescription className="text-xs text-amber-900 dark:text-amber-300">
                    Dough at {doughTempF}°F retains thermal mass and continues fermenting rapidly in the fridge for 8-10 hours. Stop early at +{currentGuide.targetRise}% rise!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Factor 2: Starting Volume & Flour Weight */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 shrink-0 shadow-2xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base">
                      Factor 2: Starting Volume
                    </CardTitle>
                    <CardDescription className="hidden sm:block">
                      Leveled volume in milliliters after ingredients are combined
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setUseShorthand(!useShorthand)}
                  className="text-xs text-amber-700 dark:text-amber-400 font-semibold"
                >
                  {useShorthand ? 'Enter Manual mL' : 'Use Flour × 1.5'}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {useShorthand ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      Total Dry Flour Weight:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => handleFlourChange(Math.max(200, flourGrams - 50))}
                        className="w-8 h-8 rounded-lg"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <Input
                        type="number"
                        min={200}
                        max={4000}
                        step={50}
                        value={flourGrams}
                        onChange={(e) => handleFlourChange(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 h-8 px-2 py-1 text-center font-mono font-bold text-stone-900 dark:text-stone-100"
                      />
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => handleFlourChange(Math.min(4000, flourGrams + 50))}
                        className="w-8 h-8 rounded-lg"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">grams</span>
                    </div>
                  </div>

                  {/* Loaf presets */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '1 Loaf', flour: 500, vol: '750 mL' },
                      { label: '2 Loaves', flour: 1000, vol: '1,500 mL' },
                      { label: '3 Loaves', flour: 1500, vol: '2,250 mL' },
                    ].map((preset) => {
                      const isSelected = flourGrams === preset.flour;
                      return (
                        <button
                          key={preset.flour}
                          type="button"
                          onClick={() => handleFlourChange(preset.flour)}
                          className={`py-2 px-2 rounded-xl text-xs text-center border transition-all touch-manipulation cursor-pointer ${
                            isSelected
                              ? 'bg-amber-600 dark:bg-amber-500 text-white dark:text-stone-950 border-amber-600 dark:border-amber-500 font-bold shadow-xs'
                              : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                          }`}
                        >
                          <div className="font-bold">{preset.label}</div>
                          <div className="text-[10px] opacity-80 font-mono">{preset.flour}g = {preset.vol}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 flex items-center justify-between">
                    <span className="text-stone-600 dark:text-stone-300">Shorthand Formula ({flourGrams}g × 1.5):</span>
                    <span className="font-mono font-bold text-amber-900 dark:text-amber-400 text-sm">
                      = {startingVolumeMl} mL Starting Volume
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Measured Starting Volume (in container mL markers):
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const v = Math.max(200, startingVolumeMl - 25);
                        setStartingVolumeMl(v);
                        setCurrentDoughVolume(v);
                      }}
                      className="w-10 h-10 rounded-xl"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      min={200}
                      max={5000}
                      step={25}
                      value={startingVolumeMl}
                      onChange={(e) => {
                        const v = Math.max(0, parseInt(e.target.value) || 0);
                        setStartingVolumeMl(v);
                        setCurrentDoughVolume(v);
                      }}
                      className="flex-1 h-10 font-mono font-bold text-center text-base"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const v = Math.min(5000, startingVolumeMl + 25);
                        setStartingVolumeMl(v);
                        setCurrentDoughVolume(v);
                      }}
                      className="w-10 h-10 rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-semibold text-stone-600 dark:text-stone-400">mL</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Card: Target % Rise & Cutoff Volume */}
          <Card className="bg-stone-900 dark:bg-stone-950 text-stone-100 border-stone-800 shadow-md">
            <CardHeader className="pb-3 border-b border-stone-800">
              <div className="flex items-center justify-between">
                <Badge variant="amber" className="font-mono text-[11px] font-bold uppercase tracking-wider">
                  Calculated Fermentation Target
                </Badge>
                <span className="text-xs text-stone-400 font-mono">
                  {currentGuide.approxHours} window
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3.5 bg-stone-800/80 rounded-2xl border border-stone-700/60 flex flex-col justify-between">
                  <div className="text-xs text-stone-400 font-medium mb-1">Target % Rise</div>
                  <div className="font-mono text-3xl sm:text-4xl font-black text-amber-400 leading-none">
                    +{currentGuide.targetRise}%
                  </div>
                  <div className="text-[10px] text-stone-400 mt-2 font-mono">
                    At {displayTemp}°{tempUnit} dough temp
                  </div>
                </div>

                <div className="p-3.5 bg-stone-800/80 rounded-2xl border border-stone-700/60 flex flex-col justify-between">
                  <div className="text-xs text-stone-400 font-medium mb-1">Cutoff Volume</div>
                  <div className="font-mono text-3xl sm:text-4xl font-black text-emerald-400 leading-none">
                    {targetCalc.rounded}
                    <span className="text-sm font-normal text-stone-300 ml-1">mL</span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-2 font-mono">
                    Exact: {targetCalc.exact} mL
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-stone-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Mark container at <strong className="text-white font-mono">{targetCalc.rounded} mL</strong> cutoff</span>
                </div>
                
                {onStartBakeWithValues && (
                  <Button
                    size="lg"
                    variant="default"
                    onClick={() =>
                      onStartBakeWithValues({
                        doughTempF,
                        flourGrams,
                        startingVolumeMl,
                        targetRisePercent: currentGuide.targetRise,
                        targetVolumeMl: targetCalc.rounded,
                      })
                    }
                    className="w-full sm:w-auto text-xs font-bold gap-2 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start & Track Live Bake</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Desktop Only: Quick Temperature Reference Table */}
          <Card className="hidden lg:block">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  The Sourdough Journey Temping Guide (2024)
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-[11px]">
                  16 Temperatures
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="overflow-x-auto max-h-48 overflow-y-auto border border-stone-200 dark:border-stone-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 sticky top-0 font-medium">
                    <tr>
                      <th className="p-2.5">Dough Temp</th>
                      <th className="p-2.5">Target % Rise</th>
                      <th className="p-2.5">Approx. Planning Time</th>
                      <th className="p-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono">
                    {DOUGH_TEMP_GUIDE.map((entry) => {
                      const isSelected = Math.round(doughTempF) === entry.tempF;
                      return (
                        <tr
                          key={entry.tempF}
                          onClick={() => setDoughTempF(entry.tempF)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-amber-100/80 dark:bg-amber-950/70 font-bold text-amber-900 dark:text-amber-300'
                              : 'hover:bg-stone-50 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <td className="p-2">
                            {entry.tempF}°F / {entry.tempC}°C
                          </td>
                          <td className="p-2 text-amber-700 dark:text-amber-400 font-bold">
                            +{entry.targetRise}%
                          </td>
                          <td className="p-2 text-stone-500 dark:text-stone-400">
                            {entry.approxHours}
                          </td>
                          <td className="p-2 font-sans text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                            {isSelected ? '✓ Selected' : 'Select'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                * Recipe assumption: 90% Bread Flour, 10% Whole Wheat, 75% Hydration, 20% Starter, 2% Salt. Retard 12-16 hrs at 37-39°F (3-4°C).
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Fermentation Vessel Visualizer & Dome Helper */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Visual Vessel Container Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Fermentation Vessel Simulator
                  </CardTitle>
                  <CardDescription>
                    Visual straight-sided Cambro / cylinder guide
                  </CardDescription>
                </div>
                <Badge variant="amber" className="font-mono text-xs">
                  {currentRisePercent}% rise achieved
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Container Graphic */}
              <div className="relative w-full max-w-[260px] mx-auto h-72 bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 rounded-b-2xl border-4 border-stone-300 dark:border-stone-700 border-t-0 p-2 flex flex-col justify-end shadow-inner overflow-hidden">
                
                {/* Milliliter tick marks on the container wall */}
                <div className="absolute left-2 top-4 bottom-4 w-8 flex flex-col justify-between text-[9px] font-mono text-stone-400 dark:text-stone-500 select-none border-r border-stone-300 dark:border-stone-700 pr-1">
                  <span>2000 mL</span>
                  <span>1500 mL</span>
                  <span>1000 mL</span>
                  <span>500 mL</span>
                  <span>0 mL</span>
                </div>

                {/* Target Cutoff Line */}
                {startingVolumeMl > 0 && targetCalc.rounded > 0 && (
                  <div
                    className="absolute left-10 right-2 border-b-2 border-dashed border-red-500 z-20 flex items-center justify-end pr-1 transition-all duration-300"
                    style={{
                      bottom: `${Math.min(95, Math.max(10, (targetCalc.rounded / 2000) * 100))}%`,
                    }}
                  >
                    <span className="text-[10px] font-mono font-bold bg-red-100 dark:bg-red-950/90 text-red-700 dark:text-red-300 border border-red-300/60 dark:border-red-800 px-1.5 py-0.5 rounded shadow-xs">
                      TARGET: {targetCalc.rounded} mL (+{currentGuide.targetRise}%)
                    </span>
                  </div>
                )}

                {/* Initial Starting Line */}
                {startingVolumeMl > 0 && (
                  <div
                    className="absolute left-10 right-2 border-b-2 border-emerald-500 z-10 flex items-center justify-end pr-1 transition-all duration-300"
                    style={{
                      bottom: `${Math.min(90, Math.max(8, (startingVolumeMl / 2000) * 100))}%`,
                    }}
                  >
                    <span className="text-[10px] font-mono font-medium bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800 px-1 py-0.5 rounded">
                      START: {startingVolumeMl} mL
                    </span>
                  </div>
                )}

                {/* Rising Dough Visual Block */}
                <div
                  className="w-full bg-gradient-to-t from-amber-200 via-amber-100 to-amber-50 dark:from-amber-600/50 dark:via-amber-500/40 dark:to-amber-400/30 rounded-b-xl border-t-2 border-amber-400/80 dark:border-amber-400 shadow-inner relative transition-all duration-300 flex items-center justify-center"
                  style={{
                    height: `${Math.min(95, Math.max(5, (effectiveCurrentVolume / 2000) * 100))}%`,
                  }}
                >
                  {/* Surface bubbles texture */}
                  <div className="absolute top-1 left-4 w-3 h-3 rounded-full bg-white/70 border border-amber-300" />
                  <div className="absolute top-2 right-6 w-2 h-2 rounded-full bg-white/70 border border-amber-300" />
                  <div className="absolute top-3 left-16 w-2.5 h-2.5 rounded-full bg-white/80 border border-amber-300" />
                  
                  {/* Dough Dome indicator */}
                  {isDomed && (
                    <div className="absolute -top-3 left-1/4 right-1/4 h-3 bg-amber-100 rounded-t-full border-t border-amber-300" />
                  )}

                  <div className="text-center px-2 py-1 bg-stone-900/80 backdrop-blur-sm rounded-lg text-white font-mono text-xs shadow-xs">
                    {effectiveCurrentVolume} mL
                    {isDomed && <span className="block text-[9px] text-amber-300">(Dome Avg)</span>}
                  </div>
                </div>
              </div>

              {/* Current Volume Interactive Slider */}
              {!isDomed ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-600 dark:text-stone-300 font-medium">Current Measured Volume:</span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setCurrentDoughVolume(Math.max(startingVolumeMl, currentDoughVolume - 25))}
                        aria-label="Decrease volume"
                        className="w-7 h-7 rounded-lg"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="font-mono font-black text-sm text-stone-900 dark:text-stone-100 min-w-[3.5rem] text-center">{currentDoughVolume} mL</span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setCurrentDoughVolume(Math.min(4000, currentDoughVolume + 25))}
                        aria-label="Increase volume"
                        className="w-7 h-7 rounded-lg"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Slider
                    min={startingVolumeMl}
                    max={Math.max(startingVolumeMl * 2.2, targetCalc.rounded + 200)}
                    step={25}
                    value={currentDoughVolume}
                    onValueChange={setCurrentDoughVolume}
                    aria-label="Current dough volume"
                  />
                </div>
              ) : null}

              {/* Target Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-stone-600 dark:text-stone-300">Progress to Bulk Cutoff:</span>
                  <span className="font-mono text-stone-900 dark:text-stone-100 font-bold">{progressToTarget}%</span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-3 overflow-hidden border border-stone-200 dark:border-stone-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      progressToTarget >= 100
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 animate-pulse'
                        : progressToTarget >= 80
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                        : 'bg-gradient-to-r from-stone-700 to-amber-600/80'
                    }`}
                    style={{ width: `${progressToTarget}%` }}
                  />
                </div>
                {progressToTarget >= 100 && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold text-center bg-emerald-50 dark:bg-emerald-950/60 p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    Target reached! Time to cut off bulk fermentation and shape.
                  </p>
                )}
              </div>

              {/* Toggle Dome Compensation Calculator */}
              <div className="border-t border-stone-200 dark:border-stone-800 pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-stone-800 dark:text-stone-200 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDomed}
                      onChange={(e) => setIsDomed(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-600 border-stone-300 dark:border-stone-700 cursor-pointer"
                    />
                    <span>Dough is Domed on Top (Step 4 FAQ)</span>
                  </label>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Split Low/High difference</span>
                </div>

                {isDomed && (
                  <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                    <p className="text-stone-600 dark:text-stone-300 text-[11px]">
                      When dough domes, split the difference between where it touches the wall and the top of the dome.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-stone-500 dark:text-stone-400 block text-[10px]">Low Point (Wall)</label>
                        <Input
                          type="number"
                          step={25}
                          value={domeLowPoint}
                          onChange={(e) => setDomeLowPoint(parseInt(e.target.value) || 0)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-stone-500 dark:text-stone-400 block text-[10px]">High Point (Dome Apex)</label>
                        <Input
                          type="number"
                          step={25}
                          value={domeHighPoint}
                          onChange={(e) => setDomeHighPoint(parseInt(e.target.value) || 0)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="text-right text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400">
                      Effective Volume: ({domeLowPoint} + {domeHighPoint}) / 2 = {effectiveCurrentVolume} mL
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Temperature Drift Advisor Card */}
          <Card className="bg-stone-50/80 dark:bg-stone-900/60">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between cursor-pointer touch-manipulation" onClick={() => setShowDriftAdvisor(!showDriftAdvisor)}>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    FAQ: What if my dough temperature drops?
                  </span>
                </div>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-amber-700 dark:text-amber-400">
                  {showDriftAdvisor ? 'Hide' : 'Calculate'}
                </Button>
              </div>

              {showDriftAdvisor && (
                <div className="space-y-3 pt-2 text-xs border-t border-stone-200 dark:border-stone-800">
                  <p className="text-stone-600 dark:text-stone-300 text-xs leading-relaxed">
                    If you mix with warm water at 80°F, but your kitchen is 70°F, dough temperature equalizes slowly toward room temperature.
                    <strong className="text-stone-900 dark:text-stone-100"> Always calibrate target rise based on your ENDING dough temperature.</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-stone-500 dark:text-stone-400 block text-[10px]">Initial Mixed Temp</label>
                      <Input
                        type="number"
                        value={mixedTempF}
                        onChange={(e) => setMixedTempF(parseInt(e.target.value) || 0)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-stone-500 dark:text-stone-400 block text-[10px]">Estimated Room Temp</label>
                      <Input
                        type="number"
                        value={roomTempF}
                        onChange={(e) => setRoomTempF(parseInt(e.target.value) || 0)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <Alert variant="amber">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-[11px] font-medium text-amber-950 dark:text-amber-300">
                      Advice: If ending dough reaches {roomTempF}°F, adjust your target rise from {getGuideForTemperature(mixedTempF).targetRise}% up to {getGuideForTemperature(roomTempF).targetRise}%.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mobile Only: Quick Temperature Reference Table Accordion */}
          <Card className="block lg:hidden overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMobileReferenceTable(!showMobileReferenceTable)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-stone-50 dark:hover:bg-stone-800/50 active:bg-stone-50 dark:active:bg-stone-800/50 transition-colors touch-manipulation cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  TSJ 2024 Reference Table (16 Temperatures)
                </span>
              </div>
              {showMobileReferenceTable ? (
                <ChevronUp className="w-4 h-4 text-stone-500 dark:text-stone-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-500 dark:text-stone-400" />
              )}
            </button>

            {showMobileReferenceTable && (
              <CardContent className="pt-0 space-y-3 border-t border-stone-100 dark:border-stone-800">
                <div className="overflow-x-auto max-h-56 overflow-y-auto border border-stone-200 dark:border-stone-800 rounded-xl mt-3">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 sticky top-0 font-medium">
                      <tr>
                        <th className="p-2.5">Temp</th>
                        <th className="p-2.5">Target % Rise</th>
                        <th className="p-2.5">Window</th>
                        <th className="p-2.5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono">
                      {DOUGH_TEMP_GUIDE.map((entry) => {
                        const isSelected = Math.round(doughTempF) === entry.tempF;
                        return (
                          <tr
                            key={entry.tempF}
                            onClick={() => setDoughTempF(entry.tempF)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-amber-100/80 dark:bg-amber-950/70 font-bold text-amber-900 dark:text-amber-300'
                                : 'hover:bg-stone-50 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            <td className="p-2">
                              {entry.tempF}°F / {entry.tempC}°C
                            </td>
                            <td className="p-2 text-amber-700 dark:text-amber-400 font-bold">
                              +{entry.targetRise}%
                            </td>
                            <td className="p-2 text-stone-500 dark:text-stone-400 text-[11px]">
                              {entry.approxHours}
                            </td>
                            <td className="p-2 font-sans text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                              {isSelected ? '✓' : 'Set'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                  * Recipe assumption: 90% Bread Flour, 10% Whole Wheat, 75% Hydration, 20% Starter, 2% Salt.
                </p>
              </CardContent>
            )}
          </Card>

        </div>
      </div>
      )}
    </div>
  );
}
