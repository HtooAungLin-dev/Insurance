import React from 'react';
import { useVehicles } from '../context/VehicleContext';
import { MONTHS } from '../data/initialData';
import { MonthKey } from '../types';
import { Calendar, ChevronRight, BarChart2, ShieldCheck, DollarSign, Car, Archive } from 'lucide-react';
import { getText } from '../utils/translations';

export const MonthSelector: React.FC = () => {
  const { 
    activeMonth, 
    setActiveMonth, 
    selectedYear, 
    setSelectedYear, 
    monthlyCounts, 
    languageMode,
    allRecords,
    archiveCount
  } = useVehicles();

  const totalAllRecords = allRecords.length;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 shadow-xs p-3 sm:p-4 mb-4">
      {/* Month Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <span>{languageMode === 'my' ? 'လအလိုက် ရွေးချယ်မှု' : 'Monthly View'}</span>
              <span className="text-slate-400 font-normal">/</span>
              <span className="text-blue-600 font-bold">{selectedYear}</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              {languageMode === 'my' 
                ? 'ဇန်နဝါရီ မှ ဒီဇင်ဘာအထိ လအလိုက် အချိန်မရွေး ပြင်ဆင်၊ ဖြည့်စွက်၊ ဖျက်နိုင်ပါသည်'
                : 'Select any month from Jan to Dec. All modifications sync in real time.'}
            </p>
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">Year:</span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
            {[2026, 2025, 2024].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`min-h-[32px] px-2.5 py-1 rounded-md transition-all ${
                  selectedYear === year 
                    ? 'bg-white text-blue-600 shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {year}
              </button>
            ))}
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
              activeMonth === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {totalAllRecords}
            </span>
          </button>

          <div className="h-5 w-px bg-slate-200 shrink-0 mx-0.5" />

          {/* 12 Months Tabs: Jan to Dec */}
          {MONTHS.map((month) => {
            const count = monthlyCounts[month.key] || 0;
            const isActive = activeMonth === month.key;

            return (
              <button
                key={month.key}
                onClick={() => setActiveMonth(month.key)}
                className={`min-h-[38px] flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/20'
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
                        ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <div className="h-5 w-px bg-slate-200 shrink-0 mx-0.5" />

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

