import { TenseKey, PronounKey, VERBS_DATA, PRONOUN_KEYS } from "../data/verbsData";

export function normalizeAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\u2019/g, "'") // right single quotation mark → apostrophe
    .replace(/'/g, "'");
}

export function checkAnswer(userInput: string, correct: string): boolean {
  return normalizeAnswer(userInput) === normalizeAnswer(correct);
}

export function getVerbsForSession(tense: TenseKey, count: number): string[] {
  const available = Object.keys(VERBS_DATA).filter(v => VERBS_DATA[v]?.[tense]);
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, available.length));
}

export function getVerbsForMultiTenseSession(
  tenses: TenseKey[],
  count: number
): { verb: string; tense: TenseKey }[] {
  // Collect all available verbs across selected tenses
  const allVerbs = new Set<string>();
  for (const t of tenses) {
    for (const v of Object.keys(VERBS_DATA)) {
      if (VERBS_DATA[v]?.[t]) allVerbs.add(v);
    }
  }

  // Shuffle verbs, then assign a random selected tense each verb supports
  const shuffled = [...allVerbs].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, Math.min(count, shuffled.length));

  return picked.map(verb => {
    const validTenses = tenses.filter(t => VERBS_DATA[verb]?.[t]);
    const tense = validTenses[Math.floor(Math.random() * validTenses.length)];
    return { verb, tense };
  });
}

export const emptyAnswers = (): Record<PronounKey, string> =>
  Object.fromEntries(PRONOUN_KEYS.map(p => [p, ""])) as Record<PronounKey, string>;

export const emptyResults = (): Record<PronounKey, boolean | null> =>
  Object.fromEntries(PRONOUN_KEYS.map(p => [p, null])) as Record<PronounKey, boolean | null>;
