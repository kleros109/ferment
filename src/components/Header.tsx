import { Flame, BookOpen, Clock, Activity, ScrollText, Sparkles, Scale, Waves, Sun, Moon } from 'lucide-react';
import { TempUnit } from '../types';
import { SourdoughLoafLogo } from './SourdoughLoafLogo';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  tempUnit: TempUnit;
  setTempUnit: (unit: TempUnit) => void;
  hasActiveSession?: boolean;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export function Header({
  currentTab,
  setCurrentTab,
  tempUnit,
  setTempUnit,
  hasActiveSession,
  theme,
  setTheme,
}: HeaderProps) {
  const tabs = [
    { id: 'calculator', label: 'Calculator', icon: Flame },
    { id: 'ddt', label: 'DDT Water', icon: Waves },
    { id: 'tracker', label: 'Active Bake', icon: Clock },
    { id: 'bulk-o-matic', label: 'Bulk-O-Matic', icon: Activity },
    { id: 'recipe', label: 'Recipe & Vessel', icon: Scale },
    { id: 'log', label: 'Baking Log', icon: ScrollText },
    { id: 'references', label: 'References', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-amber-900/30 text-stone-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentTab('calculator')}>
            <SourdoughLoafLogo className="w-10 h-10 ring-1 ring-amber-400/40 group-hover:border-amber-400/60 transition-colors" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight text-amber-100 group-hover:text-amber-300 transition-colors">
                  Ferment
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                The Sourdough Journey • Temperature & % Rise System
              </p>
            </div>
          </div>

          {/* Controls: Theme Switcher, Temp Unit Switcher & Quick Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            {hasActiveSession && (
              <button
                type="button"
                onClick={() => setCurrentTab('tracker')}
                className="flex md:hidden items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 animate-pulse shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Live Bake</span>
              </button>
            )}

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-stone-800/90 border border-stone-700/60 text-amber-400 hover:text-amber-300 hover:bg-stone-700/80 transition-all touch-manipulation shadow-inner"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-300" />
              )}
            </button>

            <div className="inline-flex rounded-lg p-1 bg-stone-800/90 border border-stone-700/60 shadow-inner">
              <button
                type="button"
                onClick={() => setTempUnit('F')}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-all touch-manipulation ${
                  tempUnit === 'F'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                °F
              </button>
              <button
                type="button"
                onClick={() => setTempUnit('C')}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-all touch-manipulation ${
                  tempUnit === 'C'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                °C
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCurrentTab('tracker')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                hasActiveSession
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${hasActiveSession ? 'bg-emerald-400' : 'bg-stone-500'}`} />
              {hasActiveSession ? 'Active Session Running' : 'Start New Bake'}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Mobile uses dedicated bottom nav) */}
        <nav className="hidden md:flex items-center space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-stone-800/60 text-xs sm:text-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'tracker' && hasActiveSession && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
