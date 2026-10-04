import React from 'react';
import { useVehicles } from '../context/VehicleContext';
import { Car, Banknote, ShieldAlert, Award, TrendingUp } from 'lucide-react';
import { MONTHS } from '../data/initialData';

export const SummaryCards: React.FC = () => {
  const { records, activeMonth, languageMode } = useVehicles();

  const totalCars = records.length;
  const totalCarValue = records.reduce((sum, r) => sum + (r.carValue || 0), 0);
  const totalWindshield = records.reduce((sum, r) => sum + (r.windshieldValue || 0), 0);
  const totalPremium = records.reduce((sum, r) => sum + (r.premiumAmount || 0), 0);
  const claimsCount = records.filter(r => r.claimDate && r.claimDate.trim() !== '').length;
  const commissionCount = records.filter(r => r.commissionDate && r.commissionDate.trim() !== '').length;

  const currentMonthLabel = activeMonth === 'all' 
    ? (languageMode === 'my' ? 'နှစ်ပတ်လည် အားလုံး' : 'All Months (Annual)')
    : MONTHS.find(m => m.key === activeMonth)?.labelEn || activeMonth;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5">
      {/* 1. Total Fleet Vehicles */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">
            {languageMode === 'my' ? 'စုစုပေါင်း ယာဉ်' : 'Total Vehicles'}
          </span>
          <Car className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-xl font-bold text-slate-900 tracking-tight">
          {totalCars}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
          {currentMonthLabel}
        </div>
      </div>

      {/* 2. Total Vehicle Value (ကားတန်ဖိုး) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">
            {languageMode === 'my' ? 'ကားတန်ဖိုး စုစုပေါင်း' : 'Total Car Value'}
          </span>
          <Banknote className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
          {totalCarValue.toLocaleString()} <span className="text-xs font-semibold text-slate-500">MMK</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {languageMode === 'my' ? 'ယာဉ်တန်ဖိုး စာရင်း' : 'Insured fleet asset'}
        </div>
      </div>

      {/* 3. Insurance Premium (အာမခံကြေး) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">
            {languageMode === 'my' ? 'အာမခံကြေး (ဝင်ငွေ)' : 'Total Premium'}
          </span>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-lg sm:text-xl font-bold text-emerald-700 tracking-tight truncate">
          {totalPremium.toLocaleString()} <span className="text-xs font-semibold text-emerald-600">MMK</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {languageMode === 'my' ? 'လအလိုက် ရရှိငွေ' : 'Revenue / month'}
        </div>
      </div>

      {/* 4. Windshield Value (လေကာမှန်တန်ဖိုး) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">
            {languageMode === 'my' ? 'လေကာမှန်တန်ဖိုး' : 'Windshield Cover'}
          </span>
          <Banknote className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
          {totalWindshield.toLocaleString()} <span className="text-xs font-semibold text-slate-500">MMK</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {languageMode === 'my' ? 'မှန်အာမခံတန်ဖိုး' : 'Glass protection'}
        </div>
      </div>

      {/* 5. Claims (Claim dt) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">
            {languageMode === 'my' ? 'လျော်ကြေး (Claim)' : 'Claims Filed'}
          </span>
          <ShieldAlert className="w-4 h-4 text-rose-500" />
        </div>
        <div className="text-xl font-bold text-rose-600 tracking-tight">
          {claimsCount}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {claimsCount > 0 ? (languageMode === 'my' ? 'လျော်ကြေးတင်ထားသည်' : 'Under assessment') : 'No claims'}
        </div>
      </div>

      {/* 6. Commission Settled (commision dt) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">
            {languageMode === 'my' ? 'ကော်မရှင် စာရင်း' : 'Commissions'}
          </span>
          <Award className="w-4 h-4 text-purple-500" />
        </div>
        <div className="text-xl font-bold text-purple-700 tracking-tight">
          {commissionCount}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {languageMode === 'my' ? 'ကော်မရှင်ထုတ်ပေးမှု' : 'Payouts recorded'}
        </div>
      </div>
    </div>
  );
};
