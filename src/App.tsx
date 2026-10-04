/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VehicleProvider, useVehicles } from './context/VehicleContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { MonthSelector } from './components/MonthSelector';
import { SummaryCards } from './components/SummaryCards';
import { ControlBar } from './components/ControlBar';
import { VehicleTable } from './components/VehicleTable';
import { Pagination } from './components/Pagination';
import { RecordModal } from './components/RecordModal';
import { FilterDrawer } from './components/FilterDrawer';
import { ExportModal } from './components/ExportModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { YearSummaryView } from './components/YearSummaryView';
import { ArchiveView } from './components/ArchiveView';
import { VehicleRecord } from './types';

function DashboardContent() {
  const { activeMonth } = useVehicles();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VehicleRecord | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setIsAddModalOpen(true);
  };

  const handleEditRecord = (record: VehicleRecord) => {
    setEditingRecord(record);
    setIsAddModalOpen(true);
  };

  const handleDeleteRecord = (id: string) => {
    setDeletingRecordId(id);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-['Inter',_'Noto_Sans_Myanmar',_sans-serif]">
      {/* Top Navigation Bar matching Image 1 */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Month Selector Bar (Jan to Dec interactive switcher + Archive tab) */}
        <MonthSelector />

        {/* If 'Archive' tab is active, show the 7-day Archive & Unfinished Drafts view */}
        {activeMonth === 'archive' ? (
          <ArchiveView onEditDraft={handleEditRecord} />
        ) : (
          <>
            {/* Monthly Summary KPI Cards */}
            <SummaryCards />

            {/* If 'All Months' selected, show annual performance breakdown */}
            {activeMonth === 'all' && (
              <YearSummaryView />
            )}

            {/* Control Action Bar matching Image 1 ("Rentals", Search, Filter, Exports, + Add Reservation) */}
            <ControlBar
              onOpenAddModal={handleOpenAddModal}
              onOpenFilterDrawer={() => setIsFilterOpen(true)}
              onOpenExportModal={() => setIsExportOpen(true)}
            />

            {/* Main Vehicle Table with Image 1 styling + Image 2 columns + Mobile Cards */}
            <VehicleTable
              onEditRecord={handleEditRecord}
              onDeleteRecord={handleDeleteRecord}
            />

            {/* Bottom Pagination matching Image 1 ("Showing 1 - 9 of 40 cars", Previous, Next) */}
            <Pagination />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white py-4 px-4 sm:px-6 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AutoLedger Fleet & Insurance System · Real-Time Interactive Synchronization</span>
          <span>Archive & 1-Week Retention for Deleted Items & Drafts</span>
        </div>
      </footer>

      {/* Add / Edit Record Modal */}
      <RecordModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecord(null);
        }}
        recordToEdit={editingRecord}
      />

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Export & Import Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingRecordId)}
        onClose={() => setDeletingRecordId(null)}
        recordId={deletingRecordId}
      />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <VehicleProvider>
      <DashboardContent />
    </VehicleProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
