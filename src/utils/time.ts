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
 * Minutes since midnight for a mix time, in 24-hour "HH:MM" or 12-hour
 * "h:mm AM/PM" form, or null for input that is not a clock time.
 */
function parseClockTimeMinutes(clockTime: string): number | null {
  const match = /^(\d{1,2}):(\d{2})(?:\s*([AP])\.?\s*M\.?)?$/i.exec(
    typeof clockTime === 'string' ? clockTime.trim() : '',
  );
  if (!match) return null;
  const minutes = Number(match[2]);
  if (minutes > 59) return null;
  let hours = Number(match[1]);
  if (match[3]) {
    if (hours < 1 || hours > 12) return null;
    hours = (hours % 12) + (match[3].toUpperCase() === 'P' ? 12 : 0);
  } else if (hours > 23) {
    return null;
  }
  return hours * 60 + minutes;
}

/**
 * Milliseconds since a mix time today, looking back at most one day: a
 * future timestamp rolls back a day rather than showing negative elapsed.
 */
function elapsedSinceMidnight(minutes: number, now: Date): number {
  const startedAt = new Date(now);
  startedAt.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  if (startedAt.getTime() > now.getTime()) startedAt.setDate(startedAt.getDate() - 1);
  return now.getTime() - startedAt.getTime();
}

/**
 * Milliseconds since a session's mix, derived from its persisted mix date
 * and mix time. The date is the UTC calendar day the bake started on, while
 * the mix time is local wall-clock, so the mix instant is the moment inside
 * that UTC day whose local clock time matches — correct for bakes longer
 * than 24 hours. A timestamp in the future rolls back a day, and a missing
 * or unparseable date falls back to the same-day heuristic.
 */
export function elapsedSinceMix(date: string, mixTime: string): number | null {
  const minutes = parseClockTimeMinutes(mixTime);
  if (minutes === null) return null;
  const now = new Date();
  const parsedDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof date === 'string' ? date.trim() : '');
  if (parsedDate) {
    const year = Number(parsedDate[1]);
    const month = Number(parsedDate[2]) - 1;
    const day = Number(parsedDate[3]);
    const utcMidnight = Date.UTC(year, month, day);
    const asUtc = new Date(utcMidnight);
    if (asUtc.getUTCFullYear() === year && asUtc.getUTCMonth() === month && asUtc.getUTCDate() === day) {
      const mixInstant = (offsetMinutes: number) =>
        utcMidnight + ((((minutes + offsetMinutes) % 1440) + 1440) % 1440) * 60_000;
      let offset = now.getTimezoneOffset();
      let startedAt = mixInstant(offset);
      const offsetAtMix = new Date(startedAt).getTimezoneOffset();
      if (offsetAtMix !== offset) {
        startedAt = mixInstant(offsetAtMix);
      }
      if (startedAt > now.getTime()) startedAt -= 86_400_000;
      return now.getTime() - startedAt;
    }
  }
  return elapsedSinceMidnight(minutes, now);
}
