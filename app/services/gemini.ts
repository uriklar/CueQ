import axios from "axios";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
console.log(
  "API Key loaded:",
  GEMINI_API_KEY ? "Yes (length: " + GEMINI_API_KEY.length + ")" : "No"
);

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "gemini-2.0-flash-lite";

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const translateSentence = async (
  sentence: string
): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const url = `${BASE_URL}/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Translate the following French sentence to English. Return only the English translation, nothing else:\n\n${sentence}`,
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post<GeminiResponse>(url, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const translation = response.data.candidates[0]?.content.parts[0]?.text;
    if (!translation) {
      throw new Error("No translation generated");
    }

    return translation.trim().replace(/^["']|["']$/g, "");
  } catch (error) {
    console.error("Error translating sentence with Gemini:", error);
    throw error;
  }
};

export const getExampleSentence = async (word: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    console.error("Environment variables:", process.env);
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const url = `${BASE_URL}/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  // Don't log the full URL as it contains the API key
  console.log("Making request to:", BASE_URL);

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Create a simple French sentence using the word "${word}". The sentence should be natural and commonly used. Return only the sentence in French with the english translation in parentheses, nothing else.`,
          },
        ],
      },
    ],
  };
  console.log("Request Body:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await axios.post<GeminiResponse>(url, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));

    const sentence = response.data.candidates[0]?.content.parts[0]?.text;
    if (!sentence) {
      throw new Error("No sentence generated");
    }

    // Clean up the response by removing any quotes if present
    return sentence.replace(/^["']|["']$/g, "");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Full error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }
    console.error("Error getting example sentence from Gemini:", error);
    throw error;
  }
};
