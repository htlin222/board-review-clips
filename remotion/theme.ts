import { themeDefaults } from "./theme.defaults";
import overrides from "./config.generated.json";

// Deep-merge the config.toml-derived overrides (config.generated.json, produced
// by `pnpm sync-config`) on top of the built-in defaults. Only leaf values that
// appear in the overrides win; everything else falls through to the default.
// This runs inside the Remotion browser bundle, so it must stay pure JS — no fs.
function deepMerge<T>(base: T, override: unknown): T {
  if (override === null || typeof override !== "object" || Array.isArray(override)) {
    return (override === undefined ? base : (override as T));
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    const baseValue = (base as Record<string, unknown>)[key];
    out[key] =
      value && typeof value === "object" && !Array.isArray(value) && baseValue && typeof baseValue === "object"
        ? deepMerge(baseValue, value)
        : value;
  }
  return out as T;
}

export const theme = deepMerge(themeDefaults, overrides) as typeof themeDefaults;
