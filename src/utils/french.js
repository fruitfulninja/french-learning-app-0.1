// utils/french.js

export const fixEncoding = (text) => {
  if (!text) return '';
  return text
    .replace(/Ã©/g, 'é')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã®/g, 'î')
    .replace(/Ã´/g, 'ô')
    .replace(/Ã¹/g, 'ù')
    .replace(/Ã»/g, 'û')
    .replace(/Ã«/g, 'ë')
    .replace(/Ã¯/g, 'ï')
    .replace(/Ã¼/g, 'ü')
    .replace(/Ã§/g, 'ç')
    .replace(/Å"/g, 'œ')
    .replace(/Ã¦/g, 'æ');
};

export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// New function to validate French words
export const isValidFrenchWord = (word) => {
  // Remove any leading/trailing spaces
  word = word.trim();
  
  // Skip if too short or too long
  if (word.length < 2 || word.length > 30) return false;
  
  // Skip numbers and symbols
  if (/[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(word)) return false;
  
  // Skip if contains multiple dots or hyphens (likely not a word)
  if ((word.match(/\./g) || []).length > 1) return false;
  if ((word.match(/-/g) || []).length > 2) return false;
  
  // Skip common non-word elements
  const nonWords = [
    'www', 'http', 'https', 'com', 'fr', 'org',
    'le', 'la', 'les', 'un', 'une', 'des', // Skip articles when alone
    'et', 'ou', 'ni', // Skip common conjunctions when alone
    'de', 'du', 'des', 'au', 'aux', // Skip common prepositions when alone
  ];
  
  if (nonWords.includes(word.toLowerCase())) return false;
  
  // Skip words that are just punctuation or special characters
  if (/^[.,!?;:'"()[\]{}<>]+$/.test(word)) return false;
  
  // Accept words with French characters
  const frenchPattern = /^[a-zàâäçéèêëîïôöùûüæœ'-]+$/i;
  return frenchPattern.test(word);
};

export const getBaseForm = (word) => {
  const normalized = word.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  // Common verb endings
  const endings = ['er', 'ir', 're'];
  const commonEndings = ['e', 'es', 'ent', 'é', 'ée', 'és', 'ées', 'ant'];
  
  for (const ending of endings) {
    if (normalized.endsWith(ending)) return word;
    for (const commonEnding of commonEndings) {
      if (normalized.endsWith(commonEnding)) {
        const stem = normalized.slice(0, -commonEnding.length);
        return stem + 'er';  // Most common case
      }
    }
  }
  return word;
};

const irregularVerbs = {
  'être': ['suis', 'es', 'est', 'sommes', 'êtes', 'sont', 'été'],
  'avoir': ['ai', 'as', 'a', 'avons', 'avez', 'ont', 'eu'],
  'aller': ['vais', 'vas', 'va', 'allons', 'allez', 'vont', 'allé'],
  'faire': ['fais', 'fait', 'faisons', 'faites', 'font'],
  'dire': ['dis', 'dit', 'disons', 'dites', 'disent'],
  'pouvoir': ['peux', 'peut', 'pouvons', 'pouvez', 'peuvent'],
  'vouloir': ['veux', 'veut', 'voulons', 'voulez', 'veulent'],
  'devoir': ['dois', 'doit', 'devons', 'devez', 'doivent'],
  'savoir': ['sais', 'sait', 'savons', 'savez', 'savent'],
};

// Add more French language data as needed...