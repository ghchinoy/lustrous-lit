import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { LUSTROUS_ICON_NAMES } from "../components/lustrous-icon/lustrous-icon.js";
import "../components/lustrous-icon/lustrous-icon.js";
import {
  darkColors,
  fonts,
  iconSizes,
  iconStrokes,
  lightColors,
  radius,
  spacing,
  typography,
  zIndex,
  type LustrousColorToken,
  type LustrousIconSize,
  type LustrousTextVariant,
  type TypographyVariantSpec,
} from "../theme/tokens.js";

const meta: Meta = {
  title: "Foundations",
};
export default meta;

const COLOR_GROUPS: ReadonlyArray<{ title: string; tokens: readonly LustrousColorToken[] }> = [
  {
    title: "Surfaces & Neutrals",
    tokens: [
      "background",
      "on-background",
      "surface",
      "surface-bright",
      "surface-dim",
      "surface-background",
      "surface-container-low",
      "surface-container",
      "surface-container-high",
      "surface-container-highest",
      "surface-accent",
      "on-surface",
      "on-surface-control",
      "on-surface-variant",
      "on-surface-low",
      "outline",
      "outline-variant",
    ],
  },
  {
    title: "Brand & Semantic Roles",
    tokens: [
      "primary",
      "on-primary",
      "primary-container",
      "on-primary-container",
      "accent",
      "on-accent",
      "accent-container",
      "on-accent-container",
      "accent-fixed",
      "tertiary",
      "on-tertiary",
      "tertiary-container",
      "on-tertiary-container",
      "positive",
      "on-positive",
      "positive-container",
      "on-positive-container",
      "warning",
      "on-warning",
      "warning-container",
      "on-warning-container",
      "error",
      "on-error",
      "error-container",
      "on-error-container",
    ],
  },
  {
    title: "Categorical Palette",
    tokens: [
      "category-cobalt",
      "on-category-cobalt",
      "category-emerald",
      "on-category-emerald",
      "category-amber",
      "on-category-amber",
      "category-rose",
      "on-category-rose",
      "category-violet",
      "on-category-violet",
      "category-teal",
      "on-category-teal",
    ],
  },
  {
    title: "Code & Data Visualization",
    tokens: [
      "code-background",
      "code-primary-text",
      "code-comment",
      "code-outline",
      "code-grey-text",
      "code-blue-text",
      "code-pink-text",
      "code-yellow-text",
      "code-green-text",
      "code-red-text",
      "code-purple-text",
      "code-teal-text",
      "data1",
      "data2",
      "data3",
      "data4",
      "data5",
    ],
  },
];

const CARD_STYLE = [
  "background-color: var(--lustrous-color-surface-container)",
  "color: var(--lustrous-color-on-surface)",
  "border: 1px solid var(--lustrous-color-outline-variant)",
  "border-radius: var(--lustrous-radius-m)",
].join("; ");

export const Colors: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px; color: var(--lustrous-color-on-background);">
      ${COLOR_GROUPS.map(
        (group) => html`
          <section style="display: flex; flex-direction: column; gap: 12px;">
            <h2 class="lustrous-headline-small" style="margin: 0; color: var(--lustrous-color-on-background);">
              ${group.title}
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
              ${group.tokens.map((token) => {
                const lightVal = lightColors[token];
                const darkVal = darkColors[token] ?? lightVal;
                return html`
                  <div style="${CARD_STYLE}; overflow: hidden; display: flex; flex-direction: column;">
                    <div
                      style="height: 48px; background: var(--lustrous-color-${token}); border-bottom: 1px solid var(--lustrous-color-outline-variant);"
                    ></div>
                    <div
                      style="padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; background-color: var(--lustrous-color-surface-container); color: var(--lustrous-color-on-surface);"
                    >
                      <code class="lustrous-code" style="font-size: 12px; color: var(--lustrous-color-on-surface);">
                        --lustrous-color-${token}
                      </code>
                      <span class="lustrous-caption" style="color: var(--lustrous-color-on-surface);">
                        Light: ${lightVal} · Dark: ${darkVal}
                      </span>
                    </div>
                  </div>
                `;
              })}
            </div>
          </section>
        `,
      )}
    </div>
  `,
};

export const Typography: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; color: var(--lustrous-color-on-background);">
      <section style="display: flex; flex-direction: column; gap: 12px;">
        <h2 class="lustrous-headline-small" style="margin: 0; color: var(--lustrous-color-on-background);">
          Font Stacks
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;">
          ${(Object.entries(fonts) as Array<[keyof typeof fonts, string]>).map(
            ([name, stack]) => html`
              <div style="${CARD_STYLE}; padding: 16px; display: flex; flex-direction: column; gap: 6px;">
                <code class="lustrous-code" style="color: var(--lustrous-color-on-surface);">--lustrous-font-${name}</code>
                <span class="lustrous-caption" style="color: var(--lustrous-color-on-surface); word-break: break-word;">
                  ${stack}
                </span>
              </div>
            `,
          )}
        </div>
      </section>

      <section style="display: flex; flex-direction: column; gap: 12px;">
        <h2 class="lustrous-headline-small" style="margin: 0; color: var(--lustrous-color-on-background);">
          Type Scale
        </h2>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${(Object.entries(typography) as Array<[LustrousTextVariant, TypographyVariantSpec]>).map(
            ([variant, spec]) => html`
              <div style="${CARD_STYLE}; padding: 16px; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px;">
                  <code class="lustrous-code" style="color: var(--lustrous-color-on-surface);">.lustrous-${variant}</code>
                  <span class="lustrous-caption" style="color: var(--lustrous-color-on-surface);">
                    ${spec.family} · ${spec.size} / ${spec.lineHeight} · wght ${spec.weight ?? 400}
                  </span>
                </div>
                <div class="lustrous-${variant}" style="color: var(--lustrous-color-on-surface);">
                  Architectural mineral precision across adaptive light and dark surfaces.
                </div>
              </div>
            `,
          )}
        </div>
      </section>
    </div>
  `,
};

export const SpacingAndRadius: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px; color: var(--lustrous-color-on-background);">
      <section style="display: flex; flex-direction: column; gap: 12px;">
        <h2 class="lustrous-headline-small" style="margin: 0; color: var(--lustrous-color-on-background);">
          Spacing Scale
        </h2>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${Object.entries(spacing).map(
            ([token, value]) => html`
              <div
                style="${CARD_STYLE}; padding: 12px 16px; display: grid; grid-template-columns: 180px 64px 1fr; align-items: center; gap: 16px;"
              >
                <code class="lustrous-code" style="color: var(--lustrous-color-on-surface);">--lustrous-space-${token}</code>
                <span class="lustrous-body-small" style="color: var(--lustrous-color-on-surface);">${value}</span>
                <div
                  style="height: 16px; width: var(--lustrous-space-${token}); background-color: var(--lustrous-color-primary); border-radius: var(--lustrous-radius-xs);"
                ></div>
              </div>
            `,
          )}
        </div>
      </section>

      <section style="display: flex; flex-direction: column; gap: 12px;">
        <h2 class="lustrous-headline-small" style="margin: 0; color: var(--lustrous-color-on-background);">
          Border Radius Scale
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
          ${Object.entries(radius).map(
            ([token, value]) => html`
              <div style="${CARD_STYLE}; padding: 16px; display: flex; align-items: center; gap: 16px;">
                <div
                  style="width: 52px; height: 52px; flex-shrink: 0; background-color: var(--lustrous-color-primary-container); border: 2px solid var(--lustrous-color-primary); border-radius: var(--lustrous-radius-${token});"
                ></div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <code class="lustrous-code" style="font-size: 12px; color: var(--lustrous-color-on-surface);">
                    --lustrous-radius-${token}
                  </code>
                  <span class="lustrous-caption" style="color: var(--lustrous-color-on-surface);">${value}</span>
                </div>
              </div>
            `,
          )}
        </div>
      </section>
    </div>
  `,
};

export const Elevation: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px; color: var(--lustrous-color-on-background);">
      <section style="display: flex; flex-direction: column; gap: 12px;">
        <h2 class="lustrous-headline-small" style="margin: 0; color: var(--lustrous-color-on-background);">
          Elevation Levels
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px;">
          ${(["level1", "level2"] as const).map(
            (level, idx) => html`
              <div
                style="${CARD_STYLE}; padding: 24px; border-radius: var(--lustrous-radius-l); box-shadow: var(--lustrous-elevation-${level}); display: flex; flex-direction: column; gap: 8px;"
              >
                <span class="lustrous-body-medium-emphasized" style="color: var(--lustrous-color-on-surface);">
                  Elevation ${idx + 1}
                </span>
                <code class="lustrous-code" style="font-size: 12px; color: var(--lustrous-color-on-surface);">
                  --lustrous-elevation-${level}
                </code>
              </div>
            `,
          )}
        </div>
      </section>

      <section style="display: flex; flex-direction: column; gap: 12px;">
        <h2 class="lustrous-headline-small" style="margin: 0; color: var(--lustrous-color-on-background);">
          Z-Index Layers
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
          ${Object.entries(zIndex).map(
            ([layer, value]) => html`
              <div style="${CARD_STYLE}; padding: 12px 16px; display: flex; flex-direction: column; gap: 4px;">
                <code class="lustrous-code" style="font-size: 12px; color: var(--lustrous-color-on-surface);">
                  --lustrous-z-${layer}
                </code>
                <span class="lustrous-caption" style="color: var(--lustrous-color-on-surface);">${value}</span>
              </div>
            `,
          )}
        </div>
      </section>
    </div>
  `,
};

export const Icons: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px; color: var(--lustrous-color-on-background);">
      <section style="display: flex; flex-direction: column; gap: 12px;">
        <h2 class="lustrous-headline-small" style="margin: 0; color: var(--lustrous-color-on-background);">
          Optical Icon Scale
        </h2>
        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
          ${(Object.keys(iconSizes) as LustrousIconSize[]).map(
            (size) => html`
              <div style="${CARD_STYLE}; padding: 16px; display: flex; align-items: center; gap: 12px;">
                <lustrous-icon name="bolt" size=${size}></lustrous-icon>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <code class="lustrous-code" style="font-size: 12px; color: var(--lustrous-color-on-surface);">
                    size="${size}"
                  </code>
                  <span class="lustrous-caption" style="color: var(--lustrous-color-on-surface);">
                    ${iconSizes[size]}px · stroke ${iconStrokes[size]}
                  </span>
                </div>
              </div>
            `,
          )}
        </div>
      </section>

      <section style="display: flex; flex-direction: column; gap: 12px;">
        <h2 class="lustrous-headline-small" style="margin: 0; color: var(--lustrous-color-on-background);">
          Core Icon Set (${LUSTROUS_ICON_NAMES.length})
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 10px;">
          ${LUSTROUS_ICON_NAMES.map(
            (name) => html`
              <div style="${CARD_STYLE}; padding: 12px; display: flex; align-items: center; gap: 10px;">
                <lustrous-icon name=${name} size="m"></lustrous-icon>
                <code
                  class="lustrous-code"
                  style="font-size: 12px; color: var(--lustrous-color-on-surface); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                >
                  ${name}
                </code>
              </div>
            `,
          )}
        </div>
      </section>
    </div>
  `,
};
