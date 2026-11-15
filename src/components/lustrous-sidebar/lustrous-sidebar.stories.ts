import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "../lustrous-icon/lustrous-icon.js";
import "./lustrous-sidebar.js";

const meta: Meta = {
  title: "Shell/Sidebar",
  component: "lustrous-sidebar",
  parameters: { layout: "fullscreen" },
};
export default meta;

export const ExpandedAndCollapsed: StoryObj = {
  render: () => html`
    <div style="height: 460px; display: flex; gap: 32px; background: var(--lustrous-color-background);">
      <lustrous-sidebar label="Primary sidebar">
        <lustrous-sidebar-header label="Lustrous">
          <lustrous-icon slot="logo" name="layers" size="m"></lustrous-icon>
        </lustrous-sidebar-header>
        <lustrous-sidebar-nav label="Primary navigation">
          <lustrous-sidebar-item icon="home" label="Overview" active></lustrous-sidebar-item>
          <lustrous-sidebar-item icon="compass" label="Explore" href="#explore"></lustrous-sidebar-item>
          <lustrous-sidebar-scroll-area>
            <lustrous-sidebar-section heading="Projects" collapsible>
              <lustrous-sidebar-item label="Mineral Tokens" meta="2m" pinned badge></lustrous-sidebar-item>
              <lustrous-sidebar-item label="Release Checklist" badge="in-progress" badge-label="Running"></lustrous-sidebar-item>
            </lustrous-sidebar-section>
          </lustrous-sidebar-scroll-area>
        </lustrous-sidebar-nav>
        <lustrous-sidebar-footer>
          <lustrous-sidebar-item icon="settings" label="Settings"></lustrous-sidebar-item>
        </lustrous-sidebar-footer>
      </lustrous-sidebar>

      <lustrous-sidebar collapsed label="Collapsed sidebar">
        <lustrous-sidebar-header label="Lustrous">
          <lustrous-icon slot="logo" name="layers" size="m"></lustrous-icon>
        </lustrous-sidebar-header>
        <lustrous-sidebar-nav label="Collapsed navigation">
          <lustrous-sidebar-item icon="home" label="Overview" active></lustrous-sidebar-item>
          <lustrous-sidebar-item icon="compass" label="Explore" href="#explore"></lustrous-sidebar-item>
        </lustrous-sidebar-nav>
        <lustrous-sidebar-footer>
          <lustrous-sidebar-item icon="settings" label="Settings"></lustrous-sidebar-item>
        </lustrous-sidebar-footer>
      </lustrous-sidebar>
    </div>
  `,
};

export const MobileDrawer: StoryObj = {
  render: () => html`
    <div style="height: 460px; padding: 32px;">
      <lustrous-sidebar-drawer open label="Workspace drawer">
        <lustrous-sidebar label="Drawer sidebar">
          <lustrous-sidebar-header label="Lustrous">
            <lustrous-icon slot="logo" name="bolt" size="m"></lustrous-icon>
          </lustrous-sidebar-header>
          <lustrous-sidebar-nav label="Drawer navigation">
            <lustrous-sidebar-item icon="home" label="Overview" active></lustrous-sidebar-item>
            <lustrous-sidebar-item icon="folder" label="Documents"></lustrous-sidebar-item>
          </lustrous-sidebar-nav>
        </lustrous-sidebar>
      </lustrous-sidebar-drawer>
    </div>
  `,
};
