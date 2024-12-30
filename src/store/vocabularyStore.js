// store/vocabularyStore.js

const data = {
  vocabulary: JSON.parse(localStorage.getItem('french-vocabulary') || '{}')
};

function saveVocabulary() {
  localStorage.setItem('french-vocabulary', JSON.stringify(data.vocabulary));
}

const store = {
  getVocabulary() {
    return data.vocabulary;
  },

  indexWords(text) {
    if (!text) return;
    text.split(/[\s.,!?;:'"()[\]{}<>]+/)
      .filter(word => word.length > 1 && !data.vocabulary[word])
      .forEach(word => {
        if (!data.vocabulary[word]) {
          data.vocabulary[word] = {
            stars: 0,
            lastUpdated: new Date().toISOString(),
            occurrences: 1
          };
        } else {
          data.vocabulary[word].occurrences++;
        }
      });
    saveVocabulary();
  },

  setStars(word, stars) {
    data.vocabulary[word] = {
      ...(data.vocabulary[word] || {}),
      stars,
      lastUpdated: new Date().toISOString(),
      occurrences: (data.vocabulary[word]?.occurrences || 0)
    };
    saveVocabulary();
  },

  exportVocabulary() {
    return ['Word,Stars,Occurrences,Last Updated']
      .concat(Object.entries(data.vocabulary)
        .map(([word, info]) => 
          [word, info.stars, info.occurrences, info.lastUpdated].join(','))
      ).join('\n');
  }
};

export default () => store;