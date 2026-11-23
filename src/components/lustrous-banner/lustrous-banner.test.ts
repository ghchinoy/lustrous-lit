import { afterEach, describe, expect, it, vi } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import { DEFAULT_LUSTROUS_LABELS, setLustrousLabels } from "../../theme/labels.js";
import "./lustrous-banner.js";
import type { LustrousBanner, LustrousBannerActionEvent } from "./lustrous-banner.js";

const banner = (el: LustrousBanner) => el.shadowRoot!.querySelector<HTMLElement>("[part=banner]")!;

afterEach(() => {
  setLustrousLabels(DEFAULT_LUSTROUS_LABELS);
});

describe("lustrous-banner", () => {
  it("renders a named section region in column layout with actions and dismiss button", async () => {
    const el = await fixture<LustrousBanner>(
      `<lustrous-banner heading="Upgrade to Pro" description="Dedicated capacity" icon="bolt" primary-action="Upgrade" secondary-action="Learn more" dismissible></lustrous-banner>`,
    );
    const b = banner(el);
    expect(b.tagName).toBe("SECTION");
    expect(b.getAttribute("aria-label")).toBe("Upgrade to Pro");
    expect(b.classList.contains("column")).toBe(true);
    expect(css(b, "border-top-left-radius")).toBe("20px");
    expect(b.querySelector("[role=heading]")!.getAttribute("aria-level")).toBe("3");
    const [secondary, primary] = [...b.querySelectorAll("lustrous-button")];
    expect(secondary.variant).toBe("on-surface");
    expect(primary.variant).toBe("tonal");
    expect(b.querySelector("lustrous-icon-button")!.getAttribute("aria-label")).toBe("Dismiss");
  });

  it("falls back to getLustrousLabels() for region and dismiss button names", async () => {
    setLustrousLabels({ notificationBanner: "Hinweisbanner", dismiss: "Ausblenden" });
    const el = await fixture<LustrousBanner>(`<lustrous-banner description="Notice" dismissible></lustrous-banner>`);
    const b = banner(el);
    expect(b.getAttribute("aria-label")).toBe("Hinweisbanner");
    expect(b.querySelector("lustrous-icon-button")!.getAttribute("aria-label")).toBe("Ausblenden");
  });

  it("collapses heading-only auto layout to a row and supports inline variant", async () => {
    const el = await fixture<LustrousBanner>(
      `<lustrous-banner variant="inline" heading="Maintenance tonight at 10 PM." icon="info"></lustrous-banner>`,
    );
    expect(banner(el).classList.contains("row")).toBe(true);
    expect(css(banner(el), "box-shadow")).toBe("none");
  });

  it("fires lustrous-action and hides on dismiss unless lustrous-close-request is canceled", async () => {
    const el = await fixture<LustrousBanner>(
      `<lustrous-banner heading="Tip" description="Details" primary-action="OK" dismissible></lustrous-banner>`,
    );
    const onAction = vi.fn();
    el.addEventListener("lustrous-action", ((e: LustrousBannerActionEvent) => onAction(e.detail.action)) as EventListener);
    banner(el).querySelector("lustrous-button")!.shadowRoot!.querySelector("button")!.click();
    expect(onAction).toHaveBeenCalledWith("primary");

    const close = () => banner(el).querySelector("lustrous-icon-button")!.shadowRoot!.querySelector("button")!.click();
    el.addEventListener("lustrous-close-request", (e) => e.preventDefault(), { once: true });
    close();
    expect(el.hidden).toBe(false);
    close();
    expect(el.hidden).toBe(true);
    expect(css(el, "display")).toBe("none");
  });

  it("renders trailing badge and respects image-border-radius", async () => {
    const el = await fixture<LustrousBanner>(
      `<lustrous-banner variant="inline" heading="Directory sync" description="Connect it." badge="Paused" media-placement="inline-title" image-url="data:image/gif;base64,R0lGODlhAQABAAAAACw=" image-alt="Logo" image-size="20" image-border-radius="none"></lustrous-banner>`,
    );
    const badge = banner(el).querySelector<HTMLElement>(".title-row lustrous-badge")!;
    expect(badge.textContent).toBe("Paused");
    const img = banner(el).querySelector<HTMLElement>(".title-row img")!;
    expect(img.getAttribute("width")).toBe("20");
    expect(css(img, "border-top-left-radius")).toBe("0px");
    expect(css(img, "object-fit")).toBe("contain");
  });

  it("supports clickable banner surface with unnested dismiss button and lustrous-click event", async () => {
    const el = await fixture<LustrousBanner>(
      `<lustrous-banner clickable dismissible heading="New release notes" description="See what changed in v0.2." icon="rocketLaunch"></lustrous-banner>`,
    );
    const surface = el.shadowRoot!.querySelector<HTMLButtonElement>("[part=surface]")!;
    const close = el.shadowRoot!.querySelector<HTMLElement>("lustrous-icon-button.close")!;
    expect(surface.tagName).toBe("BUTTON");
    expect(surface.contains(close)).toBe(false);
    expect(surface.textContent).toContain("New release notes");
    expect(surface.textContent).toContain("See what changed in v0.2.");

    const onClick = vi.fn();
    el.addEventListener("lustrous-click", onClick);
    surface.click();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
