import { describe, expect, it, vi } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import type { LustrousIconButton } from "../lustrous-icon-button/lustrous-icon-button.js";
import "./lustrous-code-block.js";
import type { LustrousCodeBlock, LustrousCopyEvent } from "./lustrous-code-block.js";

describe("lustrous-code-block", () => {
  it("renders code from the property or slotted fallback on the dark code surface and toggles wrap", async () => {
    const el = await fixture<LustrousCodeBlock>(`<lustrous-code-block label="shell"></lustrous-code-block>`);
    el.code = "pnpm build";
    await el.updateComplete;

    const pre = el.shadowRoot!.querySelector<HTMLElement>("pre")!;
    expect(pre.textContent).toContain("pnpm build");
    expect(css(pre, "white-space")).toBe("pre");

    el.wrap = true;
    await el.updateComplete;
    expect(css(pre, "white-space")).toBe("pre-wrap");

    const slotted = await fixture<LustrousCodeBlock>(`<lustrous-code-block>echo ready</lustrous-code-block>`);
    expect(slotted.text).toBe("echo ready");
  });

  it("copies via lustrous-icon-button, switches icon from copy to check, announces politely, and fires lustrous-copy { code }", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const original = Object.getOwnPropertyDescriptor(Navigator.prototype, "clipboard");
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    try {
      const el = await fixture<LustrousCodeBlock>(
        `<lustrous-code-block label="deploy.sh" code="kubectl rollout status deploy/web"></lustrous-code-block>`,
      );
      const onCopy = vi.fn();
      el.addEventListener("lustrous-copy", ((e: LustrousCopyEvent) => onCopy(e.detail)) as EventListener);

      const copyBtn = el.shadowRoot!.querySelector<LustrousIconButton>("[part=copy-button]")!;
      await copyBtn.updateComplete;
      expect(copyBtn.tagName).toBe("LUSTROUS-ICON-BUTTON");
      expect(copyBtn.icon).toBe("copy");
      expect(copyBtn.getAttribute("aria-label")).toBe("Copy deploy.sh");

      copyBtn.shadowRoot!.querySelector("button")!.click();
      await vi.waitFor(() => expect(onCopy).toHaveBeenCalledWith({ code: "kubectl rollout status deploy/web" }));
      expect(writeText).toHaveBeenCalledWith("kubectl rollout status deploy/web");

      await el.updateComplete;
      expect(copyBtn.icon).toBe("check");
      const status = el.shadowRoot!.querySelector("[role=status]")!;
      expect(status.getAttribute("aria-live")).toBe("polite");
      expect(status.textContent).toContain("Copied to clipboard");
    } finally {
      delete (navigator as unknown as Record<string, unknown>).clipboard;
      if (original) Object.defineProperty(Navigator.prototype, "clipboard", original);
    }
  });

  it("hides the copy button when no-copy is set", async () => {
    const el = await fixture<LustrousCodeBlock>(`<lustrous-code-block no-copy code="const x = 1;"></lustrous-code-block>`);
    expect(el.shadowRoot!.querySelector("[part=copy-button]")).toBeNull();
    expect(el.shadowRoot!.querySelector("[part=header]")).toBeNull();
  });
});
