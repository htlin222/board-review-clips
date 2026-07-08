import { writeFileSync } from "fs";
import { join } from "path";
import { themeDefaults } from "../remotion/theme.defaults";
import { buildThemeOverrides } from "../remotion/lib/siteConfig";

const OUT = join("remotion", "config.generated.json");

// Reads config.toml, keeps only keys that exist in the theme defaults (so a
// typo in config.toml surfaces as a warning instead of a silent no-op), and
// writes the result to remotion/config.generated.json — the file theme.ts
// imports and merges. Committed and deterministic: same config.toml in, same
// JSON out. Run automatically by audio/render/still/studio.
export function syncConfig(configPath?: string): Record<string, unknown> {
  const raw = buildThemeOverrides(configPath);
  const warnings: string[] = [];
  const clean = prune(raw, themeDefaults as unknown as Record<string, unknown>, "", warnings);

  writeFileSync(OUT, JSON.stringify(clean, null, 2) + "\n");
  for (const w of warnings) console.warn(`⚠ config.toml: ${w}`);
  return clean;
}

// Drop any key not present in the defaults (with a warning) and recurse into
// nested tables so the generated overrides always match the theme shape.
function prune(
  override: Record<string, unknown>,
  base: Record<string, unknown>,
  path: string,
  warnings: string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(override)) {
    const dotted = path ? `${path}.${key}` : key;
    if (!(key in base)) {
      warnings.push(`unknown key "${dotted}" ignored (not in theme defaults)`);
      continue;
    }
    const baseValue = base[key];
    if (value && typeof value === "object" && !Array.isArray(value) && baseValue && typeof baseValue === "object") {
      out[key] = prune(value as Record<string, unknown>, baseValue as Record<string, unknown>, dotted, warnings);
    } else {
      out[key] = value;
    }
  }
  return out;
}

// Allow running directly: `pnpm sync-config`.
if (import.meta.url === `file://${process.argv[1]}`) {
  syncConfig();
  console.log(`wrote ${OUT}`);
}
