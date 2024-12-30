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