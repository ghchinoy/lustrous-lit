import { describe, expect, it, vi } from "vitest";
import { fixture, setViewport } from "../../test/fixture.js";
import "./lustrous-segmented-control.js";
import type { LustrousSegmentedControl } from "./lustrous-segmented-control.js";

async function make(value = "grid") {
  const el = await fixture<LustrousSegmentedControl>(
    `<lustrous-segmented-control label="View"></lustrous-segmented-control>`,
  );
  el.options = [
    { value: "grid", label: "Grid", icon: "grid" },
    { value: "list", label: "List", badge: 3 },
    { value: "compact", label: "Compact", disabled: true },
    { value: "table", label: "Table" },
  ];
  el.value = value;
  await el.updateComplete;
  return el;
}

const tabs = (el: LustrousSegmentedControl) => [...el.shadowRoot!.querySelectorAll<HTMLButtonElement>("[role=tab]")];
const key = (target: HTMLElement, k: string) =>
  target.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));

describe("lustrous-segmented-control", () => {
  it("renders a named tablist with a single tab stop", async () => {
    const el = await make();
    const list = el.shadowRoot!.querySelector("[role=tablist]")!;
    expect(list.getAttribute("aria-label")).toBe("View");
    expect(tabs(el).map((t) => t.tabIndex)).toEqual([0, -1, -1, -1]);
    expect(tabs(el)[0].getAttribute("aria-selected")).toBe("true");
  });

  it("emits lustrous-change on click", async () => {
    const el = await make();
    const onChange = vi.fn();
    el.addEventListener("lustrous-change", (e) => onChange(e.detail.value));
    tabs(el)[1].click();
    expect(onChange).toHaveBeenCalledWith("list");
    expect(el.value).toBe("list");
  });

  it("navigates with arrow keys, skipping disabled options and wrapping, plus Home/End", async () => {
    const el = await make("list");
    key(tabs(el)[1], "ArrowRight");
    expect(el.value).toBe("table");
    key(tabs(el)[3], "ArrowRight");
    expect(el.value).toBe("grid");
    key(tabs(el)[0], "ArrowLeft");
    expect(el.value).toBe("table");
    key(tabs(el)[3], "Home");
    expect(el.value).toBe("grid");
    key(tabs(el)[0], "End");
    expect(el.value).toBe("table");
    await el.updateComplete;
    await new Promise((r) => setTimeout(r));
    expect(el.shadowRoot!.activeElement).toBe(tabs(el)[3]);
  });

  it("sizes segments equally, slides the indicator pill, and supports size=m and variant=transparent", async () => {
    const el = await fixture<LustrousSegmentedControl>(
      `<lustrous-segmented-control label="Mode" value="a"></lustrous-segmented-control>`,
    );
    el.options = [
      { value: "a", label: "Short" },
      { value: "b", label: "A much longer label" },
    ];
    await el.updateComplete;
    const sr = el.shadowRoot!;
    const [a, b] = [...sr.querySelectorAll<HTMLElement>(".seg")];
    expect(Math.abs(a.getBoundingClientRect().width - b.getBoundingClientRect().width)).toBeLessThan(1);

    const pill = sr.querySelector<HTMLElement>("[part=indicator]")!;
    const near = (x: number, y: number) => Math.abs(x - y) < 1;
    expect(near(pill.getBoundingClientRect().left, a.getBoundingClientRect().left)).toBe(true);

    el.value = "b";
    await el.updateComplete;
    pill.getAnimations().forEach((x) => x.finish());
    await expect.poll(() => near(pill.getBoundingClientRect().left, b.getBoundingClientRect().left)).toBe(true);
    expect(getComputedStyle(sr.querySelector(".track")!).height).toBe("32px");

    el.size = "m";
    el.variant = "transparent";
    await el.updateComplete;
    expect(getComputedStyle(sr.querySelector(".track")!).height).toBe("40px");
    expect(getComputedStyle(sr.querySelector(".track")!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("expands vertical hit target to 44px via ::before at <=768px without changing track height", async () => {
    await setViewport(400, 800);
    const el = await make();
    const seg = tabs(el)[0]!;
    await expect.poll(() => getComputedStyle(seg, "::before").height).toBe("44px");
    expect(getComputedStyle(el.shadowRoot!.querySelector(".track")!).height).toBe("32px");
    await setViewport(1200, 800);
  });
});
