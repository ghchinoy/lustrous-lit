import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { ref } from "lit/directives/ref.js";
import "../lustrous-box/lustrous-box.js";
import "../lustrous-button/lustrous-button.js";
import "../lustrous-flex/lustrous-flex.js";
import "./lustrous-snackbar.js";
import type { LustrousSnackbar } from "./lustrous-snackbar.js";

const meta: Meta = {
  title: "Overlays/Snackbar",
  component: "lustrous-snackbar",
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const Stack: Story = {
  render: () => html`
    <lustrous-box height="320">
      <lustrous-snackbar
        position="top-start"
        max="4"
        ${ref((el) => {
          const bar = el as LustrousSnackbar | undefined;
          bar?.show("Repository archived", { id: "a", duration: 0, action: { label: "Undo" } });
          bar?.show("Build published to production", { id: "b", variant: "positive", duration: 0 });
          bar?.show("API quota is at 85% capacity", { id: "c", variant: "warning", duration: 0 });
          bar?.show("Could not sync workspace settings", { id: "d", variant: "error", duration: 0 });
        })}
      ></lustrous-snackbar>
    </lustrous-box>
  `,
};

export const Interactive: Story = {
  tags: ["skip-visual"],
  render: () => html`
    <lustrous-flex gap="s" padding="l" wrap="wrap">
      <lustrous-button
        variant="tonal"
        @click=${() => document.querySelector<LustrousSnackbar>("#demo-snackbar")!.show("Share link copied")}
        >Default</lustrous-button
      >
      <lustrous-button
        variant="tonal"
        @click=${() =>
          document.querySelector<LustrousSnackbar>("#demo-snackbar")!.show("Changes saved", {
            variant: "positive",
            action: { label: "Undo" },
          })}
        >Positive + Action</lustrous-button
      >
      <lustrous-button
        variant="tonal"
        @click=${() =>
          document.querySelector<LustrousSnackbar>("#demo-snackbar")!.show("Rate limit approaching", {
            variant: "warning",
          })}
        >Warning</lustrous-button
      >
      <lustrous-button
        variant="tonal"
        @click=${() =>
          document.querySelector<LustrousSnackbar>("#demo-snackbar")!.show("Connection interrupted", {
            variant: "error",
          })}
        >Error</lustrous-button
      >
      <lustrous-snackbar id="demo-snackbar"></lustrous-snackbar>
    </lustrous-flex>
  `,
};
