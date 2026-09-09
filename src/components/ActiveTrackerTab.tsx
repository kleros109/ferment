import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Snowflake,
  Save,
  Plus,
  Minus,
  ChevronLeft,
  ChevronDown,
  Check,
  Flame,
  Scale,
  Thermometer
} from 'lucide-react';
import { BakeSession, BulkFoldRound, TempUnit } from '../types';
import {
  fahrenheitToCelsius,
  getGuideForTemperature,
  calculateTargetVolume,
  calculateDomeVolume,
} from '../utils/fermentCalculations';
import { CRUMB_DIAGNOSIS_DATA } from '../data/sourdoughData';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

interface ActiveTrackerTabProps {
  session: BakeSession;
  setSession: Dispatch<SetStateAction<BakeSession>>;
  tempUnit: TempUnit;
  onSaveToLog: (session: BakeSession) => void;
  onOpenBulkOMatic: () => void;
}

export function ActiveTrackerTab({
  session,
  setSession,
  tempUnit,
  onSaveToLog,
  onOpenBulkOMatic,
}: ActiveTrackerTabProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Fold timer
  const [timerSeconds, setTimerSeconds] = useState<number>(1800); // 30 min default
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerType, setTimerType] = useState<string>('Next Stretch & Fold');

  // Input states for active step adjustments
  const [roundType, setRoundType] = useState<'Stretch and Fold' | 'Coil Fold'>('Stretch and Fold');
  const [roundTempF, setRoundTempF] = useState<number>(session.endingDoughTemp || 75);
  const [roundNote, setRoundNote] = useState<string>('');

  // Step 4 Volume check state
  const [currentCheckVolume, setCurrentCheckVolume] = useState<number>(
    session.actualEndingVolumeMl || session.startingVolumeMl
  );
  const [domeLow, setDomeLow] = useState<number>(session.domeLowPointMl || 1000);
  const [domeHigh, setDomeHigh] = useState<number>(session.domeHighPointMl || 1200);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimerWithMinutes = (mins: number, label: string) => {
    setTimerSeconds(mins * 60);
    setTimerType(label);
    setTimerRunning(true);
  };

  // Add a fold round to session
  const handleAddFoldRound = () => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newRound: BulkFoldRound = {
      id: Date.now().toString(),
      roundNumber: session.handlingRounds.length + 1,
      time: nowStr,
      type: roundType,
      doughTemp: roundTempF,
      notes: roundNote.trim() || undefined,
    };
    setSession((prev) => ({
      ...prev,
      handlingRounds: [...prev.handlingRounds, newRound],
      endingDoughTemp: roundTempF,
    }));
    setRoundNote('');
    // Start standard 30 min timer for next fold
    startTimerWithMinutes(30, `Round ${newRound.roundNumber + 1} Fold`);
  };

  // Update target rise based on measured temperature
  const handleUpdateDoughTemp = (newTempF: number) => {
    const guide = getGuideForTemperature(newTempF);
    const targetCalc = calculateTargetVolume(session.startingVolumeMl, guide.targetRise, 50);
    setSession((prev) => ({
      ...prev,
      endingDoughTemp: newTempF,
      targetRisePercent: guide.targetRise,
      targetVolumeMl: targetCalc.rounded,
    }));
  };

  const stepsList = [
    { num: 1, title: 'Mix & Starting Volume', desc: 'Combine ingredients & mark initial line' },
    { num: 2, title: 'Fold Handling Rounds', desc: 'Stretch & Folds, Coil Folds, and timing' },
    { num: 3, title: 'Dough Temp & Target Rise', desc: 'Two-factor lookup and vessel cutoff mark' },
    { num: 4, title: 'Monitor Volume & Rise', desc: 'Check expansion, dome compensation' },
    { num: 5, title: 'Divide & Preshape', desc: 'Cutoff bulk fermentation, 30m bench rest' },
    { num: 6, title: 'Final Shape & Cold Retard', desc: '8–16 hours in fridge at ~39°F (4°C)' },
    { num: 7, title: 'Scoring & Baking', desc: '500°F preheat, 450°F lid on/off' },
    { num: 8, title: 'Crumb Assessment', desc: 'Inspect fool\'s crumb vs open crumb' },
    { num: 9, title: 'Calibration for Next Bake', desc: 'Adjust target % rise by ±10%' },
  ];

  const renderTimerCard = () => (
    <Card className="border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Active Interval Timer
          </span>
          <Badge variant="outline" className="text-[11px] font-mono text-stone-500 dark:text-stone-400 max-w-[150px] truncate">
            {timerType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
        <div className="py-2.5 sm:py-3 text-center bg-amber-50/70 dark:bg-stone-950 rounded-xl text-amber-900 dark:text-amber-400 font-mono text-3xl sm:text-4xl font-extrabold tracking-widest shadow-inner border border-amber-200/80 dark:border-stone-800">
          {formatTimer(timerSeconds)}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => setTimerRunning(!timerRunning)}
            variant={timerRunning ? 'destructive' : 'emerald'}
            className="flex-1 text-xs sm:text-sm font-bold shadow-sm"
          >
            {timerRunning ? <Pause className="w-4 h-4 mr-1.5" /> : <Play className="w-4 h-4 mr-1.5" />}
            {timerRunning ? 'Pause Timer' : 'Start Timer'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              setTimerRunning(false);
              setTimerSeconds(1800);
            }}
            className="shrink-0 text-stone-600 dark:text-stone-300"
            title="Reset to 30 min"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => startTimerWithMinutes(30, 'Stretch & Fold (30m)')}
            className="text-[11px] font-mono px-1 h-8"
          >
            30m Fold
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => startTimerWithMinutes(25, 'Bench Rest (25m)')}
            className="text-[11px] font-mono px-1 h-8"
          >
            25m Rest
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => startTimerWithMinutes(20, 'Bake Steam (20m)')}
            className="text-[11px] font-mono px-1 h-8"
          >
            20m Steam
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Active Session Header Banner */}
      <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl p-5 sm:p-6 border border-stone-200/90 dark:border-stone-800 shadow-sm dark:shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <div className="mb-2">
              <Badge variant="emerald" pulseDot={true}>
                Live Baking Session
              </Badge>
            </div>
            <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
              {session.title || 'Sourdough Country Loaf'}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Started {session.date} at {session.mixTime} • {session.totalFlourWeight}g flour • {session.calculatedHydration}% Hydration
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-3 divide-x divide-stone-200 dark:divide-stone-700/80 bg-stone-50 dark:bg-stone-800/80 p-2 sm:p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-700/60 font-mono text-center text-xs">
            <div className="px-2">
              <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-tight">Dough Temp</div>
              <div className="text-amber-700 dark:text-amber-400 font-bold text-sm sm:text-base">
                {tempUnit === 'F' ? `${session.endingDoughTemp}°F` : `${fahrenheitToCelsius(session.endingDoughTemp)}°C`}
              </div>
            </div>
            <div className="px-2">
              <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-tight">Target Rise</div>
              <div className="text-amber-700 dark:text-amber-400 font-bold text-sm sm:text-base">+{session.targetRisePercent}%</div>
            </div>
            <div className="px-2">
              <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-tight">Target Cutoff</div>
              <div className="text-emerald-700 dark:text-emerald-400 font-bold text-sm sm:text-base">{session.targetVolumeMl} mL</div>
            </div>
          </div>
        </div>

        {/* Mobile Step Navigator */}
        <div className="md:hidden space-y-2 pt-1">
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentStep <= 1}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="text-xs font-semibold"
              aria-label="Previous Step"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Prev
            </Button>
            <div className="relative flex-1">
              <select
                value={currentStep}
                onChange={(e) => setCurrentStep(Number(e.target.value))}
                className="w-full appearance-none bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-amber-300 font-bold text-xs py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-700 text-center pr-7 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 min-h-[38px]"
              >
                {stepsList.map((st) => (
                  <option key={st.num} value={st.num} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                    Step {st.num}: {st.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 w-3.5 h-3.5" />
            </div>
            <Button
              type="button"
              variant="amber"
              size="sm"
              disabled={currentStep >= 9}
              onClick={() => setCurrentStep((prev) => Math.min(9, prev + 1))}
              className="text-xs font-bold"
              aria-label="Next Step"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
          {/* Visual Step Progress Bar */}
          <Progress value={(currentStep / 9) * 100} className="h-1.5 bg-stone-100 dark:bg-stone-800" indicatorClassName="bg-gradient-to-r from-amber-500 to-emerald-400" />
        </div>

        {/* Desktop 9-Step Horizontal Progress Ribbon */}
        <div className="hidden md:block overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center min-w-max gap-1">
            {stepsList.map((st) => {
              const isCurrent = currentStep === st.num;
              const isPast = currentStep > st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => setCurrentStep(st.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs ring-1 ring-amber-400'
                      : isPast
                      ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                      : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono ${
                      isCurrent ? 'bg-stone-950 text-amber-400' : isPast ? 'bg-emerald-600 text-white' : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {isPast ? '✓' : st.num}
                  </span>
                  <span>{st.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Interval Timer */}
      <div className="block lg:hidden">
        {renderTimerCard()}
      </div>

      {/* Main Interactive Stage for Current Step */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Step Details & Interactive Controls */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: MIX & STARTING VOLUME */}
          {currentStep === 1 && (
            <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold font-mono text-lg">
                    1
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-stone-900 dark:text-white">
                      Step 1: Mix Ingredients & Measure Starting Volume
                    </CardTitle>
                    <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
                      Follow your recipe. Transfer mixed dough into your transparent measuring container and level it.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div>
                    <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                      Mix Started Time:
                    </label>
                    <Input
                      type="time"
                      value={session.mixTime}
                      onChange={(e) => setSession((prev) => ({ ...prev, mixTime: e.target.value }))}
                      className="font-mono text-sm bg-white dark:bg-stone-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                      Marked Starting Volume (mL):
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const val = Math.max(100, session.startingVolumeMl - 25);
                          const targetCalc = calculateTargetVolume(val, session.targetRisePercent, 50);
                          setSession((prev) => ({
                            ...prev,
                            startingVolumeMl: val,
                            targetVolumeMl: targetCalc.rounded,
                          }));
                        }}
                        className="w-10 h-10 shrink-0"
                        aria-label="Decrease starting volume"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          value={session.startingVolumeMl}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const targetCalc = calculateTargetVolume(val, session.targetRisePercent, 50);
                            setSession((prev) => ({
                              ...prev,
                              startingVolumeMl: val,
                              targetVolumeMl: targetCalc.rounded,
                            }));
                          }}
                          className="text-center font-mono font-bold text-base pr-8 bg-white dark:bg-stone-900"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-mono pointer-events-none">
                          mL
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const val = session.startingVolumeMl + 25;
                          const targetCalc = calculateTargetVolume(val, session.targetRisePercent, 50);
                          setSession((prev) => ({
                            ...prev,
                            startingVolumeMl: val,
                            targetVolumeMl: targetCalc.rounded,
                          }));
                        }}
                        className="w-10 h-10 shrink-0"
                        aria-label="Increase starting volume"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert variant="amber">
                  <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <AlertTitle className="text-amber-900 dark:text-amber-200">Tom's Pro Tip: The Shorthand Method</AlertTitle>
                  <AlertDescription className="text-amber-800 dark:text-amber-300">
                    High-protein flour at 75% hydration mixes to approximately <strong>1.5× the dry flour weight</strong> in milliliters. (e.g. 500g flour = ~750 mL). Once measured accurately, it remains consistent for that recipe!
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => setCurrentStep(2)}
                    className="gap-2"
                  >
                    Proceed to Step 2: Bulk Handling
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: BULK FERMENTATION HANDLING (FOLDS) */}
          {currentStep === 2 && (
            <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold font-mono text-lg">
                    2
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-stone-900 dark:text-white">
                      Step 2: Dough Handling (Stretch & Folds, Coil Folds)
                    </CardTitle>
                    <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
                      Log fold rounds spaced 30 minutes apart. Take dough temperature on your final round.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-5">
                {/* Logged Fold Rounds Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                      Completed Fold Rounds ({session.handlingRounds.length})
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      Typical: 3–5 rounds
                    </Badge>
                  </div>

                  {session.handlingRounds.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl text-stone-400 dark:text-stone-500 text-xs">
                      No fold rounds recorded yet. Use the logger below to log Round 1.
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden text-xs">
                      {session.handlingRounds.map((rd) => (
                        <div key={rd.id} className="p-3 flex items-center justify-between bg-stone-50/50 dark:bg-stone-800/40 hover:bg-stone-50 dark:hover:bg-stone-800/60">
                          <div className="flex items-center gap-3">
                            <Badge variant="amber" className="w-6 h-6 p-0 rounded-full flex items-center justify-center font-mono">
                              {rd.roundNumber}
                            </Badge>
                            <div>
                              <div className="font-semibold text-stone-900 dark:text-stone-100">{rd.type}</div>
                              {rd.notes && <div className="text-stone-500 dark:text-stone-400 text-[11px]">{rd.notes}</div>}
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-stone-800 dark:text-stone-200 font-medium">{rd.time}</div>
                            {rd.doughTemp && (
                              <div className="text-stone-500 dark:text-stone-400 text-[11px]">
                                {tempUnit === 'F' ? `${rd.doughTemp}°F` : `${fahrenheitToCelsius(rd.doughTemp)}°C`}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Fold Round Form */}
                <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-3">
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    Log Fold Round #{session.handlingRounds.length + 1}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-1">Technique</label>
                      <select
                        value={roundType}
                        onChange={(e) => setRoundType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 border border-stone-300 dark:border-stone-700 rounded-lg text-xs bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      >
                        <option value="Stretch and Fold">Stretch and Fold</option>
                        <option value="Coil Fold">Coil Fold</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-1">
                        Probe Temp ({tempUnit === 'F' ? '°F' : '°C'})
                      </label>
                      <Input
                        type="number"
                        step={tempUnit === 'F' ? 1 : 0.5}
                        value={tempUnit === 'F' ? roundTempF : fahrenheitToCelsius(roundTempF)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setRoundTempF(tempUnit === 'F' ? val : Math.round(val * 1.8 + 32));
                        }}
                        className="text-xs font-mono h-8 bg-white dark:bg-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-1">Optional Notes</label>
                      <Input
                        type="text"
                        placeholder="e.g. good tension, extensible"
                        value={roundNote}
                        onChange={(e) => setRoundNote(e.target.value)}
                        className="text-xs h-8 bg-white dark:bg-stone-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      type="button"
                      variant="amber"
                      size="sm"
                      onClick={handleAddFoldRound}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      Record Round & Start 30m Timer
                    </Button>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">Autostarts 30m rest</span>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                  >
                    ← Back to Step 1
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => setCurrentStep(3)}
                    className="gap-2"
                  >
                    Done with Folds: Step 3 (Set Cutoff)
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: DOUGH TEMPERATURE & SET TARGET % RISE */}
          {currentStep === 3 && (
            <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold font-mono text-lg">
                    3
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-stone-900 dark:text-white">
                      Step 3: Measure Final Dough Temperature & Set Target
                    </CardTitle>
                    <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
                      Immediately after your last fold, insert probe thermometer into dough center.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-5">
                <div className="p-5 bg-gradient-to-br from-amber-50 to-stone-50 dark:from-amber-950/20 dark:to-stone-800/40 rounded-2xl border border-amber-200/80 dark:border-amber-800/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase">
                      Center Dough Probe Temperature:
                    </span>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateDoughTemp(Math.max(60, session.endingDoughTemp - 1))}
                        className="w-10 h-10 shrink-0"
                        aria-label="Decrease dough temperature"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center justify-center bg-white dark:bg-stone-900 px-3.5 py-1.5 border border-stone-300 dark:border-stone-700 rounded-xl shadow-sm min-w-[120px]">
                        <span className="font-mono font-black text-2xl text-amber-800 dark:text-amber-400">
                          {tempUnit === 'F' ? session.endingDoughTemp : fahrenheitToCelsius(session.endingDoughTemp)}
                        </span>
                        <span className="text-sm font-bold text-stone-600 dark:text-stone-300 ml-1">°{tempUnit}</span>
                        <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono ml-1.5">
                          ({tempUnit === 'F' ? `${fahrenheitToCelsius(session.endingDoughTemp)}°C` : `${session.endingDoughTemp}°F`})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateDoughTemp(Math.min(86, session.endingDoughTemp + 1))}
                        className="w-10 h-10 shrink-0"
                        aria-label="Increase dough temperature"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 bg-white dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 uppercase">Table Target Rise</div>
                      <div className="font-mono text-3xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                        +{session.targetRisePercent}%
                      </div>
                    </div>
                    <div className="p-3.5 bg-white dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 uppercase">Vessel Cutoff Mark</div>
                      <div className="font-mono text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {session.targetVolumeMl} mL
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-stone-600 dark:text-stone-300 bg-white/80 dark:bg-stone-800/80 p-3 rounded-xl border border-stone-200 dark:border-stone-700 leading-relaxed">
                    <strong>Tom Cucuzza's Rule: </strong>
                    Mark your container with tape or dry-erase marker at exactly{' '}
                    <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{session.targetVolumeMl} mL</strong>.
                    Now put the lid on and ignore the clock. Let the yeast do the work!
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                  >
                    ← Back to Step 2
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => setCurrentStep(4)}
                    className="gap-2"
                  >
                    Step 4: Monitor Rise & Volume
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 4: MONITOR THE RISE AND DOUGH TEMPERATURE */}
          {currentStep === 4 && (
            <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold font-mono text-lg">
                    4
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-stone-900 dark:text-white">
                      Step 4: Monitor the Rise & Watch the Dough
                    </CardTitle>
                    <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
                      Ignore the clock! When dough reaches target volume, bulk fermentation is complete.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-5">
                {/* Live Volume Checker & Dome Midpoint Calculator */}
                <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      Live Volume Check ({session.startingVolumeMl} mL → Target: {session.targetVolumeMl} mL)
                    </span>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={onOpenBulkOMatic}
                      className="text-amber-700 dark:text-amber-400 p-0 h-auto font-semibold gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Open 9-Criteria Bulk-O-Matic
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-1">
                        Low Point (where dough touches container wall):
                      </label>
                      <Input
                        type="number"
                        value={domeLow}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setDomeLow(val);
                          const avg = calculateDomeVolume(val, domeHigh);
                          setCurrentCheckVolume(avg);
                        }}
                        className="font-mono text-sm bg-white dark:bg-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-1">
                        High Point (center dome apex):
                      </label>
                      <Input
                        type="number"
                        value={domeHigh}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setDomeHigh(val);
                          const avg = calculateDomeVolume(domeLow, val);
                          setCurrentCheckVolume(avg);
                        }}
                        className="font-mono text-sm bg-white dark:bg-stone-900"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-700 dark:text-stone-300">Calculated Midpoint Volume:</span>
                    <span className="font-bold text-base text-stone-900 dark:text-stone-100">{currentCheckVolume} mL</span>
                  </div>

                  {/* Progress bar to cutoff */}
                  {session.targetVolumeMl > session.startingVolumeMl && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-400">
                        <span>Target: {session.targetVolumeMl} mL</span>
                        <span>
                          {Math.min(100, Math.round(((currentCheckVolume - session.startingVolumeMl) / (session.targetVolumeMl - session.startingVolumeMl)) * 100))}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(100, Math.max(0, ((currentCheckVolume - session.startingVolumeMl) / (session.targetVolumeMl - session.startingVolumeMl)) * 100))}
                        className="h-2.5 bg-stone-200 dark:bg-stone-700"
                        indicatorClassName="bg-amber-600"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                  >
                    ← Back to Step 3
                  </Button>
                  <Button
                    type="button"
                    variant="emerald"
                    onClick={() => {
                      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      setSession((prev) => ({
                        ...prev,
                        actualEndingVolumeMl: currentCheckVolume,
                        bulkEndTime: now,
                      }));
                      setCurrentStep(5);
                    }}
                    className="gap-2 shadow-sm font-semibold"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Target Hit! Proceed to Step 5: Shape
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 5: DIVIDE & PRESHAPE */}
          {currentStep === 5 && (
            <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold font-mono text-lg">
                    5
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-stone-900 dark:text-white">
                      Step 5: Cut Off Bulk Fermentation & Shape
                    </CardTitle>
                    <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
                      Bulk ended at {session.bulkEndTime || 'now'}. Preshape, rest 25–30 min on bench, then final shape.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-5">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="font-semibold text-amber-900 dark:text-amber-300">Preshape & Bench Rest Checklist:</div>
                  <ul className="list-disc list-inside space-y-1 text-stone-700 dark:text-stone-300">
                    <li>Gently tip dough onto lightly floured work surface without deflating</li>
                    <li>Round lightly into loose boule / round</li>
                    <li>Let rest uncovered on countertop for 25–30 minutes</li>
                    <li>Perform final shaping (Batard or Boule) and place into floured banneton</li>
                  </ul>
                </div>

                {/* Bench rest quick timer button */}
                <div className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
                  <span className="text-xs text-stone-700 dark:text-stone-300 font-medium">30-Minute Bench Rest Timer:</span>
                  <Button
                    type="button"
                    variant="amber"
                    size="sm"
                    onClick={() => startTimerWithMinutes(30, 'Bench Rest')}
                    className="font-semibold"
                  >
                    Start 30m Timer
                  </Button>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(4)}
                  >
                    ← Back to Step 4
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => setCurrentStep(6)}
                    className="gap-2"
                  >
                    Proceed to Step 6: Cold Retard
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 6: FINAL PROOF / COLD RETARD */}
          {currentStep === 6 && (
            <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 font-bold font-mono text-lg">
                    6
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-stone-900 dark:text-white">
                      Step 6: Final Proof / Cold Retard (8–16 Hours)
                    </CardTitle>
                    <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
                      Cover banneton with bag or shower cap and place in refrigerator (37–39°F / 3–4°C).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-5">
                <div className="p-4 bg-sky-50 dark:bg-sky-950/30 rounded-xl border border-sky-200 dark:border-sky-800/40 text-xs text-sky-950 dark:text-sky-200 space-y-2 leading-relaxed">
                  <div className="font-semibold flex items-center gap-1.5 text-sky-900 dark:text-sky-300">
                    <Snowflake className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                    Why 8–16 Hours? The Cooling Curve Secret
                  </div>
                  <p className="text-stone-700 dark:text-stone-300">
                    Tom Cucuzza’s thermal experiments show that warm shaped dough takes <strong>8 to 10 hours</strong> to fully cool down to 39°F (4°C) inside the refrigerator.
                  </p>
                  <p className="text-stone-700 dark:text-stone-300">
                    Once the dough core reaches 39°F, yeast fermentation virtually stops! Therefore, leaving dough for 10 hours vs 14 hours has almost identical proofing levels.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
                    <label className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1">Target Retard Duration</label>
                    <Input
                      type="number"
                      value={session.coldRetardHours || 14}
                      onChange={(e) => setSession((prev) => ({ ...prev, coldRetardHours: parseInt(e.target.value) || 12 }))}
                      className="font-mono text-sm h-8 bg-white dark:bg-stone-900"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">hours (typically 12–16)</span>
                  </div>

                  <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
                    <label className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1">Target Fridge Temp</label>
                    <Input
                      type="number"
                      step={tempUnit === 'F' ? 1 : 0.5}
                      value={tempUnit === 'F' ? (session.fridgeTempF || 39) : fahrenheitToCelsius(session.fridgeTempF || 39)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 4;
                        setSession((prev) => ({ ...prev, fridgeTempF: tempUnit === 'F' ? Math.round(val) : Math.round(val * 1.8 + 32) }));
                      }}
                      className="font-mono text-sm h-8 bg-white dark:bg-stone-900"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">{tempUnit === 'F' ? '°F (~4°C)' : '°C (~39°F)'}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(5)}
                  >
                    ← Back to Step 5
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => setCurrentStep(7)}
                    className="gap-2"
                  >
                    Ready to Bake: Step 7
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 7: SCORING & BAKING */}
          {currentStep === 7 && (
            <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 font-bold font-mono text-lg">
                    7
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-stone-900 dark:text-white">
                      Step 7: Scoring and Baking in Dutch Oven
                    </CardTitle>
                    <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
                      Bake cold straight from the fridge — do NOT bring dough to room temperature!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 uppercase">Preheat Temp</div>
                    <div className="font-mono text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">500°F / 260°C</div>
                    <div className="text-[10px] text-stone-400 mt-1">Preheat Dutch oven 30-45m</div>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/50 text-center">
                    <div className="text-[11px] text-amber-800 dark:text-amber-300 uppercase">Lid On (Steam)</div>
                    <div className="font-mono text-xl font-bold text-amber-900 dark:text-amber-200 mt-1">450°F • 20 Min</div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">Maximum oven spring & ear</div>
                  </div>

                  <div className="p-3 bg-amber-100/50 dark:bg-amber-900/30 rounded-xl border border-amber-300 dark:border-amber-800 text-center">
                    <div className="text-[11px] text-amber-900 dark:text-amber-300 uppercase">Lid Off (Crust)</div>
                    <div className="font-mono text-xl font-bold text-amber-950 dark:text-amber-100 mt-1">450°F • 20 Min</div>
                    <div className="text-[10px] text-amber-800 dark:text-amber-400 mt-1">Deep mahogany color & blisters</div>
                  </div>
                </div>

                <div className="p-3 bg-stone-100 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300">
                  <span className="font-semibold text-stone-900 dark:text-stone-100">Baking Timers: </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => startTimerWithMinutes(20, 'Bake: Lid On (Steam)')}
                      className="text-xs font-semibold"
                    >
                      Start 20m Lid On
                    </Button>
                    <Button
                      type="button"
                      variant="amber"
                      onClick={() => startTimerWithMinutes(20, 'Bake: Lid Off (Crust)')}
                      className="text-xs font-semibold"
                    >
                      Start 20m Lid Off
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => startTimerWithMinutes(90, 'Cooling Time (Do Not Slice)')}
                      className="text-xs font-semibold"
                    >
                      Start 90m Cool Down
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(6)}
                  >
                    ← Back to Step 6
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => setCurrentStep(8)}
                    className="gap-2"
                  >
                    Loaf Cooled: Step 8 Crumb Diagnosis
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 8: CRUMB ASSESSMENT */}
          {currentStep === 8 && (
            <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold font-mono text-lg">
                    8
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-stone-900 dark:text-white">
                      Step 8: Assess the Sliced Crumb
                    </CardTitle>
                    <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
                      Once loaf has cooled 90 minutes, slice through center and compare to diagnosis cards.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-5">
                {/* Diagnosis Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CRUMB_DIAGNOSIS_DATA.map((diag) => {
                    const isSelected = session.crumbOutcome === diag.status;
                    return (
                      <div
                        key={diag.status}
                        onClick={() => setSession((prev) => ({ ...prev, crumbOutcome: diag.status as any }))}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? diag.status === 'perfect'
                              ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-md ring-1 ring-emerald-500'
                              : diag.status === 'underproofed'
                              ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40 shadow-md ring-1 ring-amber-500'
                              : 'border-rose-600 bg-rose-50/70 dark:bg-rose-950/40 shadow-md ring-1 ring-rose-500'
                            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{diag.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 mb-2 leading-tight">{diag.rootCause}</p>
                        <div className="text-[11px] font-semibold text-stone-800 dark:text-stone-200">
                          Remedy: {diag.remedy}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Crumb & Flavor Tasting Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={session.crumbNotes || ''}
                    onChange={(e) => setSession((prev) => ({ ...prev, crumbNotes: e.target.value }))}
                    placeholder="Note bubble size, softness, ear height, crust blister texture, sourness..."
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 focus:bg-white dark:focus:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(7)}
                  >
                    ← Back to Step 7
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => setCurrentStep(9)}
                    className="gap-2"
                  >
                    Proceed to Step 9: Calibration
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 9: CALIBRATION */}
          {currentStep === 9 && (
            <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold font-mono text-lg">
                    9
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-stone-900 dark:text-white">
                      Step 9: Calibration for Your Next Bake
                    </CardTitle>
                    <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
                      The Two-Factor calibration rule: Repeat identical conditions, adjust only the % rise!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-5">
                <div className="p-5 bg-gradient-to-br from-amber-50/60 via-stone-50 to-amber-100/30 dark:from-stone-900 dark:to-stone-800 text-stone-900 dark:text-stone-100 rounded-2xl border border-amber-200/80 dark:border-stone-700 space-y-4 shadow-sm dark:shadow-lg">
                  <div className="text-xs font-mono text-amber-800 dark:text-amber-400 uppercase tracking-wide">
                    Recommended Calibration for Next Bake
                  </div>

                  {session.crumbOutcome === 'underproofed' && (
                    <div className="space-y-2">
                      <div className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
                        Target Rise: {session.targetRisePercent}% → {session.targetRisePercent + 10}% (+10%)
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300">
                        Because this loaf was slightly underproofed, increase target rise by 10% next time at {tempUnit === 'F' ? `${session.endingDoughTemp}°F` : `${fahrenheitToCelsius(session.endingDoughTemp)}°C`}. Keep all flour, water, and starter amounts identical!
                      </p>
                    </div>
                  )}

                  {session.crumbOutcome === 'overproofed' && (
                    <div className="space-y-2">
                      <div className="text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">
                        Target Rise: {session.targetRisePercent}% → {Math.max(20, session.targetRisePercent - 10)}% (-10%)
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300">
                        Because this loaf was slightly overproofed, decrease target rise by 10% next time at {tempUnit === 'F' ? `${session.endingDoughTemp}°F` : `${fahrenheitToCelsius(session.endingDoughTemp)}°C`}, and verify your refrigerator reaches 39°F (4°C).
                      </p>
                    </div>
                  )}

                  {session.crumbOutcome === 'perfect' && (
                    <div className="space-y-2">
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                        Target Rise: {session.targetRisePercent}% (Locked In!)
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300">
                        Congratulations! You have found your fermentation sweet spot for this recipe and temperature. Once locked in, it never changes.
                      </p>
                    </div>
                  )}

                  {!session.crumbOutcome && (
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Select a crumb outcome in Step 8 to receive automatic calibration advice.
                    </p>
                  )}
                </div>

                {/* Complete & Save to Log */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(8)}
                  >
                    ← Back to Step 8
                  </Button>
                  <Button
                    type="button"
                    variant="emerald"
                    onClick={() => {
                      const completed = { ...session, status: 'completed' as const };
                      setSession(completed);
                      onSaveToLog(completed);
                    }}
                    className="gap-2 shadow-md font-bold text-sm px-6 py-3 h-auto"
                  >
                    <Save className="w-4 h-4" />
                    Save Bake to Baker's Notebook
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Column: Live Step Companion & Timers (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 space-y-5">
          {renderTimerCard()}

          {/* Sourdough Journey Two-Factor Quick Reference Card */}
          <Card className="bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/40 shadow-none">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="font-serif font-bold text-sm text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                The Sourdough Journey Secret
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs text-amber-950 dark:text-amber-200">
              <p className="leading-relaxed text-stone-700 dark:text-stone-300">
                "Total fermentation equals bulk fermentation PLUS cold retard fermentation. Warm dough ferments quickly in bulk and keeps fermenting for 8-10 hours in the fridge. That is why warm dough needs to be cut off earlier (30-40% rise) than cool dough (75-100% rise)."
              </p>
              <div className="font-semibold text-stone-800 dark:text-stone-400 text-[11px] border-t border-amber-200 dark:border-amber-800/40 pt-2">
                — Tom Cucuzza, The Sourdough Journey (2024)
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
