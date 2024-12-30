import { getBaseForm, getWordInfo } from '../utils/french';

const useVocabularyStore = window.zustand(
  window.persist(
    (set, get) => ({
      vocabulary: {}, // { word: { stars: number, lastUpdated: Date, type: string } }
      
      indexWords: (text) => {
        const words = text.split(/[\s.,!?;:'"()[\]{}<>]+/)
          .filter(word => word.length > 1);
        
        const currentVocab = get().vocabulary;
        const newVocab = { ...currentVocab };

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

        set({ vocabulary: newVocab });
      },

      setStars: (word, stars) => {
        const baseForm = getBaseForm(word);
        set(state => ({
          vocabulary: {
            ...state.vocabulary,
            [baseForm]: {
              ...state.vocabulary[baseForm],
              stars,
              lastUpdated: new Date()
            }
          }
        }));
      },

      exportVocabulary: () => {
        const vocab = get().vocabulary;
        const csv = [
          ['Word', 'Type', 'Stars', 'Last Updated', 'Variations'].join(','),
          ...Object.entries(vocab).map(([word, data]) => [
            word,
            data.type,
            data.stars,
            new Date(data.lastUpdated).toISOString(),
            data.variations?.join(';') || ''
          ].join(','))
        ].join('\n');
        
        return csv;
      }
    }),
    {
      name: 'french-vocabulary-storage'
    }
  )
);

export default useVocabularyStore;