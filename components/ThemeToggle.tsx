"use client";

import { useEffect, useState } from "react";
import { SkyToggle } from "@/components/ui/sky-toggle";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const saved = window.localStorage.getItem("greenlight-theme");
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
    setReady(true);

    function syncTheme() {
      setTheme(getInitialTheme());
    }

    window.addEventListener("greenlight-theme-change", syncTheme);
    return () => window.removeEventListener("greenlight-theme-change", syncTheme);
  }, []);

  function handleToggle(isDark: boolean) {
    const nextTheme: Theme = isDark ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("greenlight-theme", nextTheme);
    window.dispatchEvent(new CustomEvent("greenlight-theme-change"));
  }

  if (!ready) {
    return <div className="sky-toggle sky-toggle--placeholder" aria-hidden="true" />;
  }

  return (
    <SkyToggle
      checked={theme === "dark"}
      onChange={handleToggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    />
  );
}
