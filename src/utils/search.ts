import Fuse from 'fuse.js';

export const createFuzzySearcher = (items) => {
  return new Fuse(items, {
    keys: ['content', 'choices', 'normalizedContent'],
    threshold: 0.3,
    ignoreLocation: true,
    useExtendedSearch: true,
    includeMatches: true,
    minMatchCharLength: 2
  });
};

export const performSearch = (data, searchTerm, typeFilter, levelFilter, fuseOptions) => {
  const fuse = new Fuse(data, fuseOptions);
  let result = data;

  if (searchTerm) {
    result = fuse.search(searchTerm).map(({ item }) => item);
  }

  if (typeFilter) {
    result = result.filter(item => item.type === typeFilter);
  }

  if (levelFilter) {
    result = result.filter(item => item.level === levelFilter);
  }

  return result;
};