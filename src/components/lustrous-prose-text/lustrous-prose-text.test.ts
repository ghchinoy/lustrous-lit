import { afterEach, describe, expect, it } from "vitest";
import { css, fixture } from "../../test/fixture.js";
import "../lustrous-box/lustrous-box.js";
import "./lustrous-prose-text.js";
import {
  countProseWords,
  estimateProseDirection,
  findTechnicalLtrRanges,
  getDocumentDirection,
  type LustrousProseDirectionScope,
  type LustrousProseText,
  resolveDirection,
  resolveLanguageDirection,
} from "./lustrous-prose-text.js";

function extractRangeTexts(text: string): string[] {
  return findTechnicalLtrRanges(text).map((range) => text.slice(range.start, range.end));
}

describe("bidi prose direction estimation", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("dir");
  });

  it("resolves mixed-script sentences by prose word ratio instead of first-strong character", () => {
    expect(estimateProseDirection("PostgreSQL הוא בסיס נתונים מעולה לצוותים שעובדים בענן.")).toBe("rtl");
    expect(estimateProseDirection("TypeScript היא שפה פופולרית לפיתוח ממשקים.")).toBe("rtl");
    expect(estimateProseDirection("מדריך ל-OpenTelemetry Collector")).toBe("rtl");
    expect(estimateProseDirection('שלום means "peace" in Hebrew and appears in multilingual glossaries.')).toBe(
      "ltr",
    );
  });

  it("strips URLs, emails, file paths, and BiDi control chars before counting prose words", () => {
    expect(
      estimateProseDirection(
        "ראה https://example.com/a/b/c/d/e או שלח דואר אל docs@example.com בתיקייה /usr/local/share/doc",
      ),
    ).toBe("rtl");
    expect(estimateProseDirection("בדוק ב-/usr/local/bin את ההגדרות")).toBe("rtl");
    expect(estimateProseDirection("\uFEFFEditorial manual")).toBe("ltr");
    expect(estimateProseDirection("\u200Eשלום עולם")).toBe("rtl");
    expect(countProseWords("https://example.com/foo/bar 12345 1.")).toEqual({
      rtlWords: 0,
      ltrWords: 0,
    });
  });

  it("treats standalone digits, list markers, and Arabic-Indic digits as neutral", () => {
    expect(estimateProseDirection("1.")).toBe("neutral");
    expect(estimateProseDirection("2026-11-14")).toBe("neutral");
    expect(estimateProseDirection("١٢٣٤٥")).toBe("neutral");
    expect(resolveDirection("neutral", "rtl")).toBe("rtl");

    document.documentElement.setAttribute("dir", "rtl");
    expect(getDocumentDirection()).toBe("rtl");
    expect(resolveDirection("neutral")).toBe("rtl");
  });

  it("resolves BCP-47 language tags while protecting pure opposite-script text", () => {
    expect(resolveLanguageDirection("he", "123")).toBe("rtl");
    expect(resolveLanguageDirection("ar-EG", "مرحبا")).toBe("rtl");
    expect(resolveLanguageDirection("az-Arab", "123")).toBe("rtl");
    expect(resolveLanguageDirection("ar-Latn", "123")).toBe("ltr");
    expect(resolveLanguageDirection("ar-u-nu-latn", "123")).toBe("rtl");
    expect(resolveLanguageDirection("ar", "Pure English glossary entry")).toBe("ltr");
  });
});

describe("technical-token BiDi isolation", () => {
  it("leaves plain LTR words, multi-word product names, versions, and prose lists unwrapped in RTL", () => {
    expect(findTechnicalLtrRanges("OpenTelemetry Collector הוא כלי מעולה.")).toEqual([]);
    expect(
      findTechnicalLtrRanges(
        "ספריות פופולריות (כמו Lit) כוללות את Lit, Preact, Solid לפיתוח Web.",
      ),
    ).toEqual([]);
    expect(findTechnicalLtrRanges("התקן את Node.js בגרסה v22.0 עם Web Inspector (F12) היום.")).toEqual([]);
    expect(findTechnicalLtrRanges("האם למדת TypeScript?")).toEqual([]);
  });

  it("isolates technical tokens with dangling operators, attached brackets, tags, prefixes, and digit-hyphen-LTR compounds", () => {
    expect(extractRangeTexts("מדריך פיתוח ב-C++ ו-C# עם קריאה לפונקציה foo() עכשיו.")).toEqual([
      "C++",
      "C#",
      "foo()",
    ]);

    expect(
      extractRangeTexts("הרכיב <Outlet /> טוען את ל-/usr/local/bin מתוך $HOME עם render(a, b)."),
    ).toEqual(["<Outlet />", "/usr/local/bin", "$HOME", "render(a, b)"]);

    expect(extractRangeTexts("הזרם events$ והמשתנה foo$bar פעילים.")).toEqual(["events$", "foo$bar"]);

    expect(extractRangeTexts("نموذج 3-D ومعالج 64-bit سريع.")).toEqual(["3-D", "64-bit"]);
  });

  it("groups contiguous LTR phrases when a token in the phrase is technical", () => {
    expect(extractRangeTexts("התקן את GNU Compiler C++ 2024 או הרץ git commit --amend כעת.")).toEqual([
      "GNU Compiler C++ 2024",
      "git commit --amend",
    ]);

    expect(extractRangeTexts("התקן את C++ (2023) עם מהדר Clang (C++) מהיר.")).toEqual([
      "C++ (2023)",
      "Clang (C++)",
    ]);
  });
});

describe("lustrous-prose-text and lustrous-prose-direction-scope", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("dir");
  });

  it("resolves block direction on lustrous-prose-text and inline <bdi> isolation when truncated", async () => {
    const wrap = await fixture<HTMLElement>(`
      <div>
        <lustrous-prose-text id="block-prose" block>PostgreSQL הוא בסיס נתונים מעולה לצוותים בענן עם C++.</lustrous-prose-text>
        <lustrous-prose-text id="truncated-prose" wrap="truncate">מדריך ל-PostgreSQL עם C++</lustrous-prose-text>
        <lustrous-prose-text id="explicit-dir-truncated-prose" dir="rtl" wrap="truncate">12345</lustrous-prose-text>
        <lustrous-prose-text id="element-children-prose" block><span>PostgreSQL הוא בסיס נתונים מעולה לצוותים בענן.</span></lustrous-prose-text>
        <lustrous-prose-text id="numeric-prose" wrap="truncate">42</lustrous-prose-text>
        <lustrous-prose-text id="empty-prose" wrap="truncate"></lustrous-prose-text>
      </div>
    `);

    const block = wrap.querySelector<LustrousProseText>("#block-prose")!;
    await block.updateComplete;
    expect(block.getAttribute("dir")).toBe("rtl");
    const blockBdis = Array.from(block.shadowRoot!.querySelectorAll("bdi"));
    expect(blockBdis.map((el) => el.textContent)).toEqual(["C++"]);
    expect(blockBdis.every((el) => el.getAttribute("dir") === "ltr")).toBe(true);

    const truncated = wrap.querySelector<LustrousProseText>("#truncated-prose")!;
    await truncated.updateComplete;
    expect(truncated.hasAttribute("dir")).toBe(false);
    const outerBdi = truncated.shadowRoot!.querySelector('bdi[part="bdi"]');
    expect(outerBdi?.getAttribute("dir")).toBe("rtl");
    expect(outerBdi?.querySelector("bdi")?.textContent).toBe("C++");

    const explicitDirTruncated = wrap.querySelector<LustrousProseText>("#explicit-dir-truncated-prose")!;
    await explicitDirTruncated.updateComplete;
    expect(explicitDirTruncated.hasAttribute("dir")).toBe(false);
    expect(explicitDirTruncated.shadowRoot!.querySelector('bdi[part="bdi"]')?.getAttribute("dir")).toBe("rtl");

    const elementChildrenProse = wrap.querySelector<LustrousProseText>("#element-children-prose")!;
    await elementChildrenProse.updateComplete;
    expect(elementChildrenProse.getAttribute("dir")).toBe("rtl");

    const numeric = wrap.querySelector<LustrousProseText>("#numeric-prose")!;
    await numeric.updateComplete;
    expect(numeric.shadowRoot!.querySelector('bdi[part="bdi"]')?.getAttribute("dir")).toBe("ltr");
    expect(numeric.textContent).toBe("42");

    const empty = wrap.querySelector<LustrousProseText>("#empty-prose")!;
    await empty.updateComplete;
    expect(empty.shadowRoot!.querySelector("bdi")).toBeNull();
  });

  it("preserves parent-to-child upgrade order when scope stamps dir before or onto child prose", async () => {
    const scope = await fixture<LustrousProseDirectionScope>(`
      <lustrous-prose-direction-scope fallback-dir="ltr">
        <lustrous-prose-text id="direct-child" block>מדריך מפורט לעיבוד טקסט דו-כיווני בעברית מלאה</lustrous-prose-text>
      </lustrous-prose-direction-scope>
    `);
    const child = scope.querySelector<LustrousProseText>("#direct-child")!;
    await scope.updateComplete;
    await child.updateComplete;
    expect(child.resolvedDir).toBe("rtl");
    expect(child.getAttribute("dir")).toBe("rtl");
    expect(scope.effectiveDir).toBe("rtl");
  });

  it("inherits fallback direction for neutral text from enclosing lustrous-prose-direction-scope", async () => {
    const wrap = await fixture<HTMLElement>(`
      <lustrous-prose-direction-scope fallback-dir="rtl">
        <div>
          <lustrous-prose-text id="neutral-item" block>1.</lustrous-prose-text>
        </div>
      </lustrous-prose-direction-scope>
    `);
    const item = wrap.querySelector<LustrousProseText>("#neutral-item")!;
    await item.updateComplete;
    expect(item.getAttribute("dir")).toBe("rtl");
  });

  it("aggregates descendant prose word counts bottom-up in lustrous-prose-direction-scope and updates dynamically", async () => {
    const wrap = await fixture<HTMLElement>(`
      <lustrous-prose-direction-scope id="scope">
        <ul id="scoped-list">
          <li><lustrous-prose-text block>Pure English first bullet item</lustrous-prose-text></li>
          <li id="he1"><lustrous-prose-text block>פריט שני בעברית מלאה עם הסבר מפורט מאוד</lustrous-prose-text></li>
          <li id="he2"><lustrous-prose-text block>פריט שלישי בעברית מלאה עם פרטים נוספים</lustrous-prose-text></li>
        </ul>
      </lustrous-prose-direction-scope>
    `);
    const list = wrap.querySelector<HTMLElement>("#scoped-list")!;
    expect(list.getAttribute("dir")).toBe("rtl");

    wrap.querySelector("#he1")!.remove();
    wrap.querySelector("#he2")!.remove();
    expect(list.getAttribute("dir")).toBe("ltr");
  });

  it("aligns opposite-direction prose leaves and align-with-parent child scopes to the start edge when align-start is enabled", async () => {
    const wrap = await fixture<HTMLElement>(`
      <lustrous-prose-direction-scope align-start>
        <lustrous-box id="mixed-aligned-rtl-list">
          <div>
            <lustrous-prose-text id="ltr-item-in-rtl" block>PostgreSQL 17 (Stable)</lustrous-prose-text>
          </div>
          <div>
            <lustrous-prose-direction-scope align-with-parent>
              <lustrous-box id="composite-ltr-in-rtl">
                <lustrous-prose-text>C++ 23</lustrous-prose-text>
              </lustrous-box>
            </lustrous-prose-direction-scope>
          </div>
          <div>
            <lustrous-prose-direction-scope align-with-parent>
              <p id="native-dom-ltr-in-rtl">
                <lustrous-prose-text>Node.js</lustrous-prose-text>
              </p>
            </lustrous-prose-direction-scope>
          </div>
          <div>
            <lustrous-prose-text id="rtl-item-in-rtl" block>תמיכה מלאה במערכות ליבה מהירות במיוחד בעברית</lustrous-prose-text>
          </div>
        </lustrous-box>
      </lustrous-prose-direction-scope>
    `);

    const list = wrap.querySelector<HTMLElement>("#mixed-aligned-rtl-list")!;
    const ltrItem = wrap.querySelector<LustrousProseText>("#ltr-item-in-rtl")!;
    const compositeLtr = wrap.querySelector<HTMLElement>("#composite-ltr-in-rtl")!;
    const nativeLtr = wrap.querySelector<HTMLElement>("#native-dom-ltr-in-rtl")!;
    const rtlItem = wrap.querySelector<LustrousProseText>("#rtl-item-in-rtl")!;

    await ltrItem.updateComplete;
    await rtlItem.updateComplete;

    expect(list.getAttribute("dir")).toBe("rtl");
    expect(ltrItem.getAttribute("dir")).toBe("ltr");
    expect(compositeLtr.getAttribute("dir")).toBe("ltr");
    expect(nativeLtr.getAttribute("dir")).toBe("ltr");
    expect(rtlItem.getAttribute("dir")).toBe("rtl");

    expect(css(ltrItem, "text-align")).toBe("end");
    expect(css(compositeLtr, "text-align")).toBe("end");
    expect(css(nativeLtr, "text-align")).toBe("end");
    expect(rtlItem.hasAttribute("data-align-end")).toBe(false);
  });

  it("updates resolved direction when fallback-dir and child prose change and forwards through nested scopes", async () => {
    const outer = await fixture<LustrousProseDirectionScope>(`
      <lustrous-prose-direction-scope fallback-dir="ltr">
        <lustrous-box id="outer-scope">
          <lustrous-prose-direction-scope id="inner">
            <lustrous-box id="inner-scope">
              <lustrous-prose-text id="leaf-prose" block>English summary item</lustrous-prose-text>
            </lustrous-box>
          </lustrous-prose-direction-scope>
        </lustrous-box>
      </lustrous-prose-direction-scope>
    `);

    const outerBox = outer.querySelector<HTMLElement>("#outer-scope")!;
    const innerBox = outer.querySelector<HTMLElement>("#inner-scope")!;
    const leaf = outer.querySelector<LustrousProseText>("#leaf-prose")!;

    await outer.updateComplete;
    await leaf.updateComplete;

    expect(outerBox.getAttribute("dir")).toBe("ltr");
    expect(innerBox.getAttribute("dir")).toBe("ltr");
    expect(leaf.getAttribute("dir")).toBe("ltr");

    outer.fallbackDir = "rtl";
    leaf.textContent = "2026-11-14";
    await outer.updateComplete;
    await leaf.updateComplete;
    await new Promise((r) => setTimeout(r, 0));

    expect(outerBox.getAttribute("dir")).toBe("rtl");
    expect(innerBox.getAttribute("dir")).toBe("rtl");
    expect(leaf.getAttribute("dir")).toBe("rtl");
  });
});
