import React from 'react';
import { ShieldCheck, Phone, MapPin, Mail, Heart, MessageCircle } from 'lucide-react';
import { createWhatsAppUrl, WHATSAPP_PHONE_DISPLAY } from '../utils/whatsapp';

export const Footer: React.FC = () => {
  const whatsappUrl = createWhatsAppUrl();

  return (
    <footer className="bg-stone-50/80 backdrop-blur-md text-stone-700 border-t border-stone-200/80 pt-12 pb-24 lg:pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs tracking-tighter">
                JM
              </div>
              <span className="text-lg font-serif font-bold text-[#1A1A1A] tracking-widest uppercase">
                JM FASHION
              </span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              জেএম ফ্যাশন (JM Fashion) - বাংলাদেশের অন্যতম শীর্ষ স্থানীয় ব্র্যান্ডড অনলাইন ফ্যাশন হাউজ। অরিজিনাল ভিসকস ভেলভেট সিল্ক ও আভিজাত্যময় কারুকাজে তৈরি এক্সক্লুসিভ কালেকশন।
            </p>
            <div className="flex items-center space-x-2 text-emerald-700 text-[11px] font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>১০০% অরিজিনাল কোয়ালিটি নিশ্চিত</span>
            </div>
          </div>

          {/* Contact & Helpline */}
          <div className="space-y-2.5">
            <h4 className="text-[#1A1A1A] font-bold text-sm font-serif">
              হেল্পলাইন ও কাস্টমার কেয়ার
            </h4>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 p-2.5 rounded-xl transition-all font-medium group shadow-xs"
            >
              <div className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 block font-semibold">WhatsApp হেল্পলাইন:</span>
                <span className="font-mono font-bold text-xs text-emerald-950">{WHATSAPP_PHONE_DISPLAY}</span>
              </div>
            </a>
            <div className="flex items-center space-x-2 text-stone-700">
              <Phone className="w-3.5 h-3.5 text-stone-700 shrink-0" />
              <span className="font-mono">{WHATSAPP_PHONE_DISPLAY}</span>
            </div>
            <div className="flex items-center space-x-2 text-stone-700">
              <Mail className="w-3.5 h-3.5 text-stone-700 shrink-0" />
              <span>support@jmfashion.bd</span>
            </div>
            <div className="flex items-start space-x-2 text-stone-600">
              <MapPin className="w-3.5 h-3.5 text-stone-700 shrink-0 mt-0.5" />
              <span>লেভেল-৪, ব্লক-ডি, বসুন্ধরা সিটি / ধানমন্ডি, ঢাকা-১২০৫</span>
            </div>
          </div>

          {/* Policy Links */}
          <div className="space-y-2">
            <h4 className="text-[#1A1A1A] font-bold text-sm font-serif">
              জরুরি লিংক ও পলিসি
            </h4>
            <ul className="space-y-1.5 text-stone-600">
              <li><a href="#main-product-area" className="hover:text-black">অর্ডার করার নিয়ম</a></li>
              <li><a href="#main-product-area" className="hover:text-black">ডেলিভারি ও শিপিং পলিসি</a></li>
              <li><a href="#reviews" className="hover:text-black">কাস্টমার রিভিউ ও মতামত</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-stone-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-stone-500 text-[11px] gap-2">
          <p>© {new Date().getFullYear()} JM Fashion BD. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>for Premium Fashion Lovers in Bangladesh</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
