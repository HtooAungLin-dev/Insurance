import React from 'react';
import { useVehicles } from '../context/VehicleContext';
import { MONTHS } from '../data/initialData';
import { MonthKey } from '../types';
import { ArrowRight, BarChart3, TrendingUp, ShieldAlert, Award } from 'lucide-react';

export const YearSummaryView: React.FC = () => {
  const { allRecords, selectedYear, setActiveMonth, languageMode } = useVehicles();

  // Compute breakdown for each month
  const monthlyStats = MONTHS.map(m => {
    const recordsInMonth = allRecords.filter(r => r.month === m.key);
    const count = recordsInMonth.length;
    const carValue = recordsInMonth.reduce((acc, cur) => acc + (cur.carValue || 0), 0);
    const premium = recordsInMonth.reduce((acc, cur) => acc + (cur.premiumAmount || 0), 0);
    const claims = recordsInMonth.filter(r => r.claimDate && r.claimDate.trim() !== '').length;
    const commissions = recordsInMonth.filter(r => r.commissionDate && r.commissionDate.trim() !== '').length;

    return {
      month: m.key,
      labelEn: m.labelEn,
      labelMy: m.labelMy,
      count,
      carValue,
      premium,
      claims,
      commissions,
    };
  });

  const grandTotalCars = allRecords.length;
  const grandTotalCarValue = allRecords.reduce((acc, cur) => acc + (cur.carValue || 0), 0);
  const grandTotalPremium = allRecords.reduce((acc, cur) => acc + (cur.premiumAmount || 0), 0);
  const grandTotalClaims = allRecords.filter(r => r.claimDate && r.claimDate.trim() !== '').length;

  const maxPremium = Math.max(...monthlyStats.map(s => s.premium), 1);

  return (
    <div className="space-y-5 mb-6">
      {/* Visual Monthly Revenue & Coverage Bars */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {languageMode === 'my' 
                ? `${selectedYear} ခုနှစ် လအလိုက် အာမခံကြေးနှင့် ယာဉ်အရေအတွက် နှိုင်းယှဉ်ချက်` 
                : `${selectedYear} Monthly Premium & Fleet Distribution (Jan - Dec)`}
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Grand Total Premium: <strong className="text-emerald-700">{grandTotalPremium.toLocaleString()} MMK</strong>
          </span>
        </div>

        {/* 12-Month Bar Chart */}
        <div className="grid grid-cols-12 gap-2 items-end h-40 pt-6 px-2 border-b border-slate-100">
          {monthlyStats.map((stat) => {
            const heightPercent = stat.premium > 0 
              ? Math.max(Math.round((stat.premium / maxPremium) * 100), 12) 
              : 6;

            return (
              <div 
                key={stat.month} 
                onClick={() => setActiveMonth(stat.month as MonthKey)}
                className="flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                title={`${stat.labelEn}: ${stat.premium.toLocaleString()} MMK (${stat.count} vehicles)`}
              >
                <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {Math.round(stat.premium / 1000)}k
                </span>
                <div 
                  className={`w-full max-w-[28px] rounded-t-md transition-all group-hover:bg-blue-600 ${
                    stat.count > 0 ? 'bg-blue-500/80' : 'bg-slate-100'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[10px] font-semibold text-slate-600 group-hover:text-blue-600">
                  {stat.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Monthly Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            {languageMode === 'my' ? '၁၂ လပတ် အကျဉ်းချုပ် ဇယား' : '12-Month Performance Ledger'}
          </h3>
          <span className="text-xs text-slate-500">
            Click any month row to inspect and edit entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Month / လ</th>
                <th className="py-3 px-4 text-center">Vehicles / ယာဉ်စင်းရေ</th>
                <th className="py-3 px-4 text-right">Car Value (MMK)</th>
                <th className="py-3 px-4 text-right">Premium (MMK)</th>
                <th className="py-3 px-4 text-center">Claims / လျော်ကြေး</th>
                <th className="py-3 px-4 text-center">Commissions</th>
                <th className="py-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyStats.map((stat) => (
                <tr 
                  key={stat.month}
                  onClick={() => setActiveMonth(stat.month as MonthKey)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-blue-600">
                    {stat.labelEn} <span className="text-slate-400 font-normal">({stat.labelMy})</span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    {stat.count}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    {stat.carValue.toLocaleString()} MMK
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">
                    {stat.premium.toLocaleString()} MMK
                  </td>
                  <td className="py-3 px-4 text-center">
                    {stat.claims > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                        {stat.claims}
                      </span>
                    ) : (
                      <span className="text-slate-300">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">
                    {stat.commissions}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="text-blue-600 font-semibold group-hover:underline inline-flex items-center gap-1">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-slate-50/80 font-bold text-slate-900 border-t-2 border-slate-200">
                <td className="py-3.5 px-4 uppercase tracking-wider">Annual Total</td>
                <td className="py-3.5 px-4 text-center text-blue-700">{grandTotalCars}</td>
                <td className="py-3.5 px-4 text-right">{grandTotalCarValue.toLocaleString()} MMK</td>
                <td className="py-3.5 px-4 text-right text-emerald-700">{grandTotalPremium.toLocaleString()} MMK</td>
                <td className="py-3.5 px-4 text-center text-rose-700">{grandTotalClaims}</td>
                <td className="py-3.5 px-4 text-center">—</td>
                <td className="py-3.5 pr-4 text-right text-slate-400">All 12 Months</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
