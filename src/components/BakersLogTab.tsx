import { useState } from 'react';
import {
  ScrollText,
  Calendar,
  Thermometer,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  Trash2,
  Copy,
  Check,
  Plus
} from 'lucide-react';
import { BakeSession, TempUnit } from '../types';
import { fahrenheitToCelsius } from '../utils/fermentCalculations';

interface BakersLogTabProps {
  logs: BakeSession[];
  onSelectSessionToEdit: (session: BakeSession) => void;
  onDeleteSession: (id: string) => void;
  onCalibrateNewBake: (previousSession: BakeSession) => void;
  tempUnit: TempUnit;
}

export function BakersLogTab({
  logs,
  onSelectSessionToEdit,
  onDeleteSession,
  onCalibrateNewBake,
  tempUnit,
}: BakersLogTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(logs[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCopyMarkdown = (session: BakeSession) => {
    const text = `# Sourdough Journey Baking Worksheet
Date: ${session.date}
Recipe: ${session.title}
Flour: ${session.totalFlourWeight}g (${session.flour1Name}: ${session.flour1Weight}g, ${session.flour2Name}: ${session.flour2Weight}g)
Water: ${session.waterWeight}g
Starter: ${session.starterWeight}g
Salt: ${session.saltWeight}g
Hydration: ${session.calculatedHydration}%

TWO-FACTOR MEASUREMENTS:
Dough Temperature: ${session.endingDoughTemp}°F (${fahrenheitToCelsius(session.endingDoughTemp)}°C)
Starting Volume: ${session.startingVolumeMl} mL
Target % Rise: +${session.targetRisePercent}%
Target Volume: ${session.targetVolumeMl} mL
Actual Ending Volume: ${session.actualEndingVolumeMl || 'N/A'} mL

HANDLING:
${session.handlingRounds.map((r) => `- Round ${r.roundNumber} (${r.time}): ${r.type} at ${r.doughTemp || session.endingDoughTemp}°F`).join('\n')}

PROOF & BAKE:
Cold Retard: ${session.coldRetardHours || 14} hours in fridge
Bake: 500°F Preheat, 450°F (20m lid on, 20m lid off)

ASSESSMENT:
Outcome: ${session.crumbOutcome || 'Not assessed'}
Notes: ${session.crumbNotes || 'None'}
Calibration: ${session.calibrationAdjustmentPercent ? `${session.calibrationAdjustmentPercent > 0 ? '+' : ''}${session.calibrationAdjustmentPercent}% on next bake` : 'None'}
`;
    navigator.clipboard.writeText(text);
    setCopiedId(session.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono border border-amber-500/30">
              <ScrollText className="w-3.5 h-3.5" />
              Appendices 2 & 3 Digital Worksheet
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
              Baker's Notebook & Calibration Log
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Once you dial in the optimal percentage rise for a recipe and dough temperature, it <span className="text-amber-300 font-semibold italic">never changes</span>. Keep meticulous records to make every bake repeatable.
            </p>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-sm space-y-3">
            <ScrollText className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-bold text-stone-800 text-base">No Bakes Recorded Yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Complete your first bake in the Active Bake tab or duplicate Tom Cucuzza's sample worksheet to explore.
            </p>
          </div>
        ) : (
          logs.map((session) => {
            const isExpanded = expandedId === session.id;
            const outcomeColor =
              session.crumbOutcome === 'perfect'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : session.crumbOutcome === 'underproofed'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-rose-100 text-rose-800 border-rose-300';

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all"
              >
                {/* Collapsed Header */}
                <div
                  onClick={() => toggleExpand(session.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/70"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100/70 border border-amber-200 text-amber-900 flex items-center justify-center font-bold text-sm">
                      #{session.id.slice(-2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-stone-900 text-base">{session.title}</h3>
                        {session.crumbOutcome && (
                          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${outcomeColor}`}>
                            {session.crumbOutcome}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-500 font-mono mt-0.5">
                        <span>{session.date}</span>
                        <span>•</span>
                        <span>
                          {tempUnit === 'F' ? `${session.endingDoughTemp}°F` : `${fahrenheitToCelsius(session.endingDoughTemp)}°C`}
                        </span>
                        <span>•</span>
                        <span>Target: +{session.targetRisePercent}% ({session.targetVolumeMl} mL)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto mt-2 sm:mt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCalibrateNewBake(session);
                      }}
                      className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 min-h-[40px]"
                      title="Calibrate next bake based on these results"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      Calibrate Next Bake
                    </button>
                    <div className="p-2 text-stone-400">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-stone-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-stone-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Full Worksheet View (Matching Appendix 2) */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-stone-200 bg-stone-50/50 space-y-6">
                    {/* Ingredients Breakdown */}
                    <div>
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        Ingredients & Formula
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                        <div className="p-2.5 bg-white rounded-lg border border-stone-200">
                          <span className="text-[10px] text-stone-400 block">{session.flour1Name || 'Flour 1'}</span>
                          <span className="font-bold text-stone-800">{session.flour1Weight}g (90%)</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-stone-200">
                          <span className="text-[10px] text-stone-400 block">{session.flour2Name || 'Flour 2'}</span>
                          <span className="font-bold text-stone-800">{session.flour2Weight}g (10%)</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-stone-200">
                          <span className="text-[10px] text-stone-400 block">Water / Hydration</span>
                          <span className="font-bold text-stone-800">{session.waterWeight}g ({session.calculatedHydration}%)</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-stone-200">
                          <span className="text-[10px] text-stone-400 block">Starter / Leaven</span>
                          <span className="font-bold text-stone-800">{session.starterWeight}g (20%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Fermentation Protocol Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-stone-200">
                        <div className="text-[10px] text-stone-400 uppercase font-mono">Initial Volume</div>
                        <div className="text-base font-bold text-stone-900 font-mono mt-0.5">
                          {session.startingVolumeMl} mL
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">Mixed at {session.mixTime}</div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-stone-200">
                        <div className="text-[10px] text-stone-400 uppercase font-mono">Cutoff Target</div>
                        <div className="text-base font-bold text-amber-700 font-mono mt-0.5">
                          +{session.targetRisePercent}% ({session.targetVolumeMl} mL)
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Ending temp: {session.endingDoughTemp}°F
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-stone-200">
                        <div className="text-[10px] text-stone-400 uppercase font-mono">Cold Retard & Bake</div>
                        <div className="text-base font-bold text-sky-800 font-mono mt-0.5">
                          {session.coldRetardHours || 14}h in fridge
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">450°F (20m lid on, 20m off)</div>
                      </div>
                    </div>

                    {/* Handling Rounds Log */}
                    {session.handlingRounds.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                          Handling & Fold Rounds
                        </h4>
                        <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden bg-white text-xs">
                          {session.handlingRounds.map((rd) => (
                            <div key={rd.id} className="p-2.5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-stone-400">Round {rd.roundNumber}:</span>
                                <span className="font-semibold text-stone-800">{rd.type}</span>
                                {rd.notes && <span className="text-stone-500 italic">({rd.notes})</span>}
                              </div>
                              <div className="font-mono text-stone-600">
                                {rd.time} {rd.doughTemp ? `• ${rd.doughTemp}°F` : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assessment & Calibration Notes */}
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1.5">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-700" />
                        Crumb Assessment & Calibration Notes:
                      </div>
                      <p className="text-stone-800 leading-relaxed font-sans">
                        {session.crumbNotes || 'No specific notes recorded for this bake.'}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/60">
                      <button
                        type="button"
                        onClick={() => handleCopyMarkdown(session)}
                        className="px-4 py-2.5 bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 min-h-[40px]"
                      >
                        {copiedId === session.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Copied Markdown
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-500" />
                            Copy Worksheet
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteSession(session.id)}
                        className="px-3 py-2 text-rose-600 hover:text-rose-700 text-xs font-medium flex items-center gap-1.5 active:scale-95 min-h-[40px] rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Log
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
