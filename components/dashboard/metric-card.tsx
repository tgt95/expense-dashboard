export function MetricCard({
  label,
  value,
  currency = "₫",
  size = "default",
}: {
  label: string;
  value: string;
  currency?: string;
  size?: "large" | "default";
}) {
  const isLarge = size === "large";
  const containerClassName = isLarge
    ? "flex flex-col justify-between border border-(--border) bg-(--surface) p-6 sm:p-8"
    : "flex flex-1 flex-col justify-center border border-(--border) bg-(--surface) p-6 sm:p-8";
  const valueClassName = isLarge
    ? "mt-8 font-mono text-5xl font-normal tracking-tight leading-none text-(--text) sm:text-6xl md:text-7xl"
    : "mt-2 font-mono text-4xl font-normal tracking-tight leading-tight text-(--text) sm:text-5xl";
  const currencyClassName = isLarge
    ? "text-2xl font-medium uppercase tracking-wider text-(--text-muted)"
    : "text-base font-medium uppercase tracking-wider text-(--text-muted)";

  return (
    <div className={containerClassName}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-(--text-muted)">
        {label}
      </p>
      <p className={valueClassName}>
        {value}
        <span className={currencyClassName}>{currency}</span>
      </p>
    </div>
  );
}
