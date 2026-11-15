import "@ghchinoy/lustrous-lit/fonts.css";
import { svg } from "lit";
import { registerLustrousIcons } from "@ghchinoy/lustrous-lit/components/lustrous-icon";
import {
  installLustrousTheme,
  readLustrousThemePreference,
  setLustrousTheme,
} from "@ghchinoy/lustrous-lit/theme";
import "./app-shell.js";

declare module "@ghchinoy/lustrous-lit/components/lustrous-icon" {
  interface LustrousCustomIconMap {
    meridianLogo: true;
  }
}

installLustrousTheme();
setLustrousTheme(readLustrousThemePreference("meridian.theme"));

registerLustrousIcons({
  meridianLogo: {
    paths: svg`
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    `,
    directional: false,
  },
});

const mount = document.getElementById("app") ?? document.body;
if (!mount.querySelector("meridian-app-shell")) {
  mount.append(document.createElement("meridian-app-shell"));
}
