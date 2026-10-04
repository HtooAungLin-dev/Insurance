import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Copy, 
  Check, 
  UploadCloud, 
  FileText,
  Filter,
  Sparkles
} from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { MonthKey, InsuranceCompany, VehicleRecord } from '../types';
import { MONTHS, INSURANCE_COMPANIES } from '../data/initialData';
import { generateVehicleLedgerPDF } from '../utils/pdfExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { records, allRecords, activeMonth, selectedYear, languageMode, addRecord } = useVehicles();
  const { currentUser } = useAuth();

  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importSuccess, setImportSuccess] = useState('');

  // PDF Export settings
  const [pdfPeriod, setPdfPeriod] = useState<string>(activeMonth);
  const [pdfCompany, setPdfCompany] = useState<string>('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!isOpen) return null;

  // Compute dataset to export based on selections
  const getSelectedRecords = (): VehicleRecord[] => {
    let list: VehicleRecord[] = [];
    if (pdfPeriod === 'all') {
      list = [...allRecords];
    } else {
      list = allRecords.filter(r => r.month === pdfPeriod);
    }

    if (pdfCompany !== 'all') {
      list = list.filter(r => r.insuranceCompany === pdfCompany);
    }

    return list;
  };

  const exportRecords = getSelectedRecords();

  // Export to official PDF Report
  const handleExportPDF = () => {
    setIsExportingPdf(true);
    try {
      const monthObj = MONTHS.find(m => m.key === pdfPeriod);
      const monthLabel = pdfPeriod === 'all' 
        ? 'Full Year (Jan - Dec)' 
        : `${monthObj ? monthObj.labelEn : pdfPeriod}`;

      generateVehicleLedgerPDF({
        records: exportRecords,
        monthTitle: monthLabel,
        year: selectedYear,
        generatedBy: currentUser?.displayName || 'Htay Aung',
        insuranceFilter: pdfCompany === 'all' ? 'All Companies' : pdfCompany,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Generate CSV with Burmese and English column headers matching Image 2
  const generateCSV = (includeBOM = true) => {
    const headers = [
      'စဉ် (No.)',
      'ယာဉ်အမှတ် (Vehicle No)',
      'အာမခံကုမ္ပဏီ (Insurance Co: Young/GGI/FNI/KBZ/MI)',
      'ပိုင်ရှင်အမည် (Customer/Owner)',
      'ကားတန်ဖိုး (Car Value MMK)',
      'လေကာမှန်တန်ဖိုး (Windshield Value MMK)',
      'အာမခံကြေး (Premium MMK)',
      'အခြေအနေ (Status)',
      'သက်တမ်း (Validity Period)',
      'Claim dt (လျော်ကြေးရက်)',
      'commision dt (ကော်မရှင်ရက်)',
      'ဘောင်ချာနံပါတ် (Invoice)',
      'မှတ်ချက် (Remarks)'
    ];

    const rows = exportRecords.map((r, index) => [
      r.srNo || index + 1,
      `"${(r.vehicleNo || '').replace(/"/g, '""')}"`,
      `"${r.insuranceCompany || 'Young'}"`,
      `"${(r.ownerName || '').replace(/"/g, '""')}"`,
      r.carValue || 0,
      r.windshieldValue || 0,
      r.premiumAmount || 0,
      r.status,
      `"${(r.validityPeriod || '').replace(/"/g, '""')}"`,
      `"${(r.claimDate || '').replace(/"/g, '""')}"`,
      `"${(r.commissionDate || '').replace(/"/g, '""')}"`,
      `"${r.invoiceNo}"`,
      `"${(r.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    return includeBOM ? '\uFEFF' + csvContent : csvContent;
  };

  const handleDownloadCSV = () => {
    const csvData = generateCSV(true);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Vehicle_Ledger_${pdfPeriod}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const jsonData = JSON.stringify(exportRecords, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Vehicle_Ledger_${pdfPeriod}_${selectedYear}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyClipboard = () => {
    const csvData = generateCSV(false);
    navigator.clipboard.writeText(csvData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImportCSV = () => {
    if (!importText.trim()) return;
    try {
      const lines = importText.trim().split('\n');
      let count = 0;
      const startLine = lines[0].includes('ယာဉ်') || lines[0].includes('Vehicle') ? 1 : 0;
      
      for (let i = startLine; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',').map(s => s.replace(/(^"|"$)/g, '').trim());
        if (parts.length >= 2) {
          addRecord({
            month: (activeMonth === 'all' || activeMonth === 'archive') ? 'Jan' : activeMonth,
            year: selectedYear,
            vehicleNo: parts[1] || parts[0] || 'Imported Car',
            insuranceCompany: (parts[2] as InsuranceCompany) || 'Young',
            ownerName: parts[3] || 'Customer',
            carValue: Number(parts[4]) || 25000,
            windshieldValue: Number(parts[5]) || 500,
            premiumAmount: Number(parts[6]) || 400,
            status: 'Rental',
            validityPeriod: parts[8] || '1 Year',
            claimDate: parts[9] || '',
            commissionDate: parts[10] || '',
            invoiceNo: String(Math.floor(1000000000 + Math.random() * 9000000000)),
            remarks: parts[12] || 'Imported via CSV',
          });
          count++;
        }
      }
      setImportSuccess(`Successfully imported ${count} records!`);
      setImportText('');
      setTimeout(() => setImportSuccess(''), 3000);
    } catch {
      alert('Error importing CSV format. Please ensure comma separated values.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl my-4 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {languageMode === 'my' ? 'ဒေတာ ထုတ်ယူခြင်း (Exports & Reports)' : 'Export & PDF Reports'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Generate official PDF reports, Excel CSVs, and data backups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Filter options for the export */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>Configure Report Scope</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                {exportRecords.length} records selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Select Period */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Report Period / လ ရွေးချယ်ရန်
                </label>
                <select
                  value={pdfPeriod}
                  onChange={(e) => setPdfPeriod(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Full Year {selectedYear} (Jan - Dec)</option>
                  {MONTHS.map(m => (
                    <option key={m.key} value={m.key}>
                      {m.labelEn} {selectedYear} ({m.labelMy})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Insurance Company */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Insurance Company / အာမခံကုမ္ပဏီ
                </label>
                <select
                  value={pdfCompany}
                  onChange={(e) => setPdfCompany(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Companies (Young, GGI, FNI, KBZ, MI)</option>
                  {INSURANCE_COMPANIES.map(c => (
                    <option key={c.key} value={c.key}>
                      {c.key} ({c.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Primary Action: Download PDF Report */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-4 sm:p-5 shadow-md space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-blue-200 text-xs font-semibold mb-1">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Official Landscape Report</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Export PDF Report
                </h3>
                <p className="text-xs text-blue-100/90 mt-0.5">
                  Includes header summary cards, insurance company breakdown, full vehicle table columns, and auditor signatures.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="w-full py-2.5 px-4 bg-white hover:bg-blue-50 text-blue-900 font-bold rounded-lg text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
          </div>

          {/* Other Formats Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Other Formats & Operations
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Download CSV */}
              <button
                onClick={handleDownloadCSV}
                className="p-3 border border-slate-200 hover:border-emerald-400 rounded-xl bg-white hover:bg-emerald-50/40 text-left transition-all group flex items-center gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Download CSV</p>
                  <p className="text-[11px] text-slate-400">Excel UTF-8 with Myanmar unicode</p>
                </div>
              </button>

              {/* Print Ledger */}
              <button
                onClick={handlePrint}
                className="p-3 border border-slate-200 hover:border-blue-400 rounded-xl bg-white hover:bg-blue-50/40 text-left transition-all group flex items-center gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Print Ledger</p>
                  <p className="text-[11px] text-slate-400">Direct print to paper or PDF</p>
                </div>
              </button>

              {/* Copy CSV to clipboard */}
              <button
                onClick={handleCopyClipboard}
                className="p-3 border border-slate-200 hover:border-indigo-400 rounded-xl bg-white hover:bg-indigo-50/40 text-left transition-all group flex items-center gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{copied ? 'Copied!' : 'Copy to Clipboard'}</p>
                  <p className="text-[11px] text-slate-400">Paste into Google Sheets</p>
                </div>
              </button>

              {/* Download JSON */}
              <button
                onClick={handleDownloadJSON}
                className="p-3 border border-slate-200 hover:border-amber-400 rounded-xl bg-white hover:bg-amber-50/40 text-left transition-all group flex items-center gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Export JSON</p>
                  <p className="text-[11px] text-slate-400">Complete raw dataset backup</p>
                </div>
              </button>
            </div>
          </div>

          {/* Collapsible CSV Import tool */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowImport(!showImport)}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{showImport ? 'Hide CSV Importer' : 'Need to Import Existing Spreadsheet Rows?'}</span>
            </button>

            {showImport && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="text-[11px] text-slate-500">
                  Paste rows (Sr, VehicleNo, InsuranceCompany, Owner, CarVal, WindshieldVal, Premium, etc.)
                </p>
                <textarea
                  rows={3}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="1, 2K/9911, Young, Daw Thida, 30000, 600, 500&#10;2, 1A/4422, KBZ, U Tin Win, 25000, 500, 420"
                  className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg bg-white"
                />
                <button
                  onClick={handleImportCSV}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Import Rows into {pdfPeriod === 'all' ? 'Jan' : pdfPeriod}
                </button>
                {importSuccess && (
                  <p className="text-xs text-emerald-600 font-medium">{importSuccess}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Authorized by: <strong className="text-slate-600">{currentUser?.displayName || 'Htay Aung'}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
