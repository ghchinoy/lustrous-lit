import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { css, fixture } from "../../test/fixture.js";
import "./lustrous-timeline.js";
import type { LustrousTimeline, LustrousTimelineItem } from "./lustrous-timeline.js";

const $ = (el: LustrousTimelineItem, s: string) => el.shadowRoot!.querySelector<HTMLElement>(s)!;
const color = async (value: string) =>
  css(await fixture<HTMLElement>(`<div style="background: ${value}"></div>`), "background-color");

async function roadmap() {
  const el = await fixture<LustrousTimeline>(`<lustrous-timeline label="Project roadmap">
    <lustrous-timeline-item status="past" marker-label="Completed" heading="Architecture RFC approved" time-label="Q1 2026">
      <p style="margin: 0">Completed design review.</p>
    </lustrous-timeline-item>
    <lustrous-timeline-item status="active" marker-label="Current" heading="Component rollout" time-label="Q2 2026"></lustrous-timeline-item>
    <lustrous-timeline-item status="future" marker-label="Upcoming" heading="Production cutover" time-label="Q3 2026"></lustrous-timeline-item>
  </lustrous-timeline>`);
  const items = [...el.querySelectorAll<LustrousTimelineItem>("lustrous-timeline-item")];
  await Promise.all(items.map((i) => i.updateComplete));
  return { el, items };
}

describe("lustrous-timeline", () => {
  it("exposes list/listitem semantics and accessible status marker labels", async () => {
    const { el, items } = await roadmap();
    expect(el.internals?.role).toBe("list");
    expect(el.internals?.ariaLabel).toBe("Project roadmap");
    expect(items.map((i) => i.internals?.role)).toEqual(["listitem", "listitem", "listitem"]);
    for (const name of ["Completed", "Current", "Upcoming"]) {
      await expect.element(page.getByRole("img", { name })).toBeInTheDocument();
    }
  });

  it("colors status dots by milestone state and keeps default dots decorative", async () => {
    const { items } = await roadmap();
    expect(css($(items[0], ".dot"), "background-color")).toBe(await color("var(--lustrous-color-tertiary)"));
    expect(css($(items[1], ".dot"), "background-color")).toBe(await color("var(--lustrous-color-primary)"));
    expect(css($(items[2], ".dot"), "background-color")).toBe(await color("var(--lustrous-color-outline)"));

    const plain = await fixture<LustrousTimelineItem>(
      `<lustrous-timeline-item heading="Step" marker-label="ignored"></lustrous-timeline-item>`,
    );
    const dot = $(plain, ".dot");
    expect(dot.getAttribute("aria-hidden")).toBe("true");
    expect(dot.hasAttribute("role")).toBe(false);
    expect(css(dot, "width")).toBe("16px");
  });

  it("draws a dotted connector except on last-child or hide-connector, and supports icon and custom slot=marker", async () => {
    const { items } = await roadmap();
    expect(css($(items[0], ".connector"), "display")).toBe("block");
    expect(css($(items[2], ".connector"), "display")).toBe("none");
    items[0].hideConnector = true;
    await items[0].updateComplete;
    expect(css($(items[0], ".connector"), "display")).toBe("none");

    const iconItem = await fixture<LustrousTimelineItem>(
      `<lustrous-timeline-item icon="checkCircle" heading="Verified build"></lustrous-timeline-item>`,
    );
    expect(iconItem.shadowRoot!.querySelector(".dot")).toBeNull();
    expect($(iconItem, ".icon svg").getAttribute("width")).toBe("20");

    const custom = await fixture<LustrousTimelineItem>(
      `<lustrous-timeline-item icon="checkCircle" heading="Custom stage"><span slot="marker">1</span></lustrous-timeline-item>`,
    );
    expect(custom.shadowRoot!.querySelector(".dot")).toBeNull();
    expect(custom.shadowRoot!.querySelector(".icon svg")).toBeNull();
    expect($(custom, ".icon").hidden).toBe(false);
  });
});
