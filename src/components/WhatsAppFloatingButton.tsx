import React from 'react';
import { MessageCircle } from 'lucide-react';
import { createWhatsAppUrl, WHATSAPP_PHONE_DISPLAY } from '../utils/whatsapp';

export const WhatsAppFloatingButton: React.FC = () => {
  const whatsappUrl = createWhatsAppUrl();

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-20 sm:bottom-24 lg:bottom-6 right-4 sm:right-6 z-30 flex flex-col items-end pointer-events-none select-none">
      {/* Main Floating WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp (01306318949)"
        className="pointer-events-auto group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xl shadow-[#25D366]/40 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white"
      >
        {/* Pulsing ring animation */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 group-hover:opacity-60 animate-ping pointer-events-none" />

        {/* WhatsApp Icon */}
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white drop-shadow-sm transition-transform group-hover:rotate-6" />

        {/* Online Status Dot */}
        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-300 border-2 border-white rounded-full shadow-xs" />

        {/* Desktop Hover Label Badge */}
        <span className="hidden lg:group-hover:inline-flex absolute right-full mr-3 whitespace-nowrap bg-stone-900/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg items-center gap-1.5 transition-all">
          <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
          <span>WhatsApp-এ সরাসরি কথা বলুন ({WHATSAPP_PHONE_DISPLAY})</span>
        </span>
      </a>
    </aside>
  );
};
