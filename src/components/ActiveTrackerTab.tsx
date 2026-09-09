import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Thermometer,
  Layers,
  ChevronRight,
  Sparkles,
  Flame,
  Snowflake,
  Scissors,
  Save,
  Plus,
  Minus,
  ChevronLeft,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { BakeSession, BulkFoldRound, TempUnit } from '../types';
import {
  fahrenheitToCelsius,
  getGuideForTemperature,
  calculateTargetVolume,
  calculateDomeVolume,
} from '../utils/fermentCalculations';
import { CRUMB_DIAGNOSIS_DATA } from '../data/sourdoughData';

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
      // Play a subtle sound or flash
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
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-600" />
          Active Interval Timer
        </span>
        <span className="text-[11px] text-stone-500 font-mono truncate max-w-[150px]">{timerType}</span>
      </div>

      <div className="py-2.5 sm:py-3 text-center bg-stone-900 rounded-xl text-white font-mono text-3xl sm:text-4xl font-extrabold tracking-widest shadow-inner">
        {formatTimer(timerSeconds)}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTimerRunning(!timerRunning)}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm ${
            timerRunning
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {timerRunning ? 'Pause Timer' : 'Start Timer'}
        </button>
        <button
          type="button"
          onClick={() => {
            setTimerRunning(false);
            setTimerSeconds(1800);
          }}
          className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs active:scale-95 transition-all"
          title="Reset to 30 min"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => startTimerWithMinutes(30, 'Stretch & Fold (30m)')}
          className="py-2 px-1 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 text-[11px] text-center border border-stone-200 font-mono active:scale-95 transition-all"
        >
          30m Fold
        </button>
        <button
          type="button"
          onClick={() => startTimerWithMinutes(25, 'Bench Rest (25m)')}
          className="py-2 px-1 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 text-[11px] text-center border border-stone-200 font-mono active:scale-95 transition-all"
        >
          25m Rest
        </button>
        <button
          type="button"
          onClick={() => startTimerWithMinutes(20, 'Bake Steam (20m)')}
          className="py-2 px-1 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 text-[11px] text-center border border-stone-200 font-mono active:scale-95 transition-all"
        >
          20m Bake
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Active Session Header Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono mb-1 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Baking Session
            </div>
            <h1 className="font-serif text-2xl font-bold text-white">
              {session.title || 'Sourdough Country Loaf'}
            </h1>
            <p className="text-xs text-stone-400">
              Started {session.date} at {session.mixTime} • {session.totalFlourWeight}g flour • {session.calculatedHydration}% Hydration
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-3 divide-x divide-stone-700/80 bg-stone-800/80 p-2 sm:p-2.5 rounded-xl border border-stone-700/60 font-mono text-center text-xs">
            <div className="px-2">
              <div className="text-[10px] text-stone-400 uppercase tracking-tight">Dough Temp</div>
              <div className="text-amber-400 font-bold text-sm sm:text-base">
                {tempUnit === 'F' ? `${session.endingDoughTemp}°F` : `${fahrenheitToCelsius(session.endingDoughTemp)}°C`}
              </div>
            </div>
            <div className="px-2">
              <div className="text-[10px] text-stone-400 uppercase tracking-tight">Target Rise</div>
              <div className="text-amber-400 font-bold text-sm sm:text-base">+{session.targetRisePercent}%</div>
            </div>
            <div className="px-2">
              <div className="text-[10px] text-stone-400 uppercase tracking-tight">Target Cutoff</div>
              <div className="text-emerald-400 font-bold text-sm sm:text-base">{session.targetVolumeMl} mL</div>
            </div>
          </div>
        </div>

        {/* Mobile Step Navigator */}
        <div className="md:hidden space-y-2 pt-1">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={currentStep <= 1}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold text-stone-300 active:scale-95 transition-all flex items-center gap-1 shrink-0 min-h-[40px]"
              aria-label="Previous Step"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <div className="relative flex-1">
              <select
                value={currentStep}
                onChange={(e) => setCurrentStep(Number(e.target.value))}
                className="w-full appearance-none bg-stone-800 text-amber-300 font-bold text-xs py-2 px-3 rounded-xl border border-stone-700 text-center pr-7 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 min-h-[40px]"
              >
                {stepsList.map((st) => (
                  <option key={st.num} value={st.num} className="bg-stone-900 text-white">
                    Step {st.num}: {st.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 w-3.5 h-3.5" />
            </div>
            <button
              type="button"
              disabled={currentStep >= 9}
              onClick={() => setCurrentStep((prev) => Math.min(9, prev + 1))}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-stone-950 active:scale-95 transition-all flex items-center gap-1 shrink-0 min-h-[40px]"
              aria-label="Next Step"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Visual Step Progress Bar */}
          <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
              style={{ width: `${(currentStep / 9) * 100}%` }}
            />
          </div>
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
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md ring-1 ring-amber-400'
                      : isPast
                      ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono ${
                      isCurrent ? 'bg-stone-950 text-amber-400' : isPast ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400'
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

      {/* Mobile Interval Timer: Prominently placed on mobile for quick access during folding/baking */}
      <div className="block lg:hidden">
        {renderTimerCard()}
      </div>

      {/* Main Interactive Stage for Current Step */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Step Details & Interactive Controls */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: MIX & STARTING VOLUME */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-800 font-bold font-mono text-lg">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Step 1: Mix Ingredients & Measure Starting Volume</h2>
                  <p className="text-xs text-stone-500">
                    Follow your recipe. Transfer mixed dough into your transparent measuring container and level it.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Mix Started Time:
                  </label>
                  <input
                    type="time"
                    value={session.mixTime}
                    onChange={(e) => setSession((prev) => ({ ...prev, mixTime: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Marked Starting Volume (mL):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const val = Math.max(100, session.startingVolumeMl - 25);
                        const targetCalc = calculateTargetVolume(val, session.targetRisePercent, 50);
                        setSession((prev) => ({
                          ...prev,
                          startingVolumeMl: val,
                          targetVolumeMl: targetCalc.rounded,
                        }));
                      }}
                      className="w-10 h-10 rounded-xl bg-white border border-stone-300 flex items-center justify-center text-stone-700 active:scale-95 hover:bg-stone-50 shadow-sm shrink-0"
                      aria-label="Decrease starting volume"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="relative flex-1">
                      <input
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
                        className="w-full text-center px-2 py-2 border border-stone-300 rounded-xl text-base font-mono font-bold"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-mono pointer-events-none">
                        mL
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const val = session.startingVolumeMl + 25;
                        const targetCalc = calculateTargetVolume(val, session.targetRisePercent, 50);
                        setSession((prev) => ({
                          ...prev,
                          startingVolumeMl: val,
                          targetVolumeMl: targetCalc.rounded,
                        }));
                      }}
                      className="w-10 h-10 rounded-xl bg-white border border-stone-300 flex items-center justify-center text-stone-700 active:scale-95 hover:bg-stone-50 shadow-sm shrink-0"
                      aria-label="Increase starting volume"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  Tom's Pro Tip: The Shorthand Method
                </div>
                <p>
                  High-protein flour at 75% hydration mixes to approximately <strong>1.5× the dry flour weight</strong> in milliliters. (e.g. 500g flour = ~750 mL). Once measured accurately, it remains consistent for that recipe!
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors"
                >
                  Proceed to Step 2: Bulk Handling
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BULK FERMENTATION HANDLING (FOLDS) */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-800 font-bold font-mono text-lg">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Step 2: Dough Handling (Stretch & Folds, Coil Folds)</h2>
                  <p className="text-xs text-stone-500">
                    Log fold rounds spaced 30 minutes apart. Take dough temperature on your final round.
                  </p>
                </div>
              </div>

              {/* Logged Fold Rounds Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
                    Completed Fold Rounds ({session.handlingRounds.length})
                  </h3>
                  <span className="text-xs text-stone-500">Typical: 3–5 rounds</span>
                </div>

                {session.handlingRounds.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-stone-200 rounded-xl text-stone-400 text-xs">
                    No fold rounds recorded yet. Use the logger below to log Round 1.
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden text-xs">
                    {session.handlingRounds.map((rd) => (
                      <div key={rd.id} className="p-3 flex items-center justify-between bg-stone-50/50 hover:bg-stone-50">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-mono font-bold flex items-center justify-center text-[11px]">
                            {rd.roundNumber}
                          </span>
                          <div>
                            <div className="font-semibold text-stone-900">{rd.type}</div>
                            {rd.notes && <div className="text-stone-500 text-[11px]">{rd.notes}</div>}
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <div className="text-stone-800 font-medium">{rd.time}</div>
                          {rd.doughTemp && (
                            <div className="text-stone-500 text-[11px]">
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
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="text-xs font-semibold text-stone-900">
                  Log Fold Round #{session.handlingRounds.length + 1}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">Technique</label>
                    <select
                      value={roundType}
                      onChange={(e) => setRoundType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-white"
                    >
                      <option value="Stretch and Fold">Stretch and Fold</option>
                      <option value="Coil Fold">Coil Fold</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">
                      Probe Temp ({tempUnit === 'F' ? '°F' : '°C'})
                    </label>
                    <input
                      type="number"
                      step={tempUnit === 'F' ? 1 : 0.5}
                      value={tempUnit === 'F' ? roundTempF : fahrenheitToCelsius(roundTempF)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setRoundTempF(tempUnit === 'F' ? val : Math.round(val * 1.8 + 32));
                      }}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">Optional Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. good tension, extensible"
                      value={roundNote}
                      onChange={(e) => setRoundNote(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleAddFoldRound}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Record Round & Start 30m Timer
                  </button>
                  <span className="text-[11px] text-stone-500">Autostarts 30m rest</span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-stone-600 hover:underline"
                >
                  ← Back to Step 1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors"
                >
                  Done with Folds: Step 3 (Set Cutoff)
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DOUGH TEMPERATURE & SET TARGET % RISE */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-800 font-bold font-mono text-lg">
                  3
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Step 3: Measure Final Dough Temperature & Set Target</h2>
                  <p className="text-xs text-stone-500">
                    Immediately after your last fold, insert probe thermometer into dough center.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-amber-50 to-stone-50 rounded-2xl border border-amber-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-stone-700 uppercase">
                    Center Dough Probe Temperature:
                  </span>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleUpdateDoughTemp(Math.max(60, session.endingDoughTemp - 1))}
                      className="w-10 h-10 rounded-xl bg-white border border-stone-300 flex items-center justify-center text-stone-700 active:scale-95 hover:bg-stone-100 shadow-sm shrink-0"
                      aria-label="Decrease dough temperature"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex items-center justify-center bg-white px-3.5 py-1.5 border border-stone-300 rounded-xl shadow-sm min-w-[120px]">
                      <span className="font-mono font-black text-2xl text-amber-800">
                        {tempUnit === 'F' ? session.endingDoughTemp : fahrenheitToCelsius(session.endingDoughTemp)}
                      </span>
                      <span className="text-sm font-bold text-stone-600 ml-1">°{tempUnit}</span>
                      <span className="text-[11px] text-stone-400 font-mono ml-1.5">
                        ({tempUnit === 'F' ? `${fahrenheitToCelsius(session.endingDoughTemp)}°C` : `${session.endingDoughTemp}°F`})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdateDoughTemp(Math.min(86, session.endingDoughTemp + 1))}
                      className="w-10 h-10 rounded-xl bg-white border border-stone-300 flex items-center justify-center text-stone-700 active:scale-95 hover:bg-stone-100 shadow-sm shrink-0"
                      aria-label="Increase dough temperature"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 bg-white rounded-xl border border-stone-200 text-center">
                    <div className="text-[11px] text-stone-500 uppercase">Table Target Rise</div>
                    <div className="font-mono text-3xl font-black text-amber-600 mt-0.5">
                      +{session.targetRisePercent}%
                    </div>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-stone-200 text-center">
                    <div className="text-[11px] text-stone-500 uppercase">Vessel Cutoff Mark</div>
                    <div className="font-mono text-3xl font-black text-emerald-600 mt-0.5">
                      {session.targetVolumeMl} mL
                    </div>
                  </div>
                </div>

                <div className="text-xs text-stone-600 bg-white/80 p-3 rounded-xl border border-stone-200 leading-relaxed">
                  <strong>Tom Cucuzza's Rule: </strong>
                  Mark your container with tape or dry-erase marker at exactly{' '}
                  <strong className="text-emerald-700 font-mono font-bold">{session.targetVolumeMl} mL</strong>.
                  Now put the lid on and ignore the clock. Let the yeast do the work!
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-stone-600 hover:underline"
                >
                  ← Back to Step 2
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors"
                >
                  Step 4: Monitor Rise & Volume
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: MONITOR THE RISE AND DOUGH TEMPERATURE */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-800 font-bold font-mono text-lg">
                  4
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Step 4: Monitor the Rise & Watch the Dough</h2>
                  <p className="text-xs text-stone-500">
                    Ignore the clock! When dough reaches target volume, bulk fermentation is complete.
                  </p>
                </div>
              </div>

              {/* Live Volume Checker & Dome Midpoint Calculator */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800">
                    Live Volume Check ({session.startingVolumeMl} mL → Target: {session.targetVolumeMl} mL)
                  </span>
                  <button
                    type="button"
                    onClick={onOpenBulkOMatic}
                    className="text-xs text-amber-700 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Open 9-Criteria Bulk-O-Matic
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">
                      Low Point (where dough touches container wall):
                    </label>
                    <input
                      type="number"
                      value={domeLow}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setDomeLow(val);
                        const avg = calculateDomeVolume(val, domeHigh);
                        setCurrentCheckVolume(avg);
                      }}
                      className="w-full px-3 py-2 sm:py-1.5 border border-stone-300 rounded-lg text-base sm:text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">
                      High Point (center dome apex):
                    </label>
                    <input
                      type="number"
                      value={domeHigh}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setDomeHigh(val);
                        const avg = calculateDomeVolume(domeLow, val);
                        setCurrentCheckVolume(avg);
                      }}
                      className="w-full px-3 py-2 sm:py-1.5 border border-stone-300 rounded-lg text-base sm:text-xs font-mono bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-stone-200 flex items-center justify-between text-xs font-mono">
                  <span>Calculated Midpoint Volume:</span>
                  <span className="font-bold text-base text-stone-900">{currentCheckVolume} mL</span>
                </div>

                {/* Progress bar to cutoff */}
                {session.targetVolumeMl > session.startingVolumeMl && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-stone-500">
                      <span>Target: {session.targetVolumeMl} mL</span>
                      <span>
                        {Math.min(100, Math.round(((currentCheckVolume - session.startingVolumeMl) / (session.targetVolumeMl - session.startingVolumeMl)) * 100))}%
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(0, ((currentCheckVolume - session.startingVolumeMl) / (session.targetVolumeMl - session.startingVolumeMl)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-stone-600 hover:underline"
                >
                  ← Back to Step 3
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    setSession((prev) => ({
                      ...prev,
                      actualEndingVolumeMl: currentCheckVolume,
                      bulkEndTime: now,
                    }));
                    setCurrentStep(5);
                  }}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Target Hit! Proceed to Step 5: Shape
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: DIVIDE & PRESHAPE */}
          {currentStep === 5 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-800 font-bold font-mono text-lg">
                  5
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Step 5: Cut Off Bulk Fermentation & Shape</h2>
                  <p className="text-xs text-stone-500">
                    Bulk ended at {session.bulkEndTime || 'now'}. Preshape, rest 25–30 min on bench, then final shape.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="font-semibold">Preshape & Bench Rest Checklist:</div>
                <ul className="list-disc list-inside space-y-1 text-stone-700">
                  <li>Gently tip dough onto lightly floured work surface without deflating</li>
                  <li>Round lightly into loose boule / round</li>
                  <li>Let rest uncovered on countertop for 25–30 minutes</li>
                  <li>Perform final shaping (Batard or Boule) and place into floured banneton</li>
                </ul>
              </div>

              {/* Bench rest quick timer button */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-xs text-stone-700 font-medium">30-Minute Bench Rest Timer:</span>
                <button
                  type="button"
                  onClick={() => startTimerWithMinutes(30, 'Bench Rest')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Start 30m Timer
                </button>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-xs text-stone-600 hover:underline"
                >
                  ← Back to Step 4
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors"
                >
                  Proceed to Step 6: Cold Retard
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: FINAL PROOF / COLD RETARD */}
          {currentStep === 6 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-sky-100 text-sky-800 font-bold font-mono text-lg">
                  6
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Step 6: Final Proof / Cold Retard (8–16 Hours)</h2>
                  <p className="text-xs text-stone-500">
                    Cover banneton with bag or shower cap and place in refrigerator (37–39°F / 3–4°C).
                  </p>
                </div>
              </div>

              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-950 space-y-2 leading-relaxed">
                <div className="font-semibold flex items-center gap-1.5 text-sky-900">
                  <Snowflake className="w-4 h-4 text-sky-700" />
                  Why 8–16 Hours? The Cooling Curve Secret
                </div>
                <p>
                  Tom Cucuzza’s thermal experiments show that warm shaped dough takes <strong>8 to 10 hours</strong> to fully cool down to 39°F (4°C) inside the refrigerator.
                </p>
                <p>
                  Once the dough core reaches 39°F, yeast fermentation virtually stops! Therefore, leaving dough for 10 hours vs 14 hours has almost identical proofing levels.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <label className="text-[11px] text-stone-500 block mb-1">Target Retard Duration</label>
                  <input
                    type="number"
                    value={session.coldRetardHours || 14}
                    onChange={(e) => setSession((prev) => ({ ...prev, coldRetardHours: parseInt(e.target.value) || 12 }))}
                    className="w-full px-2 py-1 font-mono text-sm border border-stone-300 rounded"
                  />
                  <span className="text-[10px] text-stone-400">hours (typically 12–16)</span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <label className="text-[11px] text-stone-500 block mb-1">Target Fridge Temp</label>
                  <input
                    type="number"
                    value={session.fridgeTempF || 39}
                    onChange={(e) => setSession((prev) => ({ ...prev, fridgeTempF: parseInt(e.target.value) || 39 }))}
                    className="w-full px-2 py-1 font-mono text-sm border border-stone-300 rounded"
                  />
                  <span className="text-[10px] text-stone-400">°F (~4°C)</span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="text-xs text-stone-600 hover:underline"
                >
                  ← Back to Step 5
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(7)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors"
                >
                  Ready to Bake: Step 7
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: SCORING & BAKING */}
          {currentStep === 7 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-100 text-orange-800 font-bold font-mono text-lg">
                  7
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Step 7: Scoring and Baking in Dutch Oven</h2>
                  <p className="text-xs text-stone-500">
                    Bake cold straight from the fridge — do NOT bring dough to room temperature!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <div className="text-[11px] text-stone-500 uppercase">Preheat Temp</div>
                  <div className="font-mono text-xl font-bold text-stone-900 mt-1">500°F / 260°C</div>
                  <div className="text-[10px] text-stone-400 mt-1">Preheat Dutch oven 30-45m</div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <div className="text-[11px] text-amber-800 uppercase">Lid On (Steam)</div>
                  <div className="font-mono text-xl font-bold text-amber-900 mt-1">450°F • 20 Min</div>
                  <div className="text-[10px] text-amber-700 mt-1">Maximum oven spring & ear</div>
                </div>

                <div className="p-3 bg-amber-100/50 rounded-xl border border-amber-300 text-center">
                  <div className="text-[11px] text-amber-900 uppercase">Lid Off (Crust)</div>
                  <div className="font-mono text-xl font-bold text-amber-950 mt-1">450°F • 20 Min</div>
                  <div className="text-[10px] text-amber-800 mt-1">Deep mahogany color & blisters</div>
                </div>
              </div>

              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-xs text-stone-700">
                <span className="font-semibold">Baking Timers: </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => startTimerWithMinutes(20, 'Bake: Lid On (Steam)')}
                    className="py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all text-center min-h-[44px] flex items-center justify-center"
                  >
                    Start 20m Lid On
                  </button>
                  <button
                    type="button"
                    onClick={() => startTimerWithMinutes(20, 'Bake: Lid Off (Crust)')}
                    className="py-2.5 px-3 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all text-center min-h-[44px] flex items-center justify-center"
                  >
                    Start 20m Lid Off
                  </button>
                  <button
                    type="button"
                    onClick={() => startTimerWithMinutes(90, 'Cooling Time (Do Not Slice)')}
                    className="py-2.5 px-3 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold active:scale-95 transition-all text-center min-h-[44px] flex items-center justify-center"
                  >
                    Start 90m Cool Down
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="text-xs text-stone-600 hover:underline"
                >
                  ← Back to Step 6
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(8)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors"
                >
                  Loaf Cooled: Step 8 Crumb Diagnosis
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: CRUMB ASSESSMENT */}
          {currentStep === 8 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-800 font-bold font-mono text-lg">
                  8
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Step 8: Assess the Sliced Crumb</h2>
                  <p className="text-xs text-stone-500">
                    Once loaf has cooled 90 minutes, slice through center and compare to diagnosis cards.
                  </p>
                </div>
              </div>

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
                            ? 'border-emerald-600 bg-emerald-50/70 shadow-md'
                            : diag.status === 'underproofed'
                            ? 'border-amber-600 bg-amber-50/70 shadow-md'
                            : 'border-rose-600 bg-rose-50/70 shadow-md'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="font-bold text-sm text-stone-900 mb-1">{diag.label}</div>
                      <p className="text-[11px] text-stone-600 mb-2 leading-tight">{diag.rootCause}</p>
                      <div className="text-[11px] font-semibold text-stone-800">
                        Remedy: {diag.remedy}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Crumb & Flavor Tasting Notes:
                </label>
                <textarea
                  rows={3}
                  value={session.crumbNotes || ''}
                  onChange={(e) => setSession((prev) => ({ ...prev, crumbNotes: e.target.value }))}
                  placeholder="Note bubble size, softness, ear height, crust blister texture, sourness..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(7)}
                  className="text-xs text-stone-600 hover:underline"
                >
                  ← Back to Step 7
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(9)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors"
                >
                  Proceed to Step 9: Calibration
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 9: CALIBRATION */}
          {currentStep === 9 && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold font-mono text-lg">
                  9
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Step 9: Calibration for Your Next Bake</h2>
                  <p className="text-xs text-stone-500">
                    The Two-Factor calibration rule: Repeat identical conditions, adjust only the % rise!
                  </p>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-r from-stone-900 to-stone-800 text-stone-100 rounded-2xl border border-stone-700 space-y-4 shadow-lg">
                <div className="text-xs font-mono text-amber-400 uppercase tracking-wide">
                  Recommended Calibration for Next Bake
                </div>

                {session.crumbOutcome === 'underproofed' && (
                  <div className="space-y-2">
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      Target Rise: {session.targetRisePercent}% → {session.targetRisePercent + 10}% (+10%)
                    </div>
                    <p className="text-xs text-stone-300">
                      Because this loaf was slightly underproofed, increase target rise by 10% next time at {session.endingDoughTemp}°F. Keep all flour, water, and starter amounts identical!
                    </p>
                  </div>
                )}

                {session.crumbOutcome === 'overproofed' && (
                  <div className="space-y-2">
                    <div className="text-2xl font-black text-rose-400 font-mono">
                      Target Rise: {session.targetRisePercent}% → {Math.max(20, session.targetRisePercent - 10)}% (-10%)
                    </div>
                    <p className="text-xs text-stone-300">
                      Because this loaf was slightly overproofed, decrease target rise by 10% next time at {session.endingDoughTemp}°F, and verify your refrigerator reaches 39°F (4°C).
                    </p>
                  </div>
                )}

                {session.crumbOutcome === 'perfect' && (
                  <div className="space-y-2">
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      Target Rise: {session.targetRisePercent}% (Locked In!)
                    </div>
                    <p className="text-xs text-stone-300">
                      Congratulations! You have found your fermentation sweet spot for this recipe and temperature. Once locked in, it never changes.
                    </p>
                  </div>
                )}

                {!session.crumbOutcome && (
                  <p className="text-xs text-stone-400">
                    Select a crumb outcome in Step 8 to receive automatic calibration advice.
                  </p>
                )}
              </div>

              {/* Complete & Save to Log */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(8)}
                  className="text-xs text-stone-600 hover:underline"
                >
                  ← Back to Step 8
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const completed = { ...session, status: 'completed' as const };
                    setSession(completed);
                    onSaveToLog(completed);
                  }}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-colors shadow-md"
                >
                  <Save className="w-4 h-4" />
                  Save Bake to Baker's Notebook
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Live Step Companion & Timers (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 space-y-5">
          {renderTimerCard()}

          {/* Sourdough Journey Two-Factor Quick Reference Card */}
          <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/80 space-y-3 text-xs text-amber-950">
            <h4 className="font-serif font-bold text-sm text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
              The Sourdough Journey Secret
            </h4>
            <p className="leading-relaxed text-stone-700">
              "Total fermentation equals bulk fermentation PLUS cold retard fermentation. Warm dough ferments quickly in bulk and keeps fermenting for 8-10 hours in the fridge. That is why warm dough needs to be cut off earlier (30-40% rise) than cool dough (75-100% rise)."
            </p>
            <div className="font-semibold text-stone-800 text-[11px] border-t border-amber-200 pt-2">
              — Tom Cucuzza, The Sourdough Journey (2024)
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
