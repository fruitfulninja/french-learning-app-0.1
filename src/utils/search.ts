import Fuse from 'fuse.js';
import { normalizeText } from './french.jsx';

export const performSearch = (data, searchTerm, typeFilter, levelFilter, fuseOptions) => {
  const fuse = new Fuse(data, fuseOptions);
  let result = data;

  if (searchTerm) {
    const normalizedSearch = normalizeText(searchTerm);
    result = fuse.search(normalizedSearch)
      .map(({ item }) => item)
      .sort((a, b) => {
        // Prioritize exact matches
        const aContent = normalizeText(a.content + ' ' + (a.choices || ''));
        const bContent = normalizeText(b.content + ' ' + (b.choices || ''));
        const exactMatchA = aContent.includes(normalizedSearch);
        const exactMatchB = bContent.includes(normalizedSearch);
        
        if (exactMatchA && !exactMatchB) return -1;
        if (!exactMatchA && exactMatchB) return 1;
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