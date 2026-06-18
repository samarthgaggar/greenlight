type DemoReadyBadgeProps = {
  active: boolean;
};

export function DemoReadyBadge({ active }: DemoReadyBadgeProps) {
  if (!active) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 rounded-full border border-[color-mix(in_srgb,var(--primary)_58%,var(--border))] bg-[color-mix(in_srgb,var(--surface)_76%,transparent)] px-3 py-1.5 text-xs font-bold text-[var(--primary)] opacity-80 shadow-sm backdrop-blur-md">
      Ready
    </div>
  );
}
