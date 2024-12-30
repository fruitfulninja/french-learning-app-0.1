import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import SearchView from './components/SearchView';
import { fixEncoding, normalizeText, getWordVariations } from './utils/french.jsx';

// Tab configuration - makes it easy to add new features
const TABS = {
  search: {
    id: 'search',
    label: 'Search Questions',
    component: SearchView
  }
};

const App = () => {
  // Data states
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [levelFilter, setLevelFilter] = useState(null);
  
  // Navigation state
  const [activeTab, setActiveTab] = useState('search');

  // Search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  // Filter data when search or filters change
  // In your useEffect for filtering data, update this part:
  useEffect(() => {
    let filtered = [...data];  // Make a copy of the data array

    if (debouncedSearch) {
      const searchTerms = debouncedSearch.toLowerCase().split(/\s+/).filter(Boolean);
      filtered = filtered.filter(item => {
        const content = (item.content + ' ' + (item.choices || '')).toLowerCase();
        return searchTerms.every(term => content.includes(term));
      });
    }

    if (typeFilter) {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    if (levelFilter) {
      filtered = filtered.filter(item => item.level === levelFilter);
    }

    setFilteredData(filtered);
  }, [debouncedSearch, typeFilter, levelFilter, data]);

  // Add this right after your filtering useEffect
  useEffect(() => {
    console.log('-------DEBUG INFO-------');
    console.log('Search term:', debouncedSearch);
    console.log('Data array length:', data.length);
    console.log('Filtered data length:', filteredData.length);
    if (filteredData.length === 0 && data.length > 0) {
      // Check the first item's content
      console.log('Sample data item:', {
        content: data[0]?.content,
        choices: data[0]?.choices,
        lowercased: (data[0]?.content + ' ' + (data[0]?.choices || '')).toLowerCase()
      });
      console.log('Search terms:', debouncedSearch.toLowerCase().split(/\s+/).filter(Boolean));
    }
    console.log('----------------------');
  }, [debouncedSearch, data, filteredData]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/Question Bank.xlsx');
      if (!response.ok) throw new Error('Failed to fetch Excel file');
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      
      const allData = [];

      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row?.length) continue;

          const item = {
            id: `${sheetName}-${i}`,
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
        }
      });

      setData(allData);
      setFilteredData(allData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data: ' + err.message);
      setLoading(false);
    }
  };

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

  // Get current tab component
  const CurrentTab = TABS[activeTab]?.component;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">French Learning Assistant</h1>
      
      {/* Tab Navigation */}
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

      {/* Tab Content */}
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
        />
      )}
    </div>
  );
};

export default App;
