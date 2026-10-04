import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  RotateCcw,
  SlidersHorizontal,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { getText } from '../utils/translations';
import { RecordStatus } from '../types';

interface ControlBarProps {
  onOpenAddModal: () => void;
  onOpenFilterDrawer: () => void;
  onOpenExportModal: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  onOpenAddModal,
  onOpenFilterDrawer,
  onOpenExportModal,
}) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedIds, 
    batchDeleteRecords, 
    batchUpdateStatus, 
    clearSelection,
    canUndo,
    undoDelete,
    languageMode,
    filters,
    resetFilters
  } = useVehicles();

  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);

  const hasActiveFilters = filters.status !== 'all' || 
    filters.hasClaim !== 'all' || 
    filters.minAmount !== undefined || 
    filters.maxAmount !== undefined;

  const handleBulkStatusChange = (status: RecordStatus) => {
    batchUpdateStatus(selectedIds, status);
  };

  const handleBatchDelete = () => {
    batchDeleteRecords(selectedIds);
    setConfirmBatchDelete(false);
  };

  return (
    <div className="space-y-3 mb-4">
      {/* Top Title Row: "Rentals" matching Image 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {languageMode === 'my' 
              ? 'ယာဉ်ငှားရမ်းမှုနှင့် အာမခံမှတ်တမ်း (Rentals)' 
              : languageMode === 'dual'
                ? 'Rentals · ယာဉ်မှတ်တမ်း'
                : 'Rentals'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {getText('pageSubtitle', languageMode)}
          </p>
        </div>

        {/* Undo notification banner if available */}
        {canUndo && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs animate-in fade-in">
            <span>Item deleted</span>
            <button
              onClick={undoDelete}
              className="font-semibold underline hover:text-amber-950 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </button>
          </div>
        )}
      </div>

      {/* Control Actions Row matching Image 1 */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input: "Search rented car, contacts" */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getText('searchPlaceholder', languageMode)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Buttons group matching Image 1: Filter, Exports, + Add Reservation */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto">
          {/* Filter button */}
          <button
            onClick={onOpenFilterDrawer}
            className={`min-h-[42px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border flex items-center justify-center gap-2 transition-all shadow-2xs flex-1 sm:flex-none ${
              hasActiveFilters 
                ? 'border-blue-300 bg-blue-50/70 text-blue-700 font-semibold' 
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Filter className="w-4 h-4 text-slate-500" />
            <span>{getText('filter', languageMode)}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            )}
          </button>

          {/* Exports button */}
          <button
            onClick={onOpenExportModal}
            className="min-h-[42px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border border-blue-200/80 bg-blue-50/50 hover:bg-blue-100/60 text-blue-600 flex items-center justify-center gap-2 transition-all shadow-2xs flex-1 sm:flex-none"
          >
            <Download className="w-4 h-4" />
            <span>{getText('exports', languageMode)}</span>
          </button>

          {/* + Add Reservation button (Image 1 bright blue CTA) */}
          <button
            onClick={onOpenAddModal}
            className="min-h-[42px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-all focus:ring-2 focus:ring-blue-500/30 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{getText('addReservation', languageMode)}</span>
          </button>
        </div>
      </div>

      {/* Selected Items Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-1 shadow-md">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded-md text-[11px]">
              {selectedIds.length}
            </span>
            <span>
              {languageMode === 'my' 
                ? 'ရွေးချယ်ထားသော စာရင်းများ' 
                : `${selectedIds.length} item(s) selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick status change */}
            <button
              onClick={() => handleBulkStatusChange('Rental')}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 rounded-md transition-colors"
            >
              Mark Rental
            </button>
            <button
              onClick={() => handleBulkStatusChange('Done')}
              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-md transition-colors"
            >
              Mark Done
            </button>

            {/* Batch delete */}
            {confirmBatchDelete ? (
              <div className="flex items-center gap-1.5 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-500/50">
                <span className="text-rose-200 text-[11px]">Confirm?</span>
                <button
                  onClick={handleBatchDelete}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmBatchDelete(false)}
                  className="px-1.5 py-0.5 text-slate-300 hover:text-white text-[11px]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmBatchDelete(true)}
                className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-400/30 rounded-md flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}

            <button
              onClick={clearSelection}
              className="px-2.5 py-1 text-slate-400 hover:text-slate-200"
            >
              Deselect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
