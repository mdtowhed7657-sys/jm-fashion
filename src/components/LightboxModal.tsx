import React from 'react';
import { X, ZoomIn } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const LightboxModal: React.FC = () => {
  const { lightboxImage, setLightboxImage, activeColor } = useStore();

  if (!lightboxImage) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      {/* Close button */}
      <button
        onClick={() => setLightboxImage(null)}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md text-stone-900 hover:bg-white flex items-center justify-center border border-white/60 shadow-lg transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-3">
        <div className="relative rounded-2xl overflow-hidden border border-stone-200/80 shadow-2xl bg-white/90 max-h-[80vh]">
          <img
            src={lightboxImage.url}
            alt={lightboxImage.alt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain max-h-[80vh]"
          />

          {/* Color Label Badge */}
          <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200 flex items-center space-x-2 text-xs text-stone-900 shadow-sm">
            <span className="w-3 h-3 rounded-full border border-stone-300" style={{ backgroundColor: activeColor.code }} />
            <span className="font-bold text-rose-700">{activeColor.nameBn}</span>
            <span className="text-stone-600">({activeColor.name})</span>
          </div>
        </div>

        <p className="text-xs text-stone-100 flex items-center gap-1.5 font-medium drop-shadow-sm">
          <ZoomIn className="w-3.5 h-3.5 text-white" />
          <span>{lightboxImage.alt || 'হাই-রেজোলিউশন প্রডাক্ট ফটোগ্রাফি'}</span>
        </p>
      </div>
    </div>
  );
};
