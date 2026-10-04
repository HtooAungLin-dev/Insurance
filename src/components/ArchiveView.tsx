import React, { useState } from 'react';
import { 
  Archive, 
  Trash2, 
  RotateCcw, 
  Clock, 
  AlertCircle, 
  FileEdit, 
  Search, 
  CheckCircle,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { ArchiveItem, ArchiveType, VehicleRecord } from '../types';

interface ArchiveViewProps {
  onEditDraft: (record: VehicleRecord) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ onEditDraft }) => {
  const { 
    archiveItems, 
    restoreArchivedItem, 
    permanentlyDeleteArchived, 
    clearAllArchive,
    languageMode 
  } = useVehicles();

  const [filterType, setFilterType] = useState<'all' | ArchiveType>('all');
  const [searchArchive, setSearchArchive] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [restoredToast, setRestoredToast] = useState<string | null>(null);

  // Time remaining helper
  const getTimeRemainingText = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Expiring now';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 1) {
      return `${days} days left`;
    }
    if (days === 1) {
      return `1 day ${hours % 24} hrs left`;
    }
    return `${hours} hrs left`;
  };

  const getUrgencyClass = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days > 3) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (days > 1) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
  };

  const handleRestore = (item: ArchiveItem) => {
    restoreArchivedItem(item.id);
    setRestoredToast(`Restored "${item.record.vehicleNo}" to ${item.record.month}!`);
    setTimeout(() => setRestoredToast(null), 3000);
  };

  // Filtered archive items
  const filtered = archiveItems.filter(item => {
    if (filterType !== 'all' && item.archiveType !== filterType) return false;
    if (searchArchive.trim()) {
      const q = searchArchive.toLowerCase();
      return (
        item.record.vehicleNo.toLowerCase().includes(q) ||
        item.record.ownerName.toLowerCase().includes(q) ||
        (item.reason && item.reason.toLowerCase().includes(q)) ||
        item.record.month.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const deletedCount = archiveItems.filter(i => i.archiveType === 'deleted').length;
  const draftCount = archiveItems.filter(i => i.archiveType === 'unfinished').length;

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Restored notification banner */}
      {restoredToast && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-md text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-200" />
            <span>{restoredToast}</span>
          </div>
          <button onClick={() => setRestoredToast(null)} className="text-emerald-200 hover:text-white">✕</button>
        </div>
      )}

      {/* Archive Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">
                  {languageMode === 'my' 
                    ? 'မော်ကွန်းတိုက်နှင့် မူကြမ်းများ (၁ ပတ် သိမ်းဆည်းမှု)' 
                    : 'Archive & Unfinished Drafts'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  1-Week Retention
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {languageMode === 'my'
                  ? 'ဖျက်လိုက်သော အချက်အလက်များနှင့် မပြီးပြတ်သေးသော မူကြမ်းများကို ဤနေရာတွင် ၇ ရက်ကြာ အလိုအလျောက် ထိန်းသိမ်းထားပါသည်။ အချိန်မရွေး ပြန်လည်ရယူနိုင်ပါသည်'
                  : 'Deleted data and unfinished records are preserved here for 7 days before permanent purge. Restore or resume editing anytime.'}
              </p>
            </div>
          </div>

          {archiveItems.length > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {confirmClearAll ? (
                <div className="flex items-center gap-1.5 bg-rose-50 p-1 rounded-lg border border-rose-200">
                  <span className="text-[11px] text-rose-700 font-semibold px-1">Purge all?</span>
                  <button
                    onClick={() => {
                      clearAllArchive();
                      setConfirmClearAll(false);
                    }}
                    className="px-2.5 py-1 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmClearAll(false)}
                    className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClearAll(true)}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Empty Archive</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filter controls row */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items ({archiveItems.length})
            </button>
            <button
              onClick={() => setFilterType('deleted')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === 'deleted'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Deleted Records</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-bold">
                {deletedCount}
              </span>
            </button>
            <button
              onClick={() => setFilterType('unfinished')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === 'unfinished'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Unfinished Drafts</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded-full font-bold">
                {draftCount}
              </span>
            </button>
          </div>

          {/* Search box inside archive */}
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              value={searchArchive}
              onChange={(e) => setSearchArchive(e.target.value)}
              placeholder="Search in archive..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>
        </div>
      </div>

      {/* Archived List / Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
          <Archive className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
          <h3 className="text-sm font-bold text-slate-700">Archive is currently empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {languageMode === 'my'
              ? 'ဖျက်လိုက်သော ဒေတာများနှင့် သိမ်းဆည်းထားသော မူကြမ်းများသည် ဤနေရာတွင် ၁ ပတ်ကြာ ပေါ်နေမည်ဖြစ်ပါသည်'
              : 'Deleted vehicle entries and unfinished drafts will automatically show here with a 7-day countdown.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((item) => {
            const isDraft = item.archiveType === 'unfinished';
            const urgencyClass = getUrgencyClass(item.expiresAt);
            const remaining = getTimeRemainingText(item.expiresAt);

            return (
              <div 
                key={item.id}
                className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                      isDraft 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {isDraft ? 'Unfinished Draft' : 'Deleted Record'}
                    </span>

                    {/* Expiry countdown */}
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${urgencyClass}`}>
                      <Clock className="w-3 h-3" />
                      <span>{remaining}</span>
                    </div>
                  </div>

                  {/* Vehicle details */}
                  <div className="mb-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {item.record.vehicleNo}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {item.record.ownerName}
                    </p>
                  </div>

                  {/* Meta details */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 my-2 border-y border-slate-100 bg-slate-50/50 rounded-lg px-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Original Month</span>
                      <span className="font-semibold text-slate-700">{item.record.month} {item.record.year}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Premium / Amount</span>
                      <span className="font-semibold text-emerald-700">${item.record.premiumAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  {item.reason && (
                    <p className="text-[11px] text-slate-400 italic mb-3">
                      Note: {item.reason}
                    </p>
                  )}
                </div>

                {/* Bottom Actions with $\ge 44\text{px}$ touch targets */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => permanentlyDeleteArchived(item.id)}
                    className="min-h-[40px] px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
                    title="Permanently remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Forever</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isDraft && (
                      <button
                        onClick={() => onEditDraft(item.record)}
                        className="min-h-[40px] px-3.5 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleRestore(item)}
                      className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore to {item.record.month}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
