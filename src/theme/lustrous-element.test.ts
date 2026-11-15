import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { describe, expect, it } from "vitest";
import { css, fixture } from "../test/fixture.js";
import { LustrousElement, lustrousBase } from "./index.js";

@customElement("test-lustrous-probe")
class TestLustrousProbe extends LustrousElement {
  static override styles = [lustrousBase];
  override render() {
    return html`<slot></slot>`;
  }
}

describe("LustrousElement", () => {
  it("auto-installs the theme on first connect and respects [hidden]", async () => {
    const el = await fixture<TestLustrousProbe>(`<test-lustrous-probe>hi</test-lustrous-probe>`);
    expect(css(el, "--lustrous-space-m")).toBe("12px");
    el.hidden = true;
    expect(css(el, "display")).toBe("none");
  });
});
