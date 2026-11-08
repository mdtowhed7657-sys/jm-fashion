import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadImageToFirebaseStorage } from '../../lib/firebase';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Edit3,
  Eye,
  Plus,
  ArrowUp,
  ArrowDown,
  Monitor,
  Smartphone,
  Check,
  X,
  AlertCircle,
  Link as LinkIcon,
  Tag,
  Layers,
  RotateCcw,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HeroBanner } from '../../types';

interface HeroBannerManagementProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const HeroBannerManagement: React.FC<HeroBannerManagementProps> = ({ onShowToast }) => {
  const {
    heroBanners,
    activeHeroBanner,
    isHeroBannerEnabled,
    addHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
    setActiveHeroBanner,
    reorderHeroBanners,
    setIsHeroBannerEnabled
  } = useStore();

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<HeroBanner | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Form State for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formTitleBn, setFormTitleBn] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formBadgeText, setFormBadgeText] = useState('🔥 ৫ পিস ৫০০৳ ধামাকা অফার');
  const [formLinkUrl, setFormLinkUrl] = useState('#main-product-area');
  const [formIsActive, setFormIsActive] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingBanner(null);
    setFormTitle('New Promotional Hero Banner');
    setFormTitleBn('নতুন স্পেশাল অফার ব্যানার');
    setFormImageUrl('');
    setFormBadgeText('🔥 ৫ পিস ৫০০৳ ধামাকা অফার');
    setFormLinkUrl('#main-product-area');
    setFormIsActive(heroBanners.length === 0);
    setShowAddModal(true);
  };

  const openEditModal = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setFormTitle(banner.title);
    setFormTitleBn(banner.titleBn || '');
    setFormImageUrl(banner.imageUrl);
    setFormBadgeText(banner.badgeText || '');
    setFormLinkUrl(banner.linkUrl || '#main-product-area');
    setFormIsActive(banner.isActive);
    setShowAddModal(true);
  };

  // State for upload loading
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Handle local file selection and upload directly to Firebase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('অনুগ্রহ করে একটি সঠিক ইমেজ ফাইল (.jpg, .png, .webp) নির্বাচন করুন', 'error');
      return;
    }

    setIsUploading(true);
    onShowToast('ফায়ারবেস স্টোরেজে ছবি আপলোড হচ্ছে...', 'info');

    try {
      const permanentUrl = await uploadImageToFirebaseStorage(file, 'hero-banners');
      setFormImageUrl(permanentUrl);
      onShowToast('ছবি সফলভাবে ফায়ারবেসে আপলোড এবং সেভ হয়েছে!', 'success');
    } catch (err: any) {
      console.error('File upload error:', err);
      onShowToast(`ছবি আপলোড ব্যর্থ হয়েছে: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Form Submit
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formImageUrl.trim()) {
      onShowToast('ব্যানারের ছবির URL বা ফাইল সিলেক্ট করা আবশ্যক', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      if (editingBanner) {
        await updateHeroBanner(editingBanner.id, {
          title: formTitle.trim() || 'Hero Banner',
          titleBn: formTitleBn.trim() || 'হিরো ব্যানার',
          imageUrl: formImageUrl.trim(),
          badgeText: formBadgeText.trim(),
          linkUrl: formLinkUrl.trim(),
          isActive: formIsActive
        });
        onShowToast('ব্যানার সফলভাবে ফায়ারবেসে সেভ করা হয়েছে!', 'success');
      } else {
        await addHeroBanner({
          title: formTitle.trim() || 'Hero Banner',
          titleBn: formTitleBn.trim() || 'হিরো ব্যানার',
          imageUrl: formImageUrl.trim(),
          badgeText: formBadgeText.trim(),
          linkUrl: formLinkUrl.trim(),
          isActive: formIsActive,
          aspectRatio: 'auto'
        });
        onShowToast('নতুন ব্যানার সফলভাবে ফায়ারবেসে যুক্ত ও সেভ হয়েছে!', 'success');
      }
      setShowAddModal(false);
    } catch (err: any) {
      onShowToast(err.message || 'ফায়ারবেসে ব্যানার সেভ করতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!bannerToDelete) return;
    setIsProcessing(true);
    try {
      await deleteHeroBanner(bannerToDelete.id);
      onShowToast('ব্যানার সফলভাবে মুছে ফেলা হয়েছে!', 'success');
      setBannerToDelete(null);
    } catch (err: any) {
      onShowToast(err.message || 'ব্যানার ডিলিট করতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Move Up / Move Down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= heroBanners.length) return;

    const updated = [...heroBanners];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    try {
      await reorderHeroBanners(updated);
      onShowToast('ব্যানারের ক্রম পরিবর্তন করা হয়েছে', 'info');
    } catch (err: any) {
      onShowToast(err.message || 'ব্যানারের ক্রম সেভ করতে সমস্যা হয়েছে', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header & Global Toggle */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-serif">
                হিরো অফার ব্যানার ম্যানেজমেন্ট (Hero Banner System)
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                ওয়েবসাইটের প্রধান হিরো সেকশনের ধামাকা অফার ব্যানার নিয়ন্ত্রণ করুন
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Add Button */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Toggle Switch */}
          <div className="flex items-center space-x-2 bg-stone-50 px-3.5 py-2 rounded-2xl border border-stone-200">
            <span className="text-xs font-semibold text-stone-700">
              হিরো ব্যানার প্রদর্শন:
            </span>
            <button
              type="button"
              onClick={async () => {
                const next = !isHeroBannerEnabled;
                try {
                  await setIsHeroBannerEnabled(next);
                  onShowToast(next ? 'হিরো ব্যানার প্রদর্শন সক্রিয় করা হয়েছে' : 'হিরো ব্যানার প্রদর্শন নিষ্ক্রিয় করা হয়েছে', 'info');
                } catch (err: any) {
                  onShowToast(err.message || 'ব্যানার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে', 'error');
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                isHeroBannerEnabled ? 'bg-emerald-600' : 'bg-stone-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isHeroBannerEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-[11px] font-bold ${isHeroBannerEnabled ? 'text-emerald-700' : 'text-stone-500'}`}>
              {isHeroBannerEnabled ? 'অন (Active)' : 'অফ (Disabled)'}
            </span>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ব্যানার যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Live Preview Simulator Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              গ্রাহক প্রিভিউ (Live Customer Preview)
            </span>
            <h4 className="text-base font-bold text-stone-900 mt-1 font-serif">
              বর্তমানে ওয়েবসাইটে প্রদর্শিত সক্রিয় ব্যানার
            </h4>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center space-x-1.5 bg-stone-100 p-1 rounded-2xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                previewDevice === 'desktop' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>ডেস্কটপ ভিউ</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                previewDevice === 'mobile' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>মোবাইল ভিউ</span>
            </button>
          </div>
        </div>

        {/* Simulator Frame */}
        <div className="bg-stone-100/70 p-4 sm:p-6 rounded-2xl border border-stone-200/80 flex items-center justify-center overflow-hidden">
          <div
            className={`transition-all duration-300 bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden ${
              previewDevice === 'mobile' ? 'w-full max-w-[340px]' : 'w-full max-w-2xl'
            }`}
          >
            {/* Mock Store Header Bar */}
            <div className="bg-stone-900 text-white px-3 py-1.5 flex items-center justify-between text-[11px] font-medium">
              <span className="font-bold">JM FASHION • {activeHeroBanner?.badgeText || '৫ পিস ৫০০৳ অফার'}</span>
              <span className="text-[10px] text-amber-400 bg-white/10 px-2 py-0.5 rounded-full">
                {isHeroBannerEnabled ? 'ব্যানার সক্রিয়' : 'ব্যানার বন্ধ'}
              </span>
            </div>

            {/* Banner Image Container with Zero-Crop Contain */}
            <div className="bg-stone-50 p-2 flex items-center justify-center">
              {activeHeroBanner ? (
                <img
                  src={activeHeroBanner.imageUrl}
                  alt={activeHeroBanner.altText || activeHeroBanner.titleBn || 'Hero Banner'}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[360px] object-contain rounded-xl block mx-auto shadow-xs"
                />
              ) : (
                <div className="py-12 text-center text-stone-400 text-xs">
                  কোনো সক্রিয় ব্যানার নেই
                </div>
              )}
            </div>

            {/* Mock Bottom Details */}
            <div className="p-3 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800">
                {activeHeroBanner?.titleBn || '৫ পিস ৫০০৳ স্পেশাল অফার ব্যানার'}
              </span>
              <button
                type="button"
                onClick={() => activeHeroBanner && openEditModal(activeHeroBanner)}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>পরিবর্তন করুন</span>
              </button>
            </div>
          </div>
        </div>

        {/* Aspect Ratio Guarantee Notice */}
        <div className="flex items-start space-x-2 text-xs text-stone-500 bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            <strong className="text-stone-800">জিরো-ক্রপ গ্যারান্টি:</strong> আপনার আপলোড করা যে কোনো সাইজ বা রেশিওর ব্যানার (লম্বা, চওড়া বা স্কয়ার) স্বয়ংক্রিয়ভাবে ১০০% সম্পূর্ণ এবং নিখুঁতভাবে প্রদর্শিত হবে। কোনো টেক্সট বা ছবি কেটে যাবে না।
          </p>
        </div>
      </div>

      {/* All Banners List (Multiple Banners & Future-Ready) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h4 className="text-base font-bold text-stone-900 font-serif">
              সংরক্ষিত সব হিরো ব্যানার তালিকা ({heroBanners.length}টি ব্যানার)
            </h4>
            <p className="text-xs text-stone-500 font-medium">
              একাধিক ব্যানার রাখতে পারবেন এবং যে কোনো সময় একটিকে এক ক্লিকে সক্রিয় করতে পারবেন
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন ব্যানার</span>
          </button>
        </div>

        {/* Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {heroBanners.map((banner, index) => {
            const isActive = banner.isActive;

            return (
              <div
                key={banner.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col bg-white ${
                  isActive 
                    ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
                    : 'border-stone-200 hover:border-stone-300 shadow-xs'
                }`}
              >
                {/* Banner Thumbnail View */}
                <div className="relative bg-stone-100 p-2 aspect-[16/10] flex items-center justify-center overflow-hidden border-b border-stone-100">
                  <img
                    src={banner.imageUrl}
                    alt={banner.titleBn || banner.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain rounded-lg"
                  />

                  {/* Active / Inactive Badge */}
                  <div className="absolute top-3 left-3">
                    {isActive ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>বর্তমানে সক্রিয়</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-800/80 text-white font-medium text-[10px]">
                        নিষ্ক্রিয়
                      </span>
                    )}
                  </div>

                  {/* Move Up/Down Controls */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/90 backdrop-blur-md rounded-xl p-1 shadow-xs border border-stone-200">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className={`p-1 rounded-lg transition-colors ${
                        index === 0 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-700 hover:bg-stone-100 cursor-pointer'
                      }`}
                      title="উপরে নিন"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === heroBanners.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className={`p-1 rounded-lg transition-colors ${
                        index === heroBanners.length - 1 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-700 hover:bg-stone-100 cursor-pointer'
                      }`}
                      title="নিচে নিন"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Banner Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h5 className="font-bold text-sm text-stone-900 font-serif line-clamp-1">
                      {banner.titleBn || banner.title}
                    </h5>
                    <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                      {banner.badgeText || 'কোনো ব্যাজ টেক্সট নেই'}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveHeroBanner(banner.id);
                          onShowToast(`"${banner.titleBn || banner.title}" ব্যানারটি সক্রিয় করা হয়েছে!`, 'success');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center space-x-1 border border-emerald-200 cursor-pointer transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>সক্রিয় করুন</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>সক্রিয় আছে</span>
                      </span>
                    )}

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(banner)}
                        className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerToDelete(banner)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================== MODAL: ADD / EDIT BANNER ===================== */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-stone-200 p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl text-stone-900"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-bold text-stone-900 font-serif">
                    {editingBanner ? 'হিরো ব্যানার সম্পাদনা করুন' : 'নতুন হিরো ব্যানার আপলোড করুন'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBanner} className="space-y-4">
                
                {/* Upload & Image URL Input */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-stone-800 block">
                    ব্যানার ছবি আপলোড বা ছবির লিংক (Image URL)*
                  </label>

                  {/* Local File Upload Box */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 hover:border-amber-500 bg-stone-50 hover:bg-amber-50/40 p-4 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-stone-600 group-hover:text-amber-600">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800">
                        ডিভাইস থেকে ছবি নির্বাচন করুন (Upload Image)
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        JPG, PNG, WebP ফাইল সাপোর্ট করে (কোনো রিসাইজ বা ক্রপ ছাড়া সম্পূর্ণ ছবি লোড হবে)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* OR Divider */}
                  <div className="flex items-center my-2">
                    <div className="flex-1 border-t border-stone-200" />
                    <span className="px-3 text-[11px] font-bold text-stone-400 uppercase">অথবা সরাসরি URL দিন</span>
                    <div className="flex-1 border-t border-stone-200" />
                  </div>

                  {/* Direct Image URL input */}
                  <div>
                    <input
                      type="url"
                      required
                      placeholder="https://i.ibb.co.com/... অথবা ছবির লিংক পেস্ট করুন"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* Default Offer Banner Preset Shortcut */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFormImageUrl('https://i.ibb.co.com/fV6MtqYm/image.png');
                        setFormTitleBn('৫ পিস ৫০০৳ স্পেশাল অফার ব্যানার');
                        setFormBadgeText('🔥 ৫ পিস ৫০০৳ ধামাকা অফার');
                        onShowToast('৫ পিস ৫০০৳ অফার ব্যানারের লিংক লোড করা হয়েছে', 'info');
                      }}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                    >
                      + ৫ পিস ৫০০৳ ডিফল্ট ব্যানার লিংক লোড করুন
                    </button>
                  </div>
                </div>

                {/* Instant Live Preview inside Modal */}
                {formImageUrl && (
                  <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      ছবির প্রিভিউ (Preview):
                    </span>
                    <div className="bg-white rounded-xl p-2 border border-stone-200 flex items-center justify-center max-h-56 overflow-hidden">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-auto max-h-48 object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Banner Bangla Title */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    ব্যানারের নাম (বাংলা):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: ৫ পিস ৫০০৳ ধামাকা অফার ব্যানার / ঈদ স্পেশাল ব্যানার"
                    value={formTitleBn}
                    onChange={(e) => setFormTitleBn(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-sans focus:outline-none focus:border-black"
                  />
                </div>

                {/* Badge Text */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    হাইলাইট ব্যাজ টেক্সট (Badge Text):
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: 🔥 ৫ পিস ৫০০৳ স্পেশাল অফার"
                    value={formBadgeText}
                    onChange={(e) => setFormBadgeText(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-sans focus:outline-none focus:border-black"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="formIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-black border-stone-300 cursor-pointer"
                  />
                  <label htmlFor="formIsActive" className="text-xs font-bold text-stone-800 cursor-pointer">
                    এই ব্যানারটিকে সাথে সাথে সক্রিয় (Active) হিসেবে সেভ করুন
                  </label>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs hover:bg-stone-200 font-medium cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {editingBanner ? 'পরিবর্তন সেভ করুন' : 'ব্যানার সেভ ও প্রকাশ করুন'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================== MODAL: DELETE CONFIRMATION ===================== */}
      <AnimatePresence>
        {bannerToDelete && (
          <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-stone-200 p-6 w-full max-w-md space-y-4 shadow-2xl text-stone-900"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-base font-bold text-stone-900 font-serif">
                  ব্যানার মুছে ফেলতে চান?
                </h4>
                <p className="text-xs text-stone-500">
                  "{bannerToDelete.titleBn || bannerToDelete.title}" ব্যানারটি স্থায়ীভাবে মুছে যাবে।
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBannerToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs hover:bg-stone-200 font-medium cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={confirmDelete}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
                >
                  হ্যাঁ, মুছে ফেলুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
