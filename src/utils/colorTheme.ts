export interface ThemeTokens {
  id: string;
  name: string;
  nameBn: string;
  hex: string;
  rgb: [number, number, number];
  rgbString: string;
  isDark: boolean;
  isVeryLight: boolean;
  
  // Theme Color System
  primary: string;            // Main brand accent color for active items
  primaryHover: string;       // Slightly darker/lighter for hover
  primaryContrastText: string; // Guaranteed readable text on primary bg (#ffffff or #0f172a)
  secondary: string;          // Complementary/supporting accent
  
  // Soft backgrounds & surfaces
  softBg: string;             // Very soft pastel/tinted surface (e.g., #fdf2f4)
  surfaceBg: string;          // Clean surface card background with slight tint
  borderSoft: string;         // Subtle harmonious border (e.g., rgba(r,g,b, 0.18))
  borderFocus: string;        // Active selection border
  
  // Badges & Highlights
  badgeBg: string;            // Chip background
  badgeText: string;          // Chip text color with high contrast
  badgeBorder: string;        // Chip border
  
  // Special Accents
  heroGlow: string;           // Radial blur backdrop color
  priceHighlight: string;     // Text color for price / savings
  savingsBadgeBg: string;     // Background for savings pill
  savingsBadgeText: string;   // Text for savings pill
  ctaBg: string;              // Primary CTA button background
  ctaHoverBg: string;         // Primary CTA button hover
  ctaText: string;            // Primary CTA text color
  ctaShadow: string;          // Primary CTA shadow glow
  
  // Gradients
  gradientHeader: string;
  gradientOffer: string;
}

// Convert Hex to RGB
export function hexToRgb(hex: string): [number, number, number] {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) {
    return [26, 26, 26]; // Default charcoal
  }
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Convert HSL to Hex
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Calculate relative luminance for WCAG contrast
export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

/**
 * Intelligent Theme Generator
 * Converts any product color hex code into a complete, accessible, elegant theme tokens set.
 */
export function generateColorTheme(
  colorHex: string,
  colorId: string = 'custom',
  colorName: string = 'Custom',
  colorNameBn: string = 'কাস্টম'
): ThemeTokens {
  const rgb = hexToRgb(colorHex);
  const [r, g, b] = rgb;
  const [h, s, l] = rgbToHsl(r, g, b);
  const luminance = getLuminance(r, g, b);

  const isDark = luminance < 0.2; // Deep dark colors (black, navy, dark maroon, emerald)
  const isVeryLight = luminance > 0.7; // Very light colors (ivory, white, pastel sky)
  const rgbString = `${r}, ${g}, ${b}`;

  // 1. Primary Action Color
  let primary = colorHex;
  let primaryHover = colorHex;
  let primaryContrastText = '#ffffff';

  if (isVeryLight) {
    // If original color is too light to serve as button/text, use a rich deepened version
    primary = hslToHex(h, Math.max(s, 40), 22);
    primaryHover = hslToHex(h, Math.max(s, 40), 16);
    primaryContrastText = '#ffffff';
  } else if (l < 15) {
    // True black or near black
    primary = '#111827';
    primaryHover = '#000000';
    primaryContrastText = '#ffffff';
  } else if (l > 65) {
    // Light pastels (e.g. blush pink, light sky)
    primary = hslToHex(h, Math.min(s + 20, 85), 38);
    primaryHover = hslToHex(h, Math.min(s + 20, 85), 30);
    primaryContrastText = '#ffffff';
  } else {
    // Rich saturated color
    primary = hslToHex(h, Math.min(s, 90), Math.max(l, 25));
    primaryHover = hslToHex(h, Math.min(s, 90), Math.max(l - 8, 18));
    primaryContrastText = '#ffffff';
  }

  // 2. Secondary Supporting Color (Analogous or Gold tone)
  const secondary = isDark
    ? hslToHex((h + 25) % 360, Math.min(s + 10, 80), 45)
    : hslToHex((h + 15) % 360, Math.min(s, 70), 35);

  // 3. Soft Backgrounds (Warm/Cool subtle surface tint)
  const softBg = isDark
    ? `rgba(${r}, ${g}, ${b}, 0.05)`
    : isVeryLight
    ? '#faf9f5'
    : hslToHex(h, Math.min(s, 60), 97);

  const surfaceBg = isDark
    ? `rgba(${r}, ${g}, ${b}, 0.03)`
    : hslToHex(h, Math.min(s, 40), 98);

  const borderSoft = isDark
    ? `rgba(${r}, ${g}, ${b}, 0.15)`
    : isVeryLight
    ? '#e5e2d9'
    : `rgba(${r}, ${g}, ${b}, 0.22)`;

  const borderFocus = primary;

  // 4. Badge colors (Chips, Tags)
  let badgeBg = '';
  let badgeText = '';
  let badgeBorder = '';

  if (isDark) {
    badgeBg = `rgba(${r}, ${g}, ${b}, 0.08)`;
    badgeText = l < 10 ? '#1f2937' : hslToHex(h, Math.min(s + 20, 85), 32);
    badgeBorder = `rgba(${r}, ${g}, ${b}, 0.2)`;
  } else if (isVeryLight) {
    badgeBg = '#f3f0e6';
    badgeText = '#374151';
    badgeBorder = '#e5e0d3';
  } else {
    badgeBg = hslToHex(h, Math.min(s, 70), 95);
    badgeText = hslToHex(h, Math.max(s, 65), 28);
    badgeBorder = hslToHex(h, Math.min(s, 50), 86);
  }

  // 5. Price Highlight & Savings Pill
  const priceHighlight = isDark
    ? (l < 10 ? '#111827' : hslToHex(h, Math.min(s + 15, 80), 30))
    : isVeryLight
    ? '#1f2937'
    : hslToHex(h, Math.min(s + 10, 85), 32);

  const savingsBadgeBg = primary;
  const savingsBadgeText = primaryContrastText;

  // 6. Hero Radial Glow
  const heroGlow = isDark
    ? `rgba(${r}, ${g}, ${b}, 0.18)`
    : `rgba(${r}, ${g}, ${b}, 0.22)`;

  // 7. CTA Button Settings
  const ctaBg = primary;
  const ctaHoverBg = primaryHover;
  const ctaText = primaryContrastText;
  const ctaShadow = `0 10px 25px -5px rgba(${r}, ${g}, ${b}, 0.35)`;

  // 8. Gradients
  const gradientHeader = `linear-gradient(135deg, ${primary} 0%, ${hslToHex((h + 20) % 360, Math.min(s, 80), 20)} 100%)`;
  const gradientOffer = `linear-gradient(135deg, ${softBg} 0%, rgba(255, 255, 255, 0.9) 100%)`;

  return {
    id: colorId,
    name: colorName,
    nameBn: colorNameBn,
    hex: colorHex,
    rgb,
    rgbString,
    isDark,
    isVeryLight,
    primary,
    primaryHover,
    primaryContrastText,
    secondary,
    softBg,
    surfaceBg,
    borderSoft,
    borderFocus,
    badgeBg,
    badgeText,
    badgeBorder,
    heroGlow,
    priceHighlight,
    savingsBadgeBg,
    savingsBadgeText,
    ctaBg,
    ctaHoverBg,
    ctaText,
    ctaShadow,
    gradientHeader,
    gradientOffer
  };
}

/**
 * Injects and updates root CSS custom variables dynamically
 */
export function applyThemeToCssVariables(theme: ThemeTokens) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-primary-hover', theme.primaryHover);
  root.style.setProperty('--theme-primary-contrast', theme.primaryContrastText);
  root.style.setProperty('--theme-secondary', theme.secondary);
  root.style.setProperty('--theme-soft-bg', theme.softBg);
  root.style.setProperty('--theme-surface-bg', theme.surfaceBg);
  root.style.setProperty('--theme-border-soft', theme.borderSoft);
  root.style.setProperty('--theme-border-focus', theme.borderFocus);
  root.style.setProperty('--theme-badge-bg', theme.badgeBg);
  root.style.setProperty('--theme-badge-text', theme.badgeText);
  root.style.setProperty('--theme-badge-border', theme.badgeBorder);
  root.style.setProperty('--theme-hero-glow', theme.heroGlow);
  root.style.setProperty('--theme-price-highlight', theme.priceHighlight);
  root.style.setProperty('--theme-savings-bg', theme.savingsBadgeBg);
  root.style.setProperty('--theme-savings-text', theme.savingsBadgeText);
  root.style.setProperty('--theme-cta-bg', theme.ctaBg);
  root.style.setProperty('--theme-cta-hover-bg', theme.ctaHoverBg);
  root.style.setProperty('--theme-cta-text', theme.ctaText);
  root.style.setProperty('--theme-cta-shadow', theme.ctaShadow);
  root.style.setProperty('--theme-rgb', theme.rgbString);
}
