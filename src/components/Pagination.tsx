import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { getText } from '../utils/translations';

export const Pagination: React.FC = () => {
  const { 
    records, 
    currentPage, 
    setCurrentPage, 
    pageSize, 
    setPageSize,
    languageMode 
  } = useVehicles();

  const total = records.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 pb-2 px-1 text-xs text-slate-500 font-medium">
      {/* Left side matching Image 1: "Showing 1 - 9 of 40 cars" */}
      <div className="flex items-center gap-2">
        <span>
          {languageMode === 'my' 
            ? `${total} ခု အနက် ${startIndex} - ${endIndex} ကို ပြသထားသည်`
            : `${getText('showingRecords', languageMode)} ${startIndex} - ${endIndex} ${getText('ofCars', languageMode)} ${total} cars`}
        </span>

        {/* Page size selector */}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="ml-2 bg-white border border-slate-200 text-slate-700 text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* Right side matching Image 1: < Previous and Next > */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          disabled={!canGoPrev}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
            canGoPrev
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
              : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{getText('previous', languageMode)}</span>
        </button>

        <span className="px-2 text-slate-600 font-semibold">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          disabled={!canGoNext}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
            canGoNext
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
              : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
          }`}
        >
          <span>{getText('next', languageMode)}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
