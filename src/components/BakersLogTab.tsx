import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  ScrollText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  Upload,
  Trash2,
  Copy,
  Check,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { BakeSession, TempUnit } from '../types';
import { fahrenheitToCelsius } from '../utils/fermentCalculations';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

interface BakersLogTabProps {
  logs: BakeSession[];
  onSelectSessionToEdit: (session: BakeSession) => void;
  onDeleteSession: (id: string) => void;
  onCalibrateNewBake: (previousSession: BakeSession) => void;
  tempUnit: TempUnit;
  onExportLogs: () => void;
  onImportLogs: (sessions: BakeSession[]) => void;
}

export function BakersLogTab({
  logs,
  onDeleteSession,
  onCalibrateNewBake,
  tempUnit,
  onExportLogs,
  onImportLogs,
}: BakersLogTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(logs[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completedLogs = useMemo(
    () => logs.filter((s) => s.crumbOutcome && s.status === 'completed'),
    [logs]
  );

  const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const sessions: unknown = Array.isArray(parsed) ? parsed : parsed?.sessions;
        if (!Array.isArray(sessions)) {
          setImportError('File does not contain a Ferment bake log.');
          setTimeout(() => setImportError(null), 5000);
          return;
        }
        const valid = sessions.filter(
          (s): s is BakeSession =>
            !!s && typeof s === 'object' && typeof (s as BakeSession).id === 'string' && typeof (s as BakeSession).date === 'string'
        );
        if (valid.length === 0) {
          setImportError('No valid bake sessions found in file.');
          setTimeout(() => setImportError(null), 5000);
          return;
        }
        onImportLogs(valid);
      } catch {
        setImportError('Could not read file as JSON.');
        setTimeout(() => setImportError(null), 5000);
      }
    };
    reader.readAsText(file);
  };

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
      <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-sm dark:shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="mb-2">
              <Badge variant="amber" className="gap-1.5">
                <ScrollText className="w-3.5 h-3.5" />
                Appendices 2 & 3 Digital Worksheet
              </Badge>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-1">
              Baker's Notebook & Calibration Log
            </h1>
            <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Once you dial in the optimal percentage rise for a recipe and dough temperature, it <span className="text-amber-700 dark:text-amber-300 font-semibold italic">never changes</span>. Keep meticulous records to make every bake repeatable.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onExportLogs}
              className="gap-1.5 text-xs font-semibold"
              title="Download all bakes as JSON backup"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              Backup
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5 text-xs font-semibold"
              title="Restore bakes from a JSON backup"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              Restore
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>

        {importError && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Calibration Insights */}
      <CalibrationInsights logs={completedLogs} tempUnit={tempUnit} />

      {/* Logs List */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <Card className="p-12 text-center border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
            <ScrollText className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
            <CardTitle className="font-bold text-stone-800 dark:text-stone-200 text-base">No Bakes Recorded Yet</CardTitle>
            <CardDescription className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Complete your first bake in the Active Bake tab or duplicate Tom Cucuzza's sample worksheet to explore.
            </CardDescription>
          </Card>
        ) : (
          logs.map((session) => {
            const isExpanded = expandedId === session.id;
            const badgeVariant =
              session.crumbOutcome === 'perfect'
                ? 'emerald'
                : session.crumbOutcome === 'underproofed'
                ? 'amber'
                : 'destructive';

            return (
              <Card
                key={session.id}
                className="border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden transition-all"
              >
                {/* Collapsed Header */}
                <div
                  onClick={() => toggleExpand(session.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold text-sm">
                      #{session.id.slice(-2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-stone-900 dark:text-white text-base">{session.title}</h3>
                        {session.crumbOutcome && (
                          <Badge variant={badgeVariant} className="text-[10px] uppercase font-mono">
                            {session.crumbOutcome}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 font-mono mt-0.5">
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
                    <Button
                      type="button"
                      variant="amber"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCalibrateNewBake(session);
                      }}
                      className="gap-1.5 text-xs font-semibold"
                      title="Calibrate next bake based on these results"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Calibrate Next Bake
                    </Button>
                    <div className="p-2 text-stone-400 dark:text-stone-500">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Full Worksheet View (Matching Appendix 2) */}
                {isExpanded && (
                  <CardContent className="p-5 sm:p-6 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 space-y-6">
                    {/* Ingredients Breakdown */}
                    <div>
                      <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                        Ingredients & Formula
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                        <div className="p-2.5 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 block">{session.flour1Name || 'Flour 1'}</span>
                          <span className="font-bold text-stone-800 dark:text-stone-100">{session.flour1Weight}g (90%)</span>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 block">{session.flour2Name || 'Flour 2'}</span>
                          <span className="font-bold text-stone-800 dark:text-stone-100">{session.flour2Weight}g (10%)</span>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 block">Water / Hydration</span>
                          <span className="font-bold text-stone-800 dark:text-stone-100">{session.waterWeight}g ({session.calculatedHydration}%)</span>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 block">Starter / Leaven</span>
                          <span className="font-bold text-stone-800 dark:text-stone-100">{session.starterWeight}g (20%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Fermentation Protocol Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                        <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-mono">Initial Volume</div>
                        <div className="text-base font-bold text-stone-900 dark:text-stone-100 font-mono mt-0.5">
                          {session.startingVolumeMl} mL
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Mixed at {session.mixTime}</div>
                      </div>

                      <div className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                        <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-mono">Cutoff Target</div>
                        <div className="text-base font-bold text-amber-700 dark:text-amber-400 font-mono mt-0.5">
                          +{session.targetRisePercent}% ({session.targetVolumeMl} mL)
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          Ending temp: {session.endingDoughTemp}°F
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                        <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-mono">Cold Retard & Bake</div>
                        <div className="text-base font-bold text-sky-800 dark:text-sky-300 font-mono mt-0.5">
                          {session.coldRetardHours || 14}h in fridge
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">450°F (20m lid on, 20m off)</div>
                      </div>
                    </div>

                    {/* Handling Rounds Log */}
                    {session.handlingRounds.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                          Handling & Fold Rounds
                        </h4>
                        <div className="divide-y divide-stone-200 dark:divide-stone-700 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden bg-white dark:bg-stone-800 text-xs">
                          {session.handlingRounds.map((rd) => (
                            <div key={rd.id} className="p-2.5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-stone-400 dark:text-stone-500">Round {rd.roundNumber}:</span>
                                <span className="font-semibold text-stone-800 dark:text-stone-200">{rd.type}</span>
                                {rd.notes && <span className="text-stone-500 dark:text-stone-400 italic">({rd.notes})</span>}
                              </div>
                              <div className="font-mono text-stone-600 dark:text-stone-400">
                                {rd.time} {rd.doughTemp ? `• ${rd.doughTemp}°F` : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assessment & Calibration Notes */}
                    <Alert variant="amber">
                      <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      <div>
                        <div className="font-bold text-amber-950 dark:text-amber-200 mb-1">
                          Crumb Assessment & Calibration Notes:
                        </div>
                        <p className="text-stone-800 dark:text-stone-200 leading-relaxed font-sans text-xs">
                          {session.crumbNotes || 'No specific notes recorded for this bake.'}
                        </p>
                      </div>
                    </Alert>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyMarkdown(session)}
                        className="gap-1.5"
                      >
                        {copiedId === session.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Copied Markdown
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                            Copy Worksheet
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSession(session.id)}
                        className="text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Log
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

interface CalibrationInsightsProps {
  logs: BakeSession[];
  tempUnit: TempUnit;
}

function CalibrationInsights({ logs, tempUnit }: CalibrationInsightsProps) {
  if (logs.length === 0) {
    return null;
  }

  const outcomeCount = { perfect: 0, underproofed: 0, overproofed: 0 } as Record<string, number>;
  for (const s of logs) {
    if (s.crumbOutcome) outcomeCount[s.crumbOutcome] += 1;
  }
  const total = logs.length;
  const perfectRate = Math.round((outcomeCount.perfect / total) * 100);

  // Group by ending dough temp (F) and compute the best (latest) calibrated target
  const byTempF = new Map<number, { count: number; latestTarget: number; latestDate: string; latestOutcome: string }>();
  for (const s of [...logs].sort((a, b) => (a.date < b.date ? -1 : 1))) {
    const key = Math.round(s.endingDoughTemp);
    const entry = byTempF.get(key) ?? { count: 0, latestTarget: s.targetRisePercent, latestDate: s.date, latestOutcome: s.crumbOutcome ?? '' };
    entry.count += 1;
    entry.latestTarget = s.targetRisePercent;
    entry.latestDate = s.date;
    entry.latestOutcome = s.crumbOutcome ?? '';
    byTempF.set(key, entry);
  }
  const tempRows = [...byTempF.entries()].sort((a, b) => a[0] - b[0]);

  return (
    <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
      <CardHeader className="p-5 sm:p-6 pb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <CardTitle className="font-bold text-stone-900 dark:text-white text-sm uppercase tracking-wider">Calibration Insights</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700">
            <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-mono">Completed Bakes</div>
            <div className="text-lg font-bold text-stone-900 dark:text-stone-100 font-mono mt-0.5">{total}</div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-mono">Perfect</div>
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 font-mono mt-0.5">{outcomeCount.perfect} ({perfectRate}%)</div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
            <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-mono">Underproofed</div>
            <div className="text-lg font-bold text-amber-800 dark:text-amber-300 font-mono mt-0.5">{outcomeCount.underproofed}</div>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800">
            <div className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-mono">Overproofed</div>
            <div className="text-lg font-bold text-rose-800 dark:text-rose-300 font-mono mt-0.5">{outcomeCount.overproofed}</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] text-stone-400 dark:text-stone-500 uppercase font-mono border-b border-stone-200 dark:border-stone-700">
                <th className="py-2 pr-3">Ending Temp</th>
                <th className="py-2 pr-3">Bakes</th>
                <th className="py-2 pr-3">Latest Target Rise</th>
                <th className="py-2 pr-3">Latest Outcome</th>
                <th className="py-2">Suggested Next</th>
              </tr>
            </thead>
            <tbody>
              {tempRows.map(([tempF, row]) => {
                const suggested =
                  row.latestOutcome === 'underproofed'
                    ? row.latestTarget + 10
                    : row.latestOutcome === 'overproofed'
                    ? Math.max(20, row.latestTarget - 10)
                    : row.latestTarget;
                return (
                  <tr key={tempF} className="border-b border-stone-100 dark:border-stone-800 last:border-0">
                    <td className="py-2 pr-3 font-mono font-bold text-stone-800 dark:text-stone-200">
                      {tempUnit === 'F' ? `${tempF}°F` : `${fahrenheitToCelsius(tempF)}°C`}
                    </td>
                    <td className="py-2 pr-3 font-mono text-stone-600 dark:text-stone-400">{row.count}</td>
                    <td className="py-2 pr-3 font-mono text-amber-700 dark:text-amber-400 font-bold">+{row.latestTarget}%</td>
                    <td className="py-2 pr-3 font-mono text-stone-600 dark:text-stone-400">{row.latestOutcome || '—'}</td>
                    <td className="py-2 font-mono font-bold text-emerald-700 dark:text-emerald-400">+{suggested}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-3 italic">
          Suggested next target follows the ±10% calibration rule from your latest bake at each ending dough temperature. Same temp + same target = repeatable loaf.
        </p>
      </CardContent>
    </Card>
  );
}
