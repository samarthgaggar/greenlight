type PresentationModeControlsProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function PresentationModeControls({ enabled, onChange }: PresentationModeControlsProps) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <span>
        <span className="block text-sm font-bold text-[var(--text-primary)]">Presentation Mode</span>
        <span className="block text-xs leading-5 text-[var(--text-muted)]">Scroll, pulse, count, and reveal for video recording.</span>
      </span>
      <input
        type="checkbox"
        className="h-5 w-5 accent-[var(--primary)]"
        checked={enabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
