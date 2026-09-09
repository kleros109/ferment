import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Eye,
  Hand,
  Wind,
  Sparkles,
  Play,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BULK_O_MATIC_CRITERIA } from '../data/sourdoughData';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface BulkOMaticTabProps {
  onProceedToShape?: () => void;
}

export function BulkOMaticTab({ onProceedToShape }: BulkOMaticTabProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'visual' | 'tactile' | 'aroma'>('all');

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) =>
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
        badgeVariant: 'emerald' as const,
        indicatorColor: 'bg-emerald-500',
        message: 'Your dough exhibits the key hallmarks of strong fermentation. Cut off bulk fermentation and shape!',
      };
    }
    if (score >= 5) {
      return {
        label: 'Approaching Peak (Developing)',
        color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
        badgeVariant: 'amber' as const,
        indicatorColor: 'bg-amber-500',
        message: 'Dough has substantial gas build-up but may need a bit more relaxation and bubble expansion.',
      };
    }
    return {
      label: 'Early / Still Developing',
      color: 'text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700',
      badgeVariant: 'secondary' as const,
      indicatorColor: 'bg-stone-500',
      message: 'Gluten structure is still settling or yeast gas production is just getting started. Keep warm and wait.',
    };
  };

  const status = getStatus();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Compact Scorecard Header */}
      <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl p-4 sm:p-5 border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              Bulk Readiness (9 Criteria)
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://youtu.be/YdaBZfzT-QQ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 flex items-center gap-1.5 font-medium"
            >
              <Play className="w-3.5 h-3.5 text-red-500 fill-current" />
              <span className="hidden sm:inline">Guide Video</span>
            </a>
            {score > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCheckedIds([])}
                className="text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white border-stone-300 dark:border-stone-700 bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-xs gap-1 h-7 px-2.5"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Live Scorecard Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
              {score} of {total} Criteria Met
            </span>
            <Badge variant={status.badgeVariant} className="font-mono uppercase tracking-wider text-[10px] py-0">
              {status.label}
            </Badge>
          </div>
          <Progress value={scorePercent} className="h-2 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700" indicatorClassName={status.indicatorColor} />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <Button
          type="button"
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('all')}
          className="text-xs font-semibold shrink-0 h-8"
        >
          All 9 Criteria
        </Button>
        <Button
          type="button"
          variant={activeCategory === 'visual' ? 'amber' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('visual')}
          className="text-xs font-semibold shrink-0 gap-1.5 h-8"
        >
          <Eye className="w-3.5 h-3.5" />
          Visual Cues
        </Button>
        <Button
          type="button"
          variant={activeCategory === 'tactile' ? 'amber' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('tactile')}
          className="text-xs font-semibold shrink-0 gap-1.5 h-8"
        >
          <Hand className="w-3.5 h-3.5" />
          Tactile Cues
        </Button>
        <Button
          type="button"
          variant={activeCategory === 'aroma' ? 'amber' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('aroma')}
          className="text-xs font-semibold shrink-0 gap-1.5 h-8"
        >
          <Wind className="w-3.5 h-3.5" />
          Aroma Cues
        </Button>
      </div>

      {/* Interactive Criteria Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredCriteria.map((criterion, index) => {
          const isChecked = checkedIds.includes(criterion.id);
          const isExpanded = expandedIds.includes(criterion.id);
          return (
            <Card
              key={criterion.id}
              onClick={() => toggleCheck(criterion.id)}
              className={`p-3.5 sm:p-4 transition-all cursor-pointer shadow-sm relative active:scale-[0.99] touch-manipulation select-none border-2 ${
                isChecked
                  ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-400/40'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-stone-200 dark:border-stone-700">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm truncate">{criterion.title}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="uppercase text-[10px] px-1.5 py-0 capitalize">
                    {criterion.category}
                  </Badge>
                  <div className="text-amber-600 pointer-events-none">
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-amber-600 fill-amber-100 dark:fill-amber-900/60" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-300 dark:text-stone-600" />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs gap-2">
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1 flex-1">
                  {criterion.description}
                </p>
                <button
                  type="button"
                  onClick={(e) => toggleExpand(criterion.id, e)}
                  className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-semibold cursor-pointer shrink-0 py-0.5 px-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <span>{isExpanded ? 'Hide' : 'Check'}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-2.5 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-700/60 text-[11px] text-stone-700 dark:text-stone-300 space-y-1">
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block">How to check:</span>
                  <p className="leading-relaxed">{criterion.instruction}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Action CTA */}
      {score >= 8 && onProceedToShape && (
        <div className="p-5 bg-emerald-900 dark:bg-emerald-950 text-emerald-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg border border-emerald-800">
          <div>
            <div className="font-bold text-base text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              Sensory Criteria Confirmed!
            </div>
            <div className="text-xs text-emerald-200 mt-0.5">
              Your dough has passed the Bulk-O-Matic test and is ready to divide and preshape.
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={onProceedToShape}
            className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-emerald-950 font-bold shrink-0 min-h-[44px]"
          >
            Go to Active Bake Shape Step
          </Button>
        </div>
      )}
    </div>
  );
}
