import { readFileSync } from "fs";
import { join } from "path";

// config.toml at the repo root is the single human-facing tuning file. It holds
// site branding ([branding]) plus optional overrides for the render theme
// ([colors], [fonts], [timing], ...). Node scripts read it directly; the
// browser bundle can't (no fs), so `pnpm sync-config` bakes the theme overrides
// into remotion/config.generated.json, which theme.ts merges over its defaults.

export type SiteConfig = {
  author: string;
  main: string;
};

// Minimal TOML reader: top-level and single-level [table] / [a.b] sections with
// `key = value` string/number/boolean scalars and `#` comments. That's all
// config.toml ever needs; a full TOML dependency would be overkill. If the
// config grows arrays or inline tables, swap this for a real parser.
export function parseToml(source: string): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  let table = root;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = stripComment(rawLine).trim();
    if (!line) continue;

    const tableMatch = line.match(/^\[([^\]]+)\]$/);
    if (tableMatch) {
      table = root;
      for (const part of tableMatch[1].split(".").map((s) => s.trim())) {
        table[part] ??= {};
        table = table[part] as Record<string, unknown>;
      }
      continue;
    }

    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (key) table[key] = parseValue(line.slice(eq + 1).trim());
  }

  return root;
}

// Strip a `#` comment, but not one inside a quoted string.
function stripComment(line: string): string {
  let quote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === "#") {
      return line.slice(0, i);
    }
  }
  return line;
}

function parseValue(raw: string): unknown {
  const quote = raw[0];
  if ((quote === '"' || quote === "'") && raw[raw.length - 1] === quote) return raw.slice(1, -1);
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw !== "" && !Number.isNaN(Number(raw))) return Number(raw);
  return raw;
}

let cached: Record<string, unknown> | undefined;

export function loadConfig(configPath = join(process.cwd(), "config.toml")): Record<string, unknown> {
  cached ??= parseToml(readFileSync(configPath, "utf-8"));
  return cached;
}

export function loadSiteConfig(configPath?: string): SiteConfig {
  const branding = (loadConfig(configPath).branding ?? {}) as Record<string, unknown>;
  return {
    author: typeof branding.author === "string" ? branding.author : "",
    main: typeof branding.main === "string" ? branding.main : "",
  };
}

// Everything in config.toml except [branding] is a theme override, keyed to
// match the theme's own shape (e.g. [fonts] titleSize -> theme.fonts.titleSize).
// Returned verbatim for deep-merging into the theme defaults.
export function buildThemeOverrides(configPath?: string): Record<string, unknown> {
  const { branding, ...rest } = loadConfig(configPath) as Record<string, unknown>;
  void branding;
  return rest;
}
