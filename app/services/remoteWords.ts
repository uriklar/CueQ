import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Word } from "@/app/types";

const REMOTE_WORDS_URL =
  "https://raw.githubusercontent.com/uriklar/CueQ/main/words.json";
const CACHE_KEY = "@cueq_remote_words_cache";
const LAST_MODIFIED_KEY = "@cueq_remote_words_last_modified";

export async function fetchRemoteWords(): Promise<
  Omit<Word, "id">[] | null
> {
  try {
    const lastModified = await AsyncStorage.getItem(LAST_MODIFIED_KEY);

    const headers: Record<string, string> = {};
    if (lastModified) {
      headers["If-Modified-Since"] = lastModified;
    }

    const response = await axios.get<Omit<Word, "id">[]>(REMOTE_WORDS_URL, {
      headers,
      timeout: 5000,
      validateStatus: (status) => status === 200 || status === 304,
    });

    if (response.status === 304) {
      // Not modified — return cached version
      return getCachedWords();
    }

    const words = response.data;
    if (!Array.isArray(words)) {
      console.error("Remote words: unexpected format, expected array");
      return getCachedWords();
    }

    // Cache the response
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(words));
    const newLastModified = response.headers["last-modified"];
    if (newLastModified) {
      await AsyncStorage.setItem(LAST_MODIFIED_KEY, newLastModified);
    }

    return words;
  } catch (error) {
    console.warn("Failed to fetch remote words, using cache:", error);
    return getCachedWords();
  }
}

async function getCachedWords(): Promise<Omit<Word, "id">[] | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}
