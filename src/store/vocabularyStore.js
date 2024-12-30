// store/vocabularyStore.js

class VocabularyStore {
  constructor() {
    this._vocabulary = this._loadFromStorage();
  }

  _loadFromStorage() {
    try {
      const saved = localStorage.getItem('french-vocabulary');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  _saveToStorage() {
    try {
      localStorage.setItem('french-vocabulary', JSON.stringify(this._vocabulary));
    } catch (e) {
      console.error('Failed to save vocabulary:', e);
    }
  }

  indexWords(text) {
    if (!text) return;
    const words = text.split(/[\s.,!?;:'"()[\]{}<>]+/)
      .filter(word => word.length > 1);
    
    words.forEach(word => {
      if (!this._vocabulary[word]) {
        this._vocabulary[word] = {
          stars: 0,
          lastUpdated: new Date(),
          occurrences: 1
        };
      } else {
        this._vocabulary[word].occurrences++;
      }
    });
    this._saveToStorage();
  }

  setStars(word, stars) {
    if (!this._vocabulary[word]) {
      this._vocabulary[word] = {
        stars: 0,
        lastUpdated: new Date(),
        occurrences: 0
      };
    }
    this._vocabulary[word].stars = stars;
    this._vocabulary[word].lastUpdated = new Date();
    this._saveToStorage();
  }

  get vocabulary() {
    return this._vocabulary;
  }

  exportVocabulary() {
    const csv = [
      ['Word', 'Stars', 'Occurrences', 'Last Updated'].join(','),
      ...Object.entries(this._vocabulary).map(([word, data]) => [
        word,
        data.stars,
        data.occurrences,
        new Date(data.lastUpdated).toISOString()
      ].join(','))
    ].join('\n');
    return csv;
  }
}

const store = new VocabularyStore();
const useVocabularyStore = () => store;

export default useVocabularyStore;