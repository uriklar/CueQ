import { DOMParser } from "react-native-html-parser";

export const getFrenchExampleSentence = async (
  word: string
): Promise<string> => {
  // Base URL for the French Wiktionary API
  const apiUrl = "https://fr.wiktionary.org/w/api.php";

  // Parameters for the API request
  const params = new URLSearchParams({
    action: "parse",
    page: word,
    format: "json",
    prop: "text",
    origin: "*", // For CORS
  });

  try {
    // Make the API request
    const response = await fetch(`${apiUrl}?${params}`);
    const data = await response.json();

    if (data.error) {
      return `Error: ${data.error.info}`;
    }

    // Parse the HTML content
    const htmlContent = data.parse.text["*"];

    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // Look for example sentences in the French section
    // This targets the "Exemple" section typically found in French Wiktionary entries
    const examples: string[] = [];

    // Find all elements with class 'exemple' or 'example'
    const exampleElements = doc.getElementsByClassName("exemple");
    const moreExamples = doc.getElementsByClassName("example");

    // Convert HTMLCollection to array and extract text content
    for (let i = 0; i < exampleElements.length; i++) {
      const text = exampleElements[i].textContent;
      if (text) examples.push(text.trim());
    }

    for (let i = 0; i < moreExamples.length; i++) {
      const text = moreExamples[i].textContent;
      if (text) examples.push(text.trim());
    }

    if (examples.length > 0) {
      // return the shortest example
      return examples.sort((a, b) => a.length - b.length)[0];
    } else {
      return "No example sentences found for this word.";
    }
  } catch (error) {
    console.error("Error fetching example sentence:", error);
    throw error;
  }
};
