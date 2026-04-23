"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/app-icons";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem("stockpilot-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    return window.localStorage.getItem("stockpilot-theme") === "dark"
      ? "dark"
      : "light";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
      aria-label="Toggle theme"
    >
      <Icon name={theme === "light" ? "moon" : "sun"} className="h-4 w-4" />
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}
