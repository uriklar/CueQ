import { words } from "../app/data/words";
import * as fs from "fs";
import * as path from "path";

// Deduplicate by french key, keeping the entry with the longest english translation
const seen = new Map<string, (typeof words)[number]>();

for (const word of words) {
  const key = word.french.toLowerCase().trim();
  const existing = seen.get(key);
  if (!existing) {
    seen.set(key, word);
  } else {
    // Keep the one with the longer/richer english translation
    if (word.english.length > existing.english.length) {
      seen.set(key, word);
    }
  }
}

const deduped = [...seen.values()];

console.log(`Before: ${words.length} words`);
console.log(`After:  ${deduped.length} words`);
console.log(`Removed: ${words.length - deduped.length} duplicates`);

// Generate the file content
const lines = deduped.map((w) => {
  const frenchStr = JSON.stringify(w.french);
  const englishStr = JSON.stringify(w.english);
  const examplesStr = JSON.stringify(w.examples);
  return `  {\n    french: ${frenchStr},\n    english: ${englishStr},\n    examples:\n      ${examplesStr},\n  }`;
});

const content = `import { Word } from "@/app/types";

export const words: Omit<Word, "id">[] = [
${lines.join(",\n")}
];
`;

const outPath = path.resolve(__dirname, "../app/data/words.ts");
fs.writeFileSync(outPath, content, "utf-8");
console.log(`\nWrote deduplicated words to ${outPath}`);
