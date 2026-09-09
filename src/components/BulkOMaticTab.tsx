import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Eye,
  Hand,
  Wind,
  Sparkles,
  AlertTriangle,
  Play,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { BULK_O_MATIC_CRITERIA } from '../data/sourdoughData';
import { BulkOMaticCriterion } from '../types';

interface BulkOMaticTabProps {
  onProceedToShape?: () => void;
}

export function BulkOMaticTab({ onProceedToShape }: BulkOMaticTabProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'visual' | 'tactile' | 'aroma'>('all');

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredCriteria = BULK_O_MATIC_CRITERIA.filter((c) => {
    if (activeCategory === 'all') return true;
    return c.category === activeCategory;
  });

  const score = checkedIds.length;
  const total = BULK_O_MATIC_CRITERIA.length;
  const scorePercent = Math.round((score / total) * 100);

  // Status diagnosis based on score
  const getStatus = () => {
    if (score >= 8) {
      return {
        label: 'Ready for Bulk Cutoff!',
        color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        barColor: 'bg-emerald-500',
        message: 'Your dough exhibits the key hallmarks of strong fermentation. Cut off bulk fermentation and shape!',
      };
    }
    if (score >= 5) {
      return {
        label: 'Approaching Peak (Developing)',
        color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
        barColor: 'bg-amber-500',
        message: 'Dough has substantial gas build-up but may need a bit more relaxation and bubble expansion.',
      };
    }
    return {
      label: 'Early / Still Developing',
      color: 'text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700',
      barColor: 'bg-stone-500',
      message: 'Gluten structure is still settling or yeast gas production is just getting started. Keep warm and wait.',
    };
  };

  const status = getStatus();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono mb-2 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              The Sourdough Journey Sensory System
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              The Bulk-O-Matic Guide: 9 Criteria for Perfect Dough
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-xl mt-1 leading-relaxed">
              When bulk fermenting warm dough (76°F–80°F / 24°C–27°C+), rise happens fast. Use Tom Cucuzza’s 9 visual, tactile, and aromatic sensory markers to confirm readiness before shaping.
            </p>
          </div>

          {/* Video Quick Link */}
          <a
            href="https://youtu.be/YdaBZfzT-QQ"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md w-full sm:w-auto min-h-[44px]"
          >
            <Play className="w-4 h-4 fill-current" />
            Watch Video (YouTube)
          </a>
        </div>

        {/* Live Scorecard Meter */}
        <div className="p-4 bg-stone-800/90 rounded-xl border border-stone-700/80 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] sm:text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Sensory Readiness Score
              </div>
              <div className="font-mono text-xl sm:text-2xl font-bold text-amber-400 mt-0.5">
                {score} <span className="text-xs sm:text-sm font-normal text-stone-400">/ {total} Criteria Met</span>
              </div>
            </div>
            {score > 0 && (
              <button
                type="button"
                onClick={() => setCheckedIds([])}
                className="text-stone-300 hover:text-white text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          <div className="w-full bg-stone-900 h-3 rounded-full overflow-hidden border border-stone-700">
            <div
              className={`h-full transition-all duration-300 ${status.barColor}`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>

          <div className={`p-3 rounded-lg border text-xs font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${status.color}`}>
            <span>{status.message}</span>
            <span className="font-bold font-mono uppercase tracking-wider text-[11px] shrink-0">{status.label}</span>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 min-h-[40px] ${
            activeCategory === 'all'
              ? 'bg-stone-900 dark:bg-amber-600 text-white shadow-sm'
              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
          }`}
        >
          All 9 Criteria
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('visual')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 min-h-[40px] ${
            activeCategory === 'visual'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Visual Cues
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('tactile')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 min-h-[40px] ${
            activeCategory === 'tactile'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
          }`}
        >
          <Hand className="w-3.5 h-3.5" />
          Tactile Cues
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('aroma')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 min-h-[40px] ${
            activeCategory === 'aroma'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          Aroma Cues
        </button>
      </div>

      {/* Interactive Criteria Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCriteria.map((criterion, index) => {
          const isChecked = checkedIds.includes(criterion.id);
          return (
            <div
              key={criterion.id}
              onClick={() => toggleCheck(criterion.id)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm relative active:scale-[0.99] touch-manipulation select-none ${
                isChecked
                  ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-400/40'
                  : 'bg-white dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-mono text-xs font-bold flex items-center justify-center border border-stone-200 dark:border-stone-600">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">{criterion.title}</h3>
                </div>
                <button
                  type="button"
                  className="text-amber-600 shrink-0 pointer-events-none"
                  aria-label="Toggle criteria"
                >
                  {isChecked ? (
                    <CheckCircle2 className="w-6 h-6 text-amber-600 fill-amber-100 dark:fill-amber-900/60" />
                  ) : (
                    <Circle className="w-6 h-6 text-stone-300 dark:text-stone-600" />
                  )}
                </button>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 mb-3 leading-relaxed">
                {criterion.description}
              </p>

              <div className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200/80 dark:border-stone-700 text-[11px] text-stone-700 dark:text-stone-300 space-y-1">
                <span className="font-semibold text-stone-900 dark:text-stone-100 block">How to check:</span>
                <p className="leading-normal">{criterion.instruction}</p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-stone-400 dark:text-stone-500">
                <span className="capitalize">{criterion.category} Cue</span>
                <span className="uppercase px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-medium">
                  {criterion.importance}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action CTA */}
      {score >= 8 && onProceedToShape && (
        <div className="p-5 bg-emerald-900 dark:bg-emerald-950 text-emerald-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg border border-emerald-800">
          <div>
            <div className="font-bold text-base text-white">Sensory Criteria Confirmed!</div>
            <div className="text-xs text-emerald-200">
              Your dough has passed the Bulk-O-Matic test and is ready to divide and preshape.
            </div>
          </div>
          <button
            type="button"
            onClick={onProceedToShape}
            className="w-full sm:w-auto px-6 py-3 bg-white text-emerald-950 font-bold rounded-xl text-sm hover:bg-emerald-50 active:scale-95 transition-all shrink-0 min-h-[48px] flex items-center justify-center shadow-sm"
          >
            Go to Active Bake Shape Step
          </button>
        </div>
      )}
    </div>
  );
}
