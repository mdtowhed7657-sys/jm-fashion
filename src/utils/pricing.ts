import { Product, ColorVariant } from '../types';

export interface PricingResult {
  unitPrice: number;
  regularUnitPrice: number;
  quantity: number;
  regularTotal: number;
  subtotal: number;
  savings: number;
  isBundleApplied: boolean;
  bundleQuantity: number;
  bundlePrice: number;
  savingsPerBundle: number;
}

/**
 * Calculates price using the actual product configuration.
 * Only applies bundle pricing if bundleQuantity and bundlePrice are explicitly configured
 * and offer a genuine discount for this specific product.
 */
export function calculatePricing(
  product: Product,
  activeColor: ColorVariant | undefined,
  quantity: number
): PricingResult {
  if (!product) {
    return {
      unitPrice: 120,
      regularUnitPrice: 160,
      quantity: 1,
      regularTotal: 160,
      subtotal: 120,
      savings: 0,
      isBundleApplied: false,
      bundleQuantity: 0,
      bundlePrice: 0,
      savingsPerBundle: 0
    };
  }

  // Ensure color variant belongs to this specific product to prevent cross-product leakage
  const colorMatchesProduct = activeColor && Array.isArray(product.colors) && product.colors.some(c => c?.id === activeColor.id);
  const colorVariant = colorMatchesProduct ? activeColor : (product.colors?.[0] || activeColor);

  // Authoritative Unit Price: Use product.basePrice, or colorVariant's priceOverride if valid
  const basePrice = Number(product.basePrice) || 0;
  const colorOverride = colorVariant?.priceOverride !== undefined ? Number(colorVariant.priceOverride) : 0;
  
  // If basePrice is configured (> 0), it is the primary product price.
  // If colorOverride is set and positive, use it. Otherwise fallback to basePrice or default.
  let unitPrice = basePrice > 0 ? basePrice : 120;
  if (colorOverride > 0 && (!basePrice || colorOverride !== 120 || basePrice === 120)) {
    unitPrice = colorOverride;
  }
  if (basePrice > 0) {
    unitPrice = basePrice;
  }

  // Regular (crossed-out) unit price
  const baseReg = Number(product.baseRegularPrice) || 0;
  const colorReg = colorVariant?.regularPriceOverride !== undefined ? Number(colorVariant.regularPriceOverride) : 0;
  const regularUnitPrice = baseReg > 0 ? baseReg : (colorReg > 0 ? colorReg : Math.round(unitPrice * 1.3));

  const safeQty = Math.max(1, Math.floor(quantity || 1));

  // Explicit Bundle Check: Only apply if configured specifically for this product
  const bQty = Number(product.bundleQuantity) || 0;
  const bPrice = Number(product.bundlePrice) || 0;
  const isBundleConfigured = bQty > 1 && bPrice > 0 && bPrice <= (bQty * unitPrice);

  let subtotal = 0;
  let isBundleApplied = false;
  let bundleSavings = 0;

  if (isBundleConfigured && safeQty >= bQty) {
    const fullBundles = Math.floor(safeQty / bQty);
    const remainder = safeQty % bQty;
    subtotal = (fullBundles * bPrice) + (remainder * unitPrice);
    isBundleApplied = true;
    bundleSavings = (safeQty * unitPrice) - subtotal;
  } else {
    subtotal = safeQty * unitPrice;
    isBundleApplied = false;
    bundleSavings = 0;
  }

  const regularTotal = safeQty * regularUnitPrice;
  const savingsPerBundle = isBundleConfigured ? Math.max(0, (bQty * unitPrice) - bPrice) : 0;

  return {
    unitPrice,
    regularUnitPrice,
    quantity: safeQty,
    regularTotal,
    subtotal,
    savings: bundleSavings,
    isBundleApplied,
    bundleQuantity: isBundleConfigured ? bQty : 0,
    bundlePrice: isBundleConfigured ? bPrice : 0,
    savingsPerBundle
  };
}

/**
 * Formats numbers in Bengali digits
 */
export function toBengaliNumber(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .replace(/\d/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}
