import React from 'react';
import { ShoppingBag, ShieldCheck, MessageCircle, Sparkles, User, Tag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { createWhatsAppUrl, WHATSAPP_PHONE_DISPLAY } from '../utils/whatsapp';

export const Header: React.FC = () => {
  const { product, activeColor, setIsOrderModalOpen, orders, theme, navigate, isAdminAuthenticated, products } = useStore();

  const handleOrderClick = () => {
    setIsOrderModalOpen(true);
  };

  const currentPrice = (product.basePrice && product.basePrice > 0) ? product.basePrice : (activeColor.priceOverride || 120);
  const whatsappUrl = createWhatsAppUrl();
  const hasBundle = Boolean(
    product.bundleQuantity &&
    product.bundlePrice &&
    product.bundleQuantity > 1 &&
    product.bundlePrice > 0 &&
    product.bundlePrice < (product.bundleQuantity * currentPrice)
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-[#1A1A1A] border-b border-pink-100 transition-all shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white text-[11px] sm:text-xs py-1.5 px-3 text-center font-medium flex items-center justify-center gap-2 tracking-wide shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-pink-100 animate-pulse" />
        <span>
          {hasBundle 
            ? `🌸 JM FASHION • ১ পিস ${currentPrice}৳ • ${product.bundleQuantity} পিস ${product.bundlePrice}৳ স্পেশাল অফার! সারা বাংলাদেশে ক্যাশ অন ডেলিভারি 🌸`
            : `🌸 JM FASHION • প্রিমিয়াম কালেকশন মাত্র ৳${currentPrice}! সারা বাংলাদেশে ক্যাশ অন ডেলিভারি 🌸`}
        </span>
        <Sparkles className="w-3.5 h-3.5 text-pink-100 animate-pulse hidden sm:inline" />
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand Logo - circular black badge with JM + bold JM FASHION */}
        <div className="flex items-center space-x-2.5">
          <a href="#" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black text-white flex items-center justify-center font-sans font-bold text-xs sm:text-sm tracking-wider shadow-sm group-hover:scale-105 transition-all">
              JM
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-wider text-black font-sans uppercase block leading-none">
                JM FASHION
              </span>
            </div>
          </a>
        </div>

        {/* Center 3 Products Nav (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold text-stone-700">
          <button
            onClick={() => scrollToSection('product-section-jm-fashion-kurti-01')}
            className="px-3.5 py-1.5 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-colors cursor-pointer"
          >
            Lace Padded (Long Sleeve)
          </button>
          <button
            onClick={() => scrollToSection('product-section-prod-fishcut-petticoat')}
            className="px-3.5 py-1.5 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-colors cursor-pointer"
          >
            ফিসকাট পেটিকোট
          </button>
          <button
            onClick={() => scrollToSection('product-section-prod-lace-short-sleeve')}
            className="px-3.5 py-1.5 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-colors cursor-pointer"
          >
            শর্টহাতা লেইসের ব্লাউজ
          </button>
        </nav>

        {/* Center Helpline badge (Desktop) */}
        <div className="hidden md:flex items-center space-x-3 text-xs text-stone-600">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200 transition-colors font-medium shadow-xs"
            title="WhatsApp Support"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            <span>WhatsApp: {WHATSAPP_PHONE_DISPLAY}</span>
          </a>
        </div>

        {/* Right Icons Matching Reference: Search + Cart with Pink Badge 0 + Admin */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Search Icon */}
          <button
            type="button"
            onClick={() => scrollToSection('main-product-area')}
            className="p-1.5 text-stone-800 hover:text-pink-600 transition-colors cursor-pointer"
            title="Search Products"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </button>

          {/* Cart Icon with Pink 0 Badge */}
          <button
            type="button"
            onClick={handleOrderClick}
            className="relative p-1.5 text-stone-800 hover:text-pink-600 transition-colors cursor-pointer"
            title="View Cart / Order"
            aria-label="Shopping Cart"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-[#E6004C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              0
            </span>
          </button>

          {/* Admin / Login Button */}
          <button
            onClick={() => {
              if (isAdminAuthenticated) {
                navigate('/admin');
              } else {
                navigate('/admin/login');
              }
            }}
            className="p-2 sm:px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-800 transition-colors flex items-center space-x-1.5 text-xs border border-pink-200/60 cursor-pointer"
            title="Admin Dashboard"
          >
            <User className="w-4 h-4 text-pink-600" />
            <span className="hidden sm:inline font-semibold">Admin</span>
            {orders.length > 0 && (
              <span className="bg-[#E6004C] text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                {orders.length}
              </span>
            )}
          </button>

          {/* Quick Order Button (Desktop) */}
          <button
            onClick={handleOrderClick}
            className="hidden sm:flex font-bold tracking-wider px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm items-center space-x-1.5 bg-[#E6004C] hover:bg-[#D00040] text-white shadow-sm shadow-pink-200 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span className="font-bold">অর্ডার করুন</span>
            <span className="bg-white/25 px-1.5 py-0.5 rounded text-[11px] font-mono">
              ৳{currentPrice}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
