// utils/search.js
import Fuse from 'fuse.js';
import { normalizeText, getWordInfo, findRelatedWords } from './french.js';

// Add memoization cache
const relatedWordsCache = new Map();

export const performSearch = (data, searchTerm, typeFilter, levelFilter, fuseOptions) => {
  console.log('performSearch called with:', { searchTerm, typeFilter, levelFilter });
  
  // Add guard clause for invalid inputs
  if (!data || !Array.isArray(data)) {
    console.warn('Invalid data provided to performSearch');
    return [];
  }

  if (!searchTerm) {
    return filterByTypeAndLevel(data, typeFilter, levelFilter);
  }

  // Initialize search
  const fuse = new Fuse(data, {
    ...fuseOptions,
    keys: ['content', 'choices', 'normalizedContent'],
    threshold: 0.2,
    distance: 100,
    minMatchCharLength: 3,
    includeScore: true,
    ignoreLocation: true,
  });

  // Get word variations and related words with memoization
  const wordInfo = getWordInfo(searchTerm);
  let relatedWords;
  
  if (relatedWordsCache.has(searchTerm)) {
    relatedWords = relatedWordsCache.get(searchTerm);
  } else {
    relatedWords = findRelatedWords(searchTerm)
      .filter(word => word !== searchTerm)
      .slice(0, 50); // Limit related words to prevent stack overflow
    relatedWordsCache.set(searchTerm, relatedWords);
  }

  console.log('relatedWords:', relatedWords);

  // Perform search and map results
  let result = fuse.search(normalizeText(searchTerm))
    .map(({ item }) => item)
    .sort((a, b) => {
      const aContent = normalizeText(a.content + ' ' + (a.choices || ''));
      const bContent = normalizeText(b.content + ' ' + (b.choices || ''));
      
      // Check for exact matches including related words
      const aMatches = [searchTerm, ...relatedWords].some(term => 
        aContent.includes(normalizeText(term)));
      const bMatches = [searchTerm, ...relatedWords].some(term => 
        bContent.includes(normalizeText(term)));
      
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
  console.log('search result:', result);

  return filterByTypeAndLevel(result, typeFilter, levelFilter);
};

// Clear cache periodically to prevent memory leaks
setInterval(() => relatedWordsCache.clear(), 30 * 60 * 1000); // Clear every 30 minutes

const filterByTypeAndLevel = (data, typeFilter, levelFilter) => {
  let filtered = data;
  
  if (typeFilter) {
    filtered = filtered.filter(item => item.type === typeFilter);
  }
  
  if (levelFilter) {
    filtered = filtered.filter(item => item.level === levelFilter);
  }
  
  return filtered;
};