// store/vocabularyStore.js
const getInitialVocabulary = () => {
  try {
    const saved = localStorage.getItem('french-vocabulary');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const vocabularyStore = {
  vocabulary: getInitialVocabulary(),

  indexWords(text) {
    if (!text) return;
    const words = text.split(/[\s.,!?;:'"()[\]{}<>]+/)
      .filter(word => word.length > 1);
    
    words.forEach(word => {
      if (!this.vocabulary[word]) {
        this.vocabulary[word] = {
          stars: 0,
          lastUpdated: new Date(),
          occurrences: 1
        };
      } else {
        this.vocabulary[word].occurrences++;
      }
    });
    this.save();
  },

  setStars(word, stars) {
    if (!this.vocabulary[word]) {
      this.vocabulary[word] = {
        stars: 0,
        lastUpdated: new Date(),
        occurrences: 0
      };
    }
    this.vocabulary[word].stars = stars;
    this.vocabulary[word].lastUpdated = new Date();
    this.save();
  },

  save() {
    try {
      localStorage.setItem('french-vocabulary', JSON.stringify(this.vocabulary));
    } catch (e) {
      console.error('Failed to save vocabulary:', e);
    }
  },

  exportVocabulary() {
    const csv = [
      ['Word', 'Stars', 'Occurrences', 'Last Updated'].join(','),
      ...Object.entries(this.vocabulary).map(([word, data]) => [
        word,
        data.stars,
        data.occurrences,
        new Date(data.lastUpdated).toISOString()
      ].join(','))
    ].join('\n');
    return csv;
  }
};

const useVocabularyStore = () => vocabularyStore;

export default useVocabularyStore;