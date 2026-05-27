export function StatusIndicator({
  label,
  value,
  active,
  loading = false,
  fill = false,
  className = '',
}: {
  label: string;
  value: string;
  active: boolean;
  loading?: boolean;
  fill?: boolean;
  className?: string;
}) {
  const containerClassName = `${
    fill ? "w-full " : ""
  }inline-flex gap-3 border border-(--border) bg-(--surface) px-4 py-2 text-xs text-(--text-muted) ${className}`;
  const markerClassName = loading
    ? "h-2 w-2 animate-pulse bg-(--accent)"
    : `h-2 w-2 ${active ? "bg-(--tag-green-text)" : "bg-(--text-muted)"}`;

  return (
    <div className={containerClassName}>
      <div className="h-4 inline-flex items-center shrink-0">
        <span className={markerClassName} />
      </div>
      <div className="flex flex-row flex-wrap gap-1">
        <span className="font-medium text-(--text-secondary)">{label}:</span> {value}
      </div>
    </div>
  );
}
