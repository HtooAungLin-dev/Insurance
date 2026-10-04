import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  VehicleRecord, 
  MonthKey, 
  LanguageMode, 
  FilterState, 
  RecordStatus,
  ArchiveItem,
  InsuranceCompany
} from '../types';
import { INITIAL_RECORDS } from '../data/initialData';
import { extractExpireYear } from '../utils/dateUtils';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface VehicleContextType {
  records: VehicleRecord[];
  allRecords: VehicleRecord[];
  activeMonth: MonthKey | 'all' | 'archive';
  setActiveMonth: (month: MonthKey | 'all' | 'archive') => void;
  selectedYear: number | 'all';
  setSelectedYear: (year: number | 'all') => void;
  availableYears: number[];
  
  // Search & Filtering
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  
  // Selection
  selectedIds: string[];
  toggleSelectRecord: (id: string) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  
  // CRUD
  addRecord: (record: Omit<VehicleRecord, 'id' | 'createdAt' | 'updatedAt' | 'srNo'>) => Promise<VehicleRecord>;
  updateRecord: (id: string, updates: Partial<VehicleRecord>) => Promise<void>;
  deleteRecord: (id: string, reason?: string) => Promise<void>;
  batchDeleteRecords: (ids: string[]) => Promise<void>;
  batchUpdateStatus: (ids: string[], status: RecordStatus) => Promise<void>;
  cloneRecordToMonth: (id: string, targetMonth: MonthKey) => Promise<void>;
  undoDelete: () => Promise<void>;
  canUndo: boolean;
  clearAllCurrentData: () => Promise<void>;
  
  // Archive (Deleted & Unfinished with 1-week retention in Firestore)
  archiveItems: ArchiveItem[];
  saveDraftToArchive: (record: Partial<VehicleRecord>, reason?: string) => Promise<void>;
  restoreArchivedItem: (archiveId: string) => Promise<void>;
  permanentlyDeleteArchived: (archiveId: string) => Promise<void>;
  clearAllArchive: () => Promise<void>;
  
  // Sync & Status
  lastSyncTime: Date;
  isLiveSyncing: boolean;
  isFirestoreConnected: boolean;
  triggerManualSync: () => void;
  
  // Language & UI
  languageMode: LanguageMode;
  setLanguageMode: (mode: LanguageMode) => void;
  mobileViewMode: 'list' | 'card';
  setMobileViewMode: (mode: 'list' | 'card') => void;
  
  // Pagination & Sorting
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  sortColumn: keyof VehicleRecord | 'none';
  sortDirection: 'asc' | 'desc';
  handleSort: (col: keyof VehicleRecord) => void;
  
  // Metrics
  monthlyCounts: Record<MonthKey, number>;
  totalActiveRecords: number;
  archiveCount: number;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clear any old local dummy seed data on load as user requested "delete all curent data"
  useEffect(() => {
    try {
      localStorage.removeItem('auto_ledger_vehicles_v2');
      localStorage.removeItem('auto_ledger_archive_v2');
    } catch (e) {
      // ignore
    }
  }, []);

  const [allRecords, setAllRecords] = useState<VehicleRecord[]>(INITIAL_RECORDS);
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([]);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);

  // Navigation: Expire Year (defaults to 2027 or 'all')
  const [activeMonth, setActiveMonth] = useState<MonthKey | 'all' | 'archive'>('Jan');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(2027);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [languageMode, setLanguageMode] = useState<LanguageMode>('dual');
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'card'>('card');
  
  // Undo buffer
  const [deletedRecordsBuffer, setDeletedRecordsBuffer] = useState<VehicleRecord[]>([]);

  // Live Sync indicators
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortColumn, setSortColumn] = useState<keyof VehicleRecord | 'none'>('srNo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    month: 'all',
    insuranceCompany: 'all',
    hasClaim: 'all',
    searchQuery: '',
  });

  // Real-time Firestore sync listener for Vehicles
  useEffect(() => {
    const colRef = collection(db, 'vehicles');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const recordsData: VehicleRecord[] = snapshot.docs.map(docSnap => {
        const raw = docSnap.data();
        const derivedExpireYear = raw.expireYear || (raw.validityPeriod ? extractExpireYear(raw.validityPeriod, raw.year || 2027) : (raw.year || 2027));
        return {
          ...raw,
          id: docSnap.id,
          year: raw.expireYear || raw.year || derivedExpireYear,
          expireYear: raw.expireYear || derivedExpireYear,
        } as VehicleRecord;
      });

      // Background migration: if any Firestore doc is stored with year 2026,
      // but its validity indicates an expire year (e.g. 2027, 2028), migrate it immediately
      snapshot.docs.forEach(docSnap => {
        const raw = docSnap.data();
        if (raw.validityPeriod) {
          const extracted = extractExpireYear(raw.validityPeriod, raw.year);
          if (extracted && extracted !== raw.year) {
            updateDoc(docSnap.ref, {
              year: extracted,
              expireYear: extracted,
              updatedAt: new Date().toISOString()
            }).catch(() => {});
          }
        }
      });

      setAllRecords(recordsData);
      setIsFirestoreConnected(true);
      setIsLiveSyncing(true);
      setLastSyncTime(new Date());
      setTimeout(() => setIsLiveSyncing(false), 500);
    }, (error) => {
      console.warn('Firestore vehicles listener warning:', error.message);
      setIsFirestoreConnected(false);
      handleFirestoreError(error, OperationType.LIST, 'vehicles');
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync listener for 1-week Archive
  useEffect(() => {
    const archiveRef = collection(db, 'archives');
    const unsubscribeArchive = onSnapshot(archiveRef, (snapshot) => {
      const now = Date.now();
      const items: ArchiveItem[] = [];

      snapshot.docs.forEach(docSnap => {
        const item = { ...docSnap.data(), id: docSnap.id } as ArchiveItem;
        if (item.expiresAt > now) {
          items.push(item);
        } else {
          // Auto purge expired item (> 7 days) from Firestore
          deleteDoc(doc(db, 'archives', docSnap.id)).catch(() => {});
        }
      });

      setArchiveItems(items);
    }, (error) => {
      console.warn('Firestore archives listener warning:', error.message);
      handleFirestoreError(error, OperationType.LIST, 'archives');
    });

    return () => unsubscribeArchive();
  }, []);

  // Recalculate record count per month across all 12 months for active expire year
  const monthlyCounts = useMemo(() => {
    const counts: Record<MonthKey, number> = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
      Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
    };
    allRecords.forEach(r => {
      const recYear = r.expireYear || r.year;
      if ((selectedYear === 'all' || recYear === selectedYear) && counts[r.month] !== undefined) {
        counts[r.month]++;
      }
    });
    return counts;
  }, [allRecords, selectedYear]);

  // Compute all available expire years
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>([2025, 2026, 2027, 2028, 2029, 2030]);
    allRecords.forEach(r => {
      const y = r.expireYear || r.year;
      if (y && typeof y === 'number') {
        yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [allRecords]);

  // Reset page when month or search changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [activeMonth, searchQuery, filters]);

  // Sorting handler
  const handleSort = (col: keyof VehicleRecord) => {
    if (sortColumn === col) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn('none');
        setSortDirection('asc');
      }
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  // Add Record to Firebase - stored in the expire year!
  const addRecord = useCallback(async (data: Omit<VehicleRecord, 'id' | 'createdAt' | 'updatedAt' | 'srNo'>): Promise<VehicleRecord> => {
    const targetMonth = data.month || (activeMonth === 'all' || activeMonth === 'archive' ? 'Jan' : activeMonth);
    const expireYearToStore = data.expireYear || data.year || extractExpireYear(data.validityPeriod, typeof selectedYear === 'number' ? selectedYear : 2027);
    const existingInMonth = allRecords.filter(r => r.month === targetMonth && (r.expireYear || r.year) === expireYearToStore);
    const nextSr = existingInMonth.length + 1;
    const nowIso = new Date().toISOString();
    const newId = 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    const newRecord: VehicleRecord = {
      ...data,
      id: newId,
      srNo: nextSr,
      month: targetMonth,
      year: expireYearToStore,
      expireYear: expireYearToStore,
      insuranceCompany: data.insuranceCompany || 'Young',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      await setDoc(doc(db, 'vehicles', newId), newRecord);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `vehicles/${newId}`);
    }

    return newRecord;
  }, [allRecords, activeMonth, selectedYear]);

  // Update Record in Firebase - preserve/update expire year
  const updateRecord = useCallback(async (id: string, updates: Partial<VehicleRecord>) => {
    const nowIso = new Date().toISOString();
    const expireYearToStore = updates.expireYear || updates.year || (updates.validityPeriod ? extractExpireYear(updates.validityPeriod) : undefined);

    const sanitizedUpdates = {
      ...updates,
      ...(expireYearToStore ? { year: expireYearToStore, expireYear: expireYearToStore } : {}),
      updatedAt: nowIso,
    };

    try {
      await updateDoc(doc(db, 'vehicles', id), sanitizedUpdates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `vehicles/${id}`);
    }
  }, []);

  // Delete Record -> Move to Firestore 1-week Archive
  const deleteRecord = useCallback(async (id: string, reason = 'Deleted by user') => {
    const toDelete = allRecords.find(r => r.id === id);
    if (!toDelete) return;

    setDeletedRecordsBuffer(prev => [toDelete, ...prev.slice(0, 9)]);
    setSelectedIds(prev => prev.filter(selId => selId !== id));

    const now = Date.now();
    const archiveId = 'arch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newArchivedItem: ArchiveItem = {
      id: archiveId,
      record: toDelete,
      archiveType: 'deleted',
      archivedAt: now,
      expiresAt: now + SEVEN_DAYS_MS,
      reason,
    };

    try {
      // 1. Remove from vehicles
      await deleteDoc(doc(db, 'vehicles', id));
      // 2. Add to archive
      await setDoc(doc(db, 'archives', archiveId), newArchivedItem);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `vehicles/${id}`);
    }
  }, [allRecords]);

  // Batch Delete -> Move multiple to Firestore Archive
  const batchDeleteRecords = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    const toDelete = allRecords.filter(r => ids.includes(r.id));
    setDeletedRecordsBuffer(prev => [...toDelete, ...prev.slice(0, 9)]);
    setSelectedIds([]);

    const now = Date.now();
    try {
      await Promise.all(
        toDelete.map(async (rec) => {
          const archiveId = 'arch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
          const archItem: ArchiveItem = {
            id: archiveId,
            record: rec,
            archiveType: 'deleted',
            archivedAt: now,
            expiresAt: now + SEVEN_DAYS_MS,
            reason: 'Batch delete action',
          };
          await deleteDoc(doc(db, 'vehicles', rec.id));
          await setDoc(doc(db, 'archives', archiveId), archItem);
        })
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'vehicles');
    }
  }, [allRecords]);

  // Save unfinished / draft record to Firestore Archive
  const saveDraftToArchive = useCallback(async (partialData: Partial<VehicleRecord>, reason = 'Saved as draft / unfinished') => {
    const now = Date.now();
    const nowIso = new Date().toISOString();
    const draftId = partialData.id || 'draft-' + Date.now();
    const draftRecord: VehicleRecord = {
      id: draftId,
      month: partialData.month || (activeMonth === 'all' || activeMonth === 'archive' ? 'Jan' : activeMonth),
      year: partialData.expireYear || partialData.year || (typeof selectedYear === 'number' ? selectedYear : 2027),
      expireYear: partialData.expireYear || partialData.year || (typeof selectedYear === 'number' ? selectedYear : 2027),
      srNo: 0,
      vehicleNo: partialData.vehicleNo || 'Draft Vehicle',
      vehicleModel: partialData.vehicleModel || '',
      insuranceCompany: (partialData.insuranceCompany as InsuranceCompany) || 'Young',
      ownerName: partialData.ownerName || 'Draft Owner',
      carValue: partialData.carValue || 0,
      windshieldValue: partialData.windshieldValue || 0,
      premiumAmount: partialData.premiumAmount || 0,
      validityPeriod: partialData.validityPeriod || 'Draft Period',
      claimDate: partialData.claimDate || '',
      commissionDate: partialData.commissionDate || '',
      remarks: partialData.remarks || 'Unfinished draft entry',
      status: partialData.status || 'Reserved',
      pickupArea: partialData.pickupArea || '',
      invoiceNo: partialData.invoiceNo || 'DRAFT-' + Math.floor(1000 + Math.random() * 9000),
      isDraft: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const archiveId = 'arch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newArchivedItem: ArchiveItem = {
      id: archiveId,
      record: draftRecord,
      archiveType: 'unfinished',
      archivedAt: now,
      expiresAt: now + SEVEN_DAYS_MS,
      reason,
    };

    try {
      await setDoc(doc(db, 'archives', archiveId), newArchivedItem);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `archives/${archiveId}`);
    }
  }, [activeMonth, selectedYear]);

  // Restore item from Firestore Archive back into vehicles
  const restoreArchivedItem = useCallback(async (archiveId: string) => {
    const item = archiveItems.find(a => a.id === archiveId);
    if (!item) return;

    const restoredId = 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const restoredRecord: VehicleRecord = {
      ...item.record,
      id: restoredId,
      isDraft: false,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'vehicles', restoredId), restoredRecord);
      await deleteDoc(doc(db, 'archives', archiveId));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'vehicles');
    }
  }, [archiveItems]);

  // Permanently delete archived item from Firestore
  const permanentlyDeleteArchived = useCallback(async (archiveId: string) => {
    try {
      await deleteDoc(doc(db, 'archives', archiveId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `archives/${archiveId}`);
    }
  }, []);

  // Clear all archive from Firestore
  const clearAllArchive = useCallback(async () => {
    try {
      await Promise.all(archiveItems.map(item => deleteDoc(doc(db, 'archives', item.id))));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'archives');
    }
  }, [archiveItems]);

  // Undo delete
  const undoDelete = useCallback(async () => {
    if (deletedRecordsBuffer.length === 0) return;
    const [restored, ...remaining] = deletedRecordsBuffer;
    setDeletedRecordsBuffer(remaining);

    try {
      await setDoc(doc(db, 'vehicles', restored.id), restored);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `vehicles/${restored.id}`);
    }
  }, [deletedRecordsBuffer]);

  // Delete all current data (clear database)
  const clearAllCurrentData = useCallback(async () => {
    try {
      await Promise.all(allRecords.map(r => deleteDoc(doc(db, 'vehicles', r.id))));
      await Promise.all(archiveItems.map(a => deleteDoc(doc(db, 'archives', a.id))));
      setSelectedIds([]);
      setAllRecords([]);
      setArchiveItems([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'vehicles');
    }
  }, [allRecords, archiveItems]);

  // Batch Update Status
  const batchUpdateStatus = useCallback(async (ids: string[], status: RecordStatus) => {
    if (ids.length === 0) return;
    const nowIso = new Date().toISOString();
    try {
      await Promise.all(
        ids.map(id => updateDoc(doc(db, 'vehicles', id), { status, updatedAt: nowIso }))
      );
      setSelectedIds([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'vehicles');
    }
  }, []);

  // Clone Record to another month
  const cloneRecordToMonth = useCallback(async (id: string, targetMonth: MonthKey) => {
    const source = allRecords.find(r => r.id === id);
    if (!source) return;

    const existingInMonth = allRecords.filter(r => r.month === targetMonth);
    const nowIso = new Date().toISOString();
    const clonedId = 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const cloned: VehicleRecord = {
      ...source,
      id: clonedId,
      month: targetMonth,
      srNo: existingInMonth.length + 1,
      invoiceNo: String(Math.floor(1000000000 + Math.random() * 9000000000)),
      remarks: `${source.remarks} (Rollover to ${targetMonth})`.trim(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      await setDoc(doc(db, 'vehicles', clonedId), cloned);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `vehicles/${clonedId}`);
    }
  }, [allRecords]);

  // Manual sync trigger
  const triggerManualSync = useCallback(() => {
    setIsLiveSyncing(true);
    setLastSyncTime(new Date());
    setTimeout(() => setIsLiveSyncing(false), 500);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      status: 'all',
      month: 'all',
      insuranceCompany: 'all',
      hasClaim: 'all',
      searchQuery: '',
    });
    setSearchQuery('');
  }, []);

  // Filtered Records (when activeMonth !== 'archive')
  const records = useMemo(() => {
    let result = [...allRecords];

    if (activeMonth !== 'all' && activeMonth !== 'archive') {
      result = result.filter(r => r.month === activeMonth);
    }

    if (selectedYear !== 'all') {
      result = result.filter(r => (r.expireYear || r.year) === selectedYear);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(r => 
        r.vehicleNo.toLowerCase().includes(query) ||
        (r.vehicleModel && r.vehicleModel.toLowerCase().includes(query)) ||
        (r.insuranceCompany && r.insuranceCompany.toLowerCase().includes(query)) ||
        r.ownerName.toLowerCase().includes(query) ||
        r.invoiceNo.toLowerCase().includes(query) ||
        (r.pickupArea && r.pickupArea.toLowerCase().includes(query)) ||
        r.remarks.toLowerCase().includes(query)
      );
    }

    if (filters.status && filters.status !== 'all') {
      result = result.filter(r => r.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.insuranceCompany && filters.insuranceCompany !== 'all') {
      result = result.filter(r => r.insuranceCompany === filters.insuranceCompany);
    }

    if (filters.hasClaim === 'yes') {
      result = result.filter(r => Boolean(r.claimDate && r.claimDate.trim() !== ''));
    } else if (filters.hasClaim === 'no') {
      result = result.filter(r => !r.claimDate || r.claimDate.trim() === '');
    }

    if (filters.minAmount !== undefined && !isNaN(filters.minAmount)) {
      result = result.filter(r => r.premiumAmount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined && !isNaN(filters.maxAmount)) {
      result = result.filter(r => r.premiumAmount <= filters.maxAmount!);
    }

    if (sortColumn !== 'none') {
      result.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        if (valA === undefined) valA = '';
        if (valB === undefined) valB = '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortDirection === 'asc' 
          ? strA.localeCompare(strB) 
          : strB.localeCompare(strA);
      });
    }

    return result;
  }, [allRecords, activeMonth, selectedYear, searchQuery, filters, sortColumn, sortDirection]);

  // Selection handlers
  const toggleSelectRecord = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    const visibleIds = records.map(r => r.id);
    const allSelected = visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  }, [records, selectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return (
    <VehicleContext.Provider
      value={{
        records,
        allRecords,
        activeMonth,
        setActiveMonth,
        selectedYear,
        setSelectedYear,
        availableYears,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        resetFilters,
        selectedIds,
        toggleSelectRecord,
        toggleSelectAll,
        clearSelection,
        addRecord,
        updateRecord,
        deleteRecord,
        batchDeleteRecords,
        batchUpdateStatus,
        cloneRecordToMonth,
        undoDelete,
        canUndo: deletedRecordsBuffer.length > 0,
        clearAllCurrentData,
        archiveItems,
        saveDraftToArchive,
        restoreArchivedItem,
        permanentlyDeleteArchived,
        clearAllArchive,
        lastSyncTime,
        isLiveSyncing,
        isFirestoreConnected,
        triggerManualSync,
        languageMode,
        setLanguageMode,
        mobileViewMode,
        setMobileViewMode,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        sortColumn,
        sortDirection,
        handleSort,
        monthlyCounts,
        totalActiveRecords: allRecords.length,
        archiveCount: archiveItems.length,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicles = (): VehicleContextType => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};
