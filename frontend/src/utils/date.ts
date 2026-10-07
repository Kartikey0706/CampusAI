const TIME_ZONE = "Asia/Kolkata";

export function formatComplaintDate(value?: string | Date | null) {
  if (!value) return "recently";

  const raw = value instanceof Date ? value.toISOString() : value.trim();
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
  const parsed = new Date(hasTimezone ? raw : `${raw}Z`);

  if (Number.isNaN(parsed.getTime())) return "recently";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(parsed);
}