import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import SearchView from './components/SearchView';
import VocabularyView from './components/VocabularyView';
import useVocabularyStore from './store/vocabularyStore';
import { fixEncoding, normalizeText } from './utils/french';
import { performSearch } from './utils/search';

const TABS = {
  search: {
    id: 'search',
    label: 'Search Questions',
    component: SearchView
  },
  vocabulary: {
    id: 'vocabulary',
    label: 'Vocabulary List',
    component: VocabularyView
  }
};

const DEBOUNCE_DELAY = 300;

const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [levelFilter, setLevelFilter] = useState(null);
  const [activeTab, setActiveTab] = useState('search');

  // Memoize search options
  const fuseOptions = useMemo(() => ({
    keys: ['content', 'choices', 'normalizedContent'],
    threshold: 0.2,
    distance: 100,
    minMatchCharLength: 3,
    includeScore: true,
    ignoreLocation: true,
  }), []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Updating debounced search:', search);
      setDebouncedSearch(search);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [search]);

  // Load data
  const loadData = useCallback(async () => {
    try {
      console.log('Loading data...');
      setLoading(true);
      
      const response = await fetch('/Question Bank.xlsx');
      if (!response.ok) throw new Error('Failed to fetch Excel file');
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      const allData = [];

      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        rows.slice(1).forEach((row, index) => {
          if (!row?.length) return;

          const item = {
            id: `${sheetName}-${index + 1}`,
            type: sheetName,
          };

          switch (sheetName) {
            case 'CE':
              item.content = fixEncoding(String(row[2] || ''));
              item.choices = fixEncoding(String(row[3] || ''));
              item.level = String(row[4] || 'B1');
              item.testNum = String(row[0] || '').split('_')[1]?.replace('.docx', '') || '';
              item.questionNum = String(row[1] || '');
              break;
            case 'CO':
              item.content = fixEncoding(String(row[7] || ''));
              item.level = String(row[5] || 'B1');
              item.testNum = String(row[1] || '');
              item.questionNum = String(row[3] || '');
              break;
            case 'EE':
              item.content = fixEncoding(String(row[6] || ''));
              item.level = 'B2';
              item.testNum = `${row[1] || ''}-${row[2] || ''}`;
              item.questionNum = String(row[5] || '');
              break;
            case 'EO':
              item.content = fixEncoding(String(row[5] || ''));
              item.level = 'B2';
              item.testNum = String(row[1] || '');
              item.questionNum = String(row[2] || '');
              break;
          }

          if (item.content) {
            item.normalizedContent = normalizeText(item.content + ' ' + (item.choices || ''));
            allData.push(item);
          }
        });
      });

      console.log(`Loaded ${allData.length} items`);
      setData(allData);
      setFilteredData(allData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data: ' + err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update filtered data when search or filters change
  useEffect(() => {
    console.log('Search parameters changed, updating filtered data');
    const filtered = performSearch(data, debouncedSearch, typeFilter, levelFilter, fuseOptions);
    setFilteredData(filtered);
  }, [data, debouncedSearch, typeFilter, levelFilter, fuseOptions]);

  const { indexWords } = useVocabularyStore();

  const handleSearch = useCallback((term) => {
    setSearch(term);
    setActiveTab('search');
  }, []);

  // Index words for vocabulary
  useEffect(() => {
    if (data.length > 0) {
      console.log('Indexing words from data');
      const allText = data.map(item => 
        `${item.content} ${item.choices || ''}`
      ).join(' ');
      indexWords(allText);
    }
  }, [data, indexWords]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-red-600">{error}</div>
      </div>
    );
  }

  const CurrentTab = TABS[activeTab]?.component;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">French Learning Assistant</h1>
      
      <div className="flex gap-4 mb-8">
        {Object.values(TABS).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {CurrentTab && (
        <CurrentTab
          data={data}
          search={search}
          setSearch={setSearch}
          debouncedSearch={debouncedSearch}
          typeFilter={typeFilter}
          levelFilter={levelFilter}
          setTypeFilter={setTypeFilter}
          setLevelFilter={setLevelFilter}
          filteredData={filteredData}
          onSearchWord={handleSearch}
        />
      )}
    </div>
  );
};

export default App;