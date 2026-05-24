import type { ReactNode } from "react";

type DashboardPanelElement = "aside" | "div" | "section";

export function DashboardPanel({
  title,
  description,
  action,
  children,
  as = "div",
  className = "",
  headerClassName = "",
  contentClassName = "",
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  as?: DashboardPanelElement;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}) {
  const Component = as;
  const rootClassName = `border border-(--border) bg-(--surface) ${className}`;
  const headerClasses = `flex flex-col gap-3 p-5 pb-2 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pb-3 ${headerClassName}`;
  const contentClasses = `px-4 pb-4 sm:px-5 sm:pb-5 ${contentClassName}`;

  return (
    <Component className={rootClassName}>
      <div className={headerClasses}>
        <div>
          <h2 className="text-xl font-normal tracking-tight text-(--text)">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-(--text-secondary)">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className={contentClasses}>{children}</div>
    </Component>
  );
}
