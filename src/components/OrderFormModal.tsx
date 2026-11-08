import React, { useState, useEffect, useMemo } from 'react';
import { X, ShoppingBag, Check, MapPin, Phone, User, Home, MessageCircle, Plus, Minus, AlertCircle, ArrowRight, ArrowLeft, Palette, Building2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DeliveryZone, Product, OrderItem } from '../types';
import { createWhatsAppUrl, WHATSAPP_PHONE_DISPLAY } from '../utils/whatsapp';

export const OrderFormModal: React.FC = () => {
  const {
    products,
    product,
    selectedProductId,
    isOrderModalOpen,
    setIsOrderModalOpen,
    placeOrder,
    theme
  } = useStore();

  // Step state: 1 = Product Selection & Quantity, 2 = Customer Info & Delivery
  const [step, setStep] = useState<1 | 2>(1);

  // Map of selected product IDs: { [productId: string]: boolean }
  const [selectedProductIds, setSelectedProductIds] = useState<Record<string, boolean>>({});

  // Map of independent product quantities: { [productId: string]: number }
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Customer information fields (Bengali)
  const [preferredColors, setPreferredColors] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [thana, setThana] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside_dhaka');
  const [paymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [note, setNote] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOrderModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOrderModalOpen]);

  // Available visible products catalog
  const visibleProducts = useMemo(() => {
    const list = (products || []).filter(p => p && p.isVisible !== false);
    return list.length > 0 ? list : (product ? [product] : []);
  }, [products, product]);

  // Synchronize initial selection when modal opens
  useEffect(() => {
    if (!isOrderModalOpen) return;

    // Reset step to 1 on opening
    setStep(1);
    setErrorMessage('');

    // Pre-select the clicked product with quantity 1
    const targetId = selectedProductId || visibleProducts[0]?.id || 'jm-fashion-kurti-01';

    const initialSelections: Record<string, boolean> = {};
    const initialQuantities: Record<string, number> = {};

    visibleProducts.forEach(p => {
      if (p.id === targetId) {
        initialSelections[p.id] = true;
        initialQuantities[p.id] = 1;
      } else {
        initialSelections[p.id] = false;
        initialQuantities[p.id] = 1;
      }
    });

    setSelectedProductIds(initialSelections);
    setQuantities(initialQuantities);
  }, [isOrderModalOpen, selectedProductId, visibleProducts]);

  if (!isOrderModalOpen) return null;

  // Toggle selection for a product
  const toggleProductSelection = (prodId: string) => {
    setErrorMessage('');
    setSelectedProductIds(prev => ({
      ...prev,
      [prodId]: !prev[prodId]
    }));

    setQuantities(prev => ({
      ...prev,
      [prodId]: prev[prodId] || 1
    }));
  };

  // Adjust quantity for a specific product
  const updateProductQuantity = (prodId: string, delta: number) => {
    setErrorMessage('');
    setQuantities(prev => {
      const current = prev[prodId] || 1;
      const next = current + delta;
      if (next < 1) return prev;
      return { ...prev, [prodId]: next };
    });

    // Auto-select product if adjusting quantity
    setSelectedProductIds(prev => ({
      ...prev,
      [prodId]: true
    }));
  };

  // List of currently selected products
  const selectedProducts = visibleProducts.filter(p => selectedProductIds[p.id]);

  // Calculate Subtotal for selected products
  const runningSubtotal = selectedProducts.reduce((sum, p) => {
    const qty = quantities[p.id] || 1;
    const price = Number(p.basePrice) || 120;
    return sum + (price * qty);
  }, 0);

  // Delivery fee calculation
  const deliveryFee = deliveryZone === 'inside_dhaka' ? 100 : 130;
  const totalAmount = runningSubtotal + deliveryFee;

  // Move from Step 1 -> Step 2
  const handleNextStep = () => {
    setErrorMessage('');
    if (selectedProducts.length === 0) {
      setErrorMessage('অনুগ্রহ করে কমপক্ষে ১টি পণ্য নির্বাচন করুন।');
      return;
    }
    setStep(2);
  };

  // Move back from Step 2 -> Step 1
  const handlePrevStep = () => {
    setErrorMessage('');
    setStep(1);
  };

  // Submit Order on Step 2
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isSubmitting) return;

    if (selectedProducts.length === 0) {
      setErrorMessage('অনুগ্রহ করে কমপক্ষে ১টি পণ্য নির্বাচন করুন।');
      setStep(1);
      return;
    }

    // Required fields validation
    if (!preferredColors.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার পছন্দের কালারগুলো লিখুন।');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন।');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      setErrorMessage('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (যেমন: 01700000000)');
      return;
    }

    if (!thana.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার থানার নাম লিখুন।');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build order items list
      const customOrderItems: OrderItem[] = selectedProducts.map(p => {
        const qty = quantities[p.id] || 1;
        const unitPrice = Number(p.basePrice) || 120;
        const img = p.colors?.find(c => c.images && c.images.length > 0)?.images[0]?.url || p.colors?.[0]?.images?.[0]?.url || p.heroBanners?.[0]?.imageUrl || '/assets/products/banner_5models.png';

        return {
          productId: p.id,
          productName: p.nameBn || p.name,
          colorId: p.defaultColorId || p.colors?.[0]?.id || 'default-color',
          colorName: 'Any Available Colour',
          colorNameBn: preferredColors.trim(),
          colorCode: '#E6004C',
          size: 'Free Size',
          quantity: qty,
          unitPrice: unitPrice,
          totalPrice: unitPrice * qty,
          imageUrl: img
        };
      });

      await placeOrder(
        {
          name: name.trim(),
          phone: cleanPhone,
          thana: thana.trim(),
          address: address.trim(),
          preferredColors: preferredColors.trim(),
          deliveryZone,
          note: note.trim()
        },
        paymentMethod,
        undefined,
        undefined,
        undefined,
        customOrderItems,
        runningSubtotal,
        deliveryFee,
        totalAmount
      );
    } catch (err) {
      setErrorMessage('অর্ডার করার সময় সমস্যা দেখা দিয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white/95 backdrop-blur-2xl border border-pink-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative my-auto animate-scaleUp text-stone-900 theme-transition">
        
        {/* Modal Header with 2-Step Progress Indicator */}
        <div className="bg-[#FFF5F7] p-4 sm:p-5 border-b border-pink-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E6004C] text-white flex items-center justify-center shadow-xs font-bold text-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#1A1A1A]">
                  অর্ডার ফরম (JM FASHION Checkout)
                </h3>
                <p className="text-[11px] text-pink-700 font-medium">
                  সহজ ২ ধাপে আপনার অর্ডার সম্পূর্ণ করুন
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOrderModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white hover:bg-pink-100 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer border border-pink-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2-Step Progress Bar Header */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                step === 1
                  ? 'bg-[#E6004C] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-pink-200 hover:bg-pink-50'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">১</span>
              <span>পণ্য নির্বাচন</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                step === 2
                  ? 'bg-[#E6004C] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-pink-200 hover:bg-pink-50'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">২</span>
              <span>ডেলিভারি তথ্য</span>
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto bg-white">

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 text-rose-800 text-xs p-3 rounded-2xl border border-rose-200 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ====================================================================
              PAGE 1: PRODUCT SELECTION & QUANTITY
             ==================================================================== */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Header Note for Step 1 */}
              <div className="bg-[#FFF5F7] p-3 rounded-2xl border border-pink-200 text-xs text-stone-700 font-medium flex items-center justify-between">
                <span>অর্ডারের জন্য পছন্দমতো পণ্য টিক দিন এবং পরিমাণ নির্বাচন করুন:</span>
                <span className="text-[11px] font-bold text-[#E6004C] bg-white px-2 py-0.5 rounded-full border border-pink-200">
                  {visibleProducts.length}টি কালেকশন
                </span>
              </div>

              {/* Product Selection List matching reference mockup */}
              <div className="space-y-2.5 max-h-[52vh] overflow-y-auto pr-0.5 scrollbar-thin">
                {visibleProducts.map((p) => {
                  const isSelected = Boolean(selectedProductIds[p.id]);
                  const qty = quantities[p.id] || 1;
                  const price = Number(p.basePrice) || 120;
                  const img = p.colors?.find(c => c.images && c.images.length > 0)?.images[0]?.url || p.colors?.[0]?.images?.[0]?.url || p.heroBanners?.[0]?.imageUrl || '/assets/products/banner_5models.png';

                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleProductSelection(p.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                        isSelected
                          ? 'bg-rose-50/70 border-[#E6004C] ring-1 ring-[#E6004C]/30 shadow-xs'
                          : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      {/* Left: Checkbox & Product Image */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        {/* Custom Checkbox Toggle */}
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-[#E6004C] border-[#E6004C] text-white shadow-xs'
                              : 'bg-white border-stone-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        {/* Product Image */}
                        <div className="w-14 h-16 bg-[#FFF5F7] rounded-xl border border-pink-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={img}
                            alt={p.nameBn || p.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug line-clamp-1">
                            {p.nameBn || p.name}
                          </h4>
                          <span className="text-xs font-extrabold text-[#E6004C] font-sans block mt-0.5">
                            ৳{price} <span className="text-[10px] text-stone-400 font-normal">/ পিস</span>
                          </span>
                        </div>
                      </div>

                      {/* Right: Quantity Stepper Controls */}
                      <div
                        className="flex items-center space-x-1.5 shrink-0 bg-white border border-stone-200 rounded-xl p-1 shadow-2xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => updateProductQuantity(p.id, -1)}
                          disabled={qty <= 1}
                          className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                          title="কমান"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="w-7 text-center text-xs font-bold font-mono text-stone-900">
                          {qty}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateProductQuantity(p.id, 1)}
                          className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-pink-100 hover:text-[#E6004C] text-stone-800 flex items-center justify-center cursor-pointer"
                          title="বাড়ান"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Running Subtotal & Next Step CTA */}
              <div className="bg-[#FFF5F7] p-4 rounded-2xl border border-pink-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                  <span>সিলেক্টকৃত পণ্য ({selectedProducts.length}টি):</span>
                  <span className="text-sm font-extrabold text-[#E6004C] font-sans">
                    সাবটোটাল: ৳{runningSubtotal.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-[#E6004C] hover:bg-[#D00040] text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center space-x-2 shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  <span>পরবর্তী ধাপে যান</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

            </div>
          )}

          {/* ====================================================================
              PAGE 2: CUSTOMER INFORMATION & DELIVERY
             ==================================================================== */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Clear Availability Note Banner matching exact prompt text */}
              <div className="bg-pink-50 border border-pink-200/90 rounded-2xl p-3 text-xs sm:text-sm text-pink-950 font-medium text-center shadow-2xs leading-relaxed">
                🌈 আমাদের কাছে সব ধরনের কালার available আছে। আপনার পছন্দের কালারগুলো লিখে দিন। ❤️
              </div>

              {/* Bengali Input Fields */}
              <div className="space-y-3">

                {/* Field 1: Preferred Colors */}
                <div>
                  <label className="text-xs text-stone-800 block mb-1 font-bold flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#E6004C]" />
                    <span>আপনার পছন্দের কালারগুলো লিখুন *</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={preferredColors}
                    onChange={(e) => setPreferredColors(e.target.value)}
                    placeholder="আপনার পছন্দের কালারগুলো লিখুন..."
                    className="w-full bg-stone-50/90 border border-stone-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#E6004C]"
                  />
                </div>

                {/* Field 2: Full Name */}
                <div>
                  <label className="text-xs text-stone-800 block mb-1 font-bold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#E6004C]" />
                    <span>আপনার নাম লিখুন *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                      className="w-full bg-stone-50/90 border border-stone-200 rounded-xl px-3.5 py-2.5 pl-9 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#E6004C]"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Field 3: Phone Number */}
                <div>
                  <label className="text-xs text-stone-800 block mb-1 font-bold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#E6004C]" />
                    <span>আপনার মোবাইল নম্বর লিখুন *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="আপনার মোবাইল নম্বর লিখুন"
                      className="w-full bg-stone-50/90 border border-stone-200 rounded-xl px-3.5 py-2.5 pl-9 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#E6004C] font-mono"
                    />
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Field 4: Thana Name */}
                <div>
                  <label className="text-xs text-stone-800 block mb-1 font-bold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#E6004C]" />
                    <span>আপনার থানা লিখুন *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={thana}
                      onChange={(e) => setThana(e.target.value)}
                      placeholder="আপনার থানার নাম লিখুন"
                      className="w-full bg-stone-50/90 border border-stone-200 rounded-xl px-3.5 py-2.5 pl-9 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#E6004C]"
                    />
                    <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Field 5: Delivery Address */}
                <div>
                  <label className="text-xs text-stone-800 block mb-1 font-bold flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-[#E6004C]" />
                    <span>ডেলিভারি ঠিকানা লিখুন *</span>
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
                      className="w-full bg-stone-50/90 border border-stone-200 rounded-xl px-3.5 py-2.5 pl-9 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#E6004C]"
                    />
                    <Home className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Field 6: Delivery Area Selection */}
                <div>
                  <label className="text-xs text-stone-800 block mb-1.5 font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E6004C]" />
                    <span>ডেলিভারি এলাকা নির্বাচন করুন *</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeliveryZone('inside_dhaka')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        deliveryZone === 'inside_dhaka'
                          ? 'bg-rose-50/80 border-[#E6004C] ring-1 ring-[#E6004C] shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">📍 ঢাকার মধ্যে</span>
                        {deliveryZone === 'inside_dhaka' ? (
                          <div className="w-4 h-4 rounded-full bg-[#E6004C] text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-stone-300 bg-white" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#E6004C] block mt-1">চার্জ: 100৳</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryZone('outside_dhaka')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        deliveryZone === 'outside_dhaka'
                          ? 'bg-rose-50/80 border-[#E6004C] ring-1 ring-[#E6004C] shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">📍 ঢাকার বাইরে</span>
                        {deliveryZone === 'outside_dhaka' ? (
                          <div className="w-4 h-4 rounded-full bg-[#E6004C] text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-stone-300 bg-white" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#E6004C] block mt-1">চার্জ: 130৳</span>
                    </button>
                  </div>
                </div>

                {/* Optional Note */}
                <div>
                  <label className="text-xs text-stone-600 block mb-1 font-medium">অতিরিক্ত নোট বা তথ্য (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="যেমন: বিকালের দিকে ডেলিভারি দিলে ভালো হয়"
                    className="w-full bg-stone-50/90 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#E6004C]"
                  />
                </div>

              </div>

              {/* Order Pricing Calculation Summary */}
              <div className="bg-stone-50/90 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>বাছাইকৃত পণ্যমূল্য ({selectedProducts.length}টি প্রডাক্ট):</span>
                  <span className="font-mono text-stone-900 font-bold">৳{runningSubtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>ডেলিভারি চার্জ ({deliveryZone === 'inside_dhaka' ? 'ঢাকার মধ্যে' : 'ঢাকার বাইরে'}):</span>
                  <span className="font-mono text-stone-900 font-bold">৳{deliveryFee}</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-200 pt-2">
                  <span>সর্বমোট বিল (Total):</span>
                  <span className="font-serif text-[#E6004C] text-base font-bold">৳{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Page 2 Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-full bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>আগের ধাপে ফিরে যান</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#E6004C] hover:bg-[#D00040] text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-md active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>অর্ডার প্রসেস হচ্ছে...</span>
                  ) : (
                    <span>অর্ডার কনফার্ম করুন</span>
                  )}
                </button>
              </div>

              {/* Direct WhatsApp Option */}
              <div className="pt-1">
                <a
                  href={createWhatsAppUrl({
                    customerName: name || undefined,
                    phone: phone.trim().replace(/\D/g, '') || undefined,
                    address: address || undefined,
                    thana: thana || undefined,
                    preferredColors: preferredColors || undefined,
                    deliveryZone,
                    subtotal: runningSubtotal,
                    deliveryFee,
                    totalAmount
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 font-semibold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors shadow-xs"
                >
                  <div className="w-4 h-4 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-2.5 h-2.5 fill-white" />
                  </div>
                  <span>WhatsApp-এ সরাসরি অর্ডার করুন ({WHATSAPP_PHONE_DISPLAY})</span>
                </a>
              </div>

            </div>
          )}

        </form>

      </div>
    </div>
  );
};
