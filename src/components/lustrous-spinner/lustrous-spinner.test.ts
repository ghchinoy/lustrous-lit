import { describe, expect, it } from "vitest";
import { fixture } from "../../test/fixture.js";
import type { LustrousSpinner } from "./lustrous-spinner.js";
import "./lustrous-spinner.js";

describe("lustrous-spinner", () => {
  it("sets status role via ElementInternals when labelled", async () => {
    const unnamed = await fixture<LustrousSpinner>(`<lustrous-spinner></lustrous-spinner>`);
    expect(unnamed.internals?.ariaHidden).toBe("true");

    const named = await fixture<LustrousSpinner>(`<lustrous-spinner label="Saving"></lustrous-spinner>`);
    expect(named.internals?.role).toBe("status");
    expect(named.internals?.ariaLabel).toBe("Saving");
  });
});
