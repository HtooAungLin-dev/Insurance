import React, { useState } from 'react';
import { 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Copy, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Calendar,
  AlertCircle,
  FileText,
  Sliders,
  DollarSign,
  LayoutGrid,
  List
} from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { VehicleRecord, RecordStatus, MonthKey, InsuranceCompany } from '../types';
import { MONTHS, INSURANCE_COMPANIES } from '../data/initialData';
import { getText } from '../utils/translations';

interface VehicleTableProps {
  onEditRecord: (record: VehicleRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const VehicleTable: React.FC<VehicleTableProps> = ({
  onEditRecord,
  onDeleteRecord,
}) => {
  const { 
    records, 
    selectedIds, 
    toggleSelectRecord, 
    toggleSelectAll, 
    updateRecord, 
    cloneRecordToMonth,
    sortColumn, 
    sortDirection, 
    handleSort,
    languageMode,
    currentPage,
    pageSize,
    mobileViewMode,
    setMobileViewMode
  } = useVehicles();

  // Column view mode: 'standard' (Image 1 style) or 'full' (Image 2 Insurance Spreadsheet style)
  const [viewMode, setViewMode] = useState<'standard' | 'full'>('full');
  
  // Active action menu row id
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Clone dropdown target
  const [cloneMenuId, setCloneMenuId] = useState<string | null>(null);

  // Paginated records
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecords = records.slice(startIndex, startIndex + pageSize);

  const allVisibleSelected = paginatedRecords.length > 0 && 
    paginatedRecords.every(r => selectedIds.includes(r.id));

  // Insurance company badge renderer (Young, GGI, FNI, KBZ, MI)
  const renderInsuranceBadge = (company?: string) => {
    if (!company) return <span className="text-slate-400">—</span>;
    const item = INSURANCE_COMPANIES.find(c => c.key === company);
    const badgeClass = item?.badgeClass || 'bg-slate-50 text-slate-700 border-slate-200';
    return (
      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${badgeClass} inline-flex items-center gap-1 shadow-2xs`}>
        <span>{company}</span>
      </span>
    );
  };

  // Status Badge styling strictly matching Screenshot 1:
  const renderStatusBadge = (record: VehicleRecord) => {
    const status = record.status;
    let badgeClass = '';
    
    switch (status) {
      case 'Rental':
        badgeClass = 'bg-[#fff7ed] text-[#ea580c] border-[#ffedd5] hover:bg-orange-100/60';
        break;
      case 'Done':
        badgeClass = 'bg-[#f0fdf4] text-[#16a34a] border-[#dcfce7] hover:bg-emerald-100/60';
        break;
      case 'Reserved':
        badgeClass = 'bg-[#faf5ff] text-[#9333ea] border-[#f3e8ff] hover:bg-purple-100/60';
        break;
      case 'Active':
        badgeClass = 'bg-[#eff6ff] text-[#2563eb] border-[#dbeafe] hover:bg-blue-100/60';
        break;
      case 'Claimed':
        badgeClass = 'bg-[#fff1f2] text-[#e11d48] border-[#ffe4e6] hover:bg-rose-100/60';
        break;
      default:
        badgeClass = 'bg-slate-50 text-slate-600 border-slate-200';
    }

    return (
      <div className="relative group/status inline-block">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const statuses: RecordStatus[] = ['Rental', 'Done', 'Reserved', 'Active', 'Claimed'];
            const nextIdx = (statuses.indexOf(status) + 1) % statuses.length;
            updateRecord(record.id, { status: statuses[nextIdx] });
          }}
          title="Click to cycle status"
          className={`min-h-[28px] px-3 py-1 rounded-full text-xs font-semibold border transition-all shadow-2xs ${badgeClass} cursor-pointer`}
        >
          {status}
        </button>
      </div>
    );
  };

  const getSortIcon = (col: keyof VehicleRecord) => {
    if (sortColumn !== col) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> 
      : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />;
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Table view toggle bar */}
      <div className="px-3 sm:px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600 flex-wrap">
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium hidden sm:inline">
            {languageMode === 'my' ? 'ဇယားပုံစံ:' : 'View layout:'}
          </span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium">
            <button
              onClick={() => setViewMode('full')}
              className={`min-h-[30px] px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'full' 
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {languageMode === 'my' ? 'အာမခံဇယား (Image 2)' : 'All Columns (Image 2)'}
            </button>
            <button
              onClick={() => setViewMode('standard')}
              className={`min-h-[30px] px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'standard' 
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {languageMode === 'my' ? 'ငှားရမ်းမှု (Image 1)' : 'Rentals (Image 1)'}
            </button>
          </div>
        </div>

        {/* Mobile View Toggle: Cards vs Table */}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="md:hidden inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
            <button
              onClick={() => setMobileViewMode('card')}
              className={`p-1.5 rounded-md ${mobileViewMode === 'card' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500'}`}
              title="Mobile Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMobileViewMode('list')}
              className={`p-1.5 rounded-md ${mobileViewMode === 'list' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500'}`}
              title="Table Grid"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-slate-400 text-[11px] hidden lg:block">
            {languageMode === 'my' 
              ? 'အခြေအနေ (Status) ကို နှိပ်၍ တိုက်ရိုက်ပြောင်းလဲနိုင်ပါသည်'
              : 'Click any status pill to quick-toggle · Real-time auto sync'}
          </div>
        </div>
      </div>

      {/* MOBILE CARD VIEW (Active on phones when card mode is selected) */}
      <div className={`md:hidden p-3 space-y-3 ${mobileViewMode === 'card' ? 'block' : 'hidden'}`}>
        {paginatedRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No records found</p>
          </div>
        ) : (
          paginatedRecords.map((record, index) => {
            const isSelected = selectedIds.includes(record.id);

            return (
              <div 
                key={record.id}
                className={`bg-white rounded-xl border p-3.5 shadow-2xs transition-all ${
                  isSelected ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRecord(record.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {record.vehicleNo}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {record.ownerName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {renderInsuranceBadge(record.insuranceCompany)}
                    {renderStatusBadge(record)}
                  </div>
                </div>

                {/* Values row */}
                <div className="grid grid-cols-3 gap-2 py-2.5 my-1 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Premium</span>
                    <span className="font-bold text-emerald-700">${record.premiumAmount?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Car Value</span>
                    <span className="font-semibold text-slate-700">${record.carValue?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Windshield</span>
                    <span className="font-semibold text-slate-600">${record.windshieldValue?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Validity & Pickup */}
                <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                  <div><strong className="text-slate-600">Validity:</strong> {record.validityPeriod}</div>
                  {record.pickupArea && <div><strong className="text-slate-600">Area:</strong> {record.pickupArea}</div>}
                  {record.claimDate && <div className="text-rose-600 font-semibold">● Claim: {record.claimDate}</div>}
                </div>

                {/* Action buttons on card with min-h-[40px] */}
                <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-slate-100">
                  <span className="font-mono text-[11px] text-slate-400">#{record.invoiceNo}</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditRecord(record)}
                      className="min-h-[36px] px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="min-h-[36px] px-2.5 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Table Container (Visible on Desktop, or Mobile when list mode selected) */}
      <div className={`overflow-x-auto min-h-[350px] ${mobileViewMode === 'card' ? 'hidden md:block' : 'block'}`}>
        <table className="w-full text-left text-sm border-collapse">
          {/* Header Row */}
          <thead>
            <tr className="border-b border-slate-200/90 bg-white text-[11px] tracking-wider text-slate-500 font-semibold uppercase select-none">
              {/* Checkbox column */}
              <th className="py-3.5 pl-4 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>

              {/* စဉ် (Sr No) */}
              <th 
                onClick={() => handleSort('srNo')}
                className="py-3.5 px-3 w-12 cursor-pointer group hover:text-slate-800"
              >
                <div className="flex items-center gap-1">
                  <span>{getText('colSr', languageMode)}</span>
                  {getSortIcon('srNo')}
                </div>
              </th>

              {/* ယာဉ်အမှတ် / VEHICLE */}
              <th 
                onClick={() => handleSort('vehicleNo')}
                className="py-3.5 px-3 min-w-[180px] cursor-pointer group hover:text-slate-800"
              >
                <div className="flex items-center gap-1">
                  <span>{getText('colVehicle', languageMode)}</span>
                  {getSortIcon('vehicleNo')}
                </div>
              </th>

              {/* INSURANCE COMPANY (Young, GGI, FNI, KBZ, MI) */}
              <th 
                onClick={() => handleSort('insuranceCompany')}
                className="py-3.5 px-3 min-w-[125px] cursor-pointer group hover:text-slate-800"
              >
                <div className="flex items-center gap-1">
                  <span>{languageMode === 'my' ? 'အာမခံကုမ္ပဏီ' : 'INSURANCE CO.'}</span>
                  {getSortIcon('insuranceCompany')}
                </div>
              </th>

              {/* STATUS */}
              <th 
                onClick={() => handleSort('status')}
                className="py-3.5 px-3 min-w-[110px] cursor-pointer group hover:text-slate-800"
              >
                <div className="flex items-center gap-1">
                  <span>{getText('colStatus', languageMode)}</span>
                  {getSortIcon('status')}
                </div>
              </th>

              {/* ပိုင်ရှင်အမည် / CUSTOMER */}
              <th 
                onClick={() => handleSort('ownerName')}
                className="py-3.5 px-3 min-w-[160px] cursor-pointer group hover:text-slate-800"
              >
                <div className="flex items-center gap-1">
                  <span>{getText('colOwner', languageMode)}</span>
                  {getSortIcon('ownerName')}
                </div>
              </th>

              {/* Full Mode: ကားတန်ဖိုး (Car Value) */}
              {viewMode === 'full' && (
                <th 
                  onClick={() => handleSort('carValue')}
                  className="py-3.5 px-3 min-w-[120px] text-right cursor-pointer group hover:text-slate-800"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>{getText('colCarValue', languageMode)}</span>
                    {getSortIcon('carValue')}
                  </div>
                </th>
              )}

              {/* Full Mode: လေကာမှန်တန်ဖိုး (Windshield Value) */}
              {viewMode === 'full' && (
                <th 
                  onClick={() => handleSort('windshieldValue')}
                  className="py-3.5 px-3 min-w-[130px] text-right cursor-pointer group hover:text-slate-800"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>{getText('colWindshield', languageMode)}</span>
                    {getSortIcon('windshieldValue')}
                  </div>
                </th>
              )}

              {/* အာမခံကြေး / AMOUNT */}
              <th 
                onClick={() => handleSort('premiumAmount')}
                className="py-3.5 px-3 min-w-[120px] text-right cursor-pointer group hover:text-slate-800"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{getText('colPremium', languageMode)}</span>
                  {getSortIcon('premiumAmount')}
                </div>
              </th>

              {/* PICKUP AREA (in standard view) */}
              {viewMode === 'standard' && (
                <th className="py-3.5 px-3 min-w-[180px]">
                  <span>{getText('colPickupArea', languageMode)}</span>
                </th>
              )}

              {/* သက်တမ်း / PICKUP TIME / VALIDITY */}
              <th 
                onClick={() => handleSort('validityPeriod')}
                className="py-3.5 px-3 min-w-[160px] cursor-pointer group hover:text-slate-800"
              >
                <div className="flex items-center gap-1">
                  <span>{getText('colValidity', languageMode)}</span>
                  {getSortIcon('validityPeriod')}
                </div>
              </th>

              {/* Full Mode: Claim dt */}
              {viewMode === 'full' && (
                <th 
                  onClick={() => handleSort('claimDate')}
                  className="py-3.5 px-3 min-w-[110px] cursor-pointer group hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>{getText('colClaimDate', languageMode)}</span>
                    {getSortIcon('claimDate')}
                  </div>
                </th>
              )}

              {/* Full Mode: commision dt */}
              {viewMode === 'full' && (
                <th 
                  onClick={() => handleSort('commissionDate')}
                  className="py-3.5 px-3 min-w-[120px] cursor-pointer group hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>{getText('colCommissionDate', languageMode)}</span>
                    {getSortIcon('commissionDate')}
                  </div>
                </th>
              )}

              {/* Standard Mode: INVOICE */}
              {viewMode === 'standard' && (
                <th className="py-3.5 px-3 min-w-[130px]">
                  <span>{getText('colInvoice', languageMode)}</span>
                </th>
              )}

              {/* Full Mode: မှတ်ချက် (Remarks) */}
              {viewMode === 'full' && (
                <th className="py-3.5 px-3 min-w-[160px]">
                  <span>{getText('colRemarks', languageMode)}</span>
                </th>
              )}

              {/* Actions header */}
              <th className="py-3.5 pr-4 pl-2 w-10 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={viewMode === 'full' ? 12 : 9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-600">No records found</p>
                    <p className="text-xs text-slate-400">
                      {languageMode === 'my' 
                        ? 'ဤလအတွက် စာရင်းမရှိသေးပါ။ အပေါ်ရှိ "+ စာရင်းအသစ်ထည့်ရန်" ဖြင့် စတင်ပါ'
                        : 'No entries for this monthly filter. Click "+ Add Reservation" to record.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record, index) => {
                const isSelected = selectedIds.includes(record.id);

                return (
                  <tr 
                    key={record.id}
                    className={`hover:bg-slate-50/80 transition-colors group ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRecord(record.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* စဉ် (Sr No) */}
                    <td className="py-3.5 px-3 text-xs text-slate-400 font-mono">
                      {record.srNo || startIndex + index + 1}
                    </td>

                    {/* ယာဉ်အမှတ် / VEHICLE */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {record.vehicleNo}
                      </div>
                      {record.vehicleModel && (
                        <div className="text-[11px] text-slate-400">
                          {record.vehicleModel}
                        </div>
                      )}
                    </td>

                    {/* INSURANCE COMPANY */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {renderInsuranceBadge(record.insuranceCompany)}
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {renderStatusBadge(record)}
                    </td>

                    {/* ပိုင်ရှင်အမည် / CUSTOMER */}
                    <td className="py-3.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                      {record.ownerName}
                    </td>

                    {/* Full Mode: ကားတန်ဖိုး (Car Value) */}
                    {viewMode === 'full' && (
                      <td className="py-3.5 px-3 text-right font-medium text-slate-800">
                        ${record.carValue ? record.carValue.toLocaleString() : '0'}
                      </td>
                    )}

                    {/* Full Mode: လေကာမှန်တန်ဖိုး (Windshield Value) */}
                    {viewMode === 'full' && (
                      <td className="py-3.5 px-3 text-right font-medium text-slate-600">
                        ${record.windshieldValue ? record.windshieldValue.toLocaleString() : '0'}
                      </td>
                    )}

                    {/* အာမခံကြေး / AMOUNT */}
                    <td className="py-3.5 px-3 text-right font-semibold text-slate-900">
                      ${record.premiumAmount ? record.premiumAmount.toLocaleString() : '0'}
                    </td>

                    {/* PICKUP AREA (standard view) */}
                    {viewMode === 'standard' && (
                      <td className="py-3.5 px-3 text-xs text-slate-600 truncate max-w-[200px]" title={record.pickupArea || ''}>
                        {record.pickupArea || '—'}
                      </td>
                    )}

                    {/* သက်တမ်း / VALIDITY / PICKUP TIME */}
                    <td className="py-3.5 px-3 text-xs text-slate-600 whitespace-nowrap">
                      {record.validityPeriod || '—'}
                    </td>

                    {/* Full Mode: Claim dt */}
                    {viewMode === 'full' && (
                      <td className="py-3.5 px-3 text-xs whitespace-nowrap">
                        {record.claimDate ? (
                          <span className="text-rose-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                            {record.claimDate}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    )}

                    {/* Full Mode: commision dt */}
                    {viewMode === 'full' && (
                      <td className="py-3.5 px-3 text-xs text-slate-600 whitespace-nowrap">
                        {record.commissionDate || <span className="text-slate-400">—</span>}
                      </td>
                    )}

                    {/* Standard Mode: INVOICE */}
                    {viewMode === 'standard' && (
                      <td className="py-3.5 px-3 font-mono text-xs text-slate-600">
                        {record.invoiceNo}
                      </td>
                    )}

                    {/* Full Mode: မှတ်ချက် (Remarks) */}
                    {viewMode === 'full' && (
                      <td className="py-3.5 px-3 text-xs text-slate-500 max-w-[200px] truncate" title={record.remarks}>
                        {record.remarks || '—'}
                      </td>
                    )}

                    {/* Actions Menu (3 dots matching Screenshot 1) */}
                    <td className="py-3.5 pr-4 pl-2 text-right relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === record.id ? null : record.id);
                        }}
                        className="min-h-[32px] min-w-[32px] p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center ml-auto"
                        title="Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === record.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => {
                              setActiveMenuId(null);
                              setCloneMenuId(null);
                            }} 
                          />
                          <div className="absolute right-2 top-10 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50 text-xs font-medium text-slate-700">
                            {/* Edit */}
                            <button
                              onClick={() => {
                                onEditRecord(record);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                              <span>{languageMode === 'my' ? 'ပြင်ဆင်ရန် (Edit)' : 'Edit Record'}</span>
                            </button>

                            {/* Clone / Rollover to another month */}
                            <div className="relative">
                              <button
                                onClick={() => setCloneMenuId(cloneMenuId === record.id ? null : record.id)}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                              >
                                <span className="flex items-center gap-2">
                                  <Copy className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>{languageMode === 'my' ? 'လ အသစ်သို့ ကူးယူရန်' : 'Copy to Month...'}</span>
                                </span>
                                <span className="text-[10px] text-slate-400">▶</span>
                              </button>

                              {cloneMenuId === record.id && (
                                <div className="absolute right-full top-0 mr-1 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-60 max-h-48 overflow-y-auto">
                                  <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase">
                                    Target Month
                                  </div>
                                  {MONTHS.map(m => (
                                    <button
                                      key={m.key}
                                      onClick={() => {
                                        cloneRecordToMonth(record.id, m.key);
                                        setActiveMenuId(null);
                                        setCloneMenuId(null);
                                      }}
                                      className="w-full text-left px-2.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 text-xs"
                                    >
                                      {m.labelEn}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Cycle Status */}
                            <button
                              onClick={() => {
                                const statuses: RecordStatus[] = ['Rental', 'Done', 'Reserved', 'Active', 'Claimed'];
                                const nextIdx = (statuses.indexOf(record.status) + 1) % statuses.length;
                                updateRecord(record.id, { status: statuses[nextIdx] });
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Toggle Status</span>
                            </button>

                            <div className="h-px bg-slate-100 my-1" />

                            {/* Delete */}
                            <button
                              onClick={() => {
                                onDeleteRecord(record.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{languageMode === 'my' ? 'ဖျက်ရန် (Delete)' : 'Delete Record'}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

