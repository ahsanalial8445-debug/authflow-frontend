import { createContext } from "react";

export const ACCENT_THEMES = [
  { id: "indigo", label: "Indigo" },
  { id: "blue", label: "Blue" },
  { id: "violet", label: "Violet" },
  { id: "emerald", label: "Emerald" },
];

export const ThemeContext = createContext(null);
