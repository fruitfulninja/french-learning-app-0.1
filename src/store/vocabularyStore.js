// store/vocabularyStore.js
let vocabulary = JSON.parse(localStorage.getItem('french-vocabulary') || '{}');

const saveVocabulary = () => {
  localStorage.setItem('french-vocabulary', JSON.stringify(vocabulary));
};

const vocabularyStore = {
  getVocabulary() {
    return vocabulary;
  },

  indexWords(text) {
    if (!text) return;
    const words = text.split(/[\s.,!?;:'"()[\]{}<>]+/)
      .filter(word => word.length > 1);
    
    words.forEach(word => {
      if (!vocabulary[word]) {
        vocabulary[word] = {
          stars: 0,
          lastUpdated: new Date(),
          occurrences: 1
        };
      } else {
        vocabulary[word].occurrences++;
      }
    });
    saveVocabulary();
  },

  setStars(word, stars) {
    vocabulary[word] = {
      ...(vocabulary[word] || {}),
      stars,
      lastUpdated: new Date(),
      occurrences: (vocabulary[word]?.occurrences || 0)
    };
    saveVocabulary();
  },

  exportVocabulary() {
    const csv = [
      ['Word', 'Stars', 'Occurrences', 'Last Updated'].join(','),
      ...Object.entries(vocabulary).map(([word, data]) => [
        word,
        data.stars,
        data.occurrences,
        new Date(data.lastUpdated).toISOString()
      ].join(','))
    ].join('\n');
    return csv;
  }
};

export default () => vocabularyStore;