export interface SuggestionResult {
  suggestions: string[];
}

const FIRST_OPEN_SUGGESTIONS: string[] = [
  "Apa saja fitur yang tersedia di aplikasi ini?",
  "Bagaimana cara melakukan perhitungan PSI?",
  "Siapa saja kandidat mentor yang tersedia?",
];

export function getFirstOpenSuggestions(): SuggestionResult {
  return { suggestions: FIRST_OPEN_SUGGESTIONS };
}
