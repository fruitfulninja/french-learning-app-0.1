// utils/search.js
import Fuse from 'fuse.js';
import { normalizeText, getWordInfo, findRelatedWords } from './french.js';

export const performSearch = (data, searchTerm, typeFilter, levelFilter, fuseOptions) => {
  // Return filtered data if no search term
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

  // Get word variations and related words
  const wordInfo = getWordInfo(searchTerm);
  const relatedWords = findRelatedWords(searchTerm);

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

  return filterByTypeAndLevel(result, typeFilter, levelFilter);
};

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