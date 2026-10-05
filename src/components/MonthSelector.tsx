import React, { useState, useMemo } from 'react';
import { useVehicles } from '../context/VehicleContext';
import { MONTHS } from '../data/initialData';
import { MonthKey } from '../types';
import { Calendar, Archive, Plus, Check, X, Filter } from 'lucide-react';
import { getText } from '../utils/translations';

export const MonthSelector: React.FC = () => {
  const { 
    activeMonth, 
    setActiveMonth, 
    selectedYear, 
    setSelectedYear, 
    availableYears,
    yearCounts,
    addCustomYear,
    monthlyCounts, 
    languageMode,
    allRecords,
    archiveCount
  } = useVehicles();

  const [showAddYearInput, setShowAddYearInput] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');
  const [showOnlyActiveMonths, setShowOnlyActiveMonths] = useState(false);

  // Dynamic count of records matching the current active year filter
  const currentFilteredRecordsCount = useMemo(() => {
    if (selectedYear === 'all') return allRecords.length;
    return allRecords.filter(r => (r.expireYear || r.year) === selectedYear).length;
  }, [allRecords, selectedYear]);

  // Handle adding custom year
  const handleAddYearSubmit = () => {
    const yr = parseInt(newYearInput.trim(), 10);
    if (!isNaN(yr) && yr >= 2000 && yr <= 2100) {
      addCustomYear(yr);
      setNewYearInput('');
      setShowAddYearInput(false);
    }
  };

  // Dynamically filter months if showOnlyActiveMonths is toggled
  const displayedMonths = useMemo(() => {
    if (!showOnlyActiveMonths) return MONTHS;
    const activeList = MONTHS.filter(m => (monthlyCounts[m.key] || 0) > 0);
    return activeList.length > 0 ? activeList : MONTHS;
  }, [showOnlyActiveMonths, monthlyCounts]);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 shadow-xs p-3 sm:p-4 mb-4">
      {/* Month & Year Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>{languageMode === 'my' ? 'လအလိုက် ရွေးချယ်မှု' : 'Monthly View'}</span>
              <span className="text-slate-400 font-normal">/</span>
              <span className="text-blue-600 font-bold">
                {selectedYear === 'all' 
                  ? `All Expire Years (${allRecords.length})` 
                  : `Expire Year: ${selectedYear} (${currentFilteredRecordsCount} vehicles)`}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              {languageMode === 'my' 
                ? 'သက်တမ်းကုန်ဆုံးမည့်နှစ် (Expire Year) အလိုက် ယာဉ်မှတ်တမ်းများကို တိုက်ရိုက်စီမံနိုင်ပါသည်'
                : 'Vehicle fleet records dynamically synchronized by their insurance expire year.'}
            </p>
          </div>
        </div>

        {/* Dynamic Expire Year Selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
            {languageMode === 'my' ? 'သက်တမ်းကုန်နှစ်:' : 'Expire Year:'}
          </span>
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold overflow-x-auto max-w-full">
            {/* All Years Tab */}
            <button
              onClick={() => setSelectedYear('all')}
              className={`min-h-[30px] px-2.5 py-1 rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedYear === 'all'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>All Years</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedYear === 'all' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {allRecords.length}
              </span>
            </button>

            {/* Dynamic Existing Years from Records */}
            {availableYears.map((year) => {
              const count = yearCounts[year] || 0;
              const isSelected = selectedYear === year;

              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`min-h-[30px] px-2.5 py-1 rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected 
                      ? 'bg-white text-blue-600 shadow-xs font-bold border border-slate-200/80' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{year}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected 
                      ? 'bg-blue-100 text-blue-700' 
                      : count > 0 
                        ? 'bg-slate-200 text-slate-700' 
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Add Custom Year Dynamically */}
            {showAddYearInput ? (
              <div className="flex items-center gap-1 px-1.5 py-0.5">
                <input
                  type="number"
                  placeholder="YYYY"
                  autoFocus
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddYearSubmit();
                    if (e.key === 'Escape') setShowAddYearInput(false);
                  }}
                  className="w-16 px-1.5 py-0.5 text-xs border border-blue-400 rounded bg-white font-mono text-center focus:outline-none"
                />
                <button
                  onClick={handleAddYearSubmit}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                  title="Add Year"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowAddYearInput(false)}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddYearInput(true)}
                className="min-h-[30px] px-2 py-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50/60 rounded-md transition-colors text-xs font-semibold flex items-center gap-1 ml-0.5"
                title="Add any expire year dynamically"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Year</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Jan to Dec Horizontal Tabs + Archive */}
      <div className="pt-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200 -mx-1 px-1 touch-pan-x">
          {/* All Months button */}
          <button
            onClick={() => setActiveMonth('all')}
            className={`min-h-[38px] flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeMonth === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span>{getText('allMonths', languageMode)}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeMonth === 'all' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {currentFilteredRecordsCount}
            </span>
          </button>

          <div className="h-5 w-px bg-slate-200 shrink-0 mx-0.5" />

          {/* Dynamic Months Tabs */}
          {displayedMonths.map((month) => {
            const count = monthlyCounts[month.key] || 0;
            const isActive = activeMonth === month.key;

            return (
              <button
                key={month.key}
                onClick={() => setActiveMonth(month.key)}
                className={`min-h-[38px] flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/20'
                    : count > 0 
                      ? 'bg-blue-50/40 text-blue-900 hover:bg-blue-50 border border-blue-200/80 hover:border-blue-300'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span>
                  {languageMode === 'my' 
                    ? month.shortMy 
                    : languageMode === 'dual' 
                      ? `${month.key} (${month.shortMy})`
                      : month.key}
                </span>

                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : count > 0
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <div className="h-5 w-px bg-slate-200 shrink-0 mx-0.5" />

          {/* Quick Filter: Show only active months toggle */}
          <button
            onClick={() => setShowOnlyActiveMonths(!showOnlyActiveMonths)}
            title={showOnlyActiveMonths ? 'Showing active months only. Click to show all 12 months' : 'Click to show only months with recorded vehicles'}
            className={`min-h-[38px] flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 border ${
              showOnlyActiveMonths
                ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs font-bold'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {showOnlyActiveMonths ? 'Active Months' : 'Filter Active'}
            </span>
          </button>

          {/* ARCHIVE TAB (1-Week retention for Deleted & Unfinished) */}
          <button
            onClick={() => setActiveMonth('archive')}
            title="Archive: Deleted records & unfinished drafts kept for 1 week"
            className={`min-h-[38px] flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 border ${
              activeMonth === 'archive'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-indigo-50/60 text-indigo-700 border-indigo-200 hover:bg-indigo-100/70'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>
              {languageMode === 'my' ? 'မော်ကွန်း (Archive)' : 'Archive & Drafts'}
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeMonth === 'archive' 
                ? 'bg-white/25 text-white' 
                : 'bg-indigo-200/80 text-indigo-800'
            }`}>
              {archiveCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
