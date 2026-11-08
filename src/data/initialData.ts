import { Product, Review, FAQItem, HeroBanner } from '../types';

export const INITIAL_HERO_BANNERS: HeroBanner[] = [
  {
    id: 'banner-default-5color',
    title: '5 Color 5 Piece 500 Taka Special Offer Banner',
    titleBn: '৫ পিস ৫০০৳ স্পেশাল অফার ব্যানার',
    imageUrl: '/assets/products/banner_5models.png',
    altText: 'জেএম ফ্যাশন ৫ পিস ৫০০ টাকা অফার ব্যানার',
    isActive: true,
    badgeText: '🔥 ৫ পিস ৫০০৳ ধামাকা অফার',
    linkUrl: '#main-product-area',
    aspectRatio: 'auto',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_PRODUCT: Product = {
  id: 'jm-fashion-kurti-01',
  name: 'Lace Padded Blouse (Long Sleeve)',
  nameBn: 'Lace Padded Blouse (Long Sleeve)',
  category: 'blouse',
  isVisible: true,
  tagline: 'Luxury Long Sleeve Floral Lace Padded Blouse',
  taglineBn: 'আভিজাত্য ও নান্দনিকতায় প্রিমিয়াম লং হাতা লেইস প্যাডেড ব্লাউজ কালেকশন',
  description: 'Elevate your wardrobe with the JM Fashion Lace Padded Blouse with Long Sleeve. Meticulously handcrafted from premium floral lace with soft inner padding, comfort lining, and designer elegance.',
  descriptionBn: '১০০% প্রিমিয়াম ফ্লোরাল লেইস এবং নরম আরামদায়ক প্যাডিং যুক্ত লং হাতা ব্লাউজ। যেকোনো শাড়ির সাথে আকর্ষণীয় লুক দিবে এবং সারাদিন ব্যবহারে দারুণ কমফোর্টেবল।',
  basePrice: 120,
  baseRegularPrice: 160,
  bundleQuantity: 5,
  bundlePrice: 500,
  bundleOfferBadgeBn: '🔥 Best Deal',
  deliveryFeeInsideDhaka: 100,
  deliveryFeeOutsideDhaka: 130,
  offerText: '1 PIECE = 120৳ • 5 PIECES = 500৳ ',
  offerTextBn: '১ পিস ১২০৳ • ৫ পিস ৫০০৳ স্পেশাল অফার!',
  fabric: '100% Premium Organic Viscose Velvet Silk with Organza Dupatta',
  fabricBn: '১০০% অরিজিনাল সফট ভিসকস ভেলভেট সিল্ক এবং প্রিমিয়াম অর্গানজা ওড়না',
  craftsmanship: 'Handcrafted zari thread embroidery, contrast piping, finished borders',
  sizes: ['Free Size'],
  defaultColorId: 'color-maroon',
  isHeroBannerEnabled: true,
  heroBanners: INITIAL_HERO_BANNERS,
  colors: [
    {
      id: 'color-maroon',
      name: 'Deep Maroon',
      nameBn: 'রয়্যাল বারগ্যান্ডি মারুন',
      code: '#500B16',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 18,
      availableSizes: ['Free Size'],
      isEnabled: true,
      tag: '🔥 Best Seller',
      images: [
        {
          id: 'img-maroon-1',
          url: 'https://i.ibb.co.com/fV6MtqYm/image.png',
          alt: 'Deep Maroon View',
          isMain: true
        }
      ]
    },
    {
      id: 'color-black',
      name: 'Midnight Black',
      nameBn: 'মিডনাইট রয়্যাল ব্ল্যাক',
      code: '#1A1A1A',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 24,
      availableSizes: ['Free Size'],
      isEnabled: true,
      tag: '⭐ Customer Favorite',
      images: [
        {
          id: 'img-black-1',
          url: 'https://i.ibb.co.com/fV6MtqYm/image.png',
          alt: 'Midnight Black View',
          isMain: true
        }
      ]
    },
    {
      id: 'color-emerald',
      name: 'Emerald Green',
      nameBn: 'ফরেস্ট এমারালাইড গ্রিন',
      code: '#0F4229',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 12,
      availableSizes: ['Free Size'],
      isEnabled: true,
      tag: '✨ Trending',
      images: [
        {
          id: 'img-emerald-1',
          url: 'https://i.ibb.co.com/fV6MtqYm/image.png',
          alt: 'Emerald Green View',
          isMain: true
        }
      ]
    },
    {
      id: 'color-mustard',
      name: 'Royal Mustard',
      nameBn: 'রয়্যাল মাস্টার্ড ইয়েলো',
      code: '#D4AF37',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 15,
      availableSizes: ['Free Size'],
      isEnabled: true,
      tag: '💛 Festive Edition',
      images: [
        {
          id: 'img-mustard-1',
          url: 'https://i.ibb.co.com/fV6MtqYm/image.png',
          alt: 'Royal Mustard View',
          isMain: true
        }
      ]
    },
    {
      id: 'color-pink',
      name: 'Blush Pink',
      nameBn: 'প্যাস্টেল ব্ল্যাশ পিংক',
      code: '#E8A2A8',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 20,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'img-pink-1',
          url: 'https://i.ibb.co.com/fV6MtqYm/image.png',
          alt: 'Blush Pink View',
          isMain: true
        }
      ]
    },
    {
      id: 'color-blue',
      name: 'Royal Navy Blue',
      nameBn: 'ক্লাসিক রয়্যাল নেভি ব্লু',
      code: '#1B365D',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 14,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'img-blue-1',
          url: 'https://i.ibb.co.com/fV6MtqYm/image.png',
          alt: 'Royal Navy Blue View',
          isMain: true
        }
      ]
    },
    {
      id: 'color-white',
      name: 'Off White Ivory',
      nameBn: 'অফ হোয়াইট আইভরি',
      code: '#F5F5ED',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 10,
      availableSizes: ['Free Size'],
      isEnabled: true,
      tag: '👑 Limited Luxury',
      images: [
        {
          id: 'img-white-1',
          url: 'https://i.ibb.co.com/fV6MtqYm/image.png',
          alt: 'Off White Ivory View',
          isMain: true
        }
      ]
    },
    {
      id: 'color-ruby',
      name: 'Crimson Red',
      nameBn: 'রয়্যাল ক্রিসমাস ক্রিমসন রেড',
      code: '#8B0000',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 16,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'img-ruby-1',
          url: 'https://i.ibb.co.com/fV6MtqYm/image.png',
          alt: 'Crimson Red View',
          isMain: true
        }
      ]
    },
    {
      id: 'color-coffee',
      name: 'Mocha Coffee',
      nameBn: 'মোকা কফি ব্রাউন',
      code: '#4A2E1B',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 11,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'img-coffee-1',
          url: 'https://i.ibb.co.com/fV6MtqYm/image.png',
          alt: 'Mocha Coffee View',
          isMain: true
        }
      ]
    },
    {
      id: 'color-skyblue',
      name: 'Powder Sky Blue',
      nameBn: 'পাউডার স্কাই ব্লু',
      code: '#87CEEB',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 15,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'img-skyblue-1',
          url: 'https://i.ibb.co.com/fV6MtqYm/image.png',
          alt: 'Powder Sky Blue View',
          isMain: true
        }
      ]
    },
    {
      id: 'color-purple',
      name: 'Mulberry Purple',
      nameBn: 'রয়্যাল মালবেরি পার্পল',
      code: '#4B0082',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 13,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'img-purple-1',
          url: 'https://i.ibb.co.com/fV6MtqYm/image.png',
          alt: 'Mulberry Purple View',
          isMain: true
        }
      ]
    },
    {
      id: 'color-orange',
      name: 'Terracotta Orange',
      nameBn: 'টেরাকোটা ওয়ান্টিন অরেঞ্জ',
      code: '#C85A32',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 9,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'img-orange-1',
          url: 'https://i.ibb.co.com/fV6MtqYm/image.png',
          alt: 'Terracotta Orange View',
          isMain: true
        }
      ]
    },
    {
      id: 'color-olive',
      name: 'Sage Olive Green',
      nameBn: 'সেজ অলিভ গ্রিন',
      code: '#556B2F',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 14,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'img-olive-1',
          url: 'https://i.ibb.co.com/fV6MtqYm/image.png',
          alt: 'Sage Olive Green View',
          isMain: true
        }
      ]
    },
    {
      id: 'color-gold',
      name: 'Champagne Gold',
      nameBn: 'চ্যাম্পেইন ন্যুড গোল্ড',
      code: '#D4C4A8',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 8,
      availableSizes: ['Free Size'],
      isEnabled: true,
      tag: '✨ Premium Metallic',
      images: [
        {
          id: 'img-gold-1',
          url: 'https://i.ibb.co.com/fV6MtqYm/image.png',
          alt: 'Champagne Gold View',
          isMain: true
        }
      ]
    }
  ]
};

export const INITIAL_PRODUCT_2: Product = {
  id: 'prod-fishcut-petticoat',
  name: 'Fishcut Peticoat',
  nameBn: 'ফিসকাট পেটিকোট',
  category: 'petticoat',
  isVisible: true,
  tagline: 'Premium Stretchable Mermaid Fit Saree Shapewear Petticoat',
  taglineBn: 'শাড়িতে নিখুঁত স্লিম ও এলিগ্যান্ট মারমেইড শেপ দিতে প্রিমিয়াম ফিসকাট পেটিকোট',
  description: 'Handcrafted with ultra-stretch breathable lycra-cotton blend fabric. Designed to shape and enhance your saree silhouette while ensuring effortless comfort all day long.',
  descriptionBn: 'হাই-কোয়ালিটি সুপার স্ট্রেচেবল ফ্যাব্রিকে তৈরি আমাদের ফিসকাট পেটিকোট। শাড়ি পরার পর দেয় আকর্ষণীয় মারমেইড শেপ ও স্লিম ফিটিং। নিচে পর্যাপ্ত ফ্লেয়ার থাকায় হাঁটা-চলা করতে কোনো অসুবিধা হয় না।',
  basePrice: 120,
  baseRegularPrice: 160,
  bundleQuantity: 5,
  bundlePrice: 500,
  bundleOfferBadgeBn: '🔥 Best Deal',
  deliveryFeeInsideDhaka: 100,
  deliveryFeeOutsideDhaka: 130,
  offerText: '1 PIECE = 120৳ • 5 PIECES = 500৳ ',
  offerTextBn: '১ পিস ১২০৳ • ৫ পিস ৫০০৳ স্পেশাল অফার!',
  fabric: 'Super-Stretch Breathable Cotton Lycra with Elastic Drawstring Waist',
  fabricBn: 'সুপার স্ট্রেচেবল ব্রিদেবল কটন লাইক্রা এবং আরামদায়ক ইলাস্টিক ড্র-স্ট্রিং ওয়েস্ট',
  craftsmanship: 'Seamless side stitching, reinforced hemlines, ergonomic contouring',
  sizes: ['Free Size'],
  defaultColorId: 'fc-black',
  isHeroBannerEnabled: false,
  colors: [
    {
      id: 'fc-black',
      name: 'Midnight Black',
      nameBn: 'মিডনাইট ব্ল্যাক',
      code: '#1A1A1A',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 30,
      availableSizes: ['Free Size'],
      isEnabled: true,
      tag: '🔥 Best Seller',
      images: [
        {
          id: 'fc-img-black-1',
          url: '/assets/products/petticoat_black.png',
          alt: 'Fishcut Petticoat Midnight Black',
          isMain: true
        }
      ]
    },
    {
      id: 'fc-offwhite',
      name: 'Off White Cream',
      nameBn: 'অফ হোয়াইট ক্রিম',
      code: '#F7F4EB',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 25,
      availableSizes: ['Free Size'],
      isEnabled: true,
      tag: '⭐ Must Have',
      images: [
        {
          id: 'fc-img-white-1',
          url: '/assets/products/petticoat_beige.png',
          alt: 'Fishcut Petticoat Off White',
          isMain: true
        }
      ]
    },
    {
      id: 'fc-maroon',
      name: 'Deep Maroon',
      nameBn: 'রয়্যাল ডিপ মারুন',
      code: '#500B16',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 22,
      availableSizes: ['Free Size'],
      isEnabled: true,
      tag: '✨ Trending',
      images: [
        {
          id: 'fc-img-maroon-1',
          url: '/assets/products/petticoat_black.png',
          alt: 'Fishcut Petticoat Deep Maroon',
          isMain: true
        }
      ]
    },
    {
      id: 'fc-golden',
      name: 'Golden Beige',
      nameBn: 'গোল্ডেন বেইজ',
      code: '#D4AF37',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 18,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'fc-img-golden-1',
          url: '/assets/products/petticoat_beige.png',
          alt: 'Fishcut Petticoat Golden Beige',
          isMain: true
        }
      ]
    },
    {
      id: 'fc-navy',
      name: 'Navy Blue',
      nameBn: 'রয়্যাল নেভি ব্লু',
      code: '#1B365D',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 20,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'fc-img-navy-1',
          url: '/assets/products/petticoat_black.png',
          alt: 'Fishcut Petticoat Navy Blue',
          isMain: true
        }
      ]
    },
    {
      id: 'fc-red',
      name: 'Crimson Red',
      nameBn: 'ব্রাইডাল রেড',
      code: '#8B0000',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 25,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'fc-img-red-1',
          url: '/assets/products/petticoat_black.png',
          alt: 'Fishcut Petticoat Crimson Red',
          isMain: true
        }
      ]
    },
    {
      id: 'fc-pink',
      name: 'Baby Pink',
      nameBn: 'প্যাস্টেল বেবি পিংক',
      code: '#E8A2A8',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 15,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'fc-img-pink-1',
          url: '/assets/products/petticoat_beige.png',
          alt: 'Fishcut Petticoat Baby Pink',
          isMain: true
        }
      ]
    },
    {
      id: 'fc-lavender',
      name: 'Soft Lavender',
      nameBn: 'ল্যাভেন্ডার পার্পল',
      code: '#967BB6',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 12,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'fc-img-lavender-1',
          url: '/assets/products/petticoat_beige.png',
          alt: 'Fishcut Petticoat Soft Lavender',
          isMain: true
        }
      ]
    }
  ]
};

export const INITIAL_PRODUCT_3: Product = {
  id: 'prod-lace-short-sleeve',
  name: 'Lace Padded Blouse (Short Sleeve)',
  nameBn: 'শর্টহাতা লেইসের প্যাডেট ব্লাউজ',
  category: 'blouse',
  isVisible: true,
  tagline: 'Designer Short Sleeve Lace Padded Blouse with Comfort Cups',
  taglineBn: 'স্টাইলিশ শর্টহাতা গর্জিয়াস লেইস প্যাডেড ডিজাইনার ব্লাউজ কালেকশন',
  description: 'Premium short-sleeve lace padded blouse crafted from soft floral lace fabric with built-in lightweight padding and ultra-soft breathable lining.',
  descriptionBn: 'মার্জিত শর্ট হাতা ডিজাইন, নরম আরামদায়ক কাপিং এবং গর্জিয়াস ফ্লোরাল লেইস ওয়ার্ক। সব ধরনের পার্টি, বিয়েবাড়ি বা ক্যাজুয়াল অনুষ্ঠানে শাড়ির সাথে পরার সেরা পছন্দ।',
  basePrice: 120,
  baseRegularPrice: 160,
  bundleQuantity: 5,
  bundlePrice: 500,
  bundleOfferBadgeBn: '🔥 Best Deal ',
  deliveryFeeInsideDhaka: 100,
  deliveryFeeOutsideDhaka: 130,
  offerText: '1 PIECE = 120৳ • 5 PIECES = 500৳ ',
  offerTextBn: '১ পিস ১২০৳ • ৫ পিস ৫০০৳  স্পেশাল অফার!',
  fabric: 'Embossed Floral French Lace with Micro-Cotton Inner Lining',
  fabricBn: 'এমবসড ফ্লোরাল ফ্রেঞ্চ লেইস এবং মাইক্রো-কটন সফট ইনার লাইনিং',
  craftsmanship: 'Built-in padded cups, delicate scallop hem on sleeves, finished stitch',
  sizes: ['Free Size'],
  defaultColorId: 'ss-maroon',
  isHeroBannerEnabled: false,
  colors: [
    {
      id: 'ss-maroon',
      name: 'Royal Maroon',
      nameBn: 'রয়্যাল বারগ্যান্ডি মারুন',
      code: '#500B16',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 25,
      availableSizes: ['Free Size'],
      isEnabled: true,
      tag: '🔥 Best Seller',
      images: [
        {
          id: 'ss-img-maroon-1',
          url: '/assets/products/blouse_pink_short.png',
          alt: 'Short Sleeve Lace Padded Blouse Maroon',
          isMain: true
        }
      ]
    },
    {
      id: 'ss-black',
      name: 'Midnight Black',
      nameBn: 'মিডনাইট ব্ল্যাক',
      code: '#1A1A1A',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 28,
      availableSizes: ['Free Size'],
      isEnabled: true,
      tag: '⭐ Customer Favorite',
      images: [
        {
          id: 'ss-img-black-1',
          url: '/assets/products/blouse_black_short.png',
          alt: 'Short Sleeve Lace Padded Blouse Black',
          isMain: true
        }
      ]
    },
    {
      id: 'ss-red',
      name: 'Crimson Red',
      nameBn: 'ব্রাইডাল রেড',
      code: '#8B0000',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 20,
      availableSizes: ['Free Size'],
      isEnabled: true,
      tag: '✨ Festive Special',
      images: [
        {
          id: 'ss-img-red-1',
          url: '/assets/products/blouse_pink_short.png',
          alt: 'Short Sleeve Lace Padded Blouse Red',
          isMain: true
        }
      ]
    },
    {
      id: 'ss-pink',
      name: 'Blush Pink',
      nameBn: 'প্যাস্টেল ব্ল্যাশ পিংক',
      code: '#E8A2A8',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 18,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'ss-img-pink-1',
          url: '/assets/products/blouse_pink_short.png',
          alt: 'Short Sleeve Lace Padded Blouse Pink',
          isMain: true
        }
      ]
    },
    {
      id: 'ss-gold',
      name: 'Champagne Gold',
      nameBn: 'চ্যাম্পেইন গোল্ড',
      code: '#D4AF37',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 16,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'ss-img-gold-1',
          url: '/assets/products/blouse_pink_short.png',
          alt: 'Short Sleeve Lace Padded Blouse Gold',
          isMain: true
        }
      ]
    },
    {
      id: 'ss-emerald',
      name: 'Emerald Green',
      nameBn: 'এমারালাইড গ্রিন',
      code: '#0F4229',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 15,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'ss-img-emerald-1',
          url: '/assets/products/blouse_pink_short.png',
          alt: 'Short Sleeve Lace Padded Blouse Emerald',
          isMain: true
        }
      ]
    },
    {
      id: 'ss-white',
      name: 'Off White',
      nameBn: 'অফ হোয়াইট আইভরি',
      code: '#F7F4EB',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 14,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'ss-img-white-1',
          url: '/assets/products/blouse_pink_short.png',
          alt: 'Short Sleeve Lace Padded Blouse White',
          isMain: true
        }
      ]
    },
    {
      id: 'ss-navy',
      name: 'Royal Navy Blue',
      nameBn: 'রয়্যাল নেভি ব্লু',
      code: '#1B365D',
      priceOverride: 120,
      regularPriceOverride: 160,
      stock: 16,
      availableSizes: ['Free Size'],
      isEnabled: true,
      images: [
        {
          id: 'ss-img-navy-1',
          url: '/assets/products/blouse_black_short.png',
          alt: 'Short Sleeve Lace Padded Blouse Navy',
          isMain: true
        }
      ]
    }
  ]
};

export const INITIAL_PRODUCTS: Product[] = [
  INITIAL_PRODUCT,
  INITIAL_PRODUCT_2,
  INITIAL_PRODUCT_3
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    customerName: 'নুসরাত জাহান তাজরিন',
    rating: 5,
    comment: 'আমি বারগ্যান্ডি মারুন কালারটি অর্ডার করেছিলাম। প্রডাক্ট হাতে পেয়ে একদম মুগ্ধ হয়ে গেছি! কাপড়টা ভিষণ সফট এবং কাজগুলা অনেক সুক্ষ্ম। ছবিতে যেমন দেখেছি ঠিক তেমনই পেয়েছি।',
    colorName: 'Deep Maroon',
    colorCode: '#500B16',
    verifiedBuyer: true,
    date: '3 days ago'
  },
  {
    id: 'rev-2',
    customerName: 'Ayesha Siddiqua',
    rating: 5,
    comment: 'Order placed inside Dhaka and received in 24 hours! Color Midnight Black is pure luxury velvet. Packaging was gorgeous too.',
    colorName: 'Midnight Black',
    colorCode: '#1A1A1A',
    verifiedBuyer: true,
    date: '5 days ago'
  },
  {
    id: 'rev-3',
    customerName: 'ফারজানা আক্তার',
    rating: 5,
    comment: 'রয়্যাল মাস্টার্ড ইয়েলো কালার টা অনেক সুন্দর ফুটে উঠেছে। সাইজিং একদম পারফেক্ট (XL)। ডেলিভারি বয় খুব ভালো ব্যবহার করেছেন, ক্যাশ অন ডেলিভারিতে চেক করে নিয়েছি।',
    colorName: 'Royal Mustard',
    colorCode: '#D4AF37',
    verifiedBuyer: true,
    date: '1 week ago'
  },
  {
    id: 'rev-4',
    customerName: 'Tanjima Rahman',
    rating: 5,
    comment: 'Champagne Gold edition is stunning for wedding parties! The organza dupatta matches perfectly with gold threadwork.',
    colorName: 'Champagne Gold',
    colorCode: '#D4C4A8',
    verifiedBuyer: true,
    date: '2 weeks ago'
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I place an order?',
    questionBn: 'কীভাবে অর্ডার সম্পন্ন করবেন?',
    answer: 'Select your preferred color variant, choose your size, click "Order Now", enter your name, mobile number, and address, then click Confirm Order.',
    answerBn: 'আপনার পছন্দের কালার ভারিয়েন্ট ও সাইজ সিলেক্ট করে "অর্ডার করুন" বাটনে ক্লিক করুন। এরপর আপনার নাম, মোবাইল নাম্বার ও ডেলিভারি ঠিকানা দিয়ে অর্ডার নিশ্চিত করুন।'
  },
  {
    id: 'faq-2',
    question: 'Can I check the parcel before paying Cash on Delivery?',
    questionBn: 'ডেলিভারির সময় প্রডাক্ট দেখে টাকা দেওয়া যাবে?',
    answer: 'Yes! We offer parcel inspection upon delivery in front of the delivery rider before completing payment.',
    answerBn: 'জি অবশ্যই! ডেলিভারি ম্যানের সামনে পার্সেলটি খুলে দেখে ১০০% নিশ্চিত হয়ে টাকা পরিশোধ করার সুবিধা রয়েছে।'
  },
  {
    id: 'faq-3',
    question: 'What are the delivery charges and timelines?',
    questionBn: 'ডেলিভারি চার্জ ও সময়সীমা কত?',
    answer: 'Inside Dhaka: ৳100 (Delivered within 24–48 hours). Outside Dhaka: ৳130 (Delivered within 48–72 hours via Steadfast/Paperfly/RedX).',
    answerBn: 'ঢাকা শহরের ভেতরে ডেলিভারি চার্জ ১০০ টাকা (২৪-৪৮ ঘণ্টার মধ্যে)। ঢাকার বাইরে ১৩০ টাকা (৪৮-৭২ ঘণ্টার মধ্যে গ্রাহকের হাতে পৌঁছাবে)।'
  },
  {
    id: 'faq-4',
    question: 'What if I need a size exchange or color replacement?',
    questionBn: 'সাইজ না মিললে বা কালার চেঞ্জ করতে চাইলে কী করব?',
    answer: 'We provide a 7-day hassle-free exchange guarantee. Contact our helpline or WhatsApp with your Order ID for prompt service.',
    answerBn: 'আমাদের রয়েছে ৭ দিনের ইজি এক্সচেঞ্জ পলিসি। সাইজ সমস্যা হলে বা এক্সচেঞ্জ করতে চাইলে কাস্টমার কেয়ার নম্বরে কল বা হোয়াটসঅ্যাপ করুন।'
  }
];
