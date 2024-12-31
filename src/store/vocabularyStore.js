// store/vocabularyStore.js
import { getBaseForm, normalizeText } from '../utils/french';

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
  // Create closure to prevent external modification
  const store = {
    getVocabulary() {
      return {...data.vocabulary};  // Return copy to prevent direct mutation
    },

    indexWords(text) {
      console.log('Indexing words...');
      if (!text) return;
      
      // Use Set to deduplicate words before processing
      const uniqueWords = new Set(
        text.split(/[\s.,!?;:'"()[\]{}<>]+/)
          .filter(word => word.length > 1)
          .map(word => normalizeText(word))
      );

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

      console.log(`Indexed ${uniqueWords.size} unique words`);
      saveVocabulary();
    },

    setStars(word, stars) {
      console.log(`Setting stars for word: ${word}`);
      const baseForm = getBaseForm(word);
      data.vocabulary[baseForm] = {
        ...(data.vocabulary[baseForm] || {}),
        stars,
        lastUpdated: new Date().toISOString(),
        occurrences: (data.vocabulary[baseForm]?.occurrences || 0)
      };
      saveVocabulary();
    },

    exportVocabulary() {
      console.log('Exporting vocabulary...');
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
    }
  };

  return store;
};

// Create single instance
const store = createStore();
export default () => store;