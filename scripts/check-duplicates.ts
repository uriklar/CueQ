import { words } from "../app/data/words";

interface Duplicate {
  french: string;
  english: string;
  indices: number[];
}

function checkDuplicates() {
  const seen = new Map<string, number[]>();

  words.forEach((word, index) => {
    const key = word.french.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.set(key, [index]);
    } else {
      seen.get(key)!.push(index);
    }
  });

  const duplicates: Duplicate[] = [];
  for (const [french, indices] of seen) {
    if (indices.length > 1) {
      duplicates.push({
        french,
        english: words[indices[0]].english,
        indices,
      });
    }
  }

  if (duplicates.length === 0) {
    console.log("No duplicates found by french key.");
  } else {
    console.log(`Found ${duplicates.length} duplicate(s) by french key:\n`);
    for (const dup of duplicates) {
      console.log(`  "${dup.french}" (${dup.english})`);
      console.log(`    Appears at indices: ${dup.indices.join(", ")}`);
      for (const i of dup.indices) {
        console.log(`    [${i}] french: "${words[i].french}", english: "${words[i].english}"`);
      }
      console.log();
    }
  }

  // Also check by english key
  const seenEnglish = new Map<string, number[]>();
  words.forEach((word, index) => {
    const key = word.english.toLowerCase().trim();
    if (!seenEnglish.has(key)) {
      seenEnglish.set(key, [index]);
    } else {
      seenEnglish.get(key)!.push(index);
    }
  });

  const englishDuplicates: Duplicate[] = [];
  for (const [english, indices] of seenEnglish) {
    if (indices.length > 1) {
      englishDuplicates.push({
        french: words[indices[0]].french,
        english,
        indices,
      });
    }
  }

  if (englishDuplicates.length === 0) {
    console.log("No duplicates found by english key.");
  } else {
    console.log(
      `Found ${englishDuplicates.length} duplicate(s) by english key:\n`
    );
    for (const dup of englishDuplicates) {
      console.log(`  "${dup.english}"`);
      console.log(`    Appears at indices: ${dup.indices.join(", ")}`);
      for (const i of dup.indices) {
        console.log(`    [${i}] french: "${words[i].french}", english: "${words[i].english}"`);
      }
      console.log();
    }
  }

  console.log(`\nTotal words: ${words.length}`);
  console.log(`Unique french keys: ${seen.size}`);
  console.log(`Unique english keys: ${seenEnglish.size}`);
}

checkDuplicates();
