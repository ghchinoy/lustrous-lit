import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { css, fixture } from "../../test/fixture.js";
import type { LustrousSearchBar } from "./lustrous-search-bar.js";
import "./lustrous-search-bar.js";

const input = (el: LustrousSearchBar) => el.shadowRoot!.querySelector("input")!;

describe("lustrous-search-bar", () => {
  it("renders a pill search input with decorative leading search icon and accessible name", async () => {
    const el = await fixture<LustrousSearchBar>(`<lustrous-search-bar></lustrous-search-bar>`);
    const surface = el.shadowRoot!.querySelector<HTMLElement>("[part=surface]")!;
    expect(css(surface, "height")).toBe("44px");
    expect(css(surface, "border-top-left-radius")).toBe("9999px");
    expect(input(el).type).toBe("search");
    expect(input(el).getAttribute("aria-label")).toBe("Search");

    const svg = el.shadowRoot!.querySelector<SVGElement>(".lead svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  it("shows clear button when non-empty, submits lustrous-search { value } on Enter, and clears or blurs on Escape", async () => {
    const el = await fixture<LustrousSearchBar>(`<lustrous-search-bar aria-label="Search docs"></lustrous-search-bar>`);
    const onSearch = vi.fn();
    const onClear = vi.fn();
    el.addEventListener("lustrous-search", (e) => onSearch(e.detail.value));
    el.addEventListener("lustrous-clear", onClear);

    expect(el.shadowRoot!.querySelector("lustrous-icon-button")).toBeNull();

    el.focus();
    await userEvent.keyboard("tokens{Enter}");
    await el.updateComplete;
    expect(el.value).toBe("tokens");
    expect(onSearch).toHaveBeenCalledWith("tokens");

    const clearBtn = el.shadowRoot!.querySelector("lustrous-icon-button")!;
    expect(clearBtn).toBeTruthy();
    expect(clearBtn.getAttribute("icon")).toBe("close");
    expect(clearBtn.getAttribute("size")).toBe("s");

    // First Escape clears the query and keeps focus in the input
    await userEvent.keyboard("{Escape}");
    await el.updateComplete;
    expect(el.value).toBe("");
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(el.shadowRoot!.activeElement).toBe(input(el));

    // Second Escape when empty blurs the input
    await userEvent.keyboard("{Escape}");
    await el.updateComplete;
    expect(el.shadowRoot!.activeElement).not.toBe(input(el));
  });

  it("clears via the clear icon button and participates in FormData / reset", async () => {
    const form = await fixture<HTMLFormElement>(
      `<form><lustrous-search-bar name="q" value="initial" aria-label="Query"></lustrous-search-bar></form>`,
    );
    const el = form.querySelector<LustrousSearchBar>("lustrous-search-bar")!;
    await el.updateComplete;
    expect(new FormData(form).get("q")).toBe("initial");

    const clearBtn = el.shadowRoot!.querySelector("lustrous-icon-button")!;
    await userEvent.click(clearBtn);
    await el.updateComplete;
    expect(el.value).toBe("");
    expect(new FormData(form).get("q")).toBe("");
    expect(el.shadowRoot!.activeElement).toBe(input(el));

    form.reset();
    await el.updateComplete;
    expect(el.value).toBe("initial");
  });
});
