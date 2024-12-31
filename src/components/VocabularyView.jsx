import React, { useState, useMemo, useEffect } from 'react';
import useVocabularyStore from '../store/vocabularyStore';

const ITEMS_PER_PAGE = 20;

const VocabularyView = ({ onSearchWord }) => {
  const vocabularyStore = useVocabularyStore();
  const [vocabulary, setVocabulary] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('word');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Load vocabulary data
  useEffect(() => {
    async function loadVocabulary() {
      try {
        setLoading(true);
        console.log('Loading vocabulary data...');
        const vocabData = await vocabularyStore.getVocabulary();
        console.log('Loaded vocabulary:', vocabData);
        setVocabulary(vocabData);
      } catch (error) {
        console.error('Error loading vocabulary:', error);
      } finally {
        setLoading(false);
      }
    }

    loadVocabulary();
  }, [vocabularyStore]);

  const sortedWords = useMemo(() => {
    console.log('Sorting words with filter:', filter);
    console.log('Current vocabulary:', vocabulary);
    
    const words = Object.entries(vocabulary)
      .filter(([word]) => 
        word.toLowerCase().includes(filter.toLowerCase())
      );

    console.log('Filtered words:', words);

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
          comparison = new Date(dataA.lastUpdated || 0) - new Date(dataB.lastUpdated || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [vocabulary, filter, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedWords.length / ITEMS_PER_PAGE);
  const paginatedWords = sortedWords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(order => order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-lg text-gray-600">Loading vocabulary...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <input
          type="text"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Filter words..."
          className="px-4 py-2 border rounded-lg w-64"
        />
        <button
          onClick={vocabularyStore.exportVocabulary}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Export Vocabulary
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
                Occurrences
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedWords.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No vocabulary words found. Try searching for some words first.
                </td>
              </tr>
            ) : (
              paginatedWords.map(([word, data]) => (
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
                    {data.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {data.occurrences || 0}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedWords.length)} of {sortedWords.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyView;