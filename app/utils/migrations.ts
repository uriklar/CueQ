import AsyncStorage from "@react-native-async-storage/async-storage";

const SCHEMA_VERSION_KEY = "@cueq_schema_version";

interface Migration {
  version: number;
  name: string;
  run: () => Promise<void>;
}

const WORDS_KEY = "@french_cards_words";
const BACKLOG_KEY = "@french_cards_backlog";
const DELETED_WORDS_KEY = "@french_cards_deleted_words";

const migrations: Migration[] = [
  {
    version: 1,
    name: "rename_past_particle_to_past_participle",
    run: async () => {
      const wordsJson = await AsyncStorage.getItem(WORDS_KEY);
      if (wordsJson) {
        const words: Record<string, any> = JSON.parse(wordsJson);
        for (const id of Object.keys(words)) {
          if ("past_particle" in words[id]) {
            words[id].past_participle = words[id].past_particle;
            delete words[id].past_particle;
          }
        }
        await AsyncStorage.setItem(WORDS_KEY, JSON.stringify(words));
      }

      const backlogJson = await AsyncStorage.getItem(BACKLOG_KEY);
      if (backlogJson) {
        const backlog: any[] = JSON.parse(backlogJson);
        for (const word of backlog) {
          if ("past_particle" in word) {
            word.past_participle = word.past_particle;
            delete word.past_particle;
          }
        }
        await AsyncStorage.setItem(BACKLOG_KEY, JSON.stringify(backlog));
      }
    },
  },
  {
    version: 2,
    name: "stable_static_word_ids",
    run: async () => {
      const wordsJson = await AsyncStorage.getItem(WORDS_KEY);
      if (!wordsJson) return;

      const words: Record<string, any> = JSON.parse(wordsJson);
      const newWords: Record<string, any> = {};

      for (const [oldId, word] of Object.entries(words)) {
        if (oldId.startsWith("static_")) {
          const newId = `static:${word.french.toLowerCase().trim()}`;
          // If we already have this key, keep the one with difficulty set
          if (newWords[newId]) {
            if (word.difficulty && !newWords[newId].difficulty) {
              newWords[newId] = { ...word, id: newId };
            }
          } else {
            newWords[newId] = { ...word, id: newId };
          }
        } else {
          newWords[oldId] = word;
        }
      }

      await AsyncStorage.setItem(WORDS_KEY, JSON.stringify(newWords));

      const backlogJson = await AsyncStorage.getItem(BACKLOG_KEY);
      if (backlogJson) {
        const backlog: any[] = JSON.parse(backlogJson);
        for (const word of backlog) {
          if (word.id && word.id.startsWith("static_")) {
            word.id = `static:${word.french.toLowerCase().trim()}`;
          }
        }
        await AsyncStorage.setItem(BACKLOG_KEY, JSON.stringify(backlog));
      }
    },
  },
  {
    version: 3,
    name: "migrate_deletion_keys_to_stable_ids",
    run: async () => {
      const deletedJson = await AsyncStorage.getItem(DELETED_WORDS_KEY);
      if (!deletedJson) return;

      const deleted: Record<string, boolean> = JSON.parse(deletedJson);
      const newDeleted: Record<string, boolean> = {};

      for (const key of Object.keys(deleted)) {
        if (key.includes("::")) {
          const french = key.split("::")[0];
          const stableId = `static:${french.toLowerCase().trim()}`;
          newDeleted[stableId] = true;
        } else {
          newDeleted[key] = true;
        }
      }

      await AsyncStorage.setItem(DELETED_WORDS_KEY, JSON.stringify(newDeleted));
    },
  },
];

export async function runMigrations(): Promise<void> {
  const versionStr = await AsyncStorage.getItem(SCHEMA_VERSION_KEY);
  const currentVersion = versionStr ? parseInt(versionStr, 10) : 0;

  const pending = migrations
    .filter((m) => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    console.log(`Running migration v${migration.version}: ${migration.name}`);
    await migration.run();
    await AsyncStorage.setItem(
      SCHEMA_VERSION_KEY,
      migration.version.toString()
    );
  }
}
