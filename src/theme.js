// Sipora Calm Water Journal — visual theme
// Calm, soft, clean, journal-like. Non-medical. No neon, no heavy gradients.

export const colors = {
  background: "#F7FAFA", // warm white
  panelAqua: "#EAF4F4", // pale aqua panels
  panelAquaDeep: "#D6ECEC",
  card: "#FFFFFF",
  noteCard: "#F6F1E7", // light sand note card
  ink: "#3A4A54", // deep blue-gray text
  inkSoft: "#6B7B84",
  inkFaint: "#9AA7AE",
  teal: "#4F8F8F", // muted teal accent
  tealDeep: "#3E7676",
  sky: "#8FC3E0", // soft sky blue water
  skyDeep: "#5FA3C8",
  lavender: "#B7B2D6", // pale lavender evening accent
  sand: "#E7D9BE",
  line: "#E1EBEB",
  lineSoft: "#EEF3F3",
  success: "#5E9E8A",
  danger: "#C97A72",
  white: "#FFFFFF",
};

// Per-section accents for Morning / Afternoon / Evening
export const sectionTheme = {
  Morning: {
    accent: "#F0C877", // warm sunrise
    accentSoft: "#FBEFD3",
    water: "#8FC3E0",
    label: "Morning",
    hint: "Sunrise sips",
  },
  Afternoon: {
    accent: "#5FA3C8", // bright daytime sky
    accentSoft: "#DCEDF6",
    water: "#7CB8D8",
    label: "Afternoon",
    hint: "Midday water",
  },
  Evening: {
    accent: "#B7B2D6", // calm lavender dusk
    accentSoft: "#EAE7F3",
    water: "#9AB0D4",
    label: "Evening",
    hint: "Wind-down water",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const shadow = {
  soft: {
    shadowColor: "#3A4A54",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
};

export const SECTIONS = ["Morning", "Afternoon", "Evening"];
