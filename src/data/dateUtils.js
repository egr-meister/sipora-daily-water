// Simple, stable date helpers. All dates are ISO-like "YYYY-MM-DD" strings.
// Everything is defensive: invalid input never throws.

const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad2(n) {
  const s = String(Math.abs(Math.trunc(n)));
  return s.length >= 2 ? s : "0" + s;
}

// Returns today's date as "YYYY-MM-DD" in local time.
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Validates an ISO-like date string. Accepts only real calendar dates.
export function isValidISODate(value) {
  if (typeof value !== "string") return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const dt = new Date(year, month - 1, day);
  return (
    dt.getFullYear() === year &&
    dt.getMonth() === month - 1 &&
    dt.getDate() === day
  );
}

// Safely parse an ISO date to a Date at local midnight. Returns null if invalid.
export function parseISO(value) {
  if (!isValidISODate(value)) return null;
  const [y, mo, d] = value.split("-").map(Number);
  return new Date(y, mo - 1, d);
}

// Add whole days to an ISO date. Falls back to today on invalid input.
export function addDays(value, days) {
  const base = parseISO(value) || parseISO(todayISO()) || new Date();
  const dt = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  dt.setDate(dt.getDate() + (Number(days) || 0));
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

// "Mon", "Tue"...
export function shortWeekday(value) {
  const dt = parseISO(value);
  if (!dt) return "--";
  return WEEKDAY_LABELS[dt.getDay()].slice(0, 3);
}

export function longWeekday(value) {
  const dt = parseISO(value);
  if (!dt) return "Unknown day";
  return WEEKDAY_LABELS[dt.getDay()];
}

// "Wed, Jul 3" style label
export function prettyDate(value) {
  const dt = parseISO(value);
  if (!dt) return "Invalid date";
  return `${WEEKDAY_LABELS[dt.getDay()].slice(0, 3)}, ${
    MONTH_LABELS[dt.getMonth()]
  } ${dt.getDate()}`;
}

// "July 3, 2026" style label
export function longDate(value) {
  const dt = parseISO(value);
  if (!dt) return "Invalid date";
  return `${MONTH_LABELS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

// Monday-based start of week for a given ISO date.
export function startOfWeekISO(value, weekStartsOn = "monday") {
  const dt = parseISO(value) || parseISO(todayISO());
  if (!dt) return todayISO();
  const day = dt.getDay(); // 0 Sun .. 6 Sat
  // For Monday start: shift so Monday = 0.
  const offset = weekStartsOn === "monday" ? (day + 6) % 7 : day;
  const start = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  start.setDate(start.getDate() - offset);
  return `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(
    start.getDate()
  )}`;
}

// Returns 7 ISO date strings for the week containing `value`.
export function weekDates(value, weekStartsOn = "monday") {
  const start = startOfWeekISO(value, weekStartsOn);
  const out = [];
  for (let i = 0; i < 7; i += 1) {
    out.push(addDays(start, i));
  }
  return out;
}

// Current local hour 0-23 (used for in-app reminders).
export function currentHour() {
  return new Date().getHours();
}

// A friendly "time of day" greeting label based on hour.
export function timeOfDayLabel(hour) {
  const h = Number.isFinite(hour) ? hour : currentHour();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}
