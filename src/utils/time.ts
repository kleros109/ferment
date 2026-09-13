/**
 * Time formatting helpers for the bake surface.
 *
 * The interval timer shows H:MM:SS once a bake passes the hour mark
 * (cold retard runs 8-20 hours), and MM:SS below it (fold rounds, steam).
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Wall-clock time a running deadline lands on, e.g. "14:32". */
export function formatClockTime(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** "4h 12m" style elapsed label for the session header. */
export function formatElapsed(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/**
 * Milliseconds since a session's "HH:MM" mix time. A bake that started before
 * midnight reports an hour later than noon, so a future timestamp rolls back a
 * day rather than showing negative elapsed time.
 */
export function elapsedSinceClockTime(clockTime: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(typeof clockTime === 'string' ? clockTime.trim() : '');
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  const now = new Date();
  const startedAt = new Date(now);
  startedAt.setHours(hours, minutes, 0, 0);
  if (startedAt.getTime() > now.getTime()) startedAt.setDate(startedAt.getDate() - 1);
  return now.getTime() - startedAt.getTime();
}
