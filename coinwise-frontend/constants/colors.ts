export const colors = {
  background: "#1C1C1C",
  primary: {
    "50": "#FBF6E5",
    "100": "#F7EDCC",
    "200": "#F0DB99",
    "300": "#E8C966",
    "400": "#E1B733",
    "500": "#D4AF37",
    "600": "#AA8C2C",
    "700": "#7F6921",
    "800": "#554616",
    "900": "#2A230B",
  },
  secondary: {
    "50": "#E6EBEB",
    "100": "#CCD7D7",
    "200": "#99AFAF",
    "300": "#668888",
    "400": "#336060",
    "500": "#2F4F4F",
    "600": "#263F3F",
    "700": "#1C2F2F",
    "800": "#131F1F",
    "900": "#090F0F",
  },

  accent: "#F7E7CE",
  backgroundLight: "#2A2A2A",
  backgroundDark: "#141414",
  primaryLight: "#E5C55A",
  primaryDark: "#B38F1F",
  secondaryLight: "#3F5F5F",
  secondaryDark: "#1F3F3F",
  accentLight: "#F9F0E0",
  accentDark: "#E5D5B5",

  text: "#FFFFFF",
  textSecondary: "#A3A3A3",
  textMuted: "#999999",

  error: "#DC2626",
  success: "#10B981",
  accentBlue: "008080",
  gradients: {
    ggoldgreen: {
      background:
        "linear-gradient(90deg,rgba(42, 123, 155, 1) 0%, rgba(237, 221, 83, 1) 100%)",
    },
    greenFresh: {
      background:
        "linear-gradient(90deg,rgba(42, 123, 155, 1) 0%, rgba(128, 255, 234, 1) 100%)",
    },
  },
} as const;
