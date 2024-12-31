import React, { useState, useMemo, useCallback, useRef } from 'react';
import useVocabularyStore from '../store/vocabularyStore';

const ITEMS_PER_PAGE = 50; // Increased page size for smoother pagination

const VocabularyTable = React.memo(({ words, onStarClick, onSearchWord }) => {
  return (
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Word</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occurrences</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {words.map(([word, data]) => (
          <tr key={word} className="hover:bg-gray-50">
            <td className="px-6 py-4">{word}</td>
            <td className="px-6 py-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => onStarClick(word, star)}
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
            <td className="px-6 py-4">
              {data.occurrences || 0}
            </td>
            <td className="px-6 py-4">
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
  );
});

const VocabularyView = ({ onSearchWord }) => {
  const vocabularyStore = useVocabularyStore();
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const vocabulary = vocabularyStore.getVocabulary();

  // Debounce filter changes
  const filterTimeout = useRef(null);
  const handleFilterChange = (e) => {
    if (filterTimeout.current) {
      clearTimeout(filterTimeout.current);
    }
    filterTimeout.current = setTimeout(() => {
      setFilter(e.target.value);
      setCurrentPage(1);
    }, 150);
  };

  // Memoize filtered and sorted words
  const filteredWords = useMemo(() => {
    return Object.entries(vocabulary)
      .filter(([word]) => 
        word.toLowerCase().includes(filter.toLowerCase())
      )
      .sort((a, b) => b[1].occurrences - a[1].occurrences);
  }, [vocabulary, filter]);

  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
  const paginatedWords = filteredWords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleStarClick = useCallback(async (word, stars) => {
    await vocabularyStore.setStars(word, stars);
  }, [vocabularyStore]);

  const handleExport = useCallback(async () => {
    await vocabularyStore.exportVocabulary();
  }, [vocabularyStore]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <input
          type="text"
          onChange={handleFilterChange}
          placeholder="Filter words..."
          className="px-4 py-2 border rounded-lg w-64"
        />
        <div className="text-sm text-gray-600">
          Total words: {filteredWords.length}
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Export
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <VocabularyTable 
          words={paginatedWords}
          onStarClick={handleStarClick}
          onSearchWord={onSearchWord}
        />
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="px-4 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(VocabularyView);