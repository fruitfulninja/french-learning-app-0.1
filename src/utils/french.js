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

export const isValidFrenchWord = (word) => {
  word = word.trim();
  if (word.length < 2 || word.length > 30) return false;
  if (/[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(word)) return false;
  if ((word.match(/\./g) || []).length > 1) return false;
  if ((word.match(/-/g) || []).length > 2) return false;
  
  const nonWords = [
    'www', 'http', 'https', 'com', 'fr', 'org',
    'le', 'la', 'les', 'un', 'une', 'des',
    'et', 'ou', 'ni',
    'de', 'du', 'des', 'au', 'aux',
  ];
  
  if (nonWords.includes(word.toLowerCase())) return false;
  if (/^[.,!?;:'"()[\]{}<>]+$/.test(word)) return false;
  
  const frenchPattern = /^[a-zàâäçéèêëîïôöùûüæœ'-]+$/i;
  return frenchPattern.test(word);
};

export const getBaseForm = (word) => {
  const normalized = word.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  // Check irregular verbs first
  for (const [base, forms] of Object.entries(irregularVerbs)) {
    if (forms.includes(normalized) || base === normalized) {
      return base;
    }
  }
  
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

const vocabularyData = {
  nouns: {
    gender: ['masculine', 'feminine'],
    number: ['singular', 'plural'],
    relationships: {
      'maison': { gender: 'feminine', related: ['appartement', 'logement', 'habitation'] },
      'chat': { gender: 'masculine', related: ['chatte', 'chaton', 'félin'] },
    }
  },
  adjectives: {
    forms: {
      'beau': ['belle', 'beaux', 'belles'],
      'nouveau': ['nouvelle', 'nouveaux', 'nouvelles'],
      'grand': ['grande', 'grands', 'grandes'],
    }
  },
  expressions: {
    'avoir lieu': { meaning: 'to take place', register: 'standard' },
    'tout à fait': { meaning: 'completely', register: 'standard' },
  }
};

export const getWordInfo = (word) => {
  if (!word || !isValidFrenchWord(word)) return null;
  
  const normalized = normalizeText(word);
  
  // Check irregular verbs
  for (const [base, forms] of Object.entries(irregularVerbs)) {
    if (forms.includes(normalized) || base === normalized) {
      return {
        type: 'verb',
        baseForm: base,
        conjugations: forms,
        isIrregular: true
      };
    }
  }
  
  // Check nouns
  for (const [noun, data] of Object.entries(vocabularyData.nouns.relationships)) {
    if (normalized === normalizeText(noun)) {
      return {
        type: 'noun',
        gender: data.gender,
        related: data.related
      };
    }
  }

  // Check adjectives
  for (const [adj, forms] of Object.entries(vocabularyData.adjectives.forms)) {
    if (normalized === normalizeText(adj) || forms.some(f => normalized === normalizeText(f))) {
      return {
        type: 'adjective',
        forms: [adj, ...forms]
      };
    }
  }

  // Check expressions
  for (const [expr, data] of Object.entries(vocabularyData.expressions)) {
    if (expr.includes(word)) {
      return {
        type: 'expression',
        meaning: data.meaning,
        register: data.register
      };
    }
  }

  // Check if it might be a regular verb
  const base = getBaseForm(word);
  if (base.endsWith('er') || base.endsWith('ir') || base.endsWith('re')) {
    return {
      type: 'verb',
      baseForm: base,
      isIrregular: false
    };
  }

  return {
    type: 'unknown',
    baseForm: getBaseForm(word)
  };
};

export const findRelatedWords = (word) => {
  if (!word || !isValidFrenchWord(word)) return [];
  
  const normalized = normalizeText(word);
  const results = new Set();
  
  // Get word info
  const info = getWordInfo(word);
  if (!info) return [];
  
  switch (info.type) {
    case 'verb':
      if (info.isIrregular && info.conjugations) {
        info.conjugations.forEach(form => results.add(form));
      }
      break;
    case 'noun':
      if (info.related) {
        info.related.forEach(related => results.add(related));
      }
      break;
    case 'adjective':
      if (info.forms) {
        info.forms.forEach(form => results.add(form));
      }
      break;
  }
  
  return Array.from(results);
};

export const getWordVariations = (word) => {
  if (!word || !isValidFrenchWord(word)) return [];
  
  const normalized = normalizeText(word);
  const variations = new Set([normalized]);
  
  // Add base form
  const base = getBaseForm(word);
  variations.add(base);
  
  // Add related words
  const related = findRelatedWords(word);
  related.forEach(w => variations.add(normalizeText(w)));
  
  return Array.from(variations);
};

export const highlightText = (text, searchTerm) => {
  if (!searchTerm || !text) return text;
  
  const variations = searchTerm.toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .flatMap(getWordVariations);
  
  const pattern = variations
    .map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  
  const parts = text.split(new RegExp(`(${pattern})`, 'gi'));
  
  return parts;
};