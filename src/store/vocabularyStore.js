// store/vocabularyStore.js
import { getBaseForm, normalizeText, isValidFrenchWord } from '../utils/french';
import dbService from '../services/dbService';

const data = {
  vocabulary: {},
  isInitialized: false
};

async function initializeStore() {
  if (!data.isInitialized) {
    console.log('Initializing vocabulary store...');
    await dbService.init();
    const words = await dbService.getAllWords();
    data.vocabulary = words.reduce((acc, word) => {
      acc[word.word] = word;
      return acc;
    }, {});
    data.isInitialized = true;
    console.log('Vocabulary store initialized');
  }
}

const createStore = () => {
  const store = {
    async getVocabulary() {
      await initializeStore();
      return {...data.vocabulary};
    },

    async indexWords(text) {
      console.log('Indexing words...');
      await initializeStore();
      
      if (!text) return;
      
      const uniqueWords = new Set(
        text.split(/[\s.,!?;:'"()[\]{}<>]+/)
          .filter(word => isValidFrenchWord(word))
      );

      console.log(`Processing ${uniqueWords.size} unique words`);

      for (const word of uniqueWords) {
        const baseForm = getBaseForm(word);
        const existingWord = data.vocabulary[baseForm];
        
        const wordData = {
          word: baseForm,
          stars: existingWord?.stars || 0,
          occurrences: (existingWord?.occurrences || 0) + 1,
          notes: existingWord?.notes || '',
          type: 'word',
          lastUpdated: new Date().toISOString()
        };

        data.vocabulary[baseForm] = wordData;
        await dbService.saveWord(baseForm, wordData);

        // Save the context
        await dbService.addContext(baseForm, {
          text,
          timestamp: new Date().toISOString()
        });
      }

      console.log('Word indexing completed');
    },

    async setStars(word, stars) {
      console.log(`Setting ${stars} stars for word: ${word}`);
      await initializeStore();
      
      const baseForm = getBaseForm(word);
      const wordData = {
        ...(data.vocabulary[baseForm] || {}),
        word: baseForm,
        stars,
        lastUpdated: new Date().toISOString()
      };

      data.vocabulary[baseForm] = wordData;
      await dbService.saveWord(baseForm, wordData);
    },

    async addNote(word, note) {
      console.log(`Adding note for word: ${word}`);
      await initializeStore();
      
      const baseForm = getBaseForm(word);
      const wordData = {
        ...(data.vocabulary[baseForm] || {}),
        word: baseForm,
        notes: note,
        lastUpdated: new Date().toISOString()
      };

      data.vocabulary[baseForm] = wordData;
      await dbService.saveWord(baseForm, wordData);
    },

    async exportVocabulary() {
      console.log('Starting vocabulary export...');
      await initializeStore();
      
      const data = await dbService.exportData();
      const csvContent = ['Word,Stars,Occurrences,Notes,Last Updated']
        .concat(data.map(item => 
          [
            item.word,
            item.stars || 0,
            item.occurrences || 0,
            `"${item.notes || ''}"`,
            item.lastUpdated || new Date().toISOString()
          ].join(','))
        ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'french-vocabulary.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    async importVocabulary(csvContent) {
      console.log('Starting vocabulary import...');
      await initializeStore();
      
      // Parse CSV and convert to proper format
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',');
      
      const importData = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index];
          return obj;
        }, {});
      });

      await dbService.importData(importData);
      
      // Refresh local data
      const words = await dbService.getAllWords();
      data.vocabulary = words.reduce((acc, word) => {
        acc[word.word] = word;
        return acc;
      }, {});
    }
  };

  return store;
};

// Create single instance
const store = createStore();
export default () => store;