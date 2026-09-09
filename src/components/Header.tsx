import { Flame, BookOpen, Clock, Activity, ScrollText, Scale, Waves, Sun, Moon } from 'lucide-react';
import { TempUnit } from '../types';
import { SourdoughLoafLogo } from './SourdoughLoafLogo';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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
    <header className="sticky top-0 z-40 bg-stone-50/95 dark:bg-stone-950/90 backdrop-blur-xl border-b border-stone-200/80 dark:border-stone-800/60 text-stone-900 dark:text-stone-100 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <button
            type="button"
            className="flex items-center gap-3 cursor-pointer group text-left transition-transform active:scale-[0.98] focus:outline-none"
            onClick={() => setCurrentTab('calculator')}
          >
            <div className="relative">
              <SourdoughLoafLogo className="w-10 h-10 ring-1 ring-amber-500/40 group-hover:ring-amber-500 transition-all rounded-xl shadow-xs" />
              {hasActiveSession && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-stone-50 dark:ring-stone-900" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight text-stone-900 dark:text-amber-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                  Ferment
                </span>
                <span className="hidden lg:inline-flex text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                The Sourdough Journey • Two-Factor Fermentation System
              </p>
            </div>
          </button>

          {/* Controls: Theme Switcher, Temp Unit Switcher & Quick Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            {hasActiveSession && (
              <Badge
                variant="emerald"
                pulseDot
                onClick={() => setCurrentTab('tracker')}
                className="flex md:hidden cursor-pointer active:scale-95 transition-transform text-[11px] py-1 px-2.5"
              >
                Live Bake
              </Badge>
            )}

            {/* Dark / Light Mode Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-xl bg-white hover:bg-stone-100 border-stone-200 text-stone-700 dark:bg-stone-900/90 dark:hover:bg-stone-850 dark:border-stone-800 dark:text-amber-400 shadow-xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 transition-transform duration-200 hover:rotate-45 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 transition-transform duration-200 hover:-rotate-12 text-stone-700" />
              )}
            </Button>

            {/* Temperature Unit Segmented Control */}
            <div className="inline-flex rounded-xl p-0.5 bg-stone-200/70 dark:bg-stone-900 border border-stone-300/80 dark:border-stone-800 shadow-inner">
              <button
                type="button"
                onClick={() => setTempUnit('F')}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition-all touch-manipulation cursor-pointer ${
                  tempUnit === 'F'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                °F
              </button>
              <button
                type="button"
                onClick={() => setTempUnit('C')}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition-all touch-manipulation cursor-pointer ${
                  tempUnit === 'C'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                °C
              </button>
            </div>

            {/* Active Session Status / Start Action */}
            <Button
              variant={hasActiveSession ? 'amber' : 'outline'}
              size="sm"
              onClick={() => setCurrentTab('tracker')}
              className={`hidden md:flex items-center gap-2 rounded-xl text-xs font-medium border ${
                hasActiveSession
                  ? 'bg-emerald-100/80 hover:bg-emerald-200/80 border-emerald-300 text-emerald-900 dark:bg-emerald-950/70 dark:border-emerald-500/60 dark:text-emerald-300 dark:hover:bg-emerald-900/80'
                  : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800 dark:border-stone-700 dark:text-stone-300'
              }`}
            >
              {hasActiveSession ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Active Session Running</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Start New Bake</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Mobile uses dedicated bottom nav) */}
        <nav className="hidden md:flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-2 border-t border-stone-200/80 dark:border-stone-800/40 text-xs sm:text-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/40 shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'tracker' && hasActiveSession && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
