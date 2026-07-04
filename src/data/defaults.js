// Default data + constants for Sipora Daily Water.
// All values are safe fallbacks used when AsyncStorage is empty or corrupted.

export const STORAGE_KEY = "sipora_daily_water_v1";

export const APP_INFO = {
  name: "Sipora Daily Water",
  version: "1.0.0",
  tagline: "A calm journal for your daily water.",
};

export const MANUAL_DISCLAIMER =
  "Sipora Daily Water is a manual water journal. It does not detect drinking " +
  "automatically and does not connect to Health Connect, Google Fit, sensors, " +
  "or wearable devices.";

export const REMINDER_DISCLAIMER =
  "These are in-app reminder cards only. They do not send phone notifications.";

export const PRIVACY_NOTE =
  "Sipora Daily Water stores water entries, goals, notes, glass sizes, and " +
  "reminder settings only on this device. No account, no ads, no analytics, " +
  "no internet connection, no sensors, no Google Fit, no Health Connect, and " +
  "no notification permission.";

export const DEFAULT_GOAL_ML = 2000;
export const MIN_GOAL_ML = 1;
export const MAX_GOAL_ML = 10000;

export const MIN_GLASS_ML = 1;
export const MAX_GLASS_ML = 5000;

// Quick add amounts available in every day section.
export const QUICK_AMOUNTS = [150, 250, 330, 500];

export const SECTIONS = ["Morning", "Afternoon", "Evening"];

// Reminder trigger hours (24h). After this hour, an empty section is nudged.
export const REMINDER_HOURS = {
  Morning: 10,
  Afternoon: 15,
  Evening: 20,
};

let glassCounter = 0;
function seedId(prefix) {
  glassCounter += 1;
  return `${prefix}_seed_${glassCounter}`;
}

const SEED_TIME = "2024-01-01T00:00:00.000Z";

export function makeDefaultGlassSizes() {
  return [
    {
      id: "glass_small",
      label: "Small glass",
      amountMl: 150,
      custom: false,
      createdAt: SEED_TIME,
      updatedAt: SEED_TIME,
    },
    {
      id: "glass_regular",
      label: "Glass",
      amountMl: 250,
      custom: false,
      createdAt: SEED_TIME,
      updatedAt: SEED_TIME,
    },
    {
      id: "glass_bottle",
      label: "Bottle",
      amountMl: 500,
      custom: false,
      createdAt: SEED_TIME,
      updatedAt: SEED_TIME,
    },
  ];
}

export function makeDefaultReminderSettings() {
  return {
    enabled: true,
    morningEnabled: true,
    afternoonEnabled: true,
    eveningEnabled: true,
  };
}

export function makeDefaultSettings() {
  return {
    onboardingCompleted: false,
    dailyGoalMl: DEFAULT_GOAL_ML,
    compactMode: false,
    weekStartsOn: "monday",
    reminders: makeDefaultReminderSettings(),
  };
}

export function makeDefaultAppData() {
  return {
    schemaVersion: 1,
    records: [], // WaterDayRecord[]
    glassSizes: makeDefaultGlassSizes(),
    settings: makeDefaultSettings(),
  };
}

// avoid unused warning for seedId helper while keeping it available
export { seedId };
