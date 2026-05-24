export function StatusIndicator({
  label,
  value,
  active,
  loading = false,
  fill = false,
}: {
  label: string;
  value: string;
  active: boolean;
  loading?: boolean;
  fill?: boolean;
}) {
  const containerClassName = `${
    fill ? "w-full " : ""
  }inline-flex items-center gap-3 border border-(--border) bg-(--surface) px-4 py-2 text-xs text-(--text-muted)`;
  const markerClassName = loading
    ? "h-2 w-2 animate-pulse bg-(--accent)"
    : `h-2 w-2 ${active ? "bg-(--tag-green-text)" : "bg-(--text-muted)"}`;

  return (
    <div className={containerClassName}>
      <span className={markerClassName} />
      <span className="font-medium text-(--text-secondary)">{label}:</span> {value}
    </div>
  );
}
