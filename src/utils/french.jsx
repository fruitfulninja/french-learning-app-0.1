import React from 'react';

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
        return stem + 'er';  // Most common case, could be expanded for -ir/-re verbs
      }
    }
  }
  return word;
};

const irregularWords = {
  'être': ['suis', 'es', 'est', 'sommes', 'êtes', 'sont', 'été'],
  'avoir': ['ai', 'as', 'a', 'avons', 'avez', 'ont', 'eu'],
  'aller': ['vais', 'vas', 'va', 'allons', 'allez', 'vont', 'allé', 'allée', 'allés', 'allées'],
  'faire': ['fais', 'fait', 'faisons', 'faites', 'font'],
  'dire': ['dis', 'dit', 'disons', 'dites', 'disent'],
  'pouvoir': ['peux', 'peut', 'pouvons', 'pouvez', 'peuvent', 'pu'],
  'vouloir': ['veux', 'veut', 'voulons', 'voulez', 'veulent', 'voulu'],
  'devoir': ['dois', 'doit', 'devons', 'devez', 'doivent', 'dû'],
  'savoir': ['sais', 'sait', 'savons', 'savez', 'savent', 'su'],
};

const vocabularyData = {
  nouns: {
    gender: ['masculine', 'feminine'],
    number: ['singular', 'plural'],
    relationships: {
      'maison': { gender: 'feminine', related: ['appartement', 'logement', 'habitation'] },
      'chat': { gender: 'masculine', related: ['chatte', 'chaton', 'félin'] },
      // Add more nouns as needed
    }
  },
  adjectives: {
    forms: {
      'beau': ['belle', 'beaux', 'belles'],
      'nouveau': ['nouvelle', 'nouveaux', 'nouvelles'],
      'grand': ['grande', 'grands', 'grandes'],
      // Add more adjectives as needed
    }
  },
  expressions: {
    'avoir lieu': { meaning: 'to take place', register: 'standard' },
    'tout à fait': { meaning: 'completely', register: 'standard' },
    // Add more expressions as needed
  }
};

export const findRelatedWords = (word) => {
  const normalized = normalizeText(word);
  const results = new Set();

  // Check nouns
  for (const [noun, data] of Object.entries(vocabularyData.nouns.relationships)) {
    if (normalized === normalizeText(noun)) {
      data.related.forEach(related => results.add(related));
      break;
    }
  }

  // Check adjectives
  for (const [adj, forms] of Object.entries(vocabularyData.adjectives.forms)) {
    if (normalized === normalizeText(adj) || forms.some(f => normalized === normalizeText(f))) {
      results.add(adj);
      forms.forEach(form => results.add(form));
    }
  }

  // Check expressions
  for (const expression of Object.keys(vocabularyData.expressions)) {
    if (expression.includes(word)) {
      results.add(expression);
    }
  }

  return Array.from(results);
};

export const getWordInfo = (word) => {
  const normalized = normalizeText(word);
  
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

  // Check verbs (using existing irregular words and verb detection)
  if (irregularWords[normalized]) {
    return {
      type: 'verb',
      conjugations: irregularWords[normalized],
      isIrregular: true
    };
  }

  const base = getBaseForm(word);
  if (base.endsWith('er') || base.endsWith('ir') || base.endsWith('re')) {
    return {
      type: 'verb',
      conjugations: getWordVariations(base),
      isIrregular: false
    };
  }

  return null;
};

// Enhance getWordVariations to include vocabulary variations
export const getWordVariations = (word) => {
  const normalized = normalizeText(word);
  const variations = new Set([normalized]);
  
  // Add vocabulary-based variations
  const wordInfo = getWordInfo(word);
  if (wordInfo) {
    switch (wordInfo.type) {
      case 'noun':
        wordInfo.related.forEach(related => variations.add(normalizeText(related)));
        break;
      case 'adjective':
        wordInfo.forms.forEach(form => variations.add(normalizeText(form)));
        break;
      case 'verb':
        wordInfo.conjugations.forEach(conj => variations.add(normalizeText(conj)));
        break;
    }
  }

  // Continue with existing irregular and regular verb handling
  if (normalized.endsWith('er')) {
    const stem = normalized.slice(0, -2);
    // Present tense
    variations.add(stem + 'e');
    variations.add(stem + 'es');
    variations.add(stem + 'ent');
    // Past participle
    variations.add(stem + 'é');
    variations.add(stem + 'ée');
    variations.add(stem + 'és');
    variations.add(stem + 'ées');
    // Present participle
    variations.add(stem + 'ant');
  } else if (normalized.endsWith('ir')) {
    const stem = normalized.slice(0, -2);
    // Present tense
    variations.add(stem + 'is');
    variations.add(stem + 'it');
    variations.add(stem + 'issons');
    variations.add(stem + 'issez');
    variations.add(stem + 'issent');
    // Past participle
    variations.add(stem + 'i');
    variations.add(stem + 'ie');
    variations.add(stem + 'is');
    variations.add(stem + 'ies');
    // Present participle
    variations.add(stem + 'issant');
  } else if (normalized.endsWith('re')) {
    const stem = normalized.slice(0, -2);
    // Present tense
    variations.add(stem + 's');
    variations.add(stem);
    variations.add(stem + 'ons');
    variations.add(stem + 'ez');
    variations.add(stem + 'ent');
    // Past participle
    variations.add(stem + 'u');
    variations.add(stem + 'ue');
    variations.add(stem + 'us');
    variations.add(stem + 'ues');
    // Present participle
    variations.add(stem + 'ant');
  }

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
  
  return parts.map((part, i) => {
    if (variations.includes(normalizeText(part))) {
      return <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>;
    }
    return part;
  });
};
