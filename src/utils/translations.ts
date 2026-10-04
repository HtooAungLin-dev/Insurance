import { LanguageMode } from '../types';

export interface ColumnTranslation {
  en: string;
  my: string;
  dual: string;
}

export const TRANSLATIONS = {
  // App header & titles
  appTitle: {
    en: 'Rentals & Insurance Ledger',
    my: 'ယာဉ်ငှားရမ်းမှုနှင့် အာမခံမှတ်တမ်း',
    dual: 'Rentals & Insurance Ledger (ယာဉ်နှင့် အာမခံမှတ်တမ်း)',
  },
  pageTitle: {
    en: 'Rentals',
    my: 'ယာဉ်မှတ်တမ်းများ',
    dual: 'Rentals (ယာဉ်မှတ်တမ်း)',
  },
  pageSubtitle: {
    en: 'Manage monthly fleet records, insurance coverage, claims and client contracts with live sync.',
    my: 'လအလိုက် ယာဉ်မှတ်တမ်းများ၊ အာမခံကြေး၊ လျော်ကြေးနှင့် စာချုပ်များကို တိုက်ရိုက်စီမံနိုင်ပါသည်။',
    dual: 'Manage monthly fleet & insurance records (လအလိုက် ယာဉ်နှင့် အာမခံမှတ်တမ်း)',
  },

  // Table Column Headers (Image 2 + Image 1)
  colSr: {
    en: 'No.',
    my: 'စဉ်',
    dual: 'စဉ် (No.)',
  },
  colVehicle: {
    en: 'VEHICLE',
    my: 'ယာဉ်အမှတ်',
    dual: 'ယာဉ်အမှတ် (Vehicle)',
  },
  colStatus: {
    en: 'STATUS',
    my: 'အခြေအနေ',
    dual: 'STATUS (အခြေအနေ)',
  },
  colOwner: {
    en: 'CUSTOMER / OWNER',
    my: 'ပိုင်ရှင်အမည်',
    dual: 'ပိုင်ရှင်အမည် (Customer)',
  },
  colCarValue: {
    en: 'CAR VALUE (MMK)',
    my: 'ကားတန်ဖိုး (ကျပ်)',
    dual: 'ကားတန်ဖိုး (Car Value MMK)',
  },
  colWindshield: {
    en: 'WINDSHIELD (MMK)',
    my: 'လေကာမှန် (ကျပ်)',
    dual: 'လေကာမှန် (Windshield MMK)',
  },
  colPremium: {
    en: 'PREMIUM (MMK)',
    my: 'အာမခံကြေး (ကျပ်)',
    dual: 'အာမခံကြေး (Premium MMK)',
  },
  colValidity: {
    en: 'VALIDITY / PERIOD',
    my: 'သက်တမ်း',
    dual: 'သက်တမ်း (Validity)',
  },
  colClaimDate: {
    en: 'CLAIM DT',
    my: 'Claim dt',
    dual: 'Claim dt (လျော်ကြေးရက်)',
  },
  colCommissionDate: {
    en: 'COMMISSION DT',
    my: 'commision dt',
    dual: 'commision dt (ကော်မရှင်ရက်)',
  },
  colRemarks: {
    en: 'REMARKS',
    my: 'မှတ်ချက်',
    dual: 'မှတ်ချက် (Remarks)',
  },
  colPickupArea: {
    en: 'PICKUP AREA',
    my: 'လက်ခံရာနေရာ',
    dual: 'PICKUP AREA (နေရာ)',
  },
  colInvoice: {
    en: 'INVOICE #',
    my: 'ဘောင်ချာ / ပိုလစီ',
    dual: 'INVOICE (ဘောင်ချာ)',
  },
  colActions: {
    en: 'ACTIONS',
    my: 'လုပ်ဆောင်ချက်',
    dual: 'ACTIONS',
  },

  // Buttons & Controls
  searchPlaceholder: {
    en: 'Search rented car, contacts...',
    my: 'ယာဉ်နံပါတ်၊ ပိုင်ရှင်၊ ဘောင်ချာ ရှာရန်...',
    dual: 'Search car, contacts / ရှာရန်...',
  },
  topSearchPlaceholder: {
    en: 'Search cars, contacts',
    my: 'ယာဉ်၊ အဆက်အသွယ်ရှာရန်',
    dual: 'Search cars, contacts',
  },
  filter: {
    en: 'Filter',
    my: 'စစ်ထုတ်ရန်',
    dual: 'Filter (စစ်ထုတ်)',
  },
  exports: {
    en: 'Exports',
    my: 'ထုတ်ယူရန်',
    dual: 'Exports (ထုတ်ယူ)',
  },
  addReservation: {
    en: '+ Add Reservation',
    my: '+ စာရင်းအသစ်ထည့်ရန်',
    dual: '+ Add Record (စာရင်းသစ်)',
  },
  allMonths: {
    en: 'All Months',
    my: 'နှစ်ပတ်လည် အားလုံး',
    dual: 'All Months (အားလုံး)',
  },
  syncActive: {
    en: 'Live Sync Active',
    my: 'တိုက်ရိုက်ချိတ်ဆက်ထားသည်',
    dual: 'Live Synced',
  },
  showingRecords: {
    en: 'Showing',
    my: 'ပြသထားသည်',
    dual: 'Showing',
  },
  ofCars: {
    en: 'of',
    my: 'မှ',
    dual: 'of',
  },
  recordsUnit: {
    en: 'records',
    my: 'ခု',
    dual: 'records',
  },
  previous: {
    en: 'Previous',
    my: 'ရှေ့သို့',
    dual: 'Previous',
  },
  next: {
    en: 'Next',
    my: 'နောက်သို့',
    dual: 'Next',
  },
};

export function getText(key: keyof typeof TRANSLATIONS, mode: LanguageMode): string {
  const item = TRANSLATIONS[key];
  if (!item) return String(key);
  return item[mode] || item.en;
}
