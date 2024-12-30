import React, { useState } from 'react';
import useVocabularyStore from '../store/vocabularyStore';
import { getWordInfo } from '../utils/french';

const VocabularyView = ({ onSearchWord }) => {
  const { vocabulary, setStars, exportVocabulary } = useVocabularyStore();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastUpdated');

  const handleExport = () => {
    const csv = exportVocabulary();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'french-vocabulary.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const sortedWords = Object.entries(vocabulary).sort((a, b) => {
    if (sortBy === 'lastUpdated') {
      return new Date(b[1].lastUpdated) - new Date(a[1].lastUpdated);
    }
    return b[1].stars - a[1].stars;
  });

  const filteredWords = sortedWords.filter(([_, data]) => 
    filter === 'all' || data.type === filter
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="select select-bordered"
          >
            <option value="all">All Types</option>
            <option value="verb">Verbs</option>
            <option value="noun">Nouns</option>
            <option value="adjective">Adjectives</option>
            <option value="expression">Expressions</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="select select-bordered"
          >
            <option value="lastUpdated">Recent</option>
            <option value="stars">Stars</option>
          </select>
        </div>
        <button 
          onClick={handleExport}
          className="btn btn-primary"
        >
          Export CSV
        </button>
      </div>

      <div className="grid gap-4">
        {filteredWords.map(([word, data]) => (
          <div key={word} className="border p-4 rounded-lg flex justify-between items-center">
            <div>
              <div 
                className="text-lg font-medium cursor-pointer hover:text-blue-600"
                onClick={() => onSearchWord(word)}
              >
                {word}
              </div>
              <div className="text-sm text-gray-500">
                {data.type} • Last updated: {new Date(data.lastUpdated).toLocaleDateString()}
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setStars(word, star)}
                  className={`w-6 h-6 ${
                    star <= data.stars ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VocabularyView;
