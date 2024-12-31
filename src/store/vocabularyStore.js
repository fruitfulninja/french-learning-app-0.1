// store/vocabularyStore.js
import { getBaseForm, normalizeText, isValidFrenchWord } from '../utils/french';

const data = {
  vocabulary: JSON.parse(localStorage.getItem('french-vocabulary') || '{}')
};

function saveVocabulary() {
  console.log('Saving vocabulary to localStorage...');
  try {
    localStorage.setItem('french-vocabulary', JSON.stringify(data.vocabulary));
    console.log('Vocabulary saved successfully');
  } catch (error) {
    console.error('Error saving vocabulary:', error);
  }
}

const createStore = () => {
  const store = {
    getVocabulary() {
      return {...data.vocabulary};
    },

    indexWords(text) {
      console.log('Starting word indexing process...');
      if (!text) return;
      
      // Split text into words and clean up
      const words = text.split(/[\s.,!?;:'"()[\]{}<>]+/)
        .map(word => word.trim())
        .filter(word => word.length > 0);
      
      console.log(`Processing ${words.length} potential words...`);
      
      // Use Set to deduplicate words before processing
      const uniqueWords = new Set(
        words.filter(word => isValidFrenchWord(word))
      );

      console.log(`Found ${uniqueWords.size} valid unique French words`);

      uniqueWords.forEach(word => {
        const baseForm = getBaseForm(word);
        if (!data.vocabulary[baseForm]) {
          data.vocabulary[baseForm] = {
            stars: 0,
            lastUpdated: new Date().toISOString(),
            occurrences: 1
          };
        } else {
          data.vocabulary[baseForm].occurrences++;
        }
      });

      console.log('Word indexing completed');
      saveVocabulary();
    },

    setStars(word, stars) {
      console.log(`Setting ${stars} stars for word: ${word}`);
      const baseForm = getBaseForm(word);
      data.vocabulary[baseForm] = {
        ...(data.vocabulary[baseForm] || {}),
        stars,
        lastUpdated: new Date().toISOString(),
        occurrences: (data.vocabulary[baseForm]?.occurrences || 0)
      };
      saveVocabulary();
    },

    removeWord(word) {
      console.log(`Removing word: ${word}`);
      const baseForm = getBaseForm(word);
      delete data.vocabulary[baseForm];
      saveVocabulary();
    },

    exportVocabulary() {
      console.log('Starting vocabulary export...');
      const csvContent = ['Word,Stars,Occurrences,Last Updated']
        .concat(Object.entries(data.vocabulary)
          .map(([word, info]) => 
            [
              word,
              info.stars || 0,
              info.occurrences || 0,
              info.lastUpdated || new Date().toISOString()
            ].join(','))
        ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'french-vocabulary.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Vocabulary export completed');
    }
  };

  return store;
};

// Create single instance
const store = createStore();
export default () => store;