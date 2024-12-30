// store/vocabularyStore.js
import { getBaseForm, getWordInfo } from '../utils/french';

// Initialize store with data from localStorage
const getInitialVocabulary = () => {
  try {
    const saved = localStorage.getItem('french-vocabulary');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('Error loading vocabulary:', e);
    return {};
  }
};

const saveVocabulary = (vocab) => {
  try {
    localStorage.setItem('french-vocabulary', JSON.stringify(vocab));
  } catch (e) {
    console.error('Error saving vocabulary:', e);
  }
};

const vocabularyState = {
  vocabulary: getInitialVocabulary(),

  indexWords(text) {
    if (!text) return;
    
    const words = text.split(/[\s.,!?;:'"()[\]{}<>]+/)
      .filter(word => word.length > 1);
    
    const newVocab = { ...this.vocabulary };

    words.forEach(word => {
      const baseForm = getBaseForm(word);
      const info = getWordInfo(word);
      if (!newVocab[baseForm]) {
        newVocab[baseForm] = {
          stars: 0,
          lastUpdated: new Date(),
          type: info?.type || 'unknown',
          variations: info?.conjugations || []
        };
      }
    });

    this.vocabulary = newVocab;
    saveVocabulary(newVocab);
  },

  setStars(word, stars) {
    const baseForm = getBaseForm(word);
    const newVocab = {
      ...this.vocabulary,
      [baseForm]: {
        ...this.vocabulary[baseForm],
        stars,
        lastUpdated: new Date()
      }
    };

    this.vocabulary = newVocab;
    saveVocabulary(newVocab);
  },

  exportVocabulary() {
    const csv = [
      ['Word', 'Type', 'Stars', 'Last Updated', 'Variations'].join(','),
      ...Object.entries(this.vocabulary).map(([word, data]) => [
        word,
        data.type,
        data.stars,
        new Date(data.lastUpdated).toISOString(),
        data.variations?.join(';') || ''
      ].join(','))
    ].join('\n');
    
    return csv;
  }
};

const useVocabularyStore = () => vocabularyState;

export default useVocabularyStore;