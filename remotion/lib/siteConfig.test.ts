import { describe, it, expect } from "vitest";
import { parseToml, loadSiteConfig, buildThemeOverrides } from "./siteConfig";

describe("parseToml", () => {
  it("parses quoted strings, numbers, and booleans", () => {
    expect(parseToml('a = "hi"\nb = 42\nc = 1.5\nd = true')).toEqual({ a: "hi", b: 42, c: 1.5, d: true });
  });

  it("groups keys under [table] and [a.b] sections", () => {
    const src = `
[branding]
author = "A"

[fonts]
titleSize = 80
`;
    expect(parseToml(src)).toEqual({ branding: { author: "A" }, fonts: { titleSize: 80 } });
  });

  it("ignores comments and blank lines but keeps # inside quotes", () => {
    expect(parseToml('color = "#F5F2E8"  # bg\n# a comment')).toEqual({ color: "#F5F2E8" });
  });
});

describe("loadSiteConfig / buildThemeOverrides", () => {
  it("reads branding from the repo config.toml", () => {
    const cfg = loadSiteConfig();
    expect(cfg.author.length).toBeGreaterThan(0);
    expect(cfg.main.length).toBeGreaterThan(0);
  });

  it("excludes [branding] from the theme overrides", () => {
    const overrides = buildThemeOverrides();
    expect(overrides.branding).toBeUndefined();
    expect(overrides.colors).toBeDefined();
  });
});
