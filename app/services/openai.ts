import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Word } from "@/app/types";

const BASE_URL = "https://api.openai.com/v1";
const OPENAI_API_KEY_STORAGE = "@cueq_openai_api_key";

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Save OpenAI API key to AsyncStorage
 */
export const saveOpenAIApiKey = async (apiKey: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(OPENAI_API_KEY_STORAGE, apiKey);
  } catch (error) {
    console.error("Error saving OpenAI API key:", error);
    throw error;
  }
};

/**
 * Load OpenAI API key from AsyncStorage
 */
export const loadOpenAIApiKey = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(OPENAI_API_KEY_STORAGE);
  } catch (error) {
    console.error("Error loading OpenAI API key:", error);
    return null;
  }
};

/**
 * Remove OpenAI API key from AsyncStorage
 */
export const removeOpenAIApiKey = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OPENAI_API_KEY_STORAGE);
  } catch (error) {
    console.error("Error removing OpenAI API key:", error);
    throw error;
  }
};

/**
 * Generate a French example sentence using OpenAI's GPT model
 */
export const generateFrenchExample = async (word: string): Promise<string> => {
  const apiKey = await loadOpenAIApiKey();

  if (!apiKey) {
    throw new Error(
      "OpenAI API key is not configured. Please set it in Settings."
    );
  }

  const url = `${BASE_URL}/chat/completions`;

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a helpful French language teacher. Create simple, natural French sentences using given words. Always provide the French sentence followed by its English translation in parentheses.",
    },
    {
      role: "user",
      content: `Create a simple French sentence using the word "${word}". The sentence should be natural and commonly used. Return only the French sentence followed by the English translation in parentheses, nothing else.`,
    },
  ];

  const requestBody = {
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens: 150,
    temperature: 0.7,
  };

  try {
    const response = await axios.post<OpenAIResponse>(url, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const sentence = response.data.choices[0]?.message?.content;
    if (!sentence) {
      throw new Error("No sentence generated");
    }

    return sentence.trim();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      if (status === 401) {
        throw new Error(
          "Invalid OpenAI API key. Please check your API key in Settings."
        );
      } else if (status === 429) {
        throw new Error(
          "OpenAI API rate limit exceeded. Please try again later."
        );
      } else if (status === 403) {
        throw new Error(
          "OpenAI API access forbidden. Please check your API key permissions."
        );
      } else {
        console.error("OpenAI API Error:", {
          status,
          data: errorData,
        });
        throw new Error(`OpenAI API error: ${error.message}`);
      }
    }

    console.error("Error generating French example with OpenAI:", error);
    throw error;
  }
};

/**
 * Get word definitions using OpenAI
 */
export const getWordDefinition = async (word: string): Promise<string> => {
  const apiKey = await loadOpenAIApiKey();

  if (!apiKey) {
    throw new Error(
      "OpenAI API key is not configured. Please set it in Settings."
    );
  }

  const url = `${BASE_URL}/chat/completions`;

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a helpful French language teacher. Provide clear, concise definitions of French words in English.",
    },
    {
      role: "user",
      content: `Provide a brief, clear definition of the French word "${word}" in English. Keep it concise and suitable for language learners.`,
    },
  ];

  const requestBody = {
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens: 100,
    temperature: 0.3,
  };

  try {
    const response = await axios.post<OpenAIResponse>(url, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const definition = response.data.choices[0]?.message?.content;
    if (!definition) {
      throw new Error("No definition generated");
    }

    return definition.trim();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 401) {
        throw new Error(
          "Invalid OpenAI API key. Please check your API key in Settings."
        );
      } else if (status === 429) {
        throw new Error(
          "OpenAI API rate limit exceeded. Please try again later."
        );
      }
    }

    console.error("Error getting word definition with OpenAI:", error);
    throw error;
  }
};

/**
 * Get comprehensive word information from OpenAI using structured outputs
 */
export const getWordInfo = async (
  word: string,
  language: "english" | "french"
): Promise<Omit<Word, "id">> => {
  const apiKey = await loadOpenAIApiKey();

  if (!apiKey) {
    throw new Error(
      "OpenAI API key is not configured. Please set it in Settings."
    );
  }

  const url = `${BASE_URL}/chat/completions`;

  const systemPrompt = `You are a helpful French language teacher. You will receive a word in either English or French and need to provide comprehensive information about it.

Rules:
- If it's a verb, include conjugation and past_particle
- If it's a noun, include gender (masculine/feminine) if applicable, otherwise set to null
- For adjectives that agree with gender, show both forms like "français(e)"
- Examples should be natural, simple sentences, but not too simple.
- Keep conjugations in the exact format: (présent):\\nje verb\\n tu verbs\\n il/elle/on verb\\n nous verbs\\n vous verbs\\n ils/elles verbs
- Set conjugation and past_particle to null for non-verbs
- Set gender to null for verbs and adjectives`;

  const userPrompt = `Provide comprehensive information for the ${language} word: "${word}"`;

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  // Define the JSON schema for structured outputs
  const responseSchema = {
    type: "object",
    properties: {
      french: {
        type: "string",
        description: "The French word or phrase",
      },
      english: {
        type: "string",
        description: "The English translation",
      },
      examples: {
        type: "string",
        description:
          "A simple,but not too simple, natural French sentence using the word.",
      },
      gender: {
        type: ["string", "null"],
        enum: ["masculine", "feminine", null],
        description:
          "Gender for nouns (masculine/feminine), null for other word types",
      },
      conjugation: {
        type: ["string", "null"],
        description:
          "Present tense conjugation for verbs in format: (présent):\\nje verb\\n tu verbs\\n il/elle/on verb\\n nous verbs\\n vous verbs\\n ils/elles verbs",
      },
      past_particle: {
        type: ["string", "null"],
        description: "Past participle form for verbs only",
      },
    },
    required: [
      "french",
      "english",
      "examples",
      "gender",
      "conjugation",
      "past_particle",
    ],
    additionalProperties: false,
  };

  // Try to use structured outputs first, fall back to regular JSON if not available
  let requestBody = {
    model: "gpt-4o", // Use the standard gpt-4o model that supports structured outputs
    messages: messages,
    max_tokens: 500,
    temperature: 0.3,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "word_info",
        strict: true,
        schema: responseSchema,
      },
    },
  };

  try {
    const response = await axios.post<OpenAIResponse>(url, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response generated");
    }

    // Parse the JSON response (guaranteed to be valid JSON with structured outputs)
    const wordInfo = JSON.parse(content);
    return wordInfo;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData = error.response?.data;

      // Log detailed error information for debugging
      console.error("OpenAI API Error Details:", {
        status,
        statusText: error.response?.statusText,
        data: responseData,
        requestBody: JSON.stringify(requestBody, null, 2),
      });

      if (status === 400) {
        // Handle 400 Bad Request - try fallback without structured outputs
        console.log("Attempting fallback without structured outputs...");

        const fallbackRequestBody = {
          model: "gpt-3.5-turbo", // More widely available model
          messages: [
            ...messages,
            {
              role: "user",
              content:
                'Please respond with valid JSON only, following this exact format: {"french": "word", "english": "translation", "examples": "sentence", "gender": "masculine|feminine|null", "conjugation": "string|null", "past_particle": "string|null"}',
            },
          ],
          max_tokens: 500,
          temperature: 0.3,
        };

        try {
          const fallbackResponse = await axios.post<OpenAIResponse>(
            url,
            fallbackRequestBody,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
            }
          );

          const fallbackContent =
            fallbackResponse.data.choices[0]?.message?.content;
          if (!fallbackContent) {
            throw new Error("No response generated from fallback");
          }

          const wordInfo = JSON.parse(fallbackContent);
          return wordInfo;
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          const errorMessage =
            responseData?.error?.message || "Invalid request format";
          throw new Error(
            `OpenAI API request error: ${errorMessage}. Please check your API key and model availability.`
          );
        }
      } else if (status === 401) {
        throw new Error(
          "Invalid OpenAI API key. Please check your API key in Settings."
        );
      } else if (status === 429) {
        throw new Error(
          "OpenAI API rate limit exceeded. Please try again later."
        );
      } else if (status === 403) {
        throw new Error(
          "OpenAI API access forbidden. Please check your API key permissions."
        );
      }
    }

    console.error("Error getting word info with OpenAI:", error);
    throw error;
  }
};

/**
 * Test the OpenAI API connection with a simple request
 */
export const testOpenAIConnection = async (): Promise<boolean> => {
  try {
    await generateFrenchExample("test");
    return true;
  } catch (error) {
    console.error("OpenAI connection test failed:", error);
    return false;
  }
};
