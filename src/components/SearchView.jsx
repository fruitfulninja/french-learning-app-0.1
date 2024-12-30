import React from 'react';
import StatsTable from './StatsTable';
import { highlightText } from '../utils/french';
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
  const { vocabulary, setStars } = useVocabularyStore();

  const handleStarWord = (word) => {
    const baseForm = getBaseForm(word);
    const currentStars = vocabulary[baseForm]?.stars || 0;
    setStars(baseForm, (currentStars % 5) + 1);
  };

  return (
    <>
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
            Showing {filteredData.length} of {data.length} questions
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
                  highlightText(item.content, debouncedSearch).map((part, i) => 
                    React.isValidElement(part) ? 
                      React.cloneElement(part, {
                        onClick: () => handleStarWord(part.props.children),
                        className: part.props.className + ' cursor-pointer hover:text-blue-600'
                      }) : 
                      part
                  ) : 
                  item.content}
              </div>
              {item.choices && (
                <div className="mt-4 text-gray-700 whitespace-pre-wrap border-t pt-4">
                  {debouncedSearch ? highlightText(item.choices, debouncedSearch) : item.choices}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default SearchView;
