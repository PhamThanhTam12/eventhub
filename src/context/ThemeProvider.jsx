import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";

function getInitialTheme() {
  try {
    return localStorage.getItem("eventhub-theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.bsTheme = theme;

    try {
      localStorage.setItem("eventhub-theme", theme);
    } catch {
      // Theme still works when the browser does not allow localStorage.
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
