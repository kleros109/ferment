import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CalculatorTab } from './components/CalculatorTab';
import { ActiveTrackerTab } from './components/ActiveTrackerTab';
import { BulkOMaticTab } from './components/BulkOMaticTab';
import { RecipeTab } from './components/RecipeTab';
import { BakersLogTab } from './components/BakersLogTab';
import { ReferencesTab } from './components/ReferencesTab';
import { BakeSession, TempUnit } from './types';
import { getGuideForTemperature, calculateTargetVolume } from './utils/fermentCalculations';

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
  const [currentTab, setCurrentTab] = useState<string>('calculator');
  const [tempUnit, setTempUnit] = useState<TempUnit>('F');

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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-16">
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

      {/* Mobile Sticky Navigation Bottom Bar for one-thumb switching */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 px-2 py-1.5 flex items-center justify-around text-[10px] text-stone-400">
        <button
          type="button"
          onClick={() => setCurrentTab('calculator')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg ${
            currentTab === 'calculator' ? 'text-amber-400 font-bold' : 'text-stone-400'
          }`}
        >
          <span>Calculator</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('tracker')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg ${
            currentTab === 'tracker' ? 'text-amber-400 font-bold' : 'text-stone-400'
          }`}
        >
          <span>Active Bake</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('bulk-o-matic')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg ${
            currentTab === 'bulk-o-matic' ? 'text-amber-400 font-bold' : 'text-stone-400'
          }`}
        >
          <span>Bulk-O-Matic</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('log')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg ${
            currentTab === 'log' ? 'text-amber-400 font-bold' : 'text-stone-400'
          }`}
        >
          <span>Log</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('references')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg ${
            currentTab === 'references' ? 'text-amber-400 font-bold' : 'text-stone-400'
          }`}
        >
          <span>References</span>
        </button>
      </div>

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
