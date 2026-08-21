// Stage-2 spike: verify the four load-bearing M8 surfaces against live APIs.
import "dotenv/config";
import { config } from "dotenv";
config({ path: "../../.env", override: true });

import { generateText, generateObject, experimental_generateImage as generateImage, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import fs from "node:fs";

// 1. web search as a provider tool inside generateText
const t0 = Date.now();
const search = await generateText({
  model: openai.responses("gpt-5.6-terra"),
  tools: { web_search: openai.tools.webSearch({}) },
  stopWhen: stepCountIs(4),
  prompt: "In two sentences with a source: what is Muse-style peer-to-peer fashion rental, and name one NYC company in that space.",
});
console.log("1) webSearch ok:", (Date.now()-t0)/1000 + "s |", search.text.slice(0, 140).replace(/\n/g, " "));
console.log("   sources:", (search.sources || []).length);

// 2. generateObject with a Zod schema (the typed wire)
const brief = await generateObject({
  model: openai.responses("gpt-5.6-terra"),
  schema: z.object({
    audience: z.string(),
    angle: z.string(),
    headlines: z.array(z.string()).describe("exactly 3 headlines — no more, no fewer"),
    image_direction: z.string(),
  }),
  prompt: `Campaign brief for Muse spring collab. Exactly three headlines. Research notes: ${search.text.slice(0, 600)}`,
});
console.log("2) generateObject ok | headlines:", brief.object.headlines.length, "|", brief.object.headlines[0].slice(0, 60));

// 3. experimental_generateImage — gpt-image-2 first, gpt-image-1 fallback
let imgModel = "gpt-image-2", img;
try {
  img = await generateImage({ model: openai.image(imgModel), prompt: brief.object.image_direction + " Editorial, no text.", size: "1024x1024" });
} catch (e) {
  imgModel = "gpt-image-1";
  img = await generateImage({ model: openai.image(imgModel), prompt: brief.object.image_direction + " Editorial, no text.", size: "1024x1024" });
}
fs.writeFileSync("spike_hero.png", Buffer.from(img.image.uint8Array));
console.log(`3) generateImage ok via ${imgModel} | bytes:`, img.image.uint8Array.length);

// 4. @react-pdf/renderer server-side with the embedded image
const React = (await import("react")).default ?? (await import("react"));
const { Document, Page, Text, View, Image, renderToFile } = await import("@react-pdf/renderer");
const e = React.createElement;
const doc = e(Document, null, e(Page, { size: "LETTER", style: { padding: 40 } },
  e(Text, { style: { fontSize: 24, marginBottom: 12 } }, brief.object.headlines[0]),
  e(Image, { src: "spike_hero.png", style: { width: 520, height: 340, objectFit: "cover" } }),
  e(View, { style: { marginTop: 14 } },
    e(Text, { style: { fontSize: 11 } }, "Audience: " + brief.object.audience),
    e(Text, { style: { fontSize: 11 } }, "Angle: " + brief.object.angle))));
await renderToFile(doc, "spike_kit.pdf");
console.log("4) react-pdf ok | spike_kit.pdf:", fs.statSync("spike_kit.pdf").size, "bytes");
