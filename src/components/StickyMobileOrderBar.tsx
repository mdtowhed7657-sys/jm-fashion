import React from 'react';
import { Home, LayoutGrid, MessageCircle, User, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { createWhatsAppUrl } from '../utils/whatsapp';

export const StickyMobileOrderBar: React.FC = () => {
  const { product, activeColor, setIsOrderModalOpen, navigate, isAdminAuthenticated } = useStore();

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductsClick = () => {
    const el = document.getElementById('main-product-area');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAccountClick = () => {
    if (isAdminAuthenticated) {
      navigate('/admin');
    } else {
      navigate('/admin/login');
    }
  };

  const whatsappUrl = createWhatsAppUrl();
  const activePrice = activeColor?.priceOverride || product?.basePrice || 120;

  return (
    <>
      {/* Floating Quick Order Pill on Mobile right above the bottom tab bar */}
      <div className="fixed bottom-16 right-3 z-40 md:hidden">
        <button
          onClick={() => setIsOrderModalOpen(true)}
          className="bg-[#E6004C] hover:bg-[#D00040] text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-xl shadow-pink-500/30 active:scale-95 transition-all cursor-pointer border border-white/20"
        >
          <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>অর্ডার করুন • ৳{activePrice}</span>
        </button>
      </div>

      {/* Fixed Mobile Bottom Tab Bar matching reference design */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-pink-100 py-1.5 px-6 flex items-center justify-around md:hidden shadow-lg text-stone-900">
        {/* Home Tab */}
        <button
          type="button"
          onClick={handleHomeClick}
          className="flex flex-col items-center justify-center text-[#E6004C] group cursor-pointer relative py-1"
        >
          <Home className="w-5 h-5 fill-[#E6004C] stroke-[#E6004C]" />
          <span className="text-[10px] font-bold mt-0.5">Home</span>
          <span className="w-4 h-0.5 bg-[#E6004C] rounded-full mt-0.5" />
        </button>

        {/* Products Tab */}
        <button
          type="button"
          onClick={handleProductsClick}
          className="flex flex-col items-center justify-center text-gray-500 hover:text-[#E6004C] group cursor-pointer py-1"
        >
          <LayoutGrid className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-medium mt-0.5">Products</span>
        </button>

        {/* WhatsApp Tab */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center text-gray-500 hover:text-[#25D366] group cursor-pointer py-1"
        >
          <MessageCircle className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-medium mt-0.5">WhatsApp</span>
        </a>

        {/* Account Tab */}
        <button
          type="button"
          onClick={handleAccountClick}
          className="flex flex-col items-center justify-center text-gray-500 hover:text-[#E6004C] group cursor-pointer py-1"
        >
          <User className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-medium mt-0.5">Account</span>
        </button>
      </div>
    </>
  );
};
