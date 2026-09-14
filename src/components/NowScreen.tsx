import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
  Minus,
  Plus,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Save,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { BakeSession, BulkFoldRound, TempUnit } from '../types';
import { calculateTargetVolume, fahrenheitToCelsius, getGuideForTemperature } from '../utils/fermentCalculations';
import { elapsedSinceMix, formatClockTime, formatDuration, formatElapsed } from '../utils/time';
import { CRUMB_DIAGNOSIS_DATA } from '../data/sourdoughData';
import { BakeRuntimeController, BAKE_STEPS, TOTAL_STEPS } from '../hooks/useBakeRuntime';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { cn } from '../lib/utils';

/**
 * One-screen bake surface for the phone.
 *
 * Mid-bake the baker is at the counter with dough on their hands: the screen
 * has to answer "what now, how long have I got, what are my targets" at a
 * glance and take one big tap. Every control here is a button or a slider -
 * no text or number inputs - because index.html sets user-scalable=no, so a
 * focused input below 16px font size triggers iOS auto-zoom and breaks
 * counter use. Nothing on the common path requires the software keyboard.
 *
 * All measurements write straight to the persisted session, so a reload or a
 * re-open from the home screen restores them along with the step and timer.
 */

const VOLUME_STEP_ML = 25;
const TEMP_MIN_F = 60;
const TEMP_MAX_F = 86;

interface NowScreenProps {
  session: BakeSession;
  setSession: Dispatch<SetStateAction<BakeSession>>;
  tempUnit: TempUnit;
  runtime: BakeRuntimeController;
  onSaveToLog: (session: BakeSession) => void;
  onOpenSteps: () => void;
  onStartNewBake: () => void;
}

export function NowScreen({
  session,
  setSession,
  tempUnit,
  runtime,
  onSaveToLog,
  onOpenSteps,
  onStartNewBake,
}: NowScreenProps) {
  const [foldType, setFoldType] = useState<BulkFoldRound['type']>('Stretch and Fold');
  const inProgress = session.status === 'in_progress';

  // The 'since mix' readout is computed from the wall clock at render time,
  // so it needs its own heartbeat whenever the interval timer is not
  // providing one.
  const [, setElapsedTick] = useState(0);
  useEffect(() => {
    if (!inProgress || runtime.timerRunning) return;
    const id = window.setInterval(() => setElapsedTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [inProgress, runtime.timerRunning]);

  const step = runtime.step;
  const startVolumeMl = session.startingVolumeMl;
  const cutoffMl = session.targetVolumeMl;
  const measuredMl = session.actualEndingVolumeMl ?? startVolumeMl;

  const risePercent = startVolumeMl > 0 ? Math.round(((measuredMl - startVolumeMl) / startVolumeMl) * 100) : 0;
  const cutoffProgress =
    cutoffMl > startVolumeMl ? Math.min(100, Math.max(0, ((measuredMl - startVolumeMl) / (cutoffMl - startVolumeMl)) * 100)) : 0;

  const showTemp = (fahrenheit: number) =>
    tempUnit === 'F' ? `${Math.round(fahrenheit)}°F` : `${fahrenheitToCelsius(fahrenheit)}°C`;

  /**
   * Measurement writes take a value or an updater and always resolve against
   * the persisted session, never a render closure, so fast repeated taps on a
   * +/− button each land instead of overwriting one another.
   */
  type Measurement = number | ((current: number) => number);

  const setStartingVolume = (next: Measurement) => {
    setSession((prev) => {
      const clamped = Math.max(100, Math.round(typeof next === 'function' ? next(prev.startingVolumeMl) : next));
      return {
        ...prev,
        startingVolumeMl: clamped,
        targetVolumeMl: calculateTargetVolume(clamped, prev.targetRisePercent, 50).rounded,
      };
    });
  };

  /** Dough temperature is the first factor: it sets the target rise and the cutoff mark. */
  const applyDoughTemp = (next: Measurement) => {
    setSession((prev) => {
      const clamped = Math.min(TEMP_MAX_F, Math.max(TEMP_MIN_F, Math.round(typeof next === 'function' ? next(prev.endingDoughTemp) : next)));
      const guide = getGuideForTemperature(clamped);
      return {
        ...prev,
        endingDoughTemp: clamped,
        targetRisePercent: guide.targetRise,
        targetVolumeMl: calculateTargetVolume(prev.startingVolumeMl, guide.targetRise, 50).rounded,
      };
    });
  };

  const setRetardHours = (next: Measurement) => {
    setSession((prev) => {
      const current = prev.coldRetardHours || 14;
      const clamped = Math.min(24, Math.max(4, Math.round(typeof next === 'function' ? next(current) : next)));
      return { ...prev, coldRetardHours: clamped };
    });
  };

  const setMeasuredVolume = (next: Measurement) => {
    setSession((prev) => {
      const current = prev.actualEndingVolumeMl ?? prev.startingVolumeMl;
      const raw = typeof next === 'function' ? next(current) : next;
      return { ...prev, actualEndingVolumeMl: Math.max(prev.startingVolumeMl, Math.round(raw)) };
    });
  };

  const logFoldRound = () => {
    const roundNumber = session.handlingRounds.length + 1;
    const round: BulkFoldRound = {
      id: Date.now().toString(),
      roundNumber,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: foldType,
      doughTemp: session.endingDoughTemp,
    };
    setSession((prev) => ({ ...prev, handlingRounds: [...prev.handlingRounds, round] }));
    runtime.startTimer(30, `Round ${roundNumber + 1} Fold`);
  };

  const commitTargetHit = () => {
    setSession((prev) => ({
      ...prev,
      actualEndingVolumeMl: measuredMl,
      bulkEndTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    runtime.nextStep();
  };

  const saveBake = () => {
    const completed: BakeSession = { ...session, status: 'completed' };
    setSession(completed);
    onSaveToLog(completed);
  };

  if (!inProgress) {
    return (
      <div className="max-w-md mx-auto pt-8 px-1 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <Clock className="w-7 h-7 text-amber-700 dark:text-amber-400" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-50">No bake in progress</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
            Set your dough temperature and target rise in the calculator, then start a bake. This screen takes over from there.
          </p>
        </div>
        <Button size="lg" className="w-full h-14 text-base font-bold" onClick={onStartNewBake}>
          Open the Calculator
        </Button>
      </div>
    );
  }

  const nextEvent =
    step === 1
      ? `Mark the starting line at ${startVolumeMl} mL`
      : step === 2
        ? `Fold round ${session.handlingRounds.length + 1} - every 30 min`
        : step === 3
          ? 'Probe the dough centre temperature'
          : step === 4
            ? `Check the rise against ${cutoffMl} mL`
            : step === 5
              ? 'Preshape, then 25-30 min bench rest'
              : step === 6
                ? `Into the fridge for ${session.coldRetardHours || 14} hours`
                : step === 7
                  ? 'Lid on, 20 min at 450°F'
                  : step === 8
                    ? 'Slice the cooled loaf and judge the crumb'
                    : 'Save the bake to the notebook';

  const elapsedLabel = (() => {
    const elapsedMs = elapsedSinceMix(session.date, session.mixTime);
    return elapsedMs === null ? null : formatElapsed(elapsedMs);
  })();

  return (
    <div className="max-w-md mx-auto space-y-3 pb-1">
      {/* Step identity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 w-7 h-7 rounded-lg bg-amber-500 text-stone-950 font-mono font-bold text-sm flex items-center justify-center">
              {step}
            </span>
            <div className="min-w-0">
              <div className="font-serif font-bold text-base leading-tight text-stone-900 dark:text-stone-50 truncate">
                {BAKE_STEPS[step - 1].title}
              </div>
              {elapsedLabel && (
                <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                  Step {step} of {TOTAL_STEPS} · {elapsedLabel} since mix
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSteps}
            className="shrink-0 h-11 px-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400"
          >
            All steps
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </div>
        <Progress
          value={(step / TOTAL_STEPS) * 100}
          className="h-1.5 bg-stone-200 dark:bg-stone-800 border-0"
          indicatorClassName="bg-gradient-to-r from-amber-500 to-emerald-400"
        />
      </div>

      {/* What is next, and how long until it is due */}
      <section className="rounded-2xl border border-amber-300/70 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm overflow-hidden">
        <div className="px-4 pt-3.5 pb-3 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                Next
              </div>
              <div className="font-serif text-base font-bold leading-snug text-stone-900 dark:text-stone-50">
                {nextEvent}
              </div>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 max-w-[122px] truncate text-[10px] font-mono text-stone-500 dark:text-stone-400"
            >
              {runtime.timerLabel}
            </Badge>
          </div>

          <div className="text-center py-0.5">
            <div
              className={cn(
                'font-mono font-black tabular-nums leading-none tracking-tight text-5xl',
                runtime.isDue ? 'text-rose-600 dark:text-rose-400' : 'text-stone-900 dark:text-amber-300'
              )}
            >
              {runtime.isDue ? 'DUE' : runtime.remainingLabel}
            </div>
            <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-2">
              {runtime.isDue
                ? `${runtime.timerLabel} is due now`
                : runtime.timerRunning && runtime.timerEndsAt !== null
                  ? `Due at ${formatClockTime(runtime.timerEndsAt)}`
                  : `Paused at ${formatDuration(runtime.remainingMs)}`}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2 px-3 pb-3">
          <Button
            type="button"
            size="lg"
            variant={runtime.timerRunning ? 'amber' : 'emerald'}
            className="h-12 text-sm font-bold"
            onClick={runtime.toggleTimer}
          >
            {runtime.timerRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {runtime.remainingMs > 0 && runtime.remainingMs < runtime.timerDurationMs ? 'Resume' : 'Start'}
              </>
            )}
          </Button>
          <Button
            type="button"
            size="icon-lg"
            variant="outline"
            onClick={runtime.resetTimer}
            aria-label="Reset interval timer"
            className="text-stone-600 dark:text-stone-300"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Targets stay glanceable while a measurement is being logged */}
      <div className="grid grid-cols-3 divide-x divide-stone-200 dark:divide-stone-800 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/80 py-2.5 text-center font-mono">
        <div>
          <div className="text-[9px] uppercase tracking-tight text-stone-500 dark:text-stone-400">Dough</div>
          <div className="text-base font-bold text-amber-700 dark:text-amber-400">{showTemp(session.endingDoughTemp)}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-tight text-stone-500 dark:text-stone-400">Target Rise</div>
          <div className="text-base font-bold text-amber-700 dark:text-amber-400">+{session.targetRisePercent}%</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-tight text-stone-500 dark:text-stone-400">Cutoff</div>
          <div className="text-base font-bold text-emerald-700 dark:text-emerald-400">{cutoffMl} mL</div>
        </div>
      </div>

      {/* The one action that logs a measurement for this step */}
      <section className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm p-3.5 space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          Log measurement
        </div>

        {step === 1 && (
          <>
            <ReadoutRow
              value={`${startVolumeMl}`}
              unit="mL"
              caption={`500 g flour is roughly ${Math.round(session.totalFlourWeight * 1.5)} mL`}
              onDecrease={() => setStartingVolume((current) => current - VOLUME_STEP_ML)}
              onIncrease={() => setStartingVolume((current) => current + VOLUME_STEP_ML)}
            />
            <Slider
              className="py-0"
              min={250}
              max={Math.max(1500, Math.round((startVolumeMl * 1.3) / 25) * 25)}
              step={VOLUME_STEP_ML}
              value={startVolumeMl}
              onValueChange={setStartingVolume}
              aria-label="Marked starting volume in millilitres"
            />
            <Button
              type="button"
              size="lg"
              className="w-full h-14 text-base font-bold"
              onClick={() => {
                runtime.startTimer(30, 'Next Stretch & Fold');
                runtime.nextStep();
              }}
            >
              Bulk started - begin folds
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {(['Stretch and Fold', 'Coil Fold'] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={foldType === type ? 'default' : 'outline'}
                  className="h-11 text-xs font-semibold"
                  onClick={() => setFoldType(type)}
                >
                  {type === 'Stretch and Fold' ? 'Stretch & Fold' : 'Coil Fold'}
                </Button>
              ))}
            </div>
            <ReadoutRow
              value={`${tempUnit === 'F' ? session.endingDoughTemp : fahrenheitToCelsius(session.endingDoughTemp)}`}
              unit={`°${tempUnit}`}
              caption={`Target rise +${session.targetRisePercent}% - cutoff ${cutoffMl} mL`}
              onDecrease={() => applyDoughTemp((current) => current - 1)}
              onIncrease={() => applyDoughTemp((current) => current + 1)}
            />
            <Button type="button" size="lg" className="w-full h-14 text-base font-bold" onClick={logFoldRound}>
              Log round {session.handlingRounds.length + 1} {foldType === 'Coil Fold' ? 'coil fold' : 'stretch & fold'}
            </Button>
            <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
              Logging a round starts the 30 minute rest timer.
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <ReadoutRow
              value={`${tempUnit === 'F' ? session.endingDoughTemp : fahrenheitToCelsius(session.endingDoughTemp)}`}
              unit={`°${tempUnit}`}
              caption={`Two-factor table: +${session.targetRisePercent}% rise at this temperature`}
              onDecrease={() => applyDoughTemp((current) => current - 1)}
              onIncrease={() => applyDoughTemp((current) => current + 1)}
            />
            <Slider
              className="py-0"
              min={TEMP_MIN_F}
              max={TEMP_MAX_F}
              step={1}
              value={Math.round(session.endingDoughTemp)}
              onValueChange={applyDoughTemp}
              aria-label="Dough centre temperature in Fahrenheit"
            />
            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="rounded-xl border border-amber-200/80 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-950/30 py-2">
                <div className="text-[10px] uppercase text-stone-500 dark:text-stone-400">Target Rise</div>
                <div className="text-2xl font-black text-amber-700 dark:text-amber-400">+{session.targetRisePercent}%</div>
              </div>
              <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/70 dark:bg-emerald-950/30 py-2">
                <div className="text-[10px] uppercase text-stone-500 dark:text-stone-400">Vessel Cutoff</div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{cutoffMl} mL</div>
              </div>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-300 flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              Mark the container at {cutoffMl} mL with tape before the dough rises past it.
            </p>
          </>
        )}

        {step === 4 && (
          <>
            <ReadoutRow
              value={`${measuredMl}`}
              unit="mL"
              caption={`+${risePercent}% rise · target +${session.targetRisePercent}%`}
              onDecrease={() => setMeasuredVolume((current) => current - VOLUME_STEP_ML)}
              onIncrease={() => setMeasuredVolume((current) => current + VOLUME_STEP_ML)}
            />
            <Slider
              className="py-0"
              min={startVolumeMl}
              max={Math.max(Math.round((cutoffMl * 1.15) / 25) * 25, startVolumeMl + VOLUME_STEP_ML)}
              step={VOLUME_STEP_ML}
              value={measuredMl}
              onValueChange={setMeasuredVolume}
              aria-label="Measured dough volume in millilitres"
            />
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
                <span>{startVolumeMl} mL</span>
                <span className={cn(cutoffProgress >= 100 && 'font-bold text-emerald-600 dark:text-emerald-400')}>
                  {Math.round(cutoffProgress)}% to cutoff
                </span>
                <span>{cutoffMl} mL</span>
              </div>
              <Progress
                value={cutoffProgress}
                className="h-2.5 bg-stone-200 dark:bg-stone-800"
                indicatorClassName={cutoffProgress >= 100 ? 'bg-emerald-500' : 'bg-amber-600'}
              />
            </div>
            <Button type="button" size="lg" variant="emerald" className="w-full h-14 text-base font-bold" onClick={commitTargetHit}>
              Cut off bulk at {measuredMl} mL
            </Button>
          </>
        )}

        {step === 5 && (
          <>
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              Tip the dough out without deflating, round it loosely, rest uncovered, then shape and drop it into the floured
              banneton.
            </div>
            <Button
              type="button"
              size="lg"
              variant="amber"
              className="w-full h-12 text-sm font-semibold"
              onClick={() => runtime.startTimer(30, 'Bench Rest')}
            >
              Start 30 min bench rest
            </Button>
            <Button type="button" size="lg" variant="emerald" className="w-full h-14 text-base font-bold" onClick={runtime.nextStep}>
              Shaped - into the fridge
            </Button>
          </>
        )}

        {step === 6 && (
          <>
            <ReadoutRow
              value={`${session.coldRetardHours || 14}`}
              unit="h"
              caption={`Fridge at ${showTemp(session.fridgeTempF || 39)}`}
              onDecrease={() => setRetardHours((current) => current - 1)}
              onIncrease={() => setRetardHours((current) => current + 1)}
            />
            <Slider
              className="py-0"
              min={8}
              max={20}
              step={1}
              value={session.coldRetardHours || 14}
              onValueChange={setRetardHours}
              aria-label="Cold retard hours"
            />
            <Button
              type="button"
              size="lg"
              className="w-full h-14 text-base font-bold"
              onClick={() => {
                const hours = session.coldRetardHours || 14;
                runtime.startTimer(hours * 60, `${hours}h Cold Retard`);
              }}
            >
              Start {session.coldRetardHours || 14} hour retard timer
            </Button>
          </>
        )}

        {step === 7 && (
          <>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 py-2">
                <div className="text-[9px] uppercase text-stone-500 dark:text-stone-400">Preheat</div>
                <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {showTemp(session.preheatTempF || 500)}
                </div>
              </div>
              <div className="rounded-xl border border-amber-200/80 dark:border-amber-800/50 bg-amber-50/70 dark:bg-amber-950/30 py-2">
                <div className="text-[9px] uppercase text-amber-800 dark:text-amber-300">Lid On</div>
                <div className="text-sm font-bold text-amber-900 dark:text-amber-200">{session.lidOnMinutes || 20}m</div>
              </div>
              <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-100/50 dark:bg-amber-900/30 py-2">
                <div className="text-[9px] uppercase text-amber-900 dark:text-amber-300">Lid Off</div>
                <div className="text-sm font-bold text-amber-950 dark:text-amber-100">{session.lidOffMinutes || 20}m</div>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                type="button"
                size="lg"
                className="w-full h-12 text-sm font-bold"
                onClick={() => runtime.startTimer(session.lidOnMinutes || 20, 'Bake: Lid On (Steam)')}
              >
                Start {session.lidOnMinutes || 20} min lid on
              </Button>
              <Button
                type="button"
                size="lg"
                variant="amber"
                className="w-full h-12 text-sm font-semibold"
                onClick={() => runtime.startTimer(session.lidOffMinutes || 20, 'Bake: Lid Off (Crust)')}
              >
                Start {session.lidOffMinutes || 20} min lid off
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                className="w-full h-12 text-sm font-semibold"
                onClick={() => runtime.startTimer(90, 'Cooling (Do Not Slice)')}
              >
                Start 90 min cooldown
              </Button>
            </div>
          </>
        )}

        {step === 8 && (
          <div className="space-y-2">
            {CRUMB_DIAGNOSIS_DATA.map((diagnosis) => {
              const isSelected = session.crumbOutcome === diagnosis.status;
              return (
                <button
                  key={diagnosis.status}
                  type="button"
                  onClick={() => setSession((prev) => ({ ...prev, crumbOutcome: diagnosis.status as BakeSession['crumbOutcome'] }))}
                  className={cn(
                    'w-full min-h-[64px] p-3 rounded-xl border-2 text-left transition-all touch-manipulation flex items-center justify-between gap-3',
                    isSelected
                      ? diagnosis.status === 'perfect'
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40'
                        : diagnosis.status === 'underproofed'
                          ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/40'
                          : 'border-rose-600 bg-rose-50/70 dark:bg-rose-950/40'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60'
                  )}
                >
                  <span className="min-w-0">
                    <span className="block font-bold text-sm text-stone-900 dark:text-stone-100">{diagnosis.label}</span>
                    <span className="block text-[11px] text-stone-600 dark:text-stone-400 leading-tight">
                      {diagnosis.remedy}
                    </span>
                  </span>
                  {isSelected && <Check className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />}
                </button>
              );
            })}
          </div>
        )}

        {step === 9 && (
          <>
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50/70 to-stone-50 dark:from-stone-900 dark:to-stone-800 border border-amber-200/80 dark:border-stone-700 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wide text-amber-800 dark:text-amber-400">
                Next bake target
              </div>
              <div className="font-mono text-2xl font-black text-stone-900 dark:text-stone-50">
                +{session.targetRisePercent}%
                {session.crumbOutcome === 'underproofed' && (
                  <span className="text-amber-700 dark:text-amber-400"> → +{session.targetRisePercent + 10}%</span>
                )}
                {session.crumbOutcome === 'overproofed' && (
                  <span className="text-rose-700 dark:text-rose-400"> → +{Math.max(20, session.targetRisePercent - 10)}%</span>
                )}
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                {session.crumbOutcome === 'perfect'
                  ? 'Locked in - repeat identical conditions.'
                  : session.crumbOutcome
                    ? `Keep everything else identical and move the target ${session.crumbOutcome === 'underproofed' ? 'up' : 'down'} 10%.`
                    : 'Pick a crumb outcome in step 8 for calibration advice.'}
              </p>
            </div>
            <Button type="button" size="lg" variant="emerald" className="w-full h-14 text-base font-bold" onClick={saveBake}>
              <Save className="w-4 h-4" />
              Save bake to notebook
            </Button>
          </>
        )}
      </section>

      <p className="text-[11px] text-stone-500 dark:text-stone-400 px-0.5">{BAKE_STEPS[step - 1].hint}</p>

      {/* Step navigation: every action above stays reachable one-handed */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-14 flex-1 text-sm font-semibold"
          disabled={step <= 1}
          onClick={runtime.prevStep}
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-14 flex-1 text-sm font-semibold"
          disabled={step >= TOTAL_STEPS}
          onClick={runtime.nextStep}
        >
          Next step
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {session.handlingRounds.length > 0 && (
        <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono text-center">
          {session.handlingRounds.length} fold round{session.handlingRounds.length === 1 ? '' : 's'} logged · last{' '}
          {session.handlingRounds[session.handlingRounds.length - 1].time}
        </p>
      )}
    </div>
  );
}

interface ReadoutRowProps {
  value: string;
  unit: string;
  caption: string;
  onDecrease: () => void;
  onIncrease: () => void;
}

function ReadoutRow({ value, unit, caption, onDecrease, onIncrease }: ReadoutRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon-lg"
          variant="outline"
          onClick={onDecrease}
          aria-label="Decrease"
          className="shrink-0"
        >
          <Minus className="w-5 h-5" />
        </Button>
        <div className="flex-1 text-center">
          <div className="font-mono text-3xl font-black leading-none text-stone-900 dark:text-amber-300">
            {value}
            <span className="text-base font-bold text-stone-500 dark:text-stone-400 ml-1">{unit}</span>
          </div>
        </div>
        <Button
          type="button"
          size="icon-lg"
          variant="outline"
          onClick={onIncrease}
          aria-label="Increase"
          className="shrink-0"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
      <div className="text-[11px] text-center text-stone-500 dark:text-stone-400">{caption}</div>
    </div>
  );
}
