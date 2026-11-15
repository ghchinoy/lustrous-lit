/** Sort modules by path so the manifest is deterministic across filesystems. */
const sortModules = () => ({
  name: "sort-modules",
  packageLinkPhase({ customElementsManifest }) {
    customElementsManifest.modules.sort((a, b) => a.path.localeCompare(b.path, "en"));
  },
});

export default {
  globs: ["src/components/**/*.ts"],
  exclude: ["src/**/*.test.ts", "src/**/*.stories.ts"],
  outdir: ".",
  litelement: true,
  plugins: [sortModules()],
};
