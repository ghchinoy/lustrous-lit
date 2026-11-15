import { describe, expect, it, vi } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import type { LustrousLink } from "./lustrous-link.js";
import "./lustrous-link.js";

describe("lustrous-link", () => {
  it("renders an inline anchor when href is set and a button when href is omitted", async () => {
    const anchorHost = await fixture<LustrousLink>(
      `<lustrous-link href="/docs" target="_blank" download="guide.pdf" external>Guide</lustrous-link>`,
    );
    const a = anchorHost.shadowRoot!.querySelector<HTMLAnchorElement>("a.link")!;
    expect(a).toBeTruthy();
    expect(a.classList.contains("focus-ring")).toBe(true);
    expect(a.getAttribute("href")).toBe("/docs");
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    expect(a.getAttribute("download")).toBe("guide.pdf");
    expect(anchorHost.shadowRoot!.querySelector("[part=external-icon] svg")).toBeTruthy();

    const btnHost = await fixture<LustrousLink>(`<lustrous-link>Show details</lustrous-link>`);
    const btn = btnHost.shadowRoot!.querySelector<HTMLButtonElement>("button.link")!;
    expect(btn).toBeTruthy();
    expect(btn.type).toBe("button");
    expect(btn.classList.contains("focus-ring")).toBe(true);
  });

  it("applies underline modes and blocks activation when disabled", async () => {
    const none = await fixture<LustrousLink>(
      `<lustrous-link href="#x" variant="muted" underline="none">Quiet</lustrous-link>`,
    );
    const noneLink = none.shadowRoot!.querySelector("a.link")!;
    expect(css(noneLink, "text-decoration-line")).toBe("none");

    const disabled = await fixture<LustrousLink>(`<lustrous-link href="/billing" disabled>Billing</lustrous-link>`);
    const onClick = vi.fn();
    disabled.addEventListener("click", onClick);
    const da = disabled.shadowRoot!.querySelector<HTMLAnchorElement>("a.link")!;
    expect(da.hasAttribute("href")).toBe(false);
    expect(da.getAttribute("aria-disabled")).toBe("true");
    expect(da.getAttribute("role")).toBe("link");
    da.click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
