import React, { useState, useMemo } from 'react';
import { useVehicles } from '../context/VehicleContext';
import { MONTHS } from '../data/initialData';
import { MonthKey } from '../types';
import { Calendar, Archive, Plus, Check, X, Filter, ChevronDown } from 'lucide-react';
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
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

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

        {/* Dynamic Expire Year Dropdown Selector */}
        <div className="relative self-start sm:self-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
              {languageMode === 'my' ? 'သက်တမ်းကုန်နှစ်:' : 'Expire Year:'}
            </span>

            {/* Dropdown Toggle Button */}
            <button
              type="button"
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              className="min-h-[36px] px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <span className="text-blue-600 font-bold">
                {selectedYear === 'all' ? 'All Expire Years' : `Expire Year: ${selectedYear}`}
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                {selectedYear === 'all' ? allRecords.length : (yearCounts[selectedYear] || 0)}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Dropdown Menu Modal / Overlay */}
          {isYearDropdownOpen && (
            <>
              {/* Click outside backdrop */}
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => {
                  setIsYearDropdownOpen(false);
                  setShowAddYearInput(false);
                }} 
              />
              
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  {languageMode === 'my' ? 'သက်တမ်းကုန်နှစ် ရွေးချယ်ပါ' : 'Select Expire Year'}
                </div>

                {/* Option: All Years */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedYear('all');
                    setIsYearDropdownOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selectedYear === 'all' 
                      ? 'bg-blue-50 text-blue-700 font-bold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {selectedYear === 'all' ? (
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    ) : (
                      <span className="w-3.5 shrink-0" />
                    )}
                    <span>All Expire Years</span>
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    selectedYear === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {allRecords.length}
                  </span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                {/* Dynamic List of Available Years */}
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                  {availableYears.map((year) => {
                    const count = yearCounts[year] || 0;
                    const isSelected = selectedYear === year;

                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          setSelectedYear(year);
                          setIsYearDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-50 text-blue-700 font-bold' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          ) : (
                            <span className="w-3.5 shrink-0" />
                          )}
                          <span>Year {year}</span>
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isSelected 
                            ? 'bg-blue-100 text-blue-700' 
                            : count > 0 
                              ? 'bg-slate-200 text-slate-700' 
                              : 'bg-slate-100 text-slate-400'
                        }`}>
                          {count} {count === 1 ? 'car' : 'cars'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="my-1 border-t border-slate-100" />

                {/* Inline Add Custom Year inside Dropdown */}
                <div className="p-2 bg-slate-50/70">
                  {showAddYearInput ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="YYYY"
                        autoFocus
                        value={newYearInput}
                        onChange={(e) => setNewYearInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddYearSubmit();
                            setIsYearDropdownOpen(false);
                          }
                          if (e.key === 'Escape') setShowAddYearInput(false);
                        }}
                        className="w-full px-2 py-1 text-xs border border-blue-400 rounded-lg bg-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          handleAddYearSubmit();
                          setIsYearDropdownOpen(false);
                        }}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddYearInput(false)}
                        className="p-1 text-slate-400 hover:bg-slate-200 rounded-lg shrink-0 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddYearInput(true)}
                      className="w-full px-2.5 py-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 border border-dashed border-slate-300 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      <span>{languageMode === 'my' ? '+ အခြားနှစ်ထည့်ရန်' : '+ Add Custom Year'}</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
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
