import React, { useState, useEffect } from 'react';
import { X, Check, Calculator, Sparkles, Archive, FileEdit } from 'lucide-react';
import { VehicleRecord, MonthKey, RecordStatus, InsuranceCompany } from '../types';
import { MONTHS, INSURANCE_COMPANIES } from '../data/initialData';
import { useVehicles } from '../context/VehicleContext';
import { extractExpireYear } from '../utils/dateUtils';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit?: VehicleRecord | null;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
}) => {
  const { addRecord, updateRecord, saveDraftToArchive, activeMonth, selectedYear, languageMode } = useVehicles();

  const isEditing = Boolean(recordToEdit);

  // Form states
  const [month, setMonth] = useState<MonthKey>('Jan');
  const [expireYear, setExpireYear] = useState<number>(2027);
  const [insuranceCompany, setInsuranceCompany] = useState<InsuranceCompany>('Young');
  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [status, setStatus] = useState<RecordStatus>('Rental');
  const [carValue, setCarValue] = useState<number | ''>('');
  const [windshieldValue, setWindshieldValue] = useState<number | ''>('');
  const [premiumAmount, setPremiumAmount] = useState<number | ''>('');
  const [validityPeriod, setValidityPeriod] = useState('');
  const [pickupArea, setPickupArea] = useState('');
  const [claimDate, setClaimDate] = useState('');
  const [commissionDate, setCommissionDate] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [remarks, setRemarks] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftToast, setDraftToast] = useState(false);

  // Reset or populate fields when modal opens
  useEffect(() => {
    if (isOpen) {
      if (recordToEdit) {
        setMonth(recordToEdit.month);
        const initYear = recordToEdit.expireYear || recordToEdit.year || extractExpireYear(recordToEdit.validityPeriod, typeof selectedYear === 'number' ? selectedYear : 2027);
        setExpireYear(initYear);
        setInsuranceCompany(recordToEdit.insuranceCompany || 'Young');
        setVehicleNo(recordToEdit.vehicleNo || '');
        setVehicleModel(recordToEdit.vehicleModel || '');
        setOwnerName(recordToEdit.ownerName || '');
        setStatus(recordToEdit.status || 'Rental');
        setCarValue(recordToEdit.carValue ?? '');
        setWindshieldValue(recordToEdit.windshieldValue ?? '');
        setPremiumAmount(recordToEdit.premiumAmount ?? '');
        setValidityPeriod(recordToEdit.validityPeriod || '');
        setPickupArea(recordToEdit.pickupArea || '');
        setClaimDate(recordToEdit.claimDate || '');
        setCommissionDate(recordToEdit.commissionDate || '');
        setInvoiceNo(recordToEdit.invoiceNo || '');
        setRemarks(recordToEdit.remarks || '');
      } else {
        // Adding new
        const initialMonth = activeMonth === 'all' || activeMonth === 'archive' ? 'Jan' : activeMonth;
        setMonth(initialMonth);
        const initYear = typeof selectedYear === 'number' ? selectedYear : 2027;
        setExpireYear(initYear);
        setInsuranceCompany('Young');
        setVehicleNo('');
        setVehicleModel('');
        setOwnerName('');
        setStatus('Rental');
        setCarValue('');
        setWindshieldValue('');
        setPremiumAmount('');
        const today = new Date().toISOString().split('T')[0];
        setValidityPeriod(`${today} - 1 Year`);
        setPickupArea('');
        setClaimDate('');
        setCommissionDate('');
        setInvoiceNo(String(Math.floor(1000000000 + Math.random() * 9000000000)));
        setRemarks('');
      }
      setErrors({});
    }
  }, [isOpen, recordToEdit, activeMonth]);

  if (!isOpen) return null;

  // Save current progress to Archive as unfinished draft
  const handleSaveAsDraft = () => {
    saveDraftToArchive({
      id: recordToEdit?.id,
      month,
      year: expireYear,
      expireYear,
      insuranceCompany,
      vehicleNo: vehicleNo.trim() || 'Draft Vehicle',
      vehicleModel: vehicleModel.trim(),
      ownerName: ownerName.trim() || 'Pending Customer',
      status,
      carValue: typeof carValue === 'number' ? carValue : 0,
      windshieldValue: typeof windshieldValue === 'number' ? windshieldValue : 0,
      premiumAmount: typeof premiumAmount === 'number' ? premiumAmount : 0,
      validityPeriod: validityPeriod.trim(),
      pickupArea: pickupArea.trim(),
      claimDate: claimDate.trim(),
      commissionDate: commissionDate.trim(),
      invoiceNo: invoiceNo.trim() || 'DRAFT-' + Math.floor(1000 + Math.random() * 9000),
      remarks: remarks.trim() ? `${remarks} (Draft)` : 'Unfinished draft entry',
    }, 'Saved as draft / unfinished');

    setDraftToast(true);
    setTimeout(() => {
      setDraftToast(false);
      onClose();
    }, 1200);
  };

  // Auto-calculate helpers
  const handleAutoCalcWindshield = () => {
    if (typeof carValue === 'number' && carValue > 0) {
      setWindshieldValue(Math.round(carValue * 0.02));
    }
  };

  const handleAutoCalcPremium = () => {
    if (typeof carValue === 'number' && carValue > 0) {
      setPremiumAmount(Math.round(carValue * 0.018));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Stored in the expire year per user requirement
    const payload = {
      month,
      year: expireYear,
      expireYear,
      insuranceCompany,
      vehicleNo: vehicleNo.trim() || '—',
      vehicleModel: vehicleModel.trim(),
      ownerName: ownerName.trim() || '—',
      status,
      carValue: typeof carValue === 'number' ? carValue : 0,
      windshieldValue: typeof windshieldValue === 'number' ? windshieldValue : 0,
      premiumAmount: typeof premiumAmount === 'number' ? premiumAmount : 0,
      validityPeriod: validityPeriod.trim(),
      pickupArea: pickupArea.trim(),
      claimDate: claimDate.trim(),
      commissionDate: commissionDate.trim(),
      invoiceNo: invoiceNo.trim() || String(Math.floor(1000000000 + Math.random() * 9000000000)),
      remarks: remarks.trim(),
    };

    if (isEditing && recordToEdit) {
      updateRecord(recordToEdit.id, payload);
    } else {
      addRecord(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl my-4 sm:my-8 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {isEditing 
                ? (languageMode === 'my' ? 'ယာဉ်မှတ်တမ်း ပြင်ဆင်ရန်' : 'Edit Vehicle Record') 
                : (languageMode === 'my' ? 'ယာဉ်မှတ်တမ်း အသစ်ထည့်သွင်းရန်' : 'Add New Reservation / Vehicle')}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              {languageMode === 'my' 
                ? 'Firebase Firestore တွင် တိုက်ရိုက်သိမ်းဆည်းပါမည်' 
                : 'Entries sync to Firebase Firestore in real time.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast confirmation if saved to draft */}
        {draftToast && (
          <div className="bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex items-center gap-2">
            <Archive className="w-4 h-4" />
            <span>Saved as unfinished draft in Archive! (Preserved for 7 days)</span>
          </div>
        )}

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Row 1: Month, Expire Year, Insurance Company & Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Month / လ
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value as MonthKey)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {MONTHS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.labelEn} ({m.labelMy})
                  </option>
                ))}
              </select>
            </div>

            {/* Expire Year Field */}
            <div>
              <label className="block text-xs font-semibold text-blue-900 mb-1.5 flex items-center justify-between">
                <span>သက်တမ်းကုန်နှစ် (Expire Year)</span>
              </label>
              <select
                value={expireYear}
                onChange={(e) => setExpireYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-blue-50/60 border border-blue-200 focus:border-blue-500 rounded-lg text-sm font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Insurance Company Dropdown: Young, GGI, FNI, KBZ, MI */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Insurance Co. / အာမခံ
              </label>
              <select
                value={insuranceCompany}
                onChange={(e) => setInsuranceCompany(e.target.value as InsuranceCompany)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {INSURANCE_COMPANIES.map((company) => (
                  <option key={company.key} value={company.key}>
                    {company.key} ({company.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status / အခြေအနေ
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RecordStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Rental">Rental (ငှားရမ်းဆဲ)</option>
                <option value="Done">Done (ပြီးစီး)</option>
                <option value="Reserved">Reserved (ကြိုတင်မှာယူ)</option>
                <option value="Active">Active (စာချုပ်အသက်ဝင်ဆဲ)</option>
                <option value="Claimed">Claimed (လျော်ကြေးတင်ထား)</option>
                <option value="In Repair">In Repair (ပြင်ဆင်ဆဲ)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Vehicle No & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ယာဉ်အမှတ် (Vehicle No. / Plate)
              </label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="e.g. Mercedez 220 - 15 or 2K/4512"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Model / ကားမော်ဒယ်
              </label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. Toyota Alphard / Mercedes C220"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 3: Owner Name & Invoice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ပိုင်ရှင်အမည် (Customer / Owner)
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Courtney Henry or ဦးအောင်ကျော်"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Invoice / Policy No. (ဘောင်ချာနံပါတ်)
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="e.g. 1641617565"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Values (Car Value, Windshield, Premium) */}
          <div className="p-3.5 sm:p-4 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Financials & Premium Calculation</span>
              <span className="text-[11px] text-slate-500 font-semibold">Myanmar Kyats (MMK)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Car Value */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  ကားတန်ဖိုး (Car Value)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={carValue}
                    onChange={(e) => setCarValue(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="35000000"
                    className="w-full pl-3 pr-12 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 text-xs font-medium">MMK</span>
                </div>
              </div>

              {/* Windshield Value */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600">
                    လေကာမှန်တန်ဖိုး
                  </label>
                  {typeof carValue === 'number' && carValue > 0 && (
                    <button
                      type="button"
                      onClick={handleAutoCalcWindshield}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      ~2%
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={windshieldValue}
                    onChange={(e) => setWindshieldValue(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="700000"
                    className="w-full pl-3 pr-12 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 text-xs font-medium">MMK</span>
                </div>
              </div>

              {/* Premium Amount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600">
                    အာမခံကြေး (Premium)
                  </label>
                  {typeof carValue === 'number' && carValue > 0 && (
                    <button
                      type="button"
                      onClick={handleAutoCalcPremium}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      ~1.8%
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={premiumAmount}
                    onChange={(e) => setPremiumAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="450000"
                    className="w-full pl-3 pr-12 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-emerald-600 text-xs font-medium">MMK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 5: Validity Period & Pickup Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                သက်တမ်း (Validity Period / Pickup Time)
              </label>
              <input
                type="text"
                value={validityPeriod}
                onChange={(e) => {
                  const val = e.target.value;
                  setValidityPeriod(val);
                  const detected = extractExpireYear(val);
                  if (detected && detected >= 2020 && detected <= 2050) {
                    setExpireYear(detected);
                  }
                }}
                placeholder="e.g. Dec 30, 2027 or 1 Year"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                လက်ခံရာနေရာ (Pickup Area / Address)
              </label>
              <input
                type="text"
                value={pickupArea}
                onChange={(e) => setPickupArea(e.target.value)}
                placeholder="e.g. 4517 Washington Ave, Yangon"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 6: Claim Date & Commission Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Claim dt (လျော်ကြေးရက်စွဲ - ရှိပါက)
              </label>
              <input
                type="text"
                value={claimDate}
                onChange={(e) => setClaimDate(e.target.value)}
                placeholder="e.g. Dec 28, 2026 or leave empty"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                commision dt (ကော်မရှင်ထုတ်ရက်)
              </label>
              <input
                type="text"
                value={commissionDate}
                onChange={(e) => setCommissionDate(e.target.value)}
                placeholder="e.g. Dec 20, 2026 or leave empty"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 7: Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              မှတ်ချက် (Remarks / Notes)
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. VIP Corporate Account, Full Glass coverage, inspection completed."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Action buttons: Cancel, Save as Draft (Unfinished), Create/Save */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Save as draft / unfinished button */}
            <button
              type="button"
              onClick={handleSaveAsDraft}
              className="min-h-[42px] px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              title="Save partial record to Archive (kept for 1 week)"
            >
              <Archive className="w-3.5 h-3.5 text-amber-600" />
              <span>Save as Draft / Unfinished</span>
            </button>

            <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[42px] flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] flex-1 sm:flex-none px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isEditing ? 'Save Changes' : 'Create Record'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
