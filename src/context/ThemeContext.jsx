import { useEffect, useState } from "react";
import { ACCENT_THEMES, ThemeContext } from "./theme";

const STORAGE_KEY = "authflow-accent-theme";

const getInitialTheme = () => {
  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  return ACCENT_THEMES.some(({ id }) => id === savedTheme) ? savedTheme : "indigo";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme((currentTheme) => {
      const currentIndex = ACCENT_THEMES.findIndex(({ id }) => id === currentTheme);
      return ACCENT_THEMES[(currentIndex + 1) % ACCENT_THEMES.length].id;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
