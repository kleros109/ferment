import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatDuration } from '../utils/time';

/**
 * Bake runtime = the state of the *session in progress*, as opposed to the
 * bake record itself: which of the nine steps is open and where the interval
 * timer stands.
 *
 * Both used to live in ActiveTrackerTab component state, so a reload, a screen
 * lock, backgrounding, or re-opening from the home screen reset the wizard to
 * step 1 with a fresh 30 minute timer. They now live here, persisted under
 * their own localStorage key, because they are transient machine state and not
 * part of the bake record that `ferment_active_session` stores and the log
 * exporter ships as JSON.
 *
 * The timer is stored as a wall-clock deadline (`timerEndsAt`) rather than a
 * decrementing counter, so remaining time is derived from the clock and a
 * throttled interval during backgrounding cannot make it drift.
 */
export const BAKE_RUNTIME_STORAGE_KEY = 'ferment_bake_runtime';

export const TOTAL_STEPS = 9;
export const DEFAULT_TIMER_MINUTES = 30;
export const DEFAULT_TIMER_LABEL = 'Next Stretch & Fold';

/** Background tabs throttle timers; re-sync on visibility instead of trusting ticks. */
const CLOCK_TICK_MS = 500;

const DEFAULT_TIMER_MS = DEFAULT_TIMER_MINUTES * 60_000;

export interface BakeRuntimeController {
  step: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  timerRunning: boolean;
  timerLabel: string;
  timerDurationMs: number;
  timerEndsAt: number | null;
  remainingMs: number;
  remainingLabel: string;
  isDue: boolean;
  startTimer: (minutes: number, label: string) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
}

interface StoredBakeRuntime {
  sessionId: string | null;
  step: number;
  timerRunning: boolean;
  timerEndsAt: number | null;
  timerRemainingMs: number;
  timerDurationMs: number;
  timerLabel: string;
}

function clampStep(value: unknown): number {
  const step = Number(value);
  if (!Number.isFinite(step)) return 1;
  return Math.min(TOTAL_STEPS, Math.max(1, Math.round(step)));
}

function freshRuntime(sessionId: string): StoredBakeRuntime {
  return {
    sessionId,
    step: 1,
    timerRunning: false,
    timerEndsAt: null,
    timerRemainingMs: DEFAULT_TIMER_MS,
    timerDurationMs: DEFAULT_TIMER_MS,
    timerLabel: DEFAULT_TIMER_LABEL,
  };
}

/**
 * Reads the persisted runtime for this bake. A stored runtime belonging to a
 * different session id (a new bake, or a bake restored from the log) is
 * discarded so a stale countdown can never leak into a fresh one.
 */
function loadRuntime(sessionId: string): StoredBakeRuntime {
  try {
    const raw = localStorage.getItem(BAKE_RUNTIME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredBakeRuntime> | null;
      if (parsed && parsed.sessionId === sessionId) {
        const durationMs =
          typeof parsed.timerDurationMs === 'number' && Number.isFinite(parsed.timerDurationMs) && parsed.timerDurationMs > 0
            ? parsed.timerDurationMs
            : DEFAULT_TIMER_MS;
        const endsAt =
          typeof parsed.timerEndsAt === 'number' && Number.isFinite(parsed.timerEndsAt) ? parsed.timerEndsAt : null;
        const running = parsed.timerRunning === true && endsAt !== null;
        const savedRemaining =
          typeof parsed.timerRemainingMs === 'number' && Number.isFinite(parsed.timerRemainingMs)
            ? Math.max(0, parsed.timerRemainingMs)
            : durationMs;
        return {
          sessionId,
          step: clampStep(parsed.step),
          timerRunning: running,
          timerEndsAt: running ? endsAt : null,
          timerRemainingMs: running && endsAt !== null ? Math.max(0, endsAt - Date.now()) : savedRemaining,
          timerDurationMs: durationMs,
          timerLabel:
            typeof parsed.timerLabel === 'string' && parsed.timerLabel.trim() ? parsed.timerLabel : DEFAULT_TIMER_LABEL,
        };
      }
    }
  } catch {
    // Storage unavailable or corrupt: fall through to a clean runtime.
  }
  return freshRuntime(sessionId);
}

export function useBakeRuntime(sessionId: string): BakeRuntimeController {
  const [state, setState] = useState<StoredBakeRuntime>(() => loadRuntime(sessionId));
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const boundSessionRef = useRef(sessionId);

  // Switching bakes (a fresh one, or one restored from the log) swaps in that
  // bake's runtime, so a stale countdown or step never follows across bakes.
  useEffect(() => {
    if (boundSessionRef.current === sessionId) return;
    boundSessionRef.current = sessionId;
    setState(loadRuntime(sessionId));
  }, [sessionId]);

  useEffect(() => {
    try {
      localStorage.setItem(BAKE_RUNTIME_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Persistence is best-effort; the surface still works without it.
    }
  }, [state]);

  // The clock only has to tick while something is counting down.
  useEffect(() => {
    if (!state.timerRunning) return;
    const sync = () => setNowMs(Date.now());
    sync();
    const interval = window.setInterval(sync, CLOCK_TICK_MS);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('pageshow', sync);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('pageshow', sync);
    };
  }, [state.timerRunning]);

  const remainingMs = useMemo(
    () =>
      state.timerRunning && state.timerEndsAt !== null
        ? Math.max(0, state.timerEndsAt - nowMs)
        : Math.max(0, state.timerRemainingMs),
    [state.timerRunning, state.timerEndsAt, state.timerRemainingMs, nowMs]
  );

  // A finished interval stops itself and parks at zero until it is reset or restarted.
  useEffect(() => {
    if (state.timerRunning && remainingMs <= 0) {
      setState((prev) =>
        prev.timerRunning ? { ...prev, timerRunning: false, timerEndsAt: null, timerRemainingMs: 0 } : prev
      );
    }
  }, [state.timerRunning, remainingMs]);

  const setStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, step: clampStep(step) }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: clampStep(prev.step + 1) }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: clampStep(prev.step - 1) }));
  }, []);

  const startTimer = useCallback((minutes: number, label: string) => {
    const ms = Math.max(1000, Math.round(minutes * 60_000));
    const startsAt = Date.now();
    setNowMs(startsAt);
    setState((prev) => ({
      ...prev,
      timerRunning: true,
      timerEndsAt: startsAt + ms,
      timerRemainingMs: ms,
      timerDurationMs: ms,
      timerLabel: label,
    }));
  }, []);

  const toggleTimer = useCallback(() => {
    setNowMs(Date.now());
    setState((prev) => {
      if (prev.timerRunning) {
        const left = prev.timerEndsAt !== null ? Math.max(0, prev.timerEndsAt - Date.now()) : prev.timerRemainingMs;
        return { ...prev, timerRunning: false, timerEndsAt: null, timerRemainingMs: left };
      }
      const resumeFrom = prev.timerRemainingMs > 0 ? prev.timerRemainingMs : prev.timerDurationMs;
      return { ...prev, timerRunning: true, timerEndsAt: Date.now() + resumeFrom, timerRemainingMs: resumeFrom };
    });
  }, []);

  const resetTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      timerRunning: false,
      timerEndsAt: null,
      timerRemainingMs: prev.timerDurationMs,
    }));
  }, []);

  return {
    step: state.step,
    setStep,
    nextStep,
    prevStep,
    timerRunning: state.timerRunning,
    timerLabel: state.timerLabel,
    timerDurationMs: state.timerDurationMs,
    timerEndsAt: state.timerEndsAt,
    remainingMs,
    remainingLabel: formatDuration(remainingMs),
    isDue: remainingMs <= 0,
    startTimer,
    toggleTimer,
    resetTimer,
  };
}
