import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Briefcase, 
  ChevronDown, 
  RefreshCw, 
  Globe, 
  Check, 
  RotateCcw,
  Sparkles,
  Layers,
  Archive,
  Trash2,
  LogOut
} from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { TRANSLATIONS, getText } from '../utils/translations';
import { LanguageMode } from '../types';

export const Header: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    languageMode, 
    setLanguageMode, 
    lastSyncTime, 
    isLiveSyncing, 
    triggerManualSync,
    clearAllCurrentData,
    activeMonth,
    setActiveMonth,
    archiveCount
  } = useVehicles();

  const { currentUser, logout } = useAuth();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const formattedSyncTime = lastSyncTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  return (
    <header className="w-full bg-white border-b border-slate-200/80 px-3 sm:px-6 py-2.5 sm:py-3.5 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left side: Search input matching Image 1 */}
        <div className="relative flex-1 max-w-xs sm:max-w-sm hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getText('topSearchPlaceholder', languageMode)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Mobile Search Toggle Button */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Right side: Sync indicator, Bell, Archive, Profile matching Image 1 */}
        <div className="flex items-center gap-1.5 sm:gap-3 ml-auto">
          {/* Live Sync Indicator */}
          <button
            onClick={triggerManualSync}
            title={`Real-time sync active across all tabs & monthly views. Last sync: ${formattedSyncTime}`}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100 text-xs font-medium text-slate-600 transition-all"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isLiveSyncing ? 'duration-300' : 'duration-1000'}`}></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{getText('syncActive', languageMode)}</span>
            <RefreshCw className={`w-3 h-3 text-slate-400 ml-0.5 ${isLiveSyncing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="min-h-[38px] flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
              title="Change Language (English / မြန်မာ / Dual)"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">
                {languageMode === 'en' ? 'EN' : languageMode === 'my' ? 'မြန်မာ' : 'Dual (EN/MM)'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowLangMenu(false)} 
                />
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50 text-xs font-medium">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Language / ဘာသာစကား
                  </div>
                  <button
                    onClick={() => { setLanguageMode('dual'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${languageMode === 'dual' ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'}`}
                  >
                    <span>Dual (English + မြန်မာ)</span>
                    {languageMode === 'dual' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => { setLanguageMode('my'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${languageMode === 'my' ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'}`}
                  >
                    <span>မြန်မာဘာသာ (Burmese)</span>
                    {languageMode === 'my' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => { setLanguageMode('en'); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${languageMode === 'en' ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'}`}
                  >
                    <span>English</span>
                    {languageMode === 'en' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notification Bell Button (from Image 1) */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationToast(!showNotificationToast)}
              className="min-h-[38px] min-w-[38px] p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors relative flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>

            {showNotificationToast && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotificationToast(false)} 
                />
                <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-slate-200/80 p-3 z-50 text-xs">
                  <div className="font-semibold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span>Notifications</span>
                    <span className="text-[10px] text-blue-600 font-medium cursor-pointer">Mark read</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    <div className="py-2.5">
                      <p className="font-medium text-slate-700">Dec Renewal Due</p>
                      <p className="text-[11px] text-slate-500">Mercedez 220 - 15 contract valid until Dec 30, 2026.</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">10 mins ago</span>
                    </div>
                    <div className="py-2.5">
                      <p className="font-medium text-slate-700">1-Week Retention Active</p>
                      <p className="text-[11px] text-slate-500">Deleted items and drafts are securely kept in Archive for 7 days.</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Active</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Archive / Briefcase Icon Button (Image 1 top right) */}
          <button
            onClick={() => setActiveMonth('archive')}
            className={`min-h-[38px] min-w-[38px] p-2 border rounded-lg transition-colors relative flex items-center justify-center ${
              activeMonth === 'archive'
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Archive & Drafts (1-Week retention)"
          >
            <Archive className="w-4 h-4" />
            {archiveCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {archiveCount}
              </span>
            )}
          </button>

          {/* User Profile: Htay Aung */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="min-h-[38px] flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 sm:pr-2 py-1 rounded-lg hover:bg-slate-100/70 transition-colors focus:outline-none"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs border border-blue-400/30 select-none">
                HA
              </div>
              <span className="text-sm font-semibold text-slate-800 hidden md:inline">
                {currentUser?.displayName || 'Htay Aung'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)} 
                />
                <div className="absolute right-0 mt-1 w-60 bg-white rounded-lg shadow-xl border border-slate-200/80 py-1.5 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-800">{currentUser?.displayName || 'Htay Aung'}</p>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser?.email || 'htayaung@autoledger.com'}</p>
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                      {currentUser?.role || 'Fleet & Insurance Director'}
                    </span>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveMonth('archive');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-800 flex items-center gap-2 transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Open Archive & Drafts ({archiveCount})</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete all records and drafts from Firebase database? This action clears current data.')) {
                          clearAllCurrentData();
                        }
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2 transition-colors font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Delete All Data in Database</span>
                    </button>
                    <button
                      onClick={() => {
                        triggerManualSync();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Force Real-Time Sync</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-500" />
                      <span>Sign Out (Htay Aung)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Expanded Row */}
      {mobileSearchOpen && (
        <div className="sm:hidden pt-2.5 pb-1">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getText('topSearchPlaceholder', languageMode)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

