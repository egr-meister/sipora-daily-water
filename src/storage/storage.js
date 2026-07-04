// AsyncStorage persistence with defensive loading.
// Loaded data is always merged with defaults so missing/corrupted fields
// never crash the app.

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  STORAGE_KEY,
  makeDefaultAppData,
  makeDefaultGlassSizes,
  makeDefaultSettings,
  makeDefaultReminderSettings,
  DEFAULT_GOAL_ML,
  MIN_GLASS_ML,
  MAX_GLASS_ML,
} from "../data/defaults";
import { isValidISODate } from "../data/dateUtils";
import { safeAmount, safeSection, makeId } from "../data/water";

function clampGlass(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return MIN_GLASS_ML;
  return Math.min(MAX_GLASS_ML, Math.max(MIN_GLASS_ML, Math.round(v)));
}

function sanitizeEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const amountMl = safeAmount(raw.amountMl);
  const now = new Date().toISOString();
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : makeId("entry"),
    section: safeSection(raw.section),
    amountMl,
    label: typeof raw.label === "string" ? raw.label : "",
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : now,
  };
}

function sanitizeRecord(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (!isValidISODate(raw.date)) return null;
  const now = new Date().toISOString();
  const entries = Array.isArray(raw.entries)
    ? raw.entries.map(sanitizeEntry).filter(Boolean)
    : [];
  const goal = Number(raw.dailyGoalMlUsed);
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : makeId("day"),
    date: raw.date,
    entries,
    note: typeof raw.note === "string" ? raw.note : "",
    dailyGoalMlUsed:
      Number.isFinite(goal) && goal > 0 ? Math.round(goal) : DEFAULT_GOAL_ML,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : now,
  };
}

function sanitizeGlassSize(raw) {
  if (!raw || typeof raw !== "object") return null;
  const label =
    typeof raw.label === "string" && raw.label.trim()
      ? raw.label.trim()
      : "Glass";
  const now = new Date().toISOString();
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : makeId("glass"),
    label,
    amountMl: clampGlass(raw.amountMl),
    custom: raw.custom === true,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : now,
  };
}

function sanitizeReminderSettings(raw) {
  const d = makeDefaultReminderSettings();
  if (!raw || typeof raw !== "object") return d;
  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : d.enabled,
    morningEnabled:
      typeof raw.morningEnabled === "boolean"
        ? raw.morningEnabled
        : d.morningEnabled,
    afternoonEnabled:
      typeof raw.afternoonEnabled === "boolean"
        ? raw.afternoonEnabled
        : d.afternoonEnabled,
    eveningEnabled:
      typeof raw.eveningEnabled === "boolean"
        ? raw.eveningEnabled
        : d.eveningEnabled,
  };
}

function sanitizeSettings(raw) {
  const d = makeDefaultSettings();
  if (!raw || typeof raw !== "object") return d;
  const goal = Number(raw.dailyGoalMl);
  return {
    onboardingCompleted:
      typeof raw.onboardingCompleted === "boolean"
        ? raw.onboardingCompleted
        : d.onboardingCompleted,
    dailyGoalMl:
      Number.isFinite(goal) && goal > 0 ? Math.round(goal) : d.dailyGoalMl,
    compactMode:
      typeof raw.compactMode === "boolean" ? raw.compactMode : d.compactMode,
    weekStartsOn: "monday",
    reminders: sanitizeReminderSettings(raw.reminders),
  };
}

// Merge whatever we loaded with defaults. Always returns a valid structure.
export function mergeWithDefaults(raw) {
  const defaults = makeDefaultAppData();
  if (!raw || typeof raw !== "object") return defaults;

  const records = Array.isArray(raw.records)
    ? raw.records.map(sanitizeRecord).filter(Boolean)
    : [];

  let glassSizes = Array.isArray(raw.glassSizes)
    ? raw.glassSizes.map(sanitizeGlassSize).filter(Boolean)
    : [];
  if (glassSizes.length === 0) glassSizes = makeDefaultGlassSizes();

  return {
    schemaVersion: 1,
    records,
    glassSizes,
    settings: sanitizeSettings(raw.settings),
  };
}

// Load app data. Never throws; falls back to defaults on any error.
export async function loadAppData() {
  try {
    const rawStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawStr) return makeDefaultAppData();
    let parsed;
    try {
      parsed = JSON.parse(rawStr);
    } catch (parseErr) {
      // Corrupted JSON -> safe fallback.
      return makeDefaultAppData();
    }
    return mergeWithDefaults(parsed);
  } catch (err) {
    return makeDefaultAppData();
  }
}

// Persist app data. Never throws.
export async function saveAppData(data) {
  try {
    const safe = mergeWithDefaults(data);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    return true;
  } catch (err) {
    return false;
  }
}

// Remove all stored data.
export async function clearAppData() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    return false;
  }
}
