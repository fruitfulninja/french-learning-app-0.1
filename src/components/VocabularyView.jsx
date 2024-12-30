// components/VocabularyView.jsx
import React, { useState, useMemo } from 'react';
import useVocabularyStore from '../store/vocabularyStore';

const VocabularyView = ({ onSearchWord }) => {
  const vocabularyStore = useVocabularyStore();
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('word');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(order => order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const sortedWords = useMemo(() => {
    const words = Object.entries(vocabularyStore.vocabulary)
      .filter(([word]) => 
        word.toLowerCase().includes(filter.toLowerCase())
      );

    return words.sort(([wordA, dataA], [wordB, dataB]) => {
      let comparison = 0;
      switch (sortBy) {
        case 'word':
          comparison = wordA.localeCompare(wordB);
          break;
        case 'stars':
          comparison = (dataA.stars || 0) - (dataB.stars || 0);
          break;
        case 'lastUpdated':
          comparison = new Date(dataA.lastUpdated) - new Date(dataB.lastUpdated);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [vocabularyStore.vocabulary, filter, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter words..."
          className="px-4 py-2 border rounded-lg w-64"
        />
        <button
          onClick={() => {
            const csv = vocabularyStore.exportVocabulary();
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'vocabulary.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('word')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Word {sortBy === 'word' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('stars')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Confidence {sortBy === 'stars' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('lastUpdated')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Last Updated {sortBy === 'lastUpdated' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedWords.map(([word, data]) => (
              <tr key={word} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{word}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => vocabularyStore.setStars(word, star)}
                        className={`w-6 h-6 ${
                          star <= (data.stars || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(data.lastUpdated).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onSearchWord(word)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Search
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VocabularyView;