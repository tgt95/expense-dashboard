"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-1 rounded-sm border border-[var(--border)] bg-[var(--surface)] p-0.5">
      {(["light", "dark", "system"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`rounded-sm px-2.5 py-1 text-[11px] font-medium tracking-wider transition-colors ${
            theme === t
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
          type="button"
          aria-label={`Set ${t} theme`}
        >
          {t === "light" ? "Light" : t === "dark" ? "Dark" : "System"}
        </button>
      ))}
    </div>
  );
}
