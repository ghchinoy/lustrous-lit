import type { FullConfig } from "@playwright/test";
import { unpackSnapshots } from "../../scripts/visual-webp.mjs";

export default async function globalSetup(config: FullConfig): Promise<void> {
  if (config.updateSnapshots === "all") return;
  await unpackSnapshots();
}
