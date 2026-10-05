import { createContext } from "react";

export const ACCENT_THEMES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Premium Dark" },
];

export const ThemeContext = createContext(null);
