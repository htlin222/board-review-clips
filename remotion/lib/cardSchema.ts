import { z } from "zod";

const nonEmpty = z.string().trim().min(1);

// Single source of truth for the card JSON shape. Imported by the format
// checker (scripts/validate-cards.ts) and the issue→card generator
// (scripts/issue-to-cards.ts) so the LLM output is held to the exact same
// contract that gates a render.
export const cardSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "id must be kebab-case (lowercase letters, digits, hyphens)"),
    // author/main are site-wide defaults from config.toml; a card may omit them
    // (inherit the config) or override them here.
    main: nonEmpty.optional(),
    section: nonEmpty,
    topic: nonEmpty,
    author: nonEmpty.optional(),
    title: nonEmpty,
    answer: nonEmpty,
    detail: z.array(nonEmpty).min(1),
    releaseNote: nonEmpty,
  })
  .strict();

export type CardInput = z.infer<typeof cardSchema>;
