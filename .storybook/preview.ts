import type { Decorator, Preview } from "@storybook/web-components-vite";
import { setCustomElementsManifest } from "@storybook/web-components-vite";
import manifest from "../custom-elements.json";
import { installLustrousTheme, setLustrousTheme, type LustrousThemePreference } from "../src/theme/index.js";
import "../fonts/lustrous-fonts.css";

setCustomElementsManifest(manifest);
installLustrousTheme();

const withTheme: Decorator = (story, context) => {
  setLustrousTheme((context.globals.theme as LustrousThemePreference) ?? "light");
  document.body.classList.add("lustrous-root");
  return story();
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Lustrous theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "system", title: "System" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    layout: "padded",
    controls: { expanded: true },
  },
  tags: ["autodocs"],
};
export default preview;
