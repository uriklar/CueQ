import { words } from "../app/data/words";
import * as fs from "fs";
import * as path from "path";

interface WordEntry {
  french: string;
  english: string;
}

interface Duplicate {
  french: string;
  english: string;
  indices: number[];
}

function findDuplicates(
  wordList: WordEntry[],
  label: string
): { frenchDupes: Duplicate[]; englishDupes: Duplicate[] } {
  const seen = new Map<string, number[]>();
  wordList.forEach((word, index) => {
    const key = word.french.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.set(key, [index]);
    } else {
      seen.get(key)!.push(index);
    }
  });

  const frenchDupes: Duplicate[] = [];
  for (const [french, indices] of seen) {
    if (indices.length > 1) {
      frenchDupes.push({ french, english: wordList[indices[0]].english, indices });
    }
  }

  if (frenchDupes.length === 0) {
    console.log(`[${label}] No duplicates found by french key.`);
  } else {
    console.log(`[${label}] Found ${frenchDupes.length} duplicate(s) by french key:\n`);
    for (const dup of frenchDupes) {
      console.log(`  "${dup.french}" (${dup.english})`);
      for (const i of dup.indices) {
        console.log(`    [${i}] french: "${wordList[i].french}", english: "${wordList[i].english}"`);
      }
      console.log();
    }
  }

  const seenEnglish = new Map<string, number[]>();
  wordList.forEach((word, index) => {
    const key = word.english.toLowerCase().trim();
    if (!seenEnglish.has(key)) {
      seenEnglish.set(key, [index]);
    } else {
      seenEnglish.get(key)!.push(index);
    }
  });

  const englishDupes: Duplicate[] = [];
  for (const [english, indices] of seenEnglish) {
    if (indices.length > 1) {
      englishDupes.push({ french: wordList[indices[0]].french, english, indices });
    }
  }

  if (englishDupes.length === 0) {
    console.log(`[${label}] No duplicates found by english key.`);
  } else {
    console.log(`[${label}] Found ${englishDupes.length} duplicate(s) by english key:\n`);
    for (const dup of englishDupes) {
      console.log(`  "${dup.english}"`);
      for (const i of dup.indices) {
        console.log(`    [${i}] french: "${wordList[i].french}", english: "${wordList[i].english}"`);
      }
      console.log();
    }
  }

  console.log(`[${label}] Total: ${wordList.length} words, ${seen.size} unique french, ${seenEnglish.size} unique english\n`);

  return { frenchDupes, englishDupes };
}

function loadRemoteWords(): WordEntry[] {
  const wordsJsonPath = path.resolve(__dirname, "../words.json");
  try {
    const content = fs.readFileSync(wordsJsonPath, "utf-8");
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      console.error("words.json is not an array");
      process.exit(1);
    }
    return parsed;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return [];
    }
    console.error("Error reading words.json:", error);
    process.exit(1);
  }
}

function checkCrossDuplicates(
  staticWords: WordEntry[],
  remoteWords: WordEntry[]
): string[] {
  const staticKeys = new Set(
    staticWords.map((w) => w.french.toLowerCase().trim())
  );
  const crossDupes: string[] = [];

  for (const word of remoteWords) {
    const key = word.french.toLowerCase().trim();
    if (staticKeys.has(key)) {
      crossDupes.push(key);
    }
  }

  if (crossDupes.length > 0) {
    console.log(`[cross-check] Found ${crossDupes.length} word(s) in words.json that already exist in words.ts:\n`);
    for (const key of crossDupes) {
      console.log(`  "${key}"`);
    }
    console.log();
  } else {
    console.log("[cross-check] No cross-duplicates between words.ts and words.json.\n");
  }

  return crossDupes;
}

// Run checks
const { frenchDupes: staticDupes } = findDuplicates(words, "words.ts");

const remoteWords = loadRemoteWords();
let remoteDupes: Duplicate[] = [];
let crossDupes: string[] = [];

if (remoteWords.length > 0) {
  const result = findDuplicates(remoteWords, "words.json");
  remoteDupes = result.frenchDupes;
  crossDupes = checkCrossDuplicates(words, remoteWords);
} else {
  console.log("[words.json] Empty or not found — skipping.\n");
}

if (staticDupes.length > 0 || remoteDupes.length > 0 || crossDupes.length > 0) {
  process.exit(1);
}
