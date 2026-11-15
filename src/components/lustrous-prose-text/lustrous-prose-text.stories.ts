import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { typography } from "../../theme/tokens.js";
import "../lustrous-box/lustrous-box.js";
import "../lustrous-flex/lustrous-flex.js";
import "./lustrous-prose-text.js";

const meta: Meta = {
  title: "Primitives/ProseText",
  component: "lustrous-prose-text",
  argTypes: {
    variant: { control: "select", options: Object.keys(typography) },
    tone: { control: "select", options: ["default", "error", "positive", "warning", "primary", "tertiary"] },
  },
  args: {
    variant: "body-medium",
    tone: "default",
    muted: false,
    text: "Internationalized engineering handbooks align mixed LTR and RTL passages cleanly.",
  },
  render: (a) =>
    html`<lustrous-prose-text block variant=${a.variant} tone=${a.tone} ?muted=${a.muted}>${a.text}</lustrous-prose-text>`,
};
export default meta;
type Story = StoryObj;

export const LatinProse: Story = {};

export const HebrewAndArabicTechnicalProse: Story = {
  tags: ["skip-visual"],
  render: () => html`
    <lustrous-flex direction="column" gap="m" width="520" padding="l">
      <lustrous-prose-text block>
        PostgreSQL הוא בסיס נתונים אמין למערכות הפצה עם תוספי C++ וקריאה לפונקציה connect(host, port).
      </lustrous-prose-text>
      <lustrous-prose-text block>
        توثيق معماري لمحرك رسوميات 3-D على معالج 64-bit في المسار /usr/local/share/doc.
      </lustrous-prose-text>
    </lustrous-flex>
  `,
};

export const DirectionScopeAndTruncation: Story = {
  tags: ["skip-visual"],
  render: () => html`
    <lustrous-prose-direction-scope align-start>
      <lustrous-box width="440" padding="l" border border-radius="m" background="surface-bright">
        <lustrous-prose-text block margin-bottom="s">
          פיתוח רכיבי תשתית ב-C++ ושימוש ב-render(a, b) מתוך /usr/local/bin.
        </lustrous-prose-text>
        <lustrous-prose-text block margin-bottom="s">
          WebAssembly Component Model 2.0
        </lustrous-prose-text>
        <lustrous-prose-text wrap="truncate" muted>
          מדריך תפעול מקוצר עבור מערכות אחסון מבוזרות עם C++ ו-validateConfig() בשורה אחת ארוכה מאוד
        </lustrous-prose-text>
      </lustrous-box>
    </lustrous-prose-direction-scope>
  `,
};

export const MultilingualDirectoryCatalog: Story = {
  tags: ["skip-visual"],
  render: () => html`
    <lustrous-flex direction="column" gap="s" width="480" padding="l">
      <lustrous-prose-text language="ja" block>
        国際化された技術文書とタイポグラフィ設計ガイドライン (UTF-8 / BCP-47)
      </lustrous-prose-text>
      <lustrous-prose-text language="he" block>
        מפרט בינאום ולוקליזציה עבור מהדורות תיעוד רב-לשוניות
      </lustrous-prose-text>
      <lustrous-prose-text language="ar" block>
        دليل النشر متعدد اللغات وتنسيق الجداول ثنائية الاتجاه
      </lustrous-prose-text>
    </lustrous-flex>
  `,
};
