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

export const getWordVariations = (word) => {
  const normalized = normalizeText(word);
  const variations = new Set([normalized]);
  
  if (normalized.endsWith('er')) {
    const stem = normalized.slice(0, -2);
    variations.add(stem + 'e');
    variations.add(stem + 'es');
    variations.add(stem + 'ent');
    variations.add(stem + 'é');
    variations.add(stem + 'ée');
    variations.add(stem + 'és');
    variations.add(stem + 'ées');
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
