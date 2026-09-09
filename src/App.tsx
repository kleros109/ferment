import { useState, useEffect } from 'react';
import { Flame, Clock, Activity, ScrollText, BookOpen, Waves, MoreHorizontal, X, ChevronRight, Scale, Sparkles } from 'lucide-react';
import { Header } from './components/Header';
import { CalculatorTab } from './components/CalculatorTab';
import { ActiveTrackerTab } from './components/ActiveTrackerTab';
import { BulkOMaticTab } from './components/BulkOMaticTab';
import { RecipeTab } from './components/RecipeTab';
import { BakersLogTab } from './components/BakersLogTab';
import { ReferencesTab } from './components/ReferencesTab';
import { BakeSession, TempUnit } from './types';
import { calculateTargetVolume, fahrenheitToCelsius } from './utils/fermentCalculations';

const VALID_TABS = ['calculator', 'ddt', 'tracker', 'bulk-o-matic', 'recipe', 'log', 'references'];

// Initial sample bake based on Appendix 2 from Tom Cucuzza's guide
const INITIAL_LOGS: BakeSession[] = [
  {
    id: 'bake-sample-1',
    date: '2024-01-01',
    title: 'Tartine Country Loaf (Appendix 2 Sample)',
    flour1Name: "Bob's Red Mill Artisan Bread Flour",
    flour1Weight: 450,
    flour2Name: 'Central Milling Whole Wheat',
    flour2Weight: 50,
    flour3Name: '',
    flour3Weight: 0,
    totalFlourWeight: 500,
    waterWeight: 375,
    starterWeight: 100,
    starterHydration: 100,
    saltWeight: 10,
    calculatedHydration: 77,
    initialDoughTemp: 72,
    endingDoughTemp: 70,
    tempUnit: 'F',
    startingVolumeMl: 750,
    targetRisePercent: 75,
    targetVolumeMl: 1313,
    actualEndingVolumeMl: 1300,
    isDomed: true,
    domeLowPointMl: 1200,
    domeHighPointMl: 1400,
    mixTime: '08:00',
    handlingRounds: [
      { id: 'r1', roundNumber: 1, time: '09:00', type: 'Stretch and Fold', doughTemp: 72 },
      { id: 'r2', roundNumber: 2, time: '09:30', type: 'Stretch and Fold', doughTemp: 71 },
      { id: 'r3', roundNumber: 3, time: '10:00', type: 'Coil Fold', doughTemp: 71 },
      { id: 'r4', roundNumber: 4, time: '10:30', type: 'Coil Fold', doughTemp: 70 },
    ],
    bulkEndTime: '17:00',
    totalFermentDuration: '9 hours',
    coldRetardHours: 14.5,
    fridgeTempF: 39,
    preheatTempF: 500,
    bakeTempF: 450,
    lidOnMinutes: 20,
    lidOffMinutes: 20,
    crumbOutcome: 'underproofed',
    crumbNotes: 'Loaf was slightly underproofed with mild density at bottom. Will repeat exact same recipe at 70°F and target 85% rise (+10%) on next bake.',
    calibrationAdjustmentPercent: 10,
    status: 'completed',
  },
];

const DEFAULT_ACTIVE_SESSION: BakeSession = {
  id: `bake-${Date.now()}`,
  date: new Date().toISOString().split('T')[0],
  title: 'Fresh Sourdough Country Loaf',
  flour1Name: 'Bread Flour (12.7% protein)',
  flour1Weight: 450,
  flour2Name: 'Whole Wheat Flour',
  flour2Weight: 50,
  flour3Name: '',
  flour3Weight: 0,
  totalFlourWeight: 500,
  waterWeight: 375,
  starterWeight: 100,
  starterHydration: 100,
  saltWeight: 10,
  calculatedHydration: 77,
  initialDoughTemp: 75,
  endingDoughTemp: 75,
  tempUnit: 'F',
  startingVolumeMl: 750,
  targetRisePercent: 50,
  targetVolumeMl: 1125,
  mixTime: '09:00',
  handlingRounds: [],
  coldRetardHours: 14,
  fridgeTempF: 39,
  preheatTempF: 500,
  bakeTempF: 450,
  lidOnMinutes: 20,
  lidOffMinutes: 20,
  status: 'in_progress',
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#/, '');
      if (VALID_TABS.includes(hash)) return hash;
    }
    return 'calculator';
  });
  const [tempUnit, setTempUnit] = useState<TempUnit>('F');
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [isMiniBannerDismissed, setIsMiniBannerDismissed] = useState<boolean>(false);

  // Reset dismissed banner if user navigates to tracker
  useEffect(() => {
    if (currentTab === 'tracker') {
      setIsMiniBannerDismissed(false);
    }
  }, [currentTab]);

  // Sync currentTab with URL hash for easy mobile sharing & browser back/forward
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.replace(/^#/, '') !== currentTab) {
      window.location.hash = currentTab;
    }
  }, [currentTab]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (VALID_TABS.includes(hash)) {
        setCurrentTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load / save active session and log history from localStorage
  const [activeSession, setActiveSession] = useState<BakeSession>(() => {
    try {
      const saved = localStorage.getItem('ferment_active_session');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_ACTIVE_SESSION;
  });

  const [logs, setLogs] = useState<BakeSession[]>(() => {
    try {
      const saved = localStorage.getItem('ferment_bake_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('ferment_active_session', JSON.stringify(activeSession));
    } catch {
      // ignore
    }
  }, [activeSession]);

  useEffect(() => {
    try {
      localStorage.setItem('ferment_bake_logs', JSON.stringify(logs));
    } catch {
      // ignore
    }
  }, [logs]);

  // Handler: Start a bake from the Calculator tab
  const handleStartBakeFromCalculator = (data: {
    doughTempF: number;
    flourGrams: number;
    startingVolumeMl: number;
    targetRisePercent: number;
    targetVolumeMl: number;
  }) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newSession: BakeSession = {
      ...DEFAULT_ACTIVE_SESSION,
      id: `bake-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      mixTime: nowTime,
      totalFlourWeight: data.flourGrams,
      flour1Weight: Math.round(data.flourGrams * 0.9),
      flour2Weight: Math.round(data.flourGrams * 0.1),
      waterWeight: Math.round(data.flourGrams * 0.75),
      starterWeight: Math.round(data.flourGrams * 0.2),
      saltWeight: Math.round(data.flourGrams * 0.02),
      calculatedHydration: 77,
      initialDoughTemp: data.doughTempF,
      endingDoughTemp: data.doughTempF,
      startingVolumeMl: data.startingVolumeMl,
      targetRisePercent: data.targetRisePercent,
      targetVolumeMl: data.targetVolumeMl,
      handlingRounds: [],
      status: 'in_progress',
    };
    setActiveSession(newSession);
    setCurrentTab('tracker');
  };

  // Handler: Save completed bake into logs
  const handleSaveToLog = (session: BakeSession) => {
    setLogs((prev) => [session, ...prev.filter((item) => item.id !== session.id)]);
    setCurrentTab('log');
  };

  // Handler: Delete log
  const handleDeleteSession = (id: string) => {
    setLogs((prev) => prev.filter((item) => item.id !== id));
  };

  // Handler: Calibrate new bake from a past bake
  const handleCalibrateNewBake = (prevSession: BakeSession) => {
    let calibratedRise = prevSession.targetRisePercent;
    if (prevSession.crumbOutcome === 'underproofed') {
      calibratedRise += 10;
    } else if (prevSession.crumbOutcome === 'overproofed') {
      calibratedRise = Math.max(20, calibratedRise - 10);
    }
    const targetCalc = calculateTargetVolume(prevSession.startingVolumeMl, calibratedRise, 50);

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newSession: BakeSession = {
      ...prevSession,
      id: `bake-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      mixTime: nowTime,
      targetRisePercent: calibratedRise,
      targetVolumeMl: targetCalc.rounded,
      actualEndingVolumeMl: undefined,
      bulkEndTime: undefined,
      handlingRounds: [],
      crumbOutcome: undefined,
      crumbNotes: `Calibrated from bake ${prevSession.date}: adjusted target rise to ${calibratedRise}%.`,
      status: 'in_progress',
    };

    setActiveSession(newSession);
    setCurrentTab('tracker');
  };

  // Handler: Transfer recipe data to calculator
  const handleLoadRecipeIntoCalculator = (
    _flourGrams: number,
    _startingVolumeMl: number,
    initialMode: 'two-factor' | 'ddt' = 'two-factor'
  ) => {
    setCurrentTab(initialMode === 'ddt' ? 'ddt' : 'calculator');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-950">
      {/* App Header & Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        tempUnit={tempUnit}
        setTempUnit={setTempUnit}
        hasActiveSession={activeSession.status === 'in_progress'}
      />

      {/* Main Content Area */}
      <main key={currentTab} className="view-in flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6 pb-36 sm:pb-20">
        {currentTab === 'calculator' && (
          <CalculatorTab
            tempUnit={tempUnit}
            initialMode="two-factor"
            onStartBakeWithValues={handleStartBakeFromCalculator}
          />
        )}

        {currentTab === 'ddt' && (
          <CalculatorTab
            tempUnit={tempUnit}
            initialMode="ddt"
            onStartBakeWithValues={handleStartBakeFromCalculator}
          />
        )}

        {currentTab === 'tracker' && (
          <ActiveTrackerTab
            session={activeSession}
            setSession={setActiveSession}
            tempUnit={tempUnit}
            onSaveToLog={handleSaveToLog}
            onOpenBulkOMatic={() => setCurrentTab('bulk-o-matic')}
          />
        )}

        {currentTab === 'bulk-o-matic' && (
          <BulkOMaticTab
            onProceedToShape={() => setCurrentTab('tracker')}
          />
        )}

        {currentTab === 'recipe' && (
          <RecipeTab
            onLoadRecipeIntoCalculator={handleLoadRecipeIntoCalculator}
          />
        )}

        {currentTab === 'log' && (
          <BakersLogTab
            logs={logs}
            onSelectSessionToEdit={(s) => {
              setActiveSession(s);
              setCurrentTab('tracker');
            }}
            onDeleteSession={handleDeleteSession}
            onCalibrateNewBake={handleCalibrateNewBake}
            tempUnit={tempUnit}
          />
        )}

        {currentTab === 'references' && <ReferencesTab />}
      </main>

      {/* Floating Active Bake Pill for Mobile (Solid, dismissible, high-contrast) */}
      {activeSession.status === 'in_progress' && currentTab !== 'tracker' && !isMiniBannerDismissed && (
        <div className="md:hidden fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-3 right-3 z-30 animate-fade-in">
          <div className="w-full bg-stone-900 border border-amber-500/50 text-stone-100 p-2.5 rounded-2xl shadow-2xl flex items-center justify-between gap-2.5 ring-1 ring-black/40">
            <button
              type="button"
              onClick={() => setCurrentTab('tracker')}
              className="flex-1 flex items-center gap-2.5 min-w-0 text-left touch-manipulation"
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">
                  {activeSession.title || 'Country Loaf'}
                </div>
                <div className="text-[10px] text-amber-300 font-mono">
                  {tempUnit === 'F' ? `${activeSession.endingDoughTemp}°F` : `${fahrenheitToCelsius(activeSession.endingDoughTemp)}°C`} • Target: +{activeSession.targetRisePercent}% ({activeSession.targetVolumeMl} mL)
                </div>
              </div>
            </button>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentTab('tracker')}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/30 touch-manipulation"
              >
                <span>Resume</span>
                <ChevronRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsMiniBannerDismissed(true)}
                className="w-6 h-6 rounded-full text-stone-400 hover:text-white flex items-center justify-center touch-manipulation active:bg-stone-800"
                aria-label="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Navigation Bottom Dock */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-stone-900/95 backdrop-blur-xl border-t border-stone-800/80 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-1.5 flex items-center justify-around shadow-2xl">
        {[
          { id: 'calculator', label: 'Calc', icon: Flame },
          { id: 'ddt', label: 'DDT Water', icon: Waves },
          { id: 'tracker', label: 'Active Bake', icon: Clock, hasPulse: activeSession.status === 'in_progress' },
          { id: 'bulk-o-matic', label: 'Bulk Cues', icon: Activity },
          { id: 'more', label: 'More', icon: MoreHorizontal, isMoreTrigger: true, isActive: ['recipe', 'log', 'references'].includes(currentTab) },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = item.isMoreTrigger ? item.isActive : currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.isMoreTrigger) {
                  setIsMoreOpen(true);
                } else {
                  setCurrentTab(item.id);
                  setIsMoreOpen(false);
                }
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all touch-manipulation min-w-[56px] ${
                isSelected
                  ? 'text-amber-400 bg-amber-500/10 font-bold'
                  : 'text-stone-400 active:text-stone-200 active:bg-stone-800/50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isSelected ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.hasPulse && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
                {item.isMoreTrigger && item.isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isSelected ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile "More" Drawer Bottom Sheet */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative bg-stone-900 border-t border-stone-800 rounded-t-3xl p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-stone-700 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-amber-100">More Baking Tools</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  TSJ 2024
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentTab('recipe');
                  setIsMoreOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  currentTab === 'recipe'
                    ? 'bg-amber-500/15 border-amber-500/50 text-white'
                    : 'bg-stone-800/80 border-stone-700 text-stone-200 active:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Recipe & Vessel Sizing</div>
                    <div className="text-xs text-stone-400">Scale loaves & Cambro container sizing</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentTab('log');
                  setIsMoreOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  currentTab === 'log'
                    ? 'bg-amber-500/15 border-amber-500/50 text-white'
                    : 'bg-stone-800/80 border-stone-700 text-stone-200 active:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <ScrollText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Baker's Notebook & Log</div>
                    <div className="text-xs text-stone-400">Past bakes, crumb outcomes & calibration</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentTab('references');
                  setIsMoreOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  currentTab === 'references'
                    ? 'bg-amber-500/15 border-amber-500/50 text-white'
                    : 'bg-stone-800/80 border-stone-700 text-stone-200 active:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Guides & Masterclasses</div>
                    <div className="text-xs text-stone-400">Tom Cucuzza's YouTube videos & research</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            {/* Quick Temp Unit in Sheet */}
            <div className="p-3 bg-stone-800/60 rounded-2xl border border-stone-700/60 flex items-center justify-between text-xs">
              <span className="text-stone-300 font-medium">Temperature Display Unit:</span>
              <div className="inline-flex rounded-lg p-1 bg-stone-900 border border-stone-700">
                <button
                  type="button"
                  onClick={() => setTempUnit('F')}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                    tempUnit === 'F' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                  }`}
                >
                  °F
                </button>
                <button
                  type="button"
                  onClick={() => setTempUnit('C')}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                    tempUnit === 'C' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                  }`}
                >
                  °C
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-stone-50 py-6 text-center text-xs text-stone-500 max-w-7xl w-full mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-stone-700">Ferment</span> — Based on the research and methodology of{' '}
            <a
              href="https://thesourdoughjourney.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 hover:underline font-medium"
            >
              The Sourdough Journey
            </a>{' '}
            by Tom Cucuzza © 2024.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://wasp.sh/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-stone-900 hover:underline"
            >
              Wasp Framework
            </a>
            <span>•</span>
            <span className="text-stone-600">Vercel Ready</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setCurrentTab('references')}
              className="text-amber-700 hover:underline"
            >
              Video Guides
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
