export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isMain?: boolean;
}

export interface HeroBanner {
  id: string;
  title: string;
  titleBn?: string;
  imageUrl: string;
  altText?: string;
  isActive: boolean;
  badgeText?: string; // e.g. "🔥 ৫ পিস ৫০০৳ স্পেশাল অফার"
  linkUrl?: string; // optional link or anchor
  aspectRatio?: string;
  createdAt: string;
}

export interface ColorVariant {
  id: string;
  name: string;
  nameBn: string; // Bangla name e.g. রয়্যাল মারুন
  code: string; // Hex color code e.g. #58111A
  images: ProductImage[];
  priceOverride?: number; // Optional color-specific price
  regularPriceOverride?: number;
  stock: number;
  availableSizes: string[];
  isEnabled: boolean;
  tag?: string; // e.g. "Best Seller", "New Arrival", "Popular"
}

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  tagline: string;
  taglineBn: string;
  description: string;
  descriptionBn: string;
  basePrice: number; // 1 piece price e.g. 120
  baseRegularPrice: number; // regular price e.g. 160
  bundleQuantity?: number; // bundle quantity e.g. 5
  bundlePrice?: number; // bundle price e.g. 500
  bundleOfferBadgeBn?: string; // e.g. "🔥 Best Deal (১০০৳ সেভ)"
  deliveryFeeInsideDhaka?: number; // e.g. 100
  deliveryFeeOutsideDhaka?: number; // e.g. 130
  offerText: string;
  offerTextBn: string;
  fabric: string;
  fabricBn: string;
  craftsmanship: string;
  sizes: string[];
  colors: ColorVariant[];
  defaultColorId: string;
  heroBanners?: HeroBanner[];
  isHeroBannerEnabled?: boolean;
  category?: string;
  isVisible?: boolean;
}

export type DeliveryZone = 'inside_dhaka' | 'outside_dhaka';

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  thana?: string;
  preferredColors?: string;
  deliveryZone: DeliveryZone;
  note?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface SelectedColorItem {
  colorId: string;
  colorName: string;
  colorNameBn: string;
  colorCode: string;
  quantity: number;
  imageUrl?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  colorId: string;
  colorName: string;
  colorNameBn: string;
  colorCode: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string;
  appliedBundle?: boolean;
  bundleSavings?: number;
  selectedColors?: SelectedColorItem[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  status: OrderStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  colorName: string;
  colorCode: string;
  verifiedBuyer: boolean;
  date: string;
  userImage?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  questionBn: string;
  answer: string;
  answerBn: string;
}

export interface AdminUser {
  email: string;
  role: 'admin';
  name: string;
  lastLogin?: string;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

