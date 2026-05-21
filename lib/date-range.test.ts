import { describe, expect, it } from "vitest";
import { normalizeDateRange, parseRangeFromSearchParams } from "@/lib/date-range";

describe("date ranges", () => {
  it("normalizes inverted custom ranges", () => {
    expect(
      normalizeDateRange({
        preset: "custom",
        start: "2026-05-21",
        end: "2026-05-19",
      }),
    ).toEqual({
      preset: "custom",
      start: "2026-05-19",
      end: "2026-05-21",
    });
  });

  it("parses custom range search params", () => {
    expect(
      parseRangeFromSearchParams({
        preset: "custom",
        start: "2026-05-19",
        end: "2026-05-21",
      }),
    ).toEqual({
      preset: "custom",
      start: "2026-05-19",
      end: "2026-05-21",
    });
  });
});
