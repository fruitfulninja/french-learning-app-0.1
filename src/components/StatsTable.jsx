import React from 'react';

const StatsTable = ({ data, onCellClick, activeType, activeLevel }) => {
  const types = ['CE', 'CO', 'EE', 'EO'];
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  
  const matrix = {};
  const rowTotals = {};
  const colTotals = {};
  let total = 0;

  types.forEach(type => {
    matrix[type] = {};
    levels.forEach(level => {
      matrix[type][level] = 0;
    });
    rowTotals[type] = 0;
  });
  levels.forEach(level => colTotals[level] = 0);

  data.forEach(item => {
    if (matrix[item.type] && matrix[item.type][item.level] !== undefined) {
      matrix[item.type][item.level]++;
      rowTotals[type]++;
      colTotals[item.level]++;
      total++;
    }
  });

  if (total === 0) return null;

  return (
    <div className="overflow-x-auto mb-6">
      <table className="stats-table">
        <thead>
          <tr>
            <th>Type/Level</th>
            {levels.map(level => (
              <th key={level}>{level}</th>
            ))}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {types.map(type => (
            <tr key={type}>
              <th>{type}</th>
              {levels.map(level => (
                <td
                  key={`${type}-${level}`}
                  onClick={() => onCellClick(type, level)}
                  className={`cursor-pointer ${
                    activeType === type && activeLevel === level 
                      ? 'bg-blue-100'
                      : matrix[type][level] > 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  {matrix[type][level]}
                </td>
              ))}
              <td className="font-medium">
                {rowTotals[type]}
              </td>
            </tr>
          ))}
          <tr>
            <th>Total</th>
            {levels.map(level => (
              <td key={level} className="font-medium">
                {colTotals[level]}
              </td>
            ))}
            <td className="font-medium bg-gray-50">
              {total}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;
