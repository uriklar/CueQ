import {
  saveOpenAIApiKey,
  loadOpenAIApiKey,
  removeOpenAIApiKey,
  generateFrenchExample,
  getWordDefinition,
} from "../openai";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock axios
jest.mock("axios", () => ({
  post: jest.fn(),
  isAxiosError: jest.fn(),
}));

describe("OpenAI Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("API Key Management", () => {
    it("should save API key", async () => {
      const AsyncStorage = require("@react-native-async-storage/async-storage");
      const apiKey = "sk-test123";

      await saveOpenAIApiKey(apiKey);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@cueq_openai_api_key",
        apiKey
      );
    });

    it("should load API key", async () => {
      const AsyncStorage = require("@react-native-async-storage/async-storage");
      const apiKey = "sk-test123";
      AsyncStorage.getItem.mockResolvedValue(apiKey);

      const result = await loadOpenAIApiKey();

      expect(result).toBe(apiKey);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("@cueq_openai_api_key");
    });

    it("should remove API key", async () => {
      const AsyncStorage = require("@react-native-async-storage/async-storage");

      await removeOpenAIApiKey();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "@cueq_openai_api_key"
      );
    });
  });

  describe("API Calls", () => {
    it("should throw error when no API key is configured", async () => {
      const AsyncStorage = require("@react-native-async-storage/async-storage");
      AsyncStorage.getItem.mockResolvedValue(null);

      await expect(generateFrenchExample("bonjour")).rejects.toThrow(
        "OpenAI API key is not configured"
      );
    });

    it("should generate French example successfully", async () => {
      const AsyncStorage = require("@react-native-async-storage/async-storage");
      const axios = require("axios");

      AsyncStorage.getItem.mockResolvedValue("sk-test123");
      axios.post.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: "Bonjour, comment allez-vous? (Hello, how are you?)",
              },
            },
          ],
        },
      });

      const result = await generateFrenchExample("bonjour");

      expect(result).toBe("Bonjour, comment allez-vous? (Hello, how are you?)");
      expect(axios.post).toHaveBeenCalledWith(
        "https://api.openai.com/v1/chat/completions",
        expect.objectContaining({
          model: "gpt-3.5-turbo",
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining("bonjour"),
            }),
          ]),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer sk-test123",
          }),
        })
      );
    });
  });
});
