import { describe, expect, it, vi } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import "./lustrous-list.js";
import type { LustrousList, LustrousListItem } from "./lustrous-list.js";

const row = (el: LustrousListItem) => el.shadowRoot!.querySelector<HTMLElement>("[part=row]")!;

describe("lustrous-list", () => {
  it("sets list/listitem ElementInternals semantics and styles selected items", async () => {
    const el = await fixture<LustrousList>(
      `<lustrous-list label="Environments" gap="xs"><lustrous-list-item label="Production" description="Active" start-icon="bolt" selected></lustrous-list-item><lustrous-list-item label="Staging"></lustrous-list-item></lustrous-list>`,
    );
    expect(el.internals?.role).toBe("list");
    expect(el.internals?.ariaLabel).toBe("Environments");
    expect(css(el, "flex-direction")).toBe("column");
    expect(css(el, "row-gap")).toBe("4px");

    const [prod, staging] = [...el.querySelectorAll<LustrousListItem>("lustrous-list-item")];
    await prod.updateComplete;
    expect(prod.internals?.role).toBe("listitem");
    expect(row(prod).tagName).toBe("BUTTON");
    expect(row(prod).getAttribute("aria-current")).toBe("true");
    expect(css(row(prod), "padding-left")).toBe("8px");
    expect(css(row(staging), "padding-left")).toBe("16px");
    expect(css(row(prod), "border-top-left-radius")).toBe("14px");
    expect(prod.shadowRoot!.querySelector(".desc")!.textContent).toBe("Active");
  });

  it("renders links, static rows, and disabled rows", async () => {
    const el = await fixture<LustrousList>(
      `<lustrous-list><lustrous-list-item label="Docs" href="/docs" end-icon="chevronRight"></lustrous-list-item><lustrous-list-item label="Version" static><span slot="end">1.2</span></lustrous-list-item><lustrous-list-item label="Off" disabled></lustrous-list-item></lustrous-list>`,
    );
    const [link, stat, off] = [...el.querySelectorAll<LustrousListItem>("lustrous-list-item")];
    await Promise.all([link.updateComplete, stat.updateComplete, off.updateComplete]);
    expect(row(link).tagName).toBe("A");
    expect(row(stat).tagName).toBe("DIV");
    expect(stat.shadowRoot!.querySelector<HTMLElement>(".end")!.hidden).toBe(false);
    expect((row(off) as HTMLButtonElement).disabled).toBe(true);
    const onClick = vi.fn();
    off.addEventListener("click", onClick);
    row(off).click();
    expect(onClick).not.toHaveBeenCalled();
  });
});
