import Fuse from 'fuse.js';
import { normalizeText, getWordInfo, findRelatedWords } from './french.jsx';

export const performSearch = (data, searchTerm, typeFilter, levelFilter, fuseOptions) => {
  const fuse = new Fuse(data, fuseOptions);
  let result = data;

  if (searchTerm) {
    const normalizedSearch = normalizeText(searchTerm);
    const wordInfo = getWordInfo(searchTerm);
    const relatedWords = findRelatedWords(searchTerm);
    
    result = fuse.search(normalizedSearch)
      .map(({ item }) => item)
      .sort((a, b) => {
        // Prioritize exact matches
        const aContent = normalizeText(a.content + ' ' + (a.choices || ''));
        const bContent = normalizeText(b.content + ' ' + (b.choices || ''));
        
        // Check for exact matches including related words
        const aMatches = [normalizedSearch, ...relatedWords].some(term => 
          aContent.includes(normalizeText(term)));
        const bMatches = [normalizedSearch, ...relatedWords].some(term => 
          bContent.includes(normalizeText(term)));
        
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
      });
  }

  if (typeFilter) {
    result = result.filter(item => item.type === typeFilter);
  }

  if (levelFilter) {
    result = result.filter(item => item.level === levelFilter);
  }

  return result;
};