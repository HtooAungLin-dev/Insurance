import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  recordId,
}) => {
  const { allRecords, deleteRecord, languageMode } = useVehicles();

  if (!isOpen || !recordId) return null;

  const target = allRecords.find((r) => r.id === recordId);

  const handleConfirm = () => {
    deleteRecord(recordId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {languageMode === 'my' ? 'ယာဉ်မှတ်တမ်း ဖျက်ရန် သေချာပါသလား?' : 'Delete Vehicle Record?'}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {target ? (
              <span>
                Are you sure you want to delete <strong className="text-slate-800">{target.vehicleNo}</strong> ({target.ownerName}) from {target.month}? You can undo this action immediately after deleting.
              </span>
            ) : (
              'Are you sure you want to delete this record?'
            )}
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
