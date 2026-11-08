import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminLoginPageProps {
  onNavigateToStore: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigateToStore,
  onLoginSuccess
}) => {
  const { loginAdmin, isAuthLoading, authError, setAuthError } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setAuthError('অনুগ্রহ করে আপনার ইমেইল এবং পাসওয়ার্ড প্রদান করুন');
      return;
    }

    const success = await loginAdmin(email.trim(), password);
    if (success) {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-black selection:text-white">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/5 via-stone-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-stone-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Simple Navigation */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateToStore}
          className="inline-flex items-center space-x-2 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white/80 hover:bg-white px-3.5 py-2 rounded-2xl border border-stone-200 shadow-xs transition-all cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>ওয়েবসাইটে ফিরে যান</span>
        </button>

        <div className="flex items-center space-x-1.5 text-xs text-stone-500 bg-white/80 px-3 py-1.5 rounded-full border border-stone-200/80 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[11px] font-medium hidden sm:inline">256-Bit SSL Encrypted Admin Portal</span>
          <span className="text-[11px] font-medium sm:hidden">Secure Portal</span>
        </div>
      </header>

      {/* Main Center Login Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md bg-white rounded-3xl border border-stone-200/90 shadow-xl p-6 sm:p-8 space-y-6 relative"
        >
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-900 text-white shadow-md mx-auto mb-1">
              <span className="font-serif font-bold text-xl tracking-tight">JM</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-wide uppercase">
                JM FASHION
              </h1>
              <p className="text-[11px] tracking-widest text-stone-400 font-semibold uppercase mt-0.5">
                Official Admin Portal
              </p>
            </div>
            <div className="pt-1 flex flex-col items-center gap-1.5">
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>অ্যাডমিন ম্যানেজমেন্ট প্যানেল লগইন</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Firebase Connected: jm-fashion-e1e9f</span>
              </span>
            </div>
          </div>

          {/* Error Alert Box */}
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-start space-x-2.5 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">লগইন ব্যর্থ হয়েছে</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">{authError}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block flex items-center justify-between">
                <span>এডমিন ইমেইল (Admin Email)</span>
                <span className="text-[10px] text-stone-400 font-normal">Official Access</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="আপনার ফায়ারবেস ইমেইল লিখুন"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white rounded-2xl pl-10 pr-3.5 py-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 transition-all focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block flex items-center justify-between">
                <span>এডমিন পাসওয়ার্ড (Password)</span>
                <span className="text-[10px] text-stone-400 font-normal">Encrypted</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white rounded-2xl pl-10 pr-11 py-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 transition-all focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full bg-stone-900 hover:bg-black text-white font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isAuthLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>এডমিন প্যানেলে লগইন করুন</span>
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee Notice */}
          <div className="bg-stone-50 rounded-2xl p-3 text-[11px] text-stone-600 text-center flex items-center justify-center space-x-1.5 border border-stone-200/70">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Firebase Authentication দ্বারা সুরক্ষিত • অনুমোদিত এডমিন লগইন</span>
          </div>
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-stone-400 border-t border-stone-200/60">
        <p>© {new Date().getFullYear()} JM FASHION EXCLUSIVES • All Rights Reserved.</p>
      </footer>
    </div>
  );
};
