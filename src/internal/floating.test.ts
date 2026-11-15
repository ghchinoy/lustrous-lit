import { describe, expect, it } from "vitest";
import { computePosition } from "./floating.js";

const rect = (left: number, top: number, width: number, height: number): DOMRect =>
  ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;

describe("floating positioning", () => {
  it("places below by default and flips to top when near bottom viewport edge", () => {
    const vp = { width: 800, height: 600 };
    const normal = computePosition(rect(100, 100, 80, 36), { width: 200, height: 120 }, vp, false, {
      side: "bottom",
      align: "start",
    });
    expect(normal.side).toBe("bottom");
    expect(normal.x).toBe(100);
    expect(normal.y).toBe(142);

    const flipped = computePosition(rect(100, 520, 80, 36), { width: 200, height: 120 }, vp, false, {
      side: "bottom",
      align: "start",
    });
    expect(flipped.side).toBe("top");
  });

  it("resolves inline-start and inline-end logically in LTR and RTL", () => {
    const vp = { width: 800, height: 600 };
    const ltrEnd = computePosition(rect(300, 200, 60, 36), { width: 120, height: 40 }, vp, false, { side: "inline-end" });
    const rtlEnd = computePosition(rect(300, 200, 60, 36), { width: 120, height: 40 }, vp, true, { side: "inline-end" });
    expect(ltrEnd.side).toBe("right");
    expect(rtlEnd.side).toBe("left");
  });
});
