import React from 'react';
import { X, RotateCcw, Filter, Check } from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { MONTHS } from '../data/initialData';
import { MonthKey, RecordStatus } from '../types';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose }) => {
  const { filters, setFilters, resetFilters, languageMode } = useVehicles();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl border-l border-slate-100 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                {languageMode === 'my' ? 'စစ်ထုတ်မှုများ' : 'Filter Records'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5 flex-1 overflow-y-auto">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Status / အခြေအနေ
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['all', 'Rental', 'Done', 'Reserved', 'Active', 'Claimed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilters(prev => ({ ...prev, status: st }))}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left flex items-center justify-between transition-all ${
                      filters.status === st
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{st === 'all' ? 'All Statuses' : st}</span>
                    {filters.status === st && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Insurance Company Filter (Young, GGI, FNI, KBZ, MI) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Insurance Co. / အာမခံကုမ္ပဏီ
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['all', 'Young', 'GGI', 'FNI', 'KBZ', 'MI'].map((co) => (
                  <button
                    key={co}
                    onClick={() => setFilters(prev => ({ ...prev, insuranceCompany: co }))}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left flex items-center justify-between transition-all ${
                      (filters.insuranceCompany || 'all') === co
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{co === 'all' ? 'All Companies' : co}</span>
                    {(filters.insuranceCompany || 'all') === co && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Claims Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Claim Filed / လျော်ကြေးရှိ/မရှိ
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['all', 'yes', 'no'] as const).map((claimOpt) => (
                  <button
                    key={claimOpt}
                    onClick={() => setFilters(prev => ({ ...prev, hasClaim: claimOpt }))}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      filters.hasClaim === claimOpt
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {claimOpt === 'all' ? 'All' : claimOpt === 'yes' ? 'Has Claim' : 'No Claim'}
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Amount Range */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Premium Range / အာမခံကြေး (MMK)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Min (MMK)</span>
                  <input
                    type="number"
                    placeholder="Min 0"
                    value={filters.minAmount ?? ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      minAmount: e.target.value === '' ? undefined : Number(e.target.value) 
                    }))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Max (MMK)</span>
                  <input
                    type="number"
                    placeholder="Max 5000000"
                    value={filters.maxAmount ?? ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      maxAmount: e.target.value === '' ? undefined : Number(e.target.value) 
                    }))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                resetFilters();
              }}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Apply & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
