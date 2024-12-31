import React, { useCallback, useMemo } from 'react';
import StatsTable from './StatsTable';
import WordStatsPanel from './WordStatsPanel';
import useVocabularyStore from '../store/vocabularyStore';
import { getBaseForm } from '../utils/french';

const SearchView = ({ 
  data,
  search, 
  setSearch,
  debouncedSearch,
  typeFilter,
  levelFilter,
  setTypeFilter,
  setLevelFilter,
  filteredData 
}) => {
  console.log('SearchView render');
  const vocabularyStore = useVocabularyStore();

  const renderHighlightedText = useCallback((text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    
    return parts.map((part, i) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <mark 
            key={i}
            className="bg-yellow-200 px-0.5 rounded cursor-pointer hover:bg-yellow-300"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  }, []);

  // Memoize filtered data stats
  const stats = useMemo(() => ({
    total: data.length,
    filtered: filteredData.length,
  }), [data.length, filteredData.length]);

  return (
    <div className="space-y-6">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search in French..."
        className="search-input"
      />

      {debouncedSearch && (
        <div className="space-y-6">
          {/* Word Stats Panel */}
          <WordStatsPanel searchTerm={debouncedSearch} />

          {/* Stats Table */}
          <div className="mb-8">
            <StatsTable
              data={filteredData}
              onCellClick={(type, level) => {
                setTypeFilter(typeFilter === type && levelFilter === level ? null : type);
                setLevelFilter(levelFilter === level && typeFilter === type ? null : level);
              }}
              activeType={typeFilter}
              activeLevel={levelFilter}
            />
            <div className="text-lg text-gray-600">
              Showing {stats.filtered} of {stats.total} questions
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(typeFilter || levelFilter) && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-gray-600">Active filters:</span>
          {typeFilter && (
            <span 
              className="badge badge-type cursor-pointer"
              onClick={() => setTypeFilter(null)}
            >
              {typeFilter} ×
            </span>
          )}
          {levelFilter && (
            <span 
              className="badge badge-level cursor-pointer"
              onClick={() => setLevelFilter(null)}
            >
              Level {levelFilter} ×
            </span>
          )}
        </div>
      )}

      {/* Results */}
      <div className="space-y-6">
        {filteredData.map(item => (
          <div key={item.id} className="question-card">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge badge-type">{item.type}</span>
              {item.level && (
                <span className="badge badge-level">Level {item.level}</span>
              )}
              {item.testNum && (
                <span className="badge badge-test">Test {item.testNum}</span>
              )}
              {item.questionNum && (
                <span className="badge badge-test">Question {item.questionNum}</span>
              )}
            </div>
            
            <div className="mt-4 text-lg leading-relaxed">
              <div className="text-gray-800 whitespace-pre-wrap">
                {debouncedSearch ? 
                  renderHighlightedText(item.content, debouncedSearch) : 
                  item.content}
              </div>
              {item.choices && (
                <div className="mt-4 text-gray-700 whitespace-pre-wrap border-t pt-4">
                  {debouncedSearch ? 
                    renderHighlightedText(item.choices, debouncedSearch) : 
                    item.choices}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(SearchView);