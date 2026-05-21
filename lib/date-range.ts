import type { DateRange, RangePreset } from "@/lib/types";

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function fromDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function getTodayDateOnly() {
  return toDateOnly(new Date());
}

export function getRollingRange(preset: Exclude<RangePreset, "custom">): DateRange {
  const endDate = fromDateOnly(getTodayDateOnly());
  const daysBack = preset === "last-3-days" ? 2 : 6;
  const startDate = addDays(endDate, -daysBack);

  return {
    preset,
    start: toDateOnly(startDate),
    end: toDateOnly(endDate),
  };
}

export function normalizeDateRange(range: DateRange): DateRange {
  if (range.start <= range.end) {
    return range;
  }

  return {
    ...range,
    start: range.end,
    end: range.start,
  };
}

export function parseRangeFromSearchParams(
  params: Record<string, string | string[] | undefined>,
): DateRange {
  const rawPreset = first(params.preset);
  const preset: RangePreset =
    rawPreset === "custom" || rawPreset === "last-week" || rawPreset === "last-3-days"
      ? rawPreset
      : "last-3-days";

  if (preset !== "custom") {
    return getRollingRange(preset);
  }

  const fallback = getRollingRange("last-3-days");
  const start = first(params.start);
  const end = first(params.end);

  return normalizeDateRange({
    preset,
    start: start && DATE_ONLY_RE.test(start) ? start : fallback.start,
    end: end && DATE_ONLY_RE.test(end) ? end : fallback.end,
  });
}

export function listDateKeys(range: Pick<DateRange, "start" | "end">) {
  const keys: string[] = [];
  let cursor = fromDateOnly(range.start);
  const end = fromDateOnly(range.end);

  while (cursor <= end) {
    keys.push(toDateOnly(cursor));
    cursor = addDays(cursor, 1);
  }

  return keys;
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(fromDateOnly(date));
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
