import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Car, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  Fingerprint,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isPlatformBiometricAvailable } from '../services/biometricAuth';

export const LoginPage: React.FC = () => {
  const { login, loginWithFingerprint, isFingerprintRegistered } = useAuth();
  
  const [username, setUsername] = useState('Htay Aung');
  const [password, setPassword] = useState('260266');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFingerprintScanning, setIsFingerprintScanning] = useState(false);
  const [fingerprintSuccess, setFingerprintSuccess] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(true);

  useEffect(() => {
    isPlatformBiometricAvailable().then((avail) => {
      setBiometricAvailable(avail);
    });
  }, []);

  // Standard Username/Password submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.error || 'Login failed. Please check credentials.');
      }
    } catch {
      setError('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Biometric / Device Fingerprint Login
  const handleFingerprintLogin = async () => {
    setError(null);
    setIsFingerprintScanning(true);

    try {
      const res = await loginWithFingerprint();
      if (res.success) {
        setFingerprintSuccess(true);
      } else {
        setError(res.error || 'Device fingerprint verification was not successful.');
      }
    } catch (err: any) {
      setError(err?.message || 'Biometric sensor error.');
    } finally {
      setIsFingerprintScanning(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('Htay Aung');
    setPassword('260266');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-['Inter',_'Noto_Sans_Myanmar',_sans-serif]">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in fade-in duration-200">
        
        {/* Card Header */}
        <div className="px-6 pt-8 pb-5 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 text-center">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-3">
            <Car className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            AutoLedger Fleet System
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ယာဉ်ငှားရမ်းမှုနှင့် အာမခံမှတ်တမ်း စီမံခန့်ခွဲမှု
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
            <Database className="w-3 h-3" />
            <span>Connected to Firebase Firestore</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Biometric Fingerprint Section */}
          <div className="p-4 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-slate-50 border border-blue-200/80 rounded-2xl shadow-xs text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Device Biometric Login / လက်ဗွေရာဖြင့်ဝင်ရန်</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto mb-4">
              Touch ID, Windows Hello, or Android Fingerprint sensor
            </p>

            {/* Interactive Fingerprint Button */}
            <button
              type="button"
              onClick={handleFingerprintLogin}
              disabled={isFingerprintScanning || fingerprintSuccess}
              className={`relative mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer group ${
                fingerprintSuccess
                  ? 'bg-emerald-600 text-white ring-8 ring-emerald-100 shadow-lg shadow-emerald-500/30'
                  : isFingerprintScanning
                  ? 'bg-blue-600 text-white ring-8 ring-blue-100 shadow-lg shadow-blue-500/30 animate-pulse'
                  : 'bg-white text-blue-600 border-2 border-blue-300 hover:border-blue-600 hover:bg-blue-50/60 shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
              }`}
              title="Click or tap to verify fingerprint on this device"
            >
              {fingerprintSuccess ? (
                <CheckCircle2 className="w-10 h-10 animate-in zoom-in-75 duration-200" />
              ) : (
                <Fingerprint 
                  className={`w-10 h-10 transition-transform ${
                    isFingerprintScanning ? 'animate-bounce' : 'group-hover:scale-110'
                  }`} 
                />
              )}

              {/* Glowing animated scanner ring */}
              {isFingerprintScanning && (
                <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75" />
              )}
            </button>

            <div className="mt-3">
              <button
                type="button"
                onClick={handleFingerprintLogin}
                disabled={isFingerprintScanning}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1"
              >
                <span>
                  {isFingerprintScanning 
                    ? 'Scanning device sensor...' 
                    : fingerprintSuccess
                    ? 'Verified! Logging in...'
                    : 'Tap Fingerprint to Sign In'}
                </span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Current device hardware sensor
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or with password
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Form Body for Password Sign In */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Username */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Username
                </label>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  Auto-fill Default
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (Htay Aung)"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (260266)"
                  required
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isFingerprintScanning}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-1"
            >
              {isLoading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Sign In with Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            Device Biometric Security
          </span>
          <span className="text-[11px] font-mono">User: Htay Aung</span>
        </div>
      </div>
    </div>
  );
};
