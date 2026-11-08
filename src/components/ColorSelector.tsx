import React from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ColorSelector: React.FC = () => {
  const { product, selectedColorId, setSelectedColorId, activeColor, theme } = useStore();

  return (
    <div className="space-y-3 bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-sm text-stone-900 theme-transition">
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: theme.primary }} />
          <span>পছন্দের কালার সিলেক্ট করুন ({product.colors.length}টি কালার ভ্যারিয়েন্ট):</span>
        </label>
        <span
          className="text-xs font-bold font-serif px-2.5 py-1 rounded-full theme-transition"
          style={{
            backgroundColor: theme.badgeBg,
            color: theme.badgeText,
            borderColor: theme.badgeBorder,
            borderWidth: '1px'
          }}
        >
          {activeColor.nameBn} ({activeColor.name})
        </span>
      </div>

      {/* Color Swatches Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2.5 pt-1">
        {product.colors.map((color) => {
          const isSelected = color.id === selectedColorId;
          const isOutOfStock = color.stock <= 0;

          return (
            <button
              key={color.id}
              onClick={() => setSelectedColorId(color.id)}
              disabled={isOutOfStock}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all group theme-transition ${
                isSelected
                  ? 'bg-stone-50 border-2 shadow-sm scale-105'
                  : 'bg-stone-50/80 hover:bg-white border border-stone-200 hover:border-stone-400'
              } ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                borderColor: isSelected ? theme.borderFocus : undefined,
                boxShadow: isSelected ? `0 0 0 2px ${theme.borderFocus}20` : undefined
              }}
            >
              {/* Color Swatch Circle */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-sm flex items-center justify-center border border-stone-300">
                <span
                  className="w-full h-full rounded-full transition-transform group-hover:scale-105"
                  style={{ backgroundColor: color.code }}
                />
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center shadow"
                      style={{
                        backgroundColor: theme.primary,
                        color: theme.primaryContrastText
                      }}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Color Name Label */}
              <span className={`text-[11px] font-medium mt-1.5 truncate max-w-full text-center ${
                isSelected ? 'font-bold' : 'text-stone-700'
              }`}
              style={{
                color: isSelected ? theme.priceHighlight : undefined
              }}
              >
                {color.nameBn}
              </span>

              {/* Tag / Badge */}
              {color.tag && !isSelected && (
                <span
                  className="absolute -top-1.5 -right-1 text-white text-[9px] font-bold px-1 rounded-full shadow"
                  style={{ backgroundColor: theme.primary }}
                >
                  ★
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Color Stock & Details Bar */}
      <div className="flex items-center justify-between text-xs pt-2 text-stone-600 border-t border-stone-200">
        <div className="flex items-center space-x-2">
          <span
            className="w-3.5 h-3.5 rounded-full border border-stone-400 shadow-xs"
            style={{ backgroundColor: activeColor.code }}
          />
          <span className="text-stone-800 font-medium">
            নির্বাচিত কালার: <span className="font-bold" style={{ color: theme.priceHighlight }}>{activeColor.nameBn}</span> ({activeColor.name})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${activeColor.stock > 0 ? 'bg-emerald-600 animate-pulse' : 'bg-rose-500'}`} />
          <span>{activeColor.stock > 0 ? `স্টক আছে (${activeColor.stock} পিস অবশিষ্ট)` : 'স্টক শেষ'}</span>
        </div>
      </div>
    </div>
  );
};
