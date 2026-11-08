import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Sparkles, CheckCircle2, Truck, ArrowDown, ShieldCheck, Tag, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Hero: React.FC = () => {
  const { 
    product, 
    activeColor, 
    setSelectedColorId, 
    setIsOrderModalOpen, 
    theme,
    activeHeroBanner,
    isHeroBannerEnabled,
    products
  } = useStore();

  const activePrice = (product.basePrice && product.basePrice > 0) ? product.basePrice : (activeColor.priceOverride || 120);
  const regularPrice = (product.baseRegularPrice && product.baseRegularPrice > 0) ? product.baseRegularPrice : (activeColor.regularPriceOverride || Math.round(activePrice * 1.3));
  const savings = regularPrice - activePrice;
  const discountPercent = regularPrice > 0 ? Math.round((savings / regularPrice) * 100) : 0;

  const hasHeroBundle = Boolean(
    product.bundleQuantity &&
    product.bundlePrice &&
    product.bundleQuantity > 1 &&
    product.bundlePrice > 0 &&
    product.bundlePrice < (product.bundleQuantity * activePrice)
  );

  // Determine whether we are displaying a dedicated admin hero banner or the active color image
  const displayBanner = isHeroBannerEnabled && activeHeroBanner ? activeHeroBanner : null;
  const fallbackColorImage = activeColor?.images?.[0]?.url || product.colors?.find(c => c.images && c.images.length > 0)?.images[0]?.url || '';

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero-section"
      className="relative bg-gradient-to-b from-[#FFF0F5] via-[#FFF5F7] to-[#FFF9FA] text-[#1A1A1A] pt-4 sm:pt-8 pb-10 sm:pb-14 overflow-hidden border-b border-rose-100/80"
    >
      {/* Background Subtle Radial Rose Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] blur-[140px] pointer-events-none rounded-full transition-all duration-700 opacity-70 bg-rose-200/50"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 sm:space-y-8">
        
        {/* Quick Category Switcher Tabs (Desktop) */}
        <div className="hidden lg:flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
            কালেকশন:
          </span>
          <button
            onClick={() => scrollToSection('product-section-jm-fashion-kurti-01')}
            className="px-3.5 py-1.5 rounded-full bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 shadow-xs text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>👗</span>
            <span>Lace Padded (Long Sleeve)</span>
          </button>
          <button
            onClick={() => scrollToSection('product-section-prod-fishcut-petticoat')}
            className="px-3.5 py-1.5 rounded-full bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 shadow-xs text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>🧜‍♀️</span>
            <span>ফিসকাট পেটিকোট</span>
          </button>
          <button
            onClick={() => scrollToSection('product-section-prod-lace-short-sleeve')}
            className="px-3.5 py-1.5 rounded-full bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 shadow-xs text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>✨</span>
            <span>শর্টহাতা লেইস ব্লাউজ</span>
          </button>
        </div>

        {/* Main Grid: Responsive 2-Column Desktop / Stacked Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Bangla Description, Price & Colors Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-4 text-center lg:text-left order-2 lg:order-1"
          >
            {/* Offer Badge */}
            <div className="inline-flex items-center gap-2 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-xs bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border border-rose-200">
              <Sparkles className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>{displayBanner?.badgeText || (hasHeroBundle ? `🔥 ${product.bundleQuantity} পিস ${product.bundlePrice}৳ স্পেশাল অফার • ১ পিস ${activePrice}৳` : `✨ স্পেশাল কালেকশন • ১ পিস ${activePrice}৳`)}</span>
            </div>

            {/* Main Title - Updated as requested by user */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 leading-tight tracking-tight">
              ক্রপ টপ ব্লাউজ কালেকশন
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#E6004C]">
              {product.name}
            </p>

            {/* Subtitle in Bangla */}
            <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {product.descriptionBn}
            </p>

            {/* Price & Bundle Highlight (Feminine Pink Card) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white/95 border border-rose-200 shadow-sm max-w-lg mx-auto lg:mx-0 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">১ পিস মূল্য:</span>
                  <span className="text-2xl sm:text-3xl font-extrabold font-serif text-rose-600">
                    ৳{activePrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-stone-400 line-through font-serif">
                    ৳{regularPrice.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs">
                  {discountPercent}% ছাড় (৳{savings} সাশ্রয়)
                </span>
              </div>

              {/* Bundle Offer Callout (Only if explicitly configured) */}
              {hasHeroBundle && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 shrink-0 text-rose-100" />
                    <span className="font-bold text-xs sm:text-sm">
                      {product.bundleQuantity} পিস স্পেশাল কম্বো: <span className="font-extrabold text-base text-yellow-200">৳{product.bundlePrice}</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-white text-rose-600 shadow-xs">
                    ৳{(product.bundleQuantity * activePrice) - product.bundlePrice} সাশ্রয়
                  </span>
                </div>
              )}
            </div>

            {/* Premium Soft Pink Highlight Availability Message */}
            <div className="bg-pink-50/95 border border-pink-200 rounded-2xl p-3 text-xs sm:text-sm text-pink-950 font-medium leading-relaxed shadow-2xs text-center lg:text-left max-w-lg mx-auto lg:mx-0">
              🌈 আমাদের কাছে সকল কালার available আছে। আপনার পছন্দের কালার স্টক থেকে পাঠানো হবে। ❤️
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                id="hero-cta-order-btn"
                onClick={() => setIsOrderModalOpen(true)}
                className="w-full sm:w-auto font-bold px-8 py-3.5 rounded-2xl text-sm sm:text-base flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md shadow-rose-200 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                <span>অর্ডার করুন (ক্যাশ অন ডেলিভারি)</span>
              </button>

              <button
                id="hero-details-scroll-btn"
                onClick={() => scrollToSection('main-product-area')}
                className="w-full sm:w-auto bg-white hover:bg-rose-50 text-rose-700 font-bold px-6 py-3.5 rounded-2xl text-sm flex items-center justify-center space-x-2 border border-rose-200 shadow-xs transition-colors cursor-pointer"
              >
                <span>৩টি কালেকশন দেখুন</span>
                <ArrowDown className="w-4 h-4 text-rose-500" />
              </button>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-rose-100 text-stone-600 text-xs font-semibold">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>দেখে চেক করে পেমেন্ট</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-rose-500 shrink-0" />
                <span>সারা দেশে হোম ডেলিভারি</span>
              </div>
              <div className="flex items-center space-x-1.5 col-span-2 sm:col-span-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>১০০% কোয়ালিটি গ্যারান্টি</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Visual Product / Offer Banner Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-6 relative order-1 lg:order-2"
          >
            <div 
              id="hero-banner-card"
              className="relative mx-auto w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-pink-200/90 shadow-md bg-white group transition-all duration-300"
            >
              {/* Top Banner Tag / Indicator (Desktop) */}
              <div className="hidden sm:flex bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 items-center justify-between text-xs font-medium">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
                  <span className="font-bold tracking-wide">
                    {displayBanner ? (displayBanner.titleBn || '৫ কালার ৫ পিস ৫০০৳ স্পেশাল অফার') : `${activeColor.nameBn} - এক্সক্লুসিভ কালেকশন`}
                  </span>
                </div>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  JM FASHION
                </span>
              </div>

              {/* Dynamic Banner Image Container with Zero-Crop and Preserved Aspect Ratio */}
              <div className="relative w-full bg-[#FFF5F7] flex items-center justify-center p-1 sm:p-3 overflow-hidden">
                {displayBanner ? (
                  <div className="relative w-full flex items-center justify-center">
                    <img
                      src={displayBanner.imageUrl}
                      alt={displayBanner.altText || displayBanner.titleBn || 'জেএম ফ্যাশন অফার ব্যানার'}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto max-h-[520px] object-contain block mx-auto rounded-2xl shadow-xs transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                  </div>
                ) : fallbackColorImage ? (
                  <div className="relative w-full flex items-center justify-center">
                    <img
                      src={fallbackColorImage}
                      alt={`${product.nameBn} - ${activeColor.nameBn}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto max-h-[520px] object-contain block mx-auto rounded-2xl shadow-xs transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
