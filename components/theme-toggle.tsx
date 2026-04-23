"use client";

import { useSyncExternalStore } from "react";

import { Icon } from "@/components/app-icons";

type Theme = "light" | "dark";
const THEME_EVENT = "stockpilot-theme-change";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem("stockpilot-theme", theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm font-medium text-[var(--text)] shadow-[var(--shadow-soft)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)] sm:px-4 sm:py-2.5"
      aria-label="Toggle theme"
    >
      <Icon name={theme === "light" ? "moon" : "sun"} className="h-4 w-4" />
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
}
