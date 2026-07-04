// Pure water-domain logic: totals, records, weekly stats, reminders, streaks.
// Every function is defensive and never throws on missing / malformed data.

import {
  SECTIONS,
  DEFAULT_GOAL_ML,
  REMINDER_HOURS,
  makeDefaultReminderSettings,
} from "./defaults";
import {
  todayISO,
  isValidISODate,
  weekDates,
  currentHour,
  longWeekday,
} from "./dateUtils";

let idCounter = 0;

// Simple, dependency-free unique id.
export function makeId(prefix = "id") {
  idCounter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${idCounter}_${rand}`;
}

export function safeAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

export function isValidSection(section) {
  return SECTIONS.indexOf(section) !== -1;
}

export function safeSection(section) {
  return isValidSection(section) ? section : "Morning";
}

// --- Record helpers -------------------------------------------------------

export function makeEmptyRecord(date, dailyGoalMlUsed = DEFAULT_GOAL_ML) {
  const now = new Date().toISOString();
  const safeDate = isValidISODate(date) ? date : todayISO();
  return {
    id: makeId("day"),
    date: safeDate,
    entries: [],
    note: "",
    dailyGoalMlUsed: Math.max(1, Number(dailyGoalMlUsed) || DEFAULT_GOAL_ML),
    createdAt: now,
    updatedAt: now,
  };
}

export function findRecord(records, date) {
  const list = Array.isArray(records) ? records : [];
  return list.find((r) => r && r.date === date) || null;
}

export function getEntries(record) {
  return record && Array.isArray(record.entries) ? record.entries : [];
}

// Total ml for a single section within a record.
export function sectionTotal(record, section) {
  const entries = getEntries(record);
  return entries.reduce((sum, e) => {
    if (!e) return sum;
    if (safeSection(e.section) !== section) return sum;
    return sum + safeAmount(e.amountMl);
  }, 0);
}

// Total ml for a whole day record.
export function dayTotal(record) {
  const entries = getEntries(record);
  return entries.reduce((sum, e) => sum + safeAmount(e && e.amountMl), 0);
}

export function sectionTotals(record) {
  return {
    Morning: sectionTotal(record, "Morning"),
    Afternoon: sectionTotal(record, "Afternoon"),
    Evening: sectionTotal(record, "Evening"),
  };
}

export function goalForRecord(record, fallbackGoal = DEFAULT_GOAL_ML) {
  const g = Number(record && record.dailyGoalMlUsed);
  if (Number.isFinite(g) && g > 0) return g;
  const fb = Number(fallbackGoal);
  return Number.isFinite(fb) && fb > 0 ? fb : DEFAULT_GOAL_ML;
}

// Progress capped at 1 for visuals; caller can still read the raw total.
export function progressRatio(total, goal) {
  const g = Math.max(1, Number(goal) || DEFAULT_GOAL_ML);
  const t = safeAmount(total);
  return Math.min(t / g, 1);
}

export function goalReached(record, fallbackGoal = DEFAULT_GOAL_ML) {
  return dayTotal(record) >= goalForRecord(record, fallbackGoal);
}

// Human-friendly progress line, e.g. "850 of 2000 ml".
export function progressLabel(total, goal) {
  const t = safeAmount(total);
  const g = Math.max(1, Number(goal) || DEFAULT_GOAL_ML);
  return `${t} of ${g} ml`;
}

export function percentLabel(total, goal) {
  const t = safeAmount(total);
  const g = Math.max(1, Number(goal) || DEFAULT_GOAL_ML);
  if (t <= 0) return "No water logged yet";
  if (t >= g) return "Goal reached";
  const pct = Math.round((t / g) * 100);
  return `${pct}% of today's goal`;
}

// Format ml, showing liters for large totals.
export function formatMl(ml) {
  const n = safeAmount(ml);
  return `${n} ml`;
}

export function formatLiters(ml) {
  const n = safeAmount(ml);
  return `${(n / 1000).toFixed(1)} L`;
}

// --- Weekly overview ------------------------------------------------------

export function weeklyStats(records, referenceDate, settings) {
  const weekStartsOn =
    (settings && settings.weekStartsOn) || "monday";
  const goal = Math.max(
    1,
    Number(settings && settings.dailyGoalMl) || DEFAULT_GOAL_ML
  );
  const dates = weekDates(
    isValidISODate(referenceDate) ? referenceDate : todayISO(),
    weekStartsOn
  );

  const days = dates.map((date) => {
    const record = findRecord(records, date);
    const totals = sectionTotals(record);
    const total = totals.Morning + totals.Afternoon + totals.Evening;
    const dayGoal = goalForRecord(record, goal);
    return {
      date,
      total,
      goal: dayGoal,
      reached: total >= dayGoal,
      sections: totals,
    };
  });

  const total = days.reduce((s, d) => s + d.total, 0);
  const average = Math.round(total / 7);
  const goalDays = days.filter((d) => d.total > 0 && d.reached).length;

  let best = null;
  days.forEach((d) => {
    if (d.total > 0 && (!best || d.total > best.total)) best = d;
  });

  const sectionSums = { Morning: 0, Afternoon: 0, Evening: 0 };
  days.forEach((d) => {
    sectionSums.Morning += d.sections.Morning;
    sectionSums.Afternoon += d.sections.Afternoon;
    sectionSums.Evening += d.sections.Evening;
  });

  let mostSection = null;
  let mostSectionMl = -1;
  SECTIONS.forEach((s) => {
    if (sectionSums[s] > mostSectionMl) {
      mostSectionMl = sectionSums[s];
      mostSection = s;
    }
  });
  if (mostSectionMl <= 0) mostSection = null;

  const maxDayTotal = days.reduce((m, d) => Math.max(m, d.total), 0);

  return {
    dates,
    days,
    total,
    average,
    goalDays,
    goalTarget: goal,
    bestDay: best ? { date: best.date, total: best.total } : null,
    bestDayLabel: best ? longWeekday(best.date) : null,
    sectionSums,
    mostSection,
    maxDayTotal,
  };
}

// --- In-app reminders -----------------------------------------------------
// Reminders are computed only from local time + today's progress.
// They are shown inside the app only. No notifications, no background work.

export function computeReminders(record, settings, hourOverride) {
  const reminders =
    (settings && settings.reminders) || makeDefaultReminderSettings();
  if (!reminders.enabled) return [];

  const hour = Number.isFinite(hourOverride) ? hourOverride : currentHour();
  const totals = sectionTotals(record);
  const total = totals.Morning + totals.Afternoon + totals.Evening;
  const goal = goalForRecord(record, settings && settings.dailyGoalMl);
  const out = [];

  if (
    reminders.morningEnabled &&
    totals.Morning === 0 &&
    hour >= REMINDER_HOURS.Morning
  ) {
    out.push({
      id: "rem_morning",
      section: "Morning",
      text: "Morning is still empty. Add a drink if you had one.",
    });
  }
  if (
    reminders.afternoonEnabled &&
    totals.Afternoon === 0 &&
    hour >= REMINDER_HOURS.Afternoon
  ) {
    out.push({
      id: "rem_afternoon",
      section: "Afternoon",
      text: "Afternoon journal is waiting.",
    });
  }
  if (
    reminders.eveningEnabled &&
    totals.Evening === 0 &&
    hour >= REMINDER_HOURS.Evening
  ) {
    out.push({
      id: "rem_evening",
      section: "Evening",
      text: "Add your evening water if needed.",
    });
  }
  if (total > 0 && total < goal) {
    out.push({
      id: "rem_below_goal",
      section: null,
      text: "You can still add today's drinks manually.",
    });
  }

  return out;
}

// Soft, per-section label used inside each journal panel.
export function sectionReminderLabel(record, section, settings, hourOverride) {
  const reminders =
    (settings && settings.reminders) || makeDefaultReminderSettings();
  if (!reminders.enabled) return null;
  const key =
    section === "Morning"
      ? "morningEnabled"
      : section === "Afternoon"
      ? "afternoonEnabled"
      : "eveningEnabled";
  if (!reminders[key]) return null;

  const hour = Number.isFinite(hourOverride) ? hourOverride : currentHour();
  const total = sectionTotal(record, section);
  if (total > 0) return null;
  if (hour < REMINDER_HOURS[section]) return null;

  if (section === "Morning") return "A gentle nudge: morning is still empty.";
  if (section === "Afternoon") return "Afternoon journal is waiting.";
  return "Add your evening water if needed.";
}

// --- Streak (informational only) -----------------------------------------

export function computeStreaks(records, settings) {
  const list = (Array.isArray(records) ? records : [])
    .filter((r) => r && isValidISODate(r.date))
    .slice();

  const goalFallback = Math.max(
    1,
    Number(settings && settings.dailyGoalMl) || DEFAULT_GOAL_ML
  );

  // Map of date -> reached boolean (only days that reached goal count).
  const reachedSet = {};
  list.forEach((r) => {
    if (goalReached(r, goalFallback)) reachedSet[r.date] = true;
  });

  const reachedDates = Object.keys(reachedSet).sort(); // ascending
  if (reachedDates.length === 0) {
    return { current: 0, best: 0 };
  }

  // Best streak: longest run of consecutive calendar days.
  let best = 1;
  let run = 1;
  for (let i = 1; i < reachedDates.length; i += 1) {
    if (isNextDay(reachedDates[i - 1], reachedDates[i])) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }

  // Current streak: consecutive reached days ending today or yesterday.
  const today = todayISO();
  let current = 0;
  let cursor = today;
  if (!reachedSet[cursor]) {
    // allow streak to be "alive" if yesterday reached but today not logged yet
    cursor = shiftDay(today, -1);
    if (!reachedSet[cursor]) {
      return { current: 0, best };
    }
  }
  while (reachedSet[cursor]) {
    current += 1;
    cursor = shiftDay(cursor, -1);
  }

  return { current, best };
}

function isNextDay(a, b) {
  return shiftDay(a, 1) === b;
}

function shiftDay(iso, delta) {
  if (!isValidISODate(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  const pad = (n) => (n < 10 ? "0" + n : String(n));
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}
