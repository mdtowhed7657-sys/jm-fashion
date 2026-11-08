import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ZoomIn, Eye, Sparkles, ImageOff } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductImage } from '../types';

export const ProductGallery: React.FC = () => {
  const { activeColor, activeImageIndex, setActiveImageIndex, setLightboxImage, theme } = useStore();

  const images = activeColor?.images || [];

  return (
    <div className="space-y-4">
      {/* Active Color Name Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-stone-200/80 shadow-sm text-stone-900 theme-transition">
        <div className="flex items-center space-x-2.5">
          <span
            className="w-4 h-4 rounded-full border border-stone-300 shadow-sm"
            style={{ backgroundColor: activeColor?.code || theme.primary }}
          />
          <span className="text-xs sm:text-sm font-bold text-stone-900">
            {activeColor?.nameBn || 'কালার'} কালেকশন {images.length > 0 ? `(${images.length}টি ছবি)` : ''}
          </span>
        </div>
        {images.length > 0 ? (
          <span className="text-[11px] text-stone-700 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" style={{ color: theme.primary }} />
            ট্যাপ করে ফুলস্ক্রিন বড় করে দেখুন
          </span>
        ) : (
          <span className="text-[11px] text-stone-500 font-medium">
            ছবি আপলোড অপেক্ষমান
          </span>
        )}
      </div>

      {images.length === 0 ? (
        <div className="aspect-[3/4] max-w-lg mx-auto rounded-3xl bg-stone-100/90 border border-stone-200 flex flex-col items-center justify-center p-8 text-center text-stone-600 space-y-4 shadow-inner">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-stone-400 border border-stone-200 shadow-sm">
            <ImageOff className="w-8 h-8 text-stone-400" />
          </div>
          <div className="space-y-1.5 max-w-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200/70 text-stone-800 text-xs font-semibold">
              <span
                className="w-2.5 h-2.5 rounded-full border border-stone-300"
                style={{ backgroundColor: activeColor?.code || theme.primary }}
              />
              {activeColor?.nameBn || activeColor?.name}
            </div>
            <h4 className="text-sm font-bold text-stone-900 pt-1">
              ছবি শীঘ্রই আসছে (No Image Available)
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              এই কালারের জন্য কোনো ছবি আপলোড করা হয়নি। এডমিন প্যানেল থেকে ছবি যুক্ত করা যাবে।
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* MOBILE GALLERY LAYOUT (2-COLUMN GRID REQUIREMENT) */}
          <div className="block lg:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeColor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 gap-2.5 sm:gap-3"
              >
                {images.map((img: ProductImage, index: number) => (
                  <div
                    key={img.id || index}
                    onClick={() => {
                      setActiveImageIndex(index);
                      setLightboxImage(img);
                    }}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-sm group cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `${activeColor.name} photo ${index + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Number Badge - Frosted Glass */}
                    <div className="absolute top-2 left-2 backdrop-blur-xl bg-white/70 border border-white/60 text-stone-900 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shadow-sm">
                      {index + 1}/{images.length}
                    </div>

                    {/* Hover / Tap Zoom Icon Overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-white/90 text-stone-900 flex items-center justify-center shadow-md border border-white/60">
                        <ZoomIn className="w-4.5 h-4.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* DESKTOP GALLERY LAYOUT (Featured Main Image + Gallery Grid / Thumbnails) */}
          <div className="hidden lg:block space-y-4">
            {/* Main Large Display */}
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${activeColor.id}-${activeImageIndex}`}
                  src={images[activeImageIndex]?.url || images[0]?.url}
                  alt={activeColor.name}
                  referrerPolicy="no-referrer"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover object-top"
                />
              </AnimatePresence>

              {/* Lightbox Zoom Trigger */}
              <button
                onClick={() => setLightboxImage(images[activeImageIndex] || images[0])}
                className="absolute top-4 right-4 backdrop-blur-xl bg-white/80 hover:bg-white text-stone-900 p-2.5 rounded-xl border border-white/60 shadow-md flex items-center space-x-1.5 text-xs font-bold transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-stone-900" />
                <span>জুম করুন</span>
              </button>
            </div>

            {/* Desktop Thumbnail Strip */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2.5">
                {images.map((img: ProductImage, index: number) => {
                  const isSelected = index === activeImageIndex;
                  return (
                    <button
                      key={img.id || index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'scale-105 shadow-md'
                          : 'border-stone-200/80 opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: isSelected ? theme.borderFocus : undefined,
                        boxShadow: isSelected ? `0 0 0 2px ${theme.borderFocus}30` : undefined
                      }}
                    >
                      <img
                        src={img.url}
                        alt={img.alt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
