// store/vocabularyStore.js
import { getBaseForm, isValidFrenchWord } from '../utils/french';
import dbService from '../services/dbService';

let data = {
  vocabulary: {},
  ratings: {},
  isInitialized: false
};

async function initializeStore() {
  if (!data.isInitialized) {
    console.log('Initializing vocabulary store...');
    await dbService.init();
    const ratings = await dbService.getAllRatings();
    
    // Convert ratings array to object for easier lookup
    data.ratings = ratings.reduce((acc, rating) => {
      acc[rating.word] = rating;
      return acc;
    }, {});
    
    data.isInitialized = true;
    console.log('Vocabulary store initialized');
  }
}

function createVocabularyStore() {
  return {
    getVocabulary() {
      // Combine vocabulary with ratings
      return Object.entries(data.vocabulary).reduce((acc, [word, wordData]) => {
        acc[word] = {
          ...wordData,
          stars: data.ratings[word]?.stars || 0,
          notes: data.ratings[word]?.notes || ''
        };
        return acc;
      }, {});
    },

    async initializeIfNeeded() {
      await initializeStore();
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
        
        data.vocabulary[baseForm] = {
          word: baseForm,
          occurrences: (existingWord?.occurrences || 0) + 1,
          type: 'word',
          lastUpdated: new Date().toISOString()
        };
      }

      console.log('Word indexing completed');
    },

    async setStars(word, stars) {
      console.log(`Setting ${stars} stars for word: ${word}`);
      await initializeStore();
      
      const baseForm = getBaseForm(word);
      const ratingData = {
        stars,
        notes: data.ratings[baseForm]?.notes || '',
        lastUpdated: new Date().toISOString()
      };

      // Update local data
      data.ratings[baseForm] = ratingData;
      
      // Save to database
      await dbService.saveRating(baseForm, ratingData);
    },

    async addNote(word, note) {
      console.log(`Adding note for word: ${word}`);
      await initializeStore();
      
      const baseForm = getBaseForm(word);
      const ratingData = {
        stars: data.ratings[baseForm]?.stars || 0,
        notes: note,
        lastUpdated: new Date().toISOString()
      };

      // Update local data
      data.ratings[baseForm] = ratingData;
      
      // Save to database
      await dbService.saveRating(baseForm, ratingData);
    },

    async exportVocabulary() {
      console.log('Starting vocabulary export...');
      await initializeStore();
      
      const vocabulary = this.getVocabulary();
      const exportData = Object.entries(vocabulary).map(([word, data]) => ({
        word,
        stars: data.stars || 0,
        notes: data.notes || '',
        occurrences: data.occurrences || 0,
        lastUpdated: data.lastUpdated
      }));

      // Create CSV
      const csvContent = ['Word,Stars,Notes,Occurrences,Last Updated']
        .concat(exportData.map(entry => 
          [
            entry.word,
            entry.stars,
            `"${entry.notes.replace(/"/g, '""')}"`,
            entry.occurrences,
            entry.lastUpdated
          ].join(','))
        ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `french-vocabulary-${new Date().toISOString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
}

const store = createVocabularyStore();
export default function useVocabularyStore() {
  return store;
}