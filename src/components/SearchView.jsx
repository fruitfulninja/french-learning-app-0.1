import React, { useCallback, useMemo, useState } from 'react';
import StatsTable from './StatsTable';
import useVocabularyStore from '../store/vocabularyStore';
import { getBaseForm, getWordInfo } from '../utils/french';

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
  const [hoveredWord, setHoveredWord] = useState(null);

  const handleStarWord = useCallback((word, event) => {
    event.stopPropagation();
    console.log('Starring word:', word);
    const baseForm = getBaseForm(word);
    const currentStars = vocabularyStore.getVocabulary()[baseForm]?.stars || 0;
    vocabularyStore.setStars(baseForm, (currentStars % 5) + 1);
  }, [vocabularyStore]);

  const renderStars = useCallback((word) => {
    const baseForm = getBaseForm(word);
    const stars = vocabularyStore.getVocabulary()[baseForm]?.stars || 0;
    return (
      <div className="inline-flex ml-1 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={(e) => handleStarWord(word, e)}
            className={`w-4 h-4 ${
              star <= stars ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-500 transition-colors`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }, [vocabularyStore, handleStarWord]);

  // Word info tooltip content
  const getWordTooltip = useCallback((word) => {
    const info = getWordInfo(word);
    if (!info) return '';

    const baseForm = getBaseForm(word);
    const stars = vocabularyStore.getVocabulary()[baseForm]?.stars || 0;
    
    let tooltip = `Type: ${info.type}\n`;
    if (info.gender) tooltip += `Gender: ${info.gender}\n`;
    if (info.baseForm) tooltip += `Base form: ${info.baseForm}\n`;
    if (info.isIrregular !== undefined) tooltip += `Irregular: ${info.isIrregular}\n`;
    tooltip += `Confidence: ${stars}/5`;

    return tooltip;
  }, [vocabularyStore]);

  const renderHighlightedText = useCallback((text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    
    return parts.map((part, i) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        const tooltip = getWordTooltip(part);
        return (
          <span key={i} className="relative inline-block group">
            <mark 
              className="bg-yellow-200 px-0.5 rounded cursor-pointer hover:bg-yellow-300"
              onMouseEnter={() => setHoveredWord(part)}
              onMouseLeave={() => setHoveredWord(null)}
            >
              {part}
              {renderStars(part)}
            </mark>
            {hoveredWord === part && (
              <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-pre-wrap z-50">
                {tooltip}
              </div>
            )}
          </span>
        );
      }
      return part;
    });
  }, [renderStars, getWordTooltip, hoveredWord]);

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