import React, { useMemo } from 'react';
import useVocabularyStore from '../store/vocabularyStore';
import { getBaseForm, getWordInfo } from '../utils/french';

const WordStatsPanel = ({ searchTerm }) => {
  const vocabularyStore = useVocabularyStore();
  const vocabulary = vocabularyStore.getVocabulary();

  const wordInfo = useMemo(() => {
    if (!searchTerm) return null;
    const baseForm = getBaseForm(searchTerm);
    const info = getWordInfo(searchTerm);
    const vocabEntry = vocabulary[baseForm] || {};
    
    return {
      baseForm,
      type: info?.type || 'unknown',
      stars: vocabEntry.stars || 0,
      occurrences: vocabEntry.occurrences || 0,
      lastSeen: vocabEntry.lastUpdated,
      info
    };
  }, [searchTerm, vocabulary]);

  if (!wordInfo) return null;

  const handleStarClick = (starCount) => {
    vocabularyStore.setStars(wordInfo.baseForm, starCount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Word Info Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Word Information</h3>
          <div className="space-y-1">
            <p className="text-gray-600">
              <span className="font-medium">Search term:</span> {searchTerm}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Base form:</span> {wordInfo.baseForm}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Type:</span> {wordInfo.type}
            </p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Statistics</h3>
          <div className="space-y-1">
            <p className="text-gray-600">
              <span className="font-medium">Occurrences:</span> {wordInfo.occurrences}
            </p>
            {wordInfo.lastSeen && (
              <p className="text-gray-600">
                <span className="font-medium">Last seen:</span>{' '}
                {new Date(wordInfo.lastSeen).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Rating Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">Confidence Rating</h3>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                className={`w-8 h-8 ${
                  star <= wordInfo.stars 
                    ? 'text-yellow-400 hover:text-yellow-500' 
                    : 'text-gray-300 hover:text-gray-400'
                } transition-colors duration-150`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Click stars to rate your confidence with this word
          </p>
        </div>

        {/* Dictionary Section - Placeholder for future implementation */}
        <div className="col-span-full mt-4">
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Dictionary
            </h3>
            <p className="text-gray-500 italic">
              Dictionary integration coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordStatsPanel;