"use client";

import { Copy, RotateCcw, Settings, X } from "lucide-react";
import type { ReactNode } from "react";
import { PresentationModeControls } from "@/components/PresentationModeControls";
import type { AiMode } from "@/lib/demoMode";

type ApiStatus = "missing" | "detected" | "connected" | "failed";
type ThemeChoice = "dark" | "light" | "system";

type DeveloperSettingsPanelProps = {
  open: boolean;
  demoMode: boolean;
  aiMode: AiMode;
  apiStatus: ApiStatus;
  presentationMode: boolean;
  themeChoice: ThemeChoice;
  liveAiAllowed: boolean;
  onClose: () => void;
  onDemoModeChange: (enabled: boolean) => void;
  onAiModeChange: (mode: AiMode) => void;
  onThemeChange: (theme: ThemeChoice) => void;
  onPresentationModeChange: (enabled: boolean) => void;
  onResetDemoFlow: () => void;
};

const apiStatusLabel: Record<ApiStatus, string> = {
  missing: "Missing API Key",
  detected: "API Key Detected",
  connected: "Live AI Connected",
  failed: "Analysis recovered with reliability layer"
};

export function DeveloperSettingsPanel({
  open,
  demoMode,
  aiMode,
  apiStatus,
  presentationMode,
  themeChoice,
  liveAiAllowed,
  onClose,
  onDemoModeChange,
  onAiModeChange,
  onThemeChange,
  onPresentationModeChange,
  onResetDemoFlow
}: DeveloperSettingsPanelProps) {
  async function copyDemoUrl() {
    const url = `${window.location.origin}${window.location.pathname}?showcase=greenlight`;
    await window.navigator.clipboard?.writeText(url);
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/25 backdrop-blur-[2px] transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-dvh w-[min(420px,100vw)] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface))] text-[var(--primary)]">
              <Settings size={19} />
            </span>
            <div>
              <h2 className="font-heading text-xl font-bold">Developer settings</h2>
              <p className="text-xs font-semibold text-[var(--text-muted)]">Internal controls</p>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close developer settings">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <SettingRow
            title="Showcase Flow"
            description="Loads the stable recording flow without changing the public UI."
            control={
              <input
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={demoMode}
                onChange={(event) => onDemoModeChange(event.target.checked)}
              />
            }
          />

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
            <p className="text-sm font-bold text-[var(--text-primary)]">AI Mode</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ModeButton active={aiMode === "mock"} label="Reliable" onClick={() => onAiModeChange("mock")} />
              <ModeButton
                active={aiMode === "live"}
                disabled={!liveAiAllowed}
                label="Live"
                onClick={() => onAiModeChange("live")}
              />
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
              Live AI is available only when the server detects a key. The key is never displayed.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
            <p className="text-sm font-bold text-[var(--text-primary)]">Theme</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <ModeButton active={themeChoice === "dark"} label="Dark" onClick={() => onThemeChange("dark")} />
              <ModeButton active={themeChoice === "light"} label="Light" onClick={() => onThemeChange("light")} />
              <ModeButton active={themeChoice === "system"} label="System" onClick={() => onThemeChange("system")} />
            </div>
          </div>

          <PresentationModeControls enabled={presentationMode} onChange={onPresentationModeChange} />

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
            <p className="text-sm font-bold text-[var(--text-primary)]">API status</p>
            <p className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-bold text-[var(--text-secondary)]">
              {apiStatusLabel[apiStatus]}
            </p>
          </div>
        </div>

        <div className="grid gap-3 border-t border-[var(--border)] p-5">
          <button type="button" className="button-secondary w-full" onClick={copyDemoUrl}>
            <Copy size={18} />
            Copy Showcase URL
          </button>
          <button type="button" className="button-ghost w-full" onClick={onResetDemoFlow}>
            <RotateCcw size={18} />
            Reset Showcase Flow
          </button>
        </div>
      </aside>
    </>
  );
}

function SettingRow({ title, description, control }: { title: string; description: string; control: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
      <span>
        <span className="block text-sm font-bold text-[var(--text-primary)]">{title}</span>
        <span className="block text-xs leading-5 text-[var(--text-muted)]">{description}</span>
      </span>
      {control}
    </div>
  );
}

function ModeButton({
  active,
  disabled,
  label,
  onClick
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`min-h-10 rounded-lg border px-3 text-sm font-bold transition ${
        active
          ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_16%,var(--surface))] text-[var(--primary)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[color-mix(in_srgb,var(--primary)_40%,var(--border))]"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
