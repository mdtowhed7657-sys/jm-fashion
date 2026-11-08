import React, { useState } from 'react';
import { ChevronDown, HelpCircle, PhoneCall } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { WHATSAPP_PHONE_DISPLAY } from '../utils/whatsapp';

export const FAQSection: React.FC = () => {
  const { faqs, setIsOrderModalOpen, theme } = useStore();
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-12 bg-stone-50/80 text-stone-900 border-b border-stone-200 theme-transition">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Title */}
        <div className="text-center space-y-2">
          <div
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold theme-transition"
            style={{
              backgroundColor: theme.badgeBg,
              color: theme.badgeText,
              borderColor: theme.badgeBorder,
              borderWidth: '1px'
            }}
          >
            <HelpCircle className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            <span>সাধারণ জিজ্ঞাসা (FAQ)</span>
          </div>
          <h3 className="text-2xl font-serif font-medium text-[#1A1A1A]">
            জরুরি প্রশ্ন ও উত্তরসমূহ
          </h3>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white/80 backdrop-blur-md rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm transition-colors theme-transition"
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 focus:outline-none hover:bg-stone-50/50 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
                    {faq.questionBn}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-700 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-stone-700 leading-relaxed border-t border-stone-200/60 pt-3">
                    <p className="mb-1 text-stone-900">{faq.answerBn}</p>
                    <p className="text-stone-500 text-xs italic">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Banner */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-stone-200 shadow-sm text-center space-y-3 theme-transition">
          <h4 className="text-sm sm:text-base font-bold text-[#1A1A1A]">
            আরও কোনো প্রশ্ন রয়েছে? আমরা আপনাকে সাহায্য করতে প্রস্তুত!
          </h4>
          <p className="text-xs text-stone-600">
            যে কোনো সময় আমাদের কাস্টমার সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ করুন
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <a
              href={`tel:${WHATSAPP_PHONE_DISPLAY}`}
              className="bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold px-4 py-2.5 rounded-xl border border-stone-300 flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" style={{ color: theme.primary }} />
              <span>কল করুন: {WHATSAPP_PHONE_DISPLAY}</span>
            </a>

            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer theme-transition"
              style={{
                backgroundColor: theme.ctaBg,
                color: theme.ctaText,
                boxShadow: theme.ctaShadow
              }}
            >
              এখনই অর্ডার করুন
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
