"use client";

import { useState } from "react";
import { Tabs } from "@base-ui/react/tabs";
import type { DateRange, RangePreset } from "@/lib/types";

const presets: Array<{ value: Exclude<RangePreset, "custom">; label: string }> = [
  { value: "last-3-days", label: "Last 3 days" },
  { value: "last-week", label: "Last week" },
];

const tabItemClassName = 'px-3 py-1.75 w-full md:w-auto text-[11px] font-medium tracking-wider text-(--text-muted) transition-colors hover:text-(--text-secondary) data-active:bg-(--accent) data-active:text-white'
const inputClassName = "w-full md:w-auto h-11 appearance-none border border-(--border) bg-(--bg) px-3 text-sm text-(--text) outline-none transition-colors focus:border-(--accent)"

export function DateRangeFilter({
  currentRange,
  isPending,
  onApply,
}: {
  currentRange: DateRange;
  isPending: boolean;
  onApply: (range: DateRange) => void;
}) {
  const [draft, setDraft] = useState<DateRange>(currentRange);

  const isCustom = draft.preset === "custom";

  const setPreset = (preset: RangePreset) => {
    setDraft({ preset, start: currentRange.start, end: currentRange.end });
  };

  const handleApply = () => {
    onApply(draft);
  };

  const handleReset = () => {
    setDraft(currentRange);
  };

  const hasChanges =
    draft.preset !== currentRange.preset ||
    draft.start !== currentRange.start ||
    draft.end !== currentRange.end;

  return (
    <div className="border border-(--border) bg-(--surface) p-2 sm:p-3">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="w-full md:w-auto inline-flex items-center gap-1 border border-(--border) bg-(--bg) p-0.5">
            <Tabs.Root
              onValueChange={(value) => setPreset(value as RangePreset)}
              value={draft.preset}
              className='w-full md:w-auto'
            >
              <Tabs.List className="flex gap-1 w-full md:w-auto">
                {presets.map((preset) => (
                  <Tabs.Tab
                    className={tabItemClassName}
                    key={preset.value}
                    value={preset.value}
                  >
                    {preset.label}
                  </Tabs.Tab>
                ))}
                <Tabs.Tab
                  className={tabItemClassName}
                  value="custom"
                >
                  Custom
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.Root>
          </div>

          {isCustom && (
            <div className="w-full md:w-auto flex items-end gap-2">
              <input
                className={inputClassName}
                onChange={(event) =>
                  setDraft({ preset: "custom", start: event.target.value, end: draft.end })
                }
                type="date"
                value={draft.start}
              />
              <input
                className={inputClassName}
                onChange={(event) =>
                  setDraft({ preset: "custom", start: draft.start, end: event.target.value })
                }
                type="date"
                value={draft.end}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="w-full md:w-auto h-11 border border-(--border) px-4 text-[11px] font-medium uppercase tracking-wider text-(--text-muted) transition-colors hover:bg-(--surface-hover) hover:text-(--text-secondary) disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-(--text-muted) active:scale-[0.96]"
            disabled={!hasChanges || isPending}
            onClick={handleReset}
            type="button"
          >
            Reset
          </button>
          <button
            className="w-full md:w-auto h-11 bg-(--accent) px-5 text-[11px] font-medium uppercase tracking-wider text-white transition-colors hover:bg-(--accent)/90 disabled:opacity-40 active:scale-[0.96]"
            disabled={!hasChanges || isPending}
            onClick={handleApply}
            type="button"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
