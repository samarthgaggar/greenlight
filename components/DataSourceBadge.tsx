type DataSourceBadgeProps = {
  type: "osm" | "census" | "ejscreen" | "demo";
  label: string;
};

export function DataSourceBadge({ type, label }: DataSourceBadgeProps) {
  const color =
    type === "osm"
      ? "var(--data)"
      : type === "ejscreen"
        ? "var(--equity)"
        : type === "census"
          ? "var(--warning)"
          : "var(--primary)";

  return (
    <span
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-bold text-[var(--text-secondary)]"
      style={{ color }}
    >
      {label}
    </span>
  );
}
