import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Check, Tag, ShieldCheck, Heart, Eye, ArrowRight, Truck, Headphones } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ColorVariant } from '../types';

interface ProductCardProps {
  product: Product;
  color: ColorVariant;
  allColors?: ColorVariant[];
  onOrderNow: (product: Product, colorId: string) => void;
  onPreview: (color: ColorVariant) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  color,
  allColors = [],
  onOrderNow,
  onPreview
}) => {
  if (!product || !color) return null;

  const [selectedColor, setSelectedColor] = useState<ColorVariant>(color);

  // Sync state if color prop or product colors update from Firestore / Admin
  React.useEffect(() => {
    if (color && product?.colors) {
      const freshColor = product.colors.find(c => c && c.id === color.id);
      if (freshColor) {
        setSelectedColor(freshColor);
        return;
      }
    }
    if (color) {
      setSelectedColor(color);
    }
  }, [color, product]);

  const safeColors = Array.isArray(allColors) && allColors.length > 0 
    ? allColors 
    : (Array.isArray(product?.colors) ? product.colors : []);
  
  // Use product's actual configured price from Firestore
  const price = (product?.basePrice && Number(product.basePrice) > 0)
    ? Number(product.basePrice)
    : (Number(selectedColor?.priceOverride) || 120);
  const regularPrice = (product?.baseRegularPrice && Number(product.baseRegularPrice) > 0)
    ? Number(product.baseRegularPrice)
    : (Number(selectedColor?.regularPriceOverride) || Math.round(price * 1.3));

  // Check if bundle offer is explicitly configured for this product
  const hasBundle = Boolean(
    product?.bundleQuantity &&
    product?.bundlePrice &&
    Number(product.bundleQuantity) > 1 &&
    Number(product.bundlePrice) > 0
  );

  // Reliable image resolution: Color image -> Product Hero/Banner -> Product-specific designated image
  let defaultProdImage = '/assets/products/banner_5models.png';
  if (product?.id === 'prod-fishcut-petticoat') {
    defaultProdImage = '/assets/products/petticoat_black.png';
  } else if (product?.id === 'prod-lace-short-sleeve') {
    defaultProdImage = '/assets/products/blouse_pink_short.png';
  }

  // Only use color image if it genuinely exists, otherwise search product colors for any uploaded image
  const anyVariantImage = product?.colors?.find(c => c.images && c.images.length > 0)?.images[0]?.url;
  const colorImg = selectedColor?.images && selectedColor.images.length > 0
    ? selectedColor.images[0].url
    : (color?.images && color.images.length > 0 ? color.images[0].url : anyVariantImage);

  const displayImage = colorImg || product?.heroBanners?.[0]?.imageUrl || defaultProdImage;
  const badgeLabel = selectedColor?.tag?.includes('Best') || color?.id?.includes('black') || color?.id?.includes('pink') ? 'Hot' : 'New';

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-pink-100/70 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden p-2.5 sm:p-3 group">
      {/* Product Image Area matching reference mockup - enlarged with contain object-fit */}
      <div className="relative w-full aspect-square sm:aspect-square md:aspect-[4/5] min-h-[175px] sm:min-h-[220px] md:min-h-[270px] bg-[#FDF0F3] rounded-2xl p-1.5 sm:p-2 flex items-center justify-center overflow-hidden mb-2">
        {/* Top-left Pill Badge: New / Hot */}
        <span className="absolute top-2.5 left-2.5 z-10 bg-[#E6004C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs tracking-wide">
          {badgeLabel}
        </span>

        {/* Product Image (strictly object-fit: contain, preserved proportions, zero distortion) */}
        <img
          src={displayImage}
          alt={`${product?.name || 'Product'} - ${selectedColor?.name || ''}`}
          loading="lazy"
          className="w-full h-full object-contain max-h-[190px] sm:max-h-[240px] md:max-h-[290px] p-0.5 transition-transform duration-300 group-hover:scale-105 cursor-pointer drop-shadow-xs"
          onClick={() => onPreview(selectedColor)}
        />
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col justify-between space-y-2 px-0.5">
        <div>
          {/* Product Name (Clean & Readable) */}
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 leading-snug">
            {product?.nameBn || product?.name}
          </h3>

          {/* Premium Soft Pink Highlight Availability Message */}
          <div className="bg-pink-50/90 border border-pink-200/80 rounded-xl p-1.5 my-1.5 text-[10px] sm:text-[11px] text-pink-950 font-medium leading-snug shadow-2xs text-center">
            🌈 আমাদের কাছে সকল কালার available আছে। আপনার পছন্দের কালার স্টক থেকে পাঠানো হবে। ❤️
          </div>
        </div>

        {/* Price & Bundle Info */}
        <div className="pt-1 border-t border-pink-50">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold text-[#E6004C] font-sans">
              ৳{price}
            </span>
            {regularPrice > price && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">
                ৳{regularPrice}
              </span>
            )}
          </div>

          {/* Below it, show the bundle offer price if configured */}
          {product.bundleQuantity && product.bundlePrice && (
            <span className="text-[11px] font-bold text-[#E6004C] block mt-0.5 font-sans leading-tight">
              {product.bundleQuantity} পিস {product.bundlePrice}৳
            </span>
          )}
        </div>

        {/* Prominent Order Now Button below product image, name and price */}
        <button
          type="button"
          onClick={() => onOrderNow(product, selectedColor.id)}
          className="w-full mt-1.5 py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl bg-[#E6004C] hover:bg-[#D00040] active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer min-h-[42px] sm:min-h-[44px]"
          title="অর্ডার করুন"
          aria-label="Order Now"
        >
          <ShoppingBag className="w-4 h-4 stroke-[2.5] shrink-0" />
          <span>অর্ডার করুন</span>
        </button>
      </div>
    </div>
  );
};

export const MainProductSection: React.FC = () => {
  const { products, openOrderModalForProduct, setLightboxImage } = useStore();
  const [activeTabId, setActiveTabId] = useState<string>('all');

  // Filter products by visibility
  const visibleProducts = (products || []).filter(p => p && p.isVisible !== false);

  if (visibleProducts.length === 0) {
    return null;
  }

  const scrollToProductSection = (id: string) => {
    setActiveTabId(id);
    const el = document.getElementById(`product-section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="main-product-area" className="py-6 sm:py-10 bg-[#FFF5F7] text-stone-900 border-b border-pink-100/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        
        {/* Top Collection Header matching Reference Design: "Our Collection" & "View All →" */}
        <div className="flex items-center justify-between border-b border-pink-100/70 pb-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 font-sans tracking-tight">
              Our Collection
            </h2>
            <span className="text-xs font-bold text-[#E6004C] bg-pink-100 px-2.5 py-0.5 rounded-full">
              ৩টি স্পেশাল কালেকশন
            </span>
          </div>

          <button
            onClick={() => setActiveTabId('all')}
            className="text-xs sm:text-sm font-bold text-[#E6004C] hover:text-[#D00040] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Collection Filter Tabs */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTabId('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTabId === 'all'
                ? 'bg-[#E6004C] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-pink-50 hover:text-pink-600 border border-pink-200'
            }`}
          >
            সকল কালেকশন ({visibleProducts.length})
          </button>
          {visibleProducts.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => scrollToProductSection(p.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTabId === p.id
                  ? 'bg-[#E6004C] text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-pink-50 hover:text-pink-600 border border-pink-200'
              }`}
            >
              {idx + 1}. {p.name}
            </button>
          ))}
        </div>



        {/* 3 Dedicated Product Sections */}
        {visibleProducts.map((p, index) => {
          const productColors = Array.isArray(p?.colors) ? p.colors : [];
          const enabledColors = productColors.filter(c => c && c.isEnabled !== false);
          const colorsToDisplay = enabledColors.length > 0 ? enabledColors : productColors;
          const singlePrice = p.basePrice || 120;
          const bundlePrice = Number(p.bundlePrice) || 0;
          const bundleQty = Number(p.bundleQuantity) || 0;
          const hasSectionBundle = bundleQty > 1 && bundlePrice > 0 && bundlePrice < (bundleQty * singlePrice);

          return (
            <section
              key={p.id}
              id={`product-section-${p.id}`}
              className="scroll-mt-24 space-y-4"
            >
              {/* Dedicated Section Header Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-pink-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E6004C] bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-full">
                      Product {index + 1}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {productColors.length} Available Colors
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 font-sans">
                    {p.name} <span className="text-sm font-normal text-gray-500">({p.nameBn})</span>
                  </h3>
                  <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
                    {p.descriptionBn}
                  </p>
                </div>

                {/* Price & Order Action in Section Header */}
                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-gray-500 block">
                      {hasSectionBundle ? 'স্পেশাল অফার:' : 'মূল্য:'}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-[#E6004C] font-sans">
                      {hasSectionBundle
                        ? `১ পিস ${singlePrice}৳ • ${bundleQty} পিস ${bundlePrice}৳`
                        : `৳${singlePrice}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openOrderModalForProduct(p)}
                    className="bg-[#E6004C] hover:bg-[#D00040] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>অর্ডার করুন</span>
                  </button>
                </div>
              </div>

              {/* 
                THE PRODUCT GRID (EXACTLY 2 COLUMNS ON MOBILE):
                - Mobile: Display strictly 2 product cards side-by-side (grid-cols-2).
                - Desktop: 3 or 4 products per row (md:grid-cols-3 lg:grid-cols-4).
                - Object-fit: contain, preserved proportions, zero distortion.
              */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                {colorsToDisplay.map((color, cIdx) => (
                  <ProductCard
                    key={`prod-${p.id}-clr-${color?.id || cIdx}`}
                    product={p}
                    color={color}
                    allColors={productColors}
                    onOrderNow={(prod, cId) => openOrderModalForProduct(prod, cId)}
                    onPreview={(clr) => {
                      if (clr?.images && clr.images.length > 0) {
                        setLightboxImage(clr.images[0]);
                      }
                    }}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Trust Features Bar matching reference mockup */}
        <div className="bg-[#FCE8ED] rounded-2xl p-3 sm:p-4 border border-pink-200/60 shadow-2xs">
          <div className="flex items-center justify-around text-[11px] sm:text-xs font-semibold text-gray-800">
            <div className="flex items-center space-x-1.5">
              <Truck className="w-4 h-4 text-[#E6004C] shrink-0" />
              <span>Fast Delivery</span>
            </div>
            <span className="text-pink-300">|</span>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#E6004C] shrink-0" />
              <span>Secure Payment</span>
            </div>
            <span className="text-pink-300">|</span>
            <div className="flex items-center space-x-1.5">
              <Headphones className="w-4 h-4 text-[#E6004C] shrink-0" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
