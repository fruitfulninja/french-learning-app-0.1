// utils/search.js
import Fuse from 'fuse.js';
import { normalizeText, getWordInfo, findRelatedWords } from './french.js';

// Cache Fuse instances for better performance
const fuseInstanceCache = new Map();

export const performSearch = (data, searchTerm, typeFilter, levelFilter, fuseOptions) => {
  console.log('performSearch called with:', { searchTerm, typeFilter, levelFilter });
  
  // Early return if no data
  if (!Array.isArray(data) || data.length === 0) {
    console.log('No data to search');
    return [];
  }

  // Return filtered data if no search term
  if (!searchTerm) {
    console.log('No search term, applying filters only');
    return filterByTypeAndLevel(data, typeFilter, levelFilter);
  }

  // Get or create Fuse instance
  const cacheKey = JSON.stringify(data.map(item => item.id));
  let fuse = fuseInstanceCache.get(cacheKey);
  if (!fuse) {
    console.log('Creating new Fuse instance');
    fuse = new Fuse(data, {
      keys: ['content', 'choices', 'normalizedContent'],
      threshold: 0.2,
      distance: 100,
      minMatchCharLength: 3,
      includeScore: true,
      ignoreLocation: true,
      ...fuseOptions
    });
    fuseInstanceCache.set(cacheKey, fuse);
  }

  // Normalize search term
  const normalizedSearchTerm = normalizeText(searchTerm);
  console.log('Normalized search term:', normalizedSearchTerm);

  try {
    // Get word variations and related words
    const wordInfo = getWordInfo(searchTerm);
    const relatedWords = findRelatedWords(searchTerm);
    console.log('Related words found:', relatedWords);

    // Perform search
    const searchResults = fuse.search(normalizedSearchTerm);
    console.log(`Found ${searchResults.length} initial results`);

    // Map and sort results
    let result = searchResults
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

    // Apply filters
    const filteredResults = filterByTypeAndLevel(result, typeFilter, levelFilter);
    console.log(`Returning ${filteredResults.length} filtered results`);
    return filteredResults;

  } catch (error) {
    console.error('Error in performSearch:', error);
    return filterByTypeAndLevel(data, typeFilter, levelFilter);
  }
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