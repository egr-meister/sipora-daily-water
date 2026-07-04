// Central app state + persistence. All screens read/write through this context.
// Every action is defensive and re-saves the full, sanitized data set.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loadAppData, saveAppData, clearAppData } from "../storage/storage";
import {
  makeDefaultAppData,
  makeDefaultGlassSizes,
  makeDefaultSettings,
  makeDefaultReminderSettings,
  DEFAULT_GOAL_ML,
  MIN_GOAL_ML,
  MAX_GOAL_ML,
  MIN_GLASS_ML,
  MAX_GLASS_ML,
} from "../data/defaults";
import { todayISO, isValidISODate } from "../data/dateUtils";
import {
  makeId,
  makeEmptyRecord,
  findRecord,
  safeAmount,
  safeSection,
} from "../data/water";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [appData, setAppData] = useState(makeDefaultAppData());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await loadAppData();
      if (alive) {
        setAppData(data);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Central updater: apply an updater fn to current data, persist, set state.
  const commit = useCallback((updater) => {
    setAppData((prev) => {
      const base = prev || makeDefaultAppData();
      let next;
      try {
        next = updater(base) || base;
      } catch (err) {
        next = base;
      }
      // Persist asynchronously; storage layer re-sanitizes.
      saveAppData(next);
      return next;
    });
  }, []);

  // Ensure a record exists for a date, returning updated records + the record.
  const ensureRecord = useCallback((records, date, settings) => {
    const list = Array.isArray(records) ? records : [];
    const existing = list.find((r) => r && r.date === date);
    if (existing) return { records: list, record: existing };
    const goal = Math.max(
      1,
      Number(settings && settings.dailyGoalMl) || DEFAULT_GOAL_ML
    );
    const record = makeEmptyRecord(date, goal);
    return { records: [...list, record], record };
  }, []);

  // --- Settings ------------------------------------------------------------

  const completeOnboarding = useCallback(() => {
    commit((data) => ({
      ...data,
      settings: { ...data.settings, onboardingCompleted: true },
    }));
  }, [commit]);

  const showOnboardingAgain = useCallback(() => {
    commit((data) => ({
      ...data,
      settings: { ...data.settings, onboardingCompleted: false },
    }));
  }, [commit]);

  const setCompactMode = useCallback((value) => {
    commit((data) => ({
      ...data,
      settings: { ...data.settings, compactMode: value === true },
    }));
  }, [commit]);

  // Returns { ok, message }. Does not change state if invalid.
  const setDailyGoal = useCallback((rawGoal) => {
    const goal = Number(rawGoal);
    if (!Number.isFinite(goal) || goal < MIN_GOAL_ML) {
      return { ok: false, message: "Please enter a goal above 0 ml." };
    }
    if (goal > MAX_GOAL_ML) {
      return {
        ok: false,
        message: `Goal should not exceed ${MAX_GOAL_ML} ml.`,
      };
    }
    commit((data) => ({
      ...data,
      settings: { ...data.settings, dailyGoalMl: Math.round(goal) },
    }));
    return { ok: true, message: "Goal saved." };
  }, [commit]);

  const resetDailyGoal = useCallback(() => {
    commit((data) => ({
      ...data,
      settings: { ...data.settings, dailyGoalMl: DEFAULT_GOAL_ML },
    }));
    return { ok: true, message: "Goal reset to default." };
  }, [commit]);

  const setReminderSettings = useCallback((partial) => {
    commit((data) => ({
      ...data,
      settings: {
        ...data.settings,
        reminders: {
          ...makeDefaultReminderSettings(),
          ...data.settings.reminders,
          ...partial,
        },
      },
    }));
  }, [commit]);

  // --- Entries -------------------------------------------------------------

  const addEntry = useCallback(
    (date, section, amountMl, label) => {
      const safeDate = isValidISODate(date) ? date : todayISO();
      const amount = safeAmount(amountMl);
      if (amount <= 0) {
        return { ok: false, message: "Amount must be greater than 0 ml." };
      }
      if (amount > MAX_GLASS_ML) {
        return {
          ok: false,
          message: `Amount must not exceed ${MAX_GLASS_ML} ml.`,
        };
      }
      const sect = safeSection(section);
      const now = new Date().toISOString();
      commit((data) => {
        const { records } = ensureRecord(
          data.records,
          safeDate,
          data.settings
        );
        const nextRecords = records.map((r) => {
          if (r.date !== safeDate) return r;
          const entry = {
            id: makeId("entry"),
            section: sect,
            amountMl: amount,
            label: typeof label === "string" ? label : "",
            createdAt: now,
            updatedAt: now,
          };
          return {
            ...r,
            entries: [...(r.entries || []), entry],
            updatedAt: now,
          };
        });
        return { ...data, records: nextRecords };
      });
      return { ok: true, message: "Drink added." };
    },
    [commit, ensureRecord]
  );

  const updateEntry = useCallback(
    (date, entryId, patch) => {
      const safeDate = isValidISODate(date) ? date : todayISO();
      const amount = safeAmount(patch && patch.amountMl);
      if (patch && patch.amountMl !== undefined) {
        if (amount <= 0) {
          return { ok: false, message: "Amount must be greater than 0 ml." };
        }
        if (amount > MAX_GLASS_ML) {
          return {
            ok: false,
            message: `Amount must not exceed ${MAX_GLASS_ML} ml.`,
          };
        }
      }
      const now = new Date().toISOString();
      commit((data) => {
        const nextRecords = (data.records || []).map((r) => {
          if (r.date !== safeDate) return r;
          const entries = (r.entries || []).map((e) => {
            if (!e || e.id !== entryId) return e;
            return {
              ...e,
              section:
                patch && patch.section !== undefined
                  ? safeSection(patch.section)
                  : e.section,
              amountMl:
                patch && patch.amountMl !== undefined ? amount : e.amountMl,
              label:
                patch && patch.label !== undefined
                  ? String(patch.label)
                  : e.label,
              updatedAt: now,
            };
          });
          return { ...r, entries, updatedAt: now };
        });
        return { ...data, records: nextRecords };
      });
      return { ok: true, message: "Drink updated." };
    },
    [commit]
  );

  const deleteEntry = useCallback(
    (date, entryId) => {
      const safeDate = isValidISODate(date) ? date : todayISO();
      const now = new Date().toISOString();
      commit((data) => {
        const nextRecords = (data.records || []).map((r) => {
          if (r.date !== safeDate) return r;
          return {
            ...r,
            entries: (r.entries || []).filter((e) => e && e.id !== entryId),
            updatedAt: now,
          };
        });
        return { ...data, records: nextRecords };
      });
      return { ok: true, message: "Drink deleted." };
    },
    [commit]
  );

  const setNote = useCallback(
    (date, note) => {
      const safeDate = isValidISODate(date) ? date : todayISO();
      const text = typeof note === "string" ? note : "";
      const now = new Date().toISOString();
      commit((data) => {
        const { records } = ensureRecord(
          data.records,
          safeDate,
          data.settings
        );
        const nextRecords = records.map((r) =>
          r.date === safeDate ? { ...r, note: text, updatedAt: now } : r
        );
        return { ...data, records: nextRecords };
      });
      return { ok: true, message: "Note saved." };
    },
    [commit, ensureRecord]
  );

  // Clear all entries + note for a day (keeps the day record shell).
  const clearDay = useCallback(
    (date) => {
      const safeDate = isValidISODate(date) ? date : todayISO();
      const now = new Date().toISOString();
      commit((data) => {
        const nextRecords = (data.records || []).map((r) =>
          r.date === safeDate
            ? { ...r, entries: [], note: "", updatedAt: now }
            : r
        );
        return { ...data, records: nextRecords };
      });
      return { ok: true, message: "Day cleared." };
    },
    [commit]
  );

  const deleteDay = useCallback(
    (date) => {
      commit((data) => ({
        ...data,
        records: (data.records || []).filter((r) => r && r.date !== date),
      }));
      return { ok: true, message: "Day removed." };
    },
    [commit]
  );

  // --- Glass sizes ---------------------------------------------------------

  const addGlassSize = useCallback(
    (label, amountMl) => {
      const trimmed = (label || "").trim();
      if (!trimmed) {
        return { ok: false, message: "Label must not be empty." };
      }
      const amount = safeAmount(amountMl);
      if (amount <= MIN_GLASS_ML - 1) {
        return { ok: false, message: "Amount must be greater than 0 ml." };
      }
      if (amount > MAX_GLASS_ML) {
        return {
          ok: false,
          message: `Amount must not exceed ${MAX_GLASS_ML} ml.`,
        };
      }
      const now = new Date().toISOString();
      commit((data) => {
        const glass = {
          id: makeId("glass"),
          label: trimmed,
          amountMl: amount,
          custom: true,
          createdAt: now,
          updatedAt: now,
        };
        return { ...data, glassSizes: [...(data.glassSizes || []), glass] };
      });
      return { ok: true, message: "Glass size added." };
    },
    [commit]
  );

  const updateGlassSize = useCallback(
    (id, label, amountMl) => {
      const trimmed = (label || "").trim();
      if (!trimmed) {
        return { ok: false, message: "Label must not be empty." };
      }
      const amount = safeAmount(amountMl);
      if (amount <= 0) {
        return { ok: false, message: "Amount must be greater than 0 ml." };
      }
      if (amount > MAX_GLASS_ML) {
        return {
          ok: false,
          message: `Amount must not exceed ${MAX_GLASS_ML} ml.`,
        };
      }
      const now = new Date().toISOString();
      commit((data) => ({
        ...data,
        glassSizes: (data.glassSizes || []).map((g) =>
          g && g.id === id
            ? { ...g, label: trimmed, amountMl: amount, updatedAt: now }
            : g
        ),
      }));
      return { ok: true, message: "Glass size updated." };
    },
    [commit]
  );

  const deleteGlassSize = useCallback(
    (id) => {
      commit((data) => ({
        ...data,
        glassSizes: (data.glassSizes || []).filter((g) => g && g.id !== id),
      }));
      return { ok: true, message: "Glass size removed." };
    },
    [commit]
  );

  const resetGlassSizes = useCallback(() => {
    commit((data) => ({ ...data, glassSizes: makeDefaultGlassSizes() }));
    return { ok: true, message: "Glass sizes reset to defaults." };
  }, [commit]);

  // --- Bulk data ops -------------------------------------------------------

  const deleteAllRecords = useCallback(() => {
    commit((data) => ({ ...data, records: [] }));
    return { ok: true, message: "All water records deleted." };
  }, [commit]);

  const resetAllData = useCallback(async () => {
    await clearAppData();
    const fresh = makeDefaultAppData();
    setAppData(fresh);
    return { ok: true, message: "All local data reset." };
  }, []);

  // --- Derived helpers -----------------------------------------------------

  const getRecord = useCallback(
    (date) => findRecord(appData.records, date),
    [appData.records]
  );

  const value = useMemo(
    () => ({
      loading,
      appData,
      records: appData.records || [],
      glassSizes: appData.glassSizes || makeDefaultGlassSizes(),
      settings: appData.settings || makeDefaultSettings(),
      getRecord,
      // settings
      completeOnboarding,
      showOnboardingAgain,
      setCompactMode,
      setDailyGoal,
      resetDailyGoal,
      setReminderSettings,
      // entries
      addEntry,
      updateEntry,
      deleteEntry,
      setNote,
      clearDay,
      deleteDay,
      // glass sizes
      addGlassSize,
      updateGlassSize,
      deleteGlassSize,
      resetGlassSizes,
      // bulk
      deleteAllRecords,
      resetAllData,
    }),
    [
      loading,
      appData,
      getRecord,
      completeOnboarding,
      showOnboardingAgain,
      setCompactMode,
      setDailyGoal,
      resetDailyGoal,
      setReminderSettings,
      addEntry,
      updateEntry,
      deleteEntry,
      setNote,
      clearDay,
      deleteDay,
      addGlassSize,
      updateGlassSize,
      deleteGlassSize,
      resetGlassSizes,
      deleteAllRecords,
      resetAllData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    // Defensive fallback so a mis-mounted component never crashes.
    return {
      loading: true,
      appData: makeDefaultAppData(),
      records: [],
      glassSizes: makeDefaultGlassSizes(),
      settings: makeDefaultSettings(),
      getRecord: () => null,
      completeOnboarding: () => {},
      showOnboardingAgain: () => {},
      setCompactMode: () => {},
      setDailyGoal: () => ({ ok: false, message: "Not ready." }),
      resetDailyGoal: () => ({ ok: false, message: "Not ready." }),
      setReminderSettings: () => {},
      addEntry: () => ({ ok: false, message: "Not ready." }),
      updateEntry: () => ({ ok: false, message: "Not ready." }),
      deleteEntry: () => ({ ok: false, message: "Not ready." }),
      setNote: () => ({ ok: false, message: "Not ready." }),
      clearDay: () => ({ ok: false, message: "Not ready." }),
      deleteDay: () => ({ ok: false, message: "Not ready." }),
      addGlassSize: () => ({ ok: false, message: "Not ready." }),
      updateGlassSize: () => ({ ok: false, message: "Not ready." }),
      deleteGlassSize: () => ({ ok: false, message: "Not ready." }),
      resetGlassSizes: () => ({ ok: false, message: "Not ready." }),
      deleteAllRecords: () => ({ ok: false, message: "Not ready." }),
      resetAllData: async () => ({ ok: false, message: "Not ready." }),
    };
  }
  return ctx;
}
