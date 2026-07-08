import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { readFileSync } from "fs";
import { join } from "path";
import { loadSiteConfig } from "../remotion/lib/siteConfig";

const [, , compositionId = "LongForm", cardId = "scd-median-survival", frameArg = "60", outArg] = process.argv;
const frame = Number(frameArg);
const outputLocation = outArg ?? join("out", `still-${compositionId}-${frame}.png`);

async function main() {
  const bundleLocation = await bundle({ entryPoint: join("remotion", "index.ts"), publicDir: "assets" });
  const card = JSON.parse(readFileSync(join("cards", `${cardId}.json`), "utf-8"));
  const { topic, section } = card;
  const author = card.author ?? loadSiteConfig().author;

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps: { cardId, topic, author, section },
  });

  await renderStill({
    composition,
    serveUrl: bundleLocation,
    output: outputLocation,
    frame,
    inputProps: { cardId, topic, author, section },
  });

  console.log(`wrote ${outputLocation} (frame ${frame})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
