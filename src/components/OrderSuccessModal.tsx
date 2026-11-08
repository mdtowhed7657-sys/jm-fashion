import React from 'react';
import { CheckCircle2, ShoppingBag, Truck, Copy, Check, Printer, ArrowRight, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { createWhatsAppUrl, WHATSAPP_PHONE_DISPLAY } from '../utils/whatsapp';

export const OrderSuccessModal: React.FC = () => {
  const { isSuccessModalOpen, setIsSuccessModalOpen, recentOrder, theme } = useStore();
  const [copied, setCopied] = React.useState(false);

  if (!isSuccessModalOpen || !recentOrder) return null;

  const item = recentOrder.items[0];

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(recentOrder.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappUrl = createWhatsAppUrl({
    orderNumber: recentOrder.orderNumber,
    customerName: recentOrder.customer.name,
    phone: recentOrder.customer.phone,
    address: recentOrder.customer.address,
    deliveryZone: recentOrder.customer.deliveryZone,
    productName: item.productName,
    colorNameBn: item.colorNameBn,
    colorNameEn: item.colorName,
    selectedColors: item.selectedColors?.map(sc => ({
      colorNameBn: sc.colorNameBn,
      quantity: sc.quantity
    })),
    size: item.size,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: recentOrder.subtotal,
    deliveryFee: recentOrder.deliveryFee,
    totalAmount: recentOrder.totalAmount
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-2xl border border-stone-200/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative my-auto animate-scaleUp text-stone-900 p-6 sm:p-8 space-y-6 theme-transition">
        
        {/* Animated Checkmark Badge */}
        <div className="text-center space-y-3">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce theme-transition"
            style={{
              backgroundColor: theme.badgeBg,
              borderColor: theme.primary,
              borderWidth: '2px',
              color: theme.primary
            }}
          >
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="text-2xl font-serif font-bold text-[#1A1A1A]">
            আপনার অর্ডারটি সফল হয়েছে!
          </h3>

          <p className="text-xs sm:text-sm text-stone-600">
            ধন্যবাদ, <span className="font-bold text-black">{recentOrder.customer.name}</span>। আমাদের প্রতিনিধি খুব শীঘ্রই ফোন করে অর্ডার কনফার্ম করবেন।
          </p>
        </div>

        {/* Order Receipt ID Box */}
        <div className="bg-stone-50/90 p-4 rounded-2xl border border-stone-200/80 space-y-3 theme-transition">
          <div className="flex items-center justify-between text-xs border-b border-stone-200 pb-2">
            <span className="text-stone-600">অর্ডার নম্বর (Order ID):</span>
            <div className="flex items-center space-x-1.5 font-mono text-black font-bold">
              <span>#{recentOrder.orderNumber}</span>
              <button
                onClick={handleCopyOrderId}
                className="p-1 hover:text-stone-700 transition-colors cursor-pointer"
                title="Copy Order ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
              </button>
            </div>
          </div>

          {/* Ordered Items Details */}
          <div className="space-y-2.5 pt-1 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              অর্ডারকৃত পণ্যসমূহ ({recentOrder.items.length}টি):
            </span>
            {recentOrder.items.map((it, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-2 bg-white rounded-xl border border-stone-200/80">
                {it.imageUrl ? (
                  <img
                    src={it.imageUrl}
                    alt={it.productName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-14 object-contain bg-[#FFF5F7] rounded-lg border border-pink-100 shrink-0 p-0.5"
                  />
                ) : (
                  <div className="w-12 h-14 bg-stone-200 rounded-lg flex items-center justify-center text-stone-500 shrink-0 text-[10px]">
                    No Image
                  </div>
                )}
                <div className="flex-1 text-xs space-y-0.5">
                  <h4 className="font-bold text-stone-900 line-clamp-1">{it.productName}</h4>
                  <div className="flex items-center justify-between text-[#E6004C] font-semibold text-[11px]">
                    <span>{it.quantity} পিস × ৳{it.unitPrice}</span>
                    <span className="font-mono font-bold text-stone-900">৳{it.totalPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment & Delivery Summary */}
          <div className="border-t border-stone-200 pt-2.5 text-xs space-y-1.5 text-stone-700">
            <div className="flex justify-between">
              <span className="text-stone-600">কাস্টমার নাম:</span>
              <span className="font-bold text-stone-900">{recentOrder.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">মোবাইল নম্বর:</span>
              <span className="font-mono text-stone-900 font-bold">{recentOrder.customer.phone}</span>
            </div>
            {recentOrder.customer.thana && (
              <div className="flex justify-between">
                <span className="text-stone-600">থানা:</span>
                <span className="font-medium text-stone-900">{recentOrder.customer.thana}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-600">ডেলিভারি ঠিকানা:</span>
              <span className="text-right font-medium max-w-[200px] text-stone-900">{recentOrder.customer.address}</span>
            </div>
            {recentOrder.customer.preferredColors && (
              <div className="bg-pink-50/90 p-2 rounded-xl border border-pink-200/80 text-[11px] text-pink-950 font-medium">
                <strong>পছন্দের কালারসমূহ:</strong> {recentOrder.customer.preferredColors}
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="text-stone-600">ডেলিভারি এলাকা:</span>
              <span className="font-medium text-stone-900">
                {recentOrder.customer.deliveryZone === 'inside_dhaka' ? '📍 ঢাকার মধ্যে' : '📍 ঢাকার বাইরে'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">ডেলিভারি চার্জ:</span>
              <span className="font-mono text-stone-900 font-bold">৳{recentOrder.deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-black text-sm pt-1 border-t border-stone-200">
              <span>সর্বমোট প্রদানযোগ্য:</span>
              <span className="font-serif text-base font-bold text-[#E6004C]">
                ৳{recentOrder.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Expected Delivery Time */}
        <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200 flex items-center space-x-3 text-xs text-stone-700">
          <Truck className="w-5 h-5 shrink-0" style={{ color: theme.primary }} />
          <div>
            <span className="font-bold text-stone-900 block">আনুকূলিক ডেলিভারি সময়:</span>
            <span className="text-stone-600">
              {recentOrder.customer.deliveryZone === 'inside_dhaka' ? '২৪ থেকে ৪৮ ঘণ্টার মধ্যে' : '৪৮ থেকে ৭২ ঘণ্টার মধ্যে'}
            </span>
          </div>
        </div>

        {/* Direct WhatsApp Status Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors shadow-xs"
        >
          <div className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
            <MessageCircle className="w-3 h-3 fill-white" />
          </div>
          <span>WhatsApp-এ অর্ডার আপডেট জানতে মেসেজ দিন ({WHATSAPP_PHONE_DISPLAY})</span>
        </a>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={handlePrint}
            className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors border border-stone-300 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-stone-700" />
            <span>মানি রিসিভ প্রিন্ট করুন</span>
          </button>

          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="flex-1 font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer theme-transition"
            style={{
              backgroundColor: theme.ctaBg,
              color: theme.ctaText,
              boxShadow: theme.ctaShadow
            }}
          >
            <span>শপিং চালিয়ে যান</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
