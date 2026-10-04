import { MonthKey, VehicleRecord, InsuranceCompany } from '../types';

export const MONTHS: { key: MonthKey; labelEn: string; labelMy: string; shortMy: string }[] = [
  { key: 'Jan', labelEn: 'January', labelMy: 'ဇန်နဝါရီ', shortMy: 'ဇန်' },
  { key: 'Feb', labelEn: 'February', labelMy: 'ဖေဖော်ဝါရီ', shortMy: 'ဖေ' },
  { key: 'Mar', labelEn: 'March', labelMy: 'မတ်', shortMy: 'မတ်' },
  { key: 'Apr', labelEn: 'April', labelMy: 'ဧပြီ', shortMy: 'ဧပြီ' },
  { key: 'May', labelEn: 'May', labelMy: 'မေ', shortMy: 'မေ' },
  { key: 'Jun', labelEn: 'June', labelMy: 'ဇွန်', shortMy: 'ဇွန်' },
  { key: 'Jul', labelEn: 'July', labelMy: 'ဇူလိုင်', shortMy: 'ဇူ' },
  { key: 'Aug', labelEn: 'August', labelMy: 'ဩဂုတ်', shortMy: 'ဩ' },
  { key: 'Sep', labelEn: 'September', labelMy: 'စက်တင်ဘာ', shortMy: 'စက်' },
  { key: 'Oct', labelEn: 'October', labelMy: 'အောက်တိုဘာ', shortMy: 'အောက်' },
  { key: 'Nov', labelEn: 'November', labelMy: 'နိုဝင်ဘာ', shortMy: 'နို' },
  { key: 'Dec', labelEn: 'December', labelMy: 'ဒီဇင်ဘာ', shortMy: 'ဒီ' },
];

export const INSURANCE_COMPANIES: { 
  key: InsuranceCompany; 
  name: string; 
  nameMy: string;
  badgeClass: string;
}[] = [
  { 
    key: 'Young', 
    name: 'Young Insurance', 
    nameMy: 'ယန်း အာမခံ', 
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200' 
  },
  { 
    key: 'GGI', 
    name: 'GGI Nippon Life', 
    nameMy: 'ဂျီဂျီအိုင် အာမခံ', 
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' 
  },
  { 
    key: 'FNI', 
    name: 'First National Insurance', 
    nameMy: 'အက်ဖ်အင်န်အိုင် အာမခံ', 
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
  },
  { 
    key: 'KBZ', 
    name: 'KBZ MS Insurance', 
    nameMy: 'ကမ္ဘောဇ အာမခံ', 
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' 
  },
  { 
    key: 'MI', 
    name: 'Myanma Insurance', 
    nameMy: 'မြန်မာ့ အာမခံ', 
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' 
  },
];

// All current data deleted as requested. Fresh, clean start for Firestore!
export const INITIAL_RECORDS: VehicleRecord[] = [];
