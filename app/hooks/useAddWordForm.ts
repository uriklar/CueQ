import { useEffect, useState } from "react";
import { Word } from "../types";

export type Gender = "masculine" | "feminine" | null;

interface FormState {
  french: string;
  english: string;
  examples: string;
  gender: Gender;
}

interface UseAddWordForm {
  form: FormState;
  setFrench: (t: string) => void;
  setEnglish: (t: string) => void;
  setExamples: (t: string) => void;
  handleGenderSelect: (g: Exclude<Gender, null>) => void;
  reset: () => void;
}

/**
 * Extracts and encapsulates the state / validation logic of the Add-/Edit-Word form.
 * The UI layer (modal) can thus remain purely presentational.
 */
export const useAddWordForm = (editingWord?: Word): UseAddWordForm => {
  const [french, setFrench] = useState("");
  const [english, setEnglish] = useState("");
  const [examples, setExamples] = useState("");
  const [gender, setGender] = useState<Gender>(null);

  // Populate when editing
  useEffect(() => {
    if (editingWord) {
      setFrench(editingWord.french);
      setEnglish(editingWord.english);
      setExamples(editingWord.examples || "");
      setGender(editingWord.gender ?? null);
    } else {
      reset();
    }
    // Only run when editingWord changes
  }, [editingWord?.id]);

  const handleGenderSelect = (selected: Exclude<Gender, null>) => {
    setGender((prev) => (prev === selected ? null : selected));
  };

  const reset = () => {
    setFrench("");
    setEnglish("");
    setExamples("");
    setGender(null);
  };

  return {
    form: { french, english, examples, gender },
    setFrench,
    setEnglish,
    setExamples,
    handleGenderSelect,
    reset,
  };
};
