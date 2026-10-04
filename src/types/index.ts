export type MonthKey = 
  | 'Jan' 
  | 'Feb' 
  | 'Mar' 
  | 'Apr' 
  | 'May' 
  | 'Jun' 
  | 'Jul' 
  | 'Aug' 
  | 'Sep' 
  | 'Oct' 
  | 'Nov' 
  | 'Dec';

export type RecordStatus = 'Rental' | 'Done' | 'Reserved' | 'Active' | 'Claimed' | 'In Repair';

export type InsuranceCompany = 'Young' | 'GGI' | 'FNI' | 'KBZ' | 'MI';

export interface VehicleRecord {
  id: string;
  month: MonthKey;
  year: number; // Stored in the expire year (e.g. 2026, 2027, 2028, etc.)
  expireYear?: number; // Explicit expire year
  srNo: number; // စဉ်
  vehicleNo: string; // ယာဉ်အမှတ် (Plate No. e.g. Mercedez 220 - 15, 2K/4521)
  vehicleModel?: string; // Car model / display name
  insuranceCompany?: InsuranceCompany; // Young, GGI, FNI, KBZ, MI
  ownerName: string; // ပိုင်ရှင်အမည် (Customer / Owner)
  carValue: number; // ကားတန်ဖိုး (Car value in USD / Currency)
  windshieldValue: number; // လေကာမှန်တန်ဖိုး (Windshield value)
  premiumAmount: number; // အာမခံကြေး (Insurance premium / Amount)
  validityPeriod: string; // သက်တမ်း (e.g. 1 Year, Jan 2026 - Dec 2026, or pickup time/period)
  claimDate: string; // Claim dt (e.g. 2026-03-15 or empty/None)
  commissionDate: string; // commision dt (e.g. 2026-01-20 or empty)
  remarks: string; // မှတ်ချက် (Notes / Remarks)
  status: RecordStatus;
  pickupArea?: string; // Pickup area from image 1 (e.g. 4517 Washington Ave, Yangon, etc.)
  invoiceNo: string; // INVOICE # (e.g. 1641617565)
  isDraft?: boolean; // Draft / Unfinished entry flag
  createdAt: string;
  updatedAt: string;
}

export type ArchiveType = 'deleted' | 'unfinished';

export interface ArchiveItem {
  id: string;
  record: VehicleRecord;
  archiveType: ArchiveType;
  archivedAt: number; // timestamp in ms
  expiresAt: number; // timestamp in ms (7 days from archivedAt)
  reason?: string;
}

export type LanguageMode = 'en' | 'my' | 'dual';

export interface FilterState {
  status: string;
  month: string; // 'all' or MonthKey
  insuranceCompany?: string; // 'all' | InsuranceCompany
  minAmount?: number;
  maxAmount?: number;
  hasClaim: 'all' | 'yes' | 'no';
  searchQuery: string;
}

export interface SyncMessage {
  type: 'SYNC_RECORDS' | 'RECORD_ADDED' | 'RECORD_UPDATED' | 'RECORD_DELETED' | 'BATCH_UPDATE' | 'ARCHIVE_UPDATE';
  timestamp: number;
  senderId: string;
  data?: any;
}

export interface AuthUser {
  username: string;
  displayName: string;
  role: string;
  email: string;
  avatarUrl?: string;
}
