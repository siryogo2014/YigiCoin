/**
 * Icon Migration Map: RemixIcon to Lucide React
 *
 * This file provides a mapping of RemixIcon class names to their Lucide React equivalents.
 * Use this guide when migrating components from RemixIcon to Lucide.
 *
 * Usage example:
 * Before: <i className="ri-star-line"></i>
 * After: import { Star } from 'lucide-react'; <Star size={16} />
 */

export const ICON_MAP: Record<string, string> = {
  // Common icons
  'ri-star-line': 'Star',
  'ri-star-fill': 'StarFill',
  'ri-time-line': 'Clock',
  'ri-money-dollar-circle-line': 'DollarSign',
  'ri-arrow-up-line': 'ArrowUp',
  'ri-arrow-down-line': 'ArrowDown',
  'ri-arrow-right-line': 'ArrowRight',
  'ri-arrow-left-line': 'ArrowLeft',
  'ri-gift-line': 'Gift',
  'ri-shield-check-line': 'ShieldCheck',
  'ri-magic-line': 'Wand2',

  // User & Account
  'ri-user-line': 'User',
  'ri-user-fill': 'User',
  'ri-logout-box-line': 'LogOut',
  'ri-settings-line': 'Settings',

  // Navigation
  'ri-arrow-down-s-line': 'ChevronDown',
  'ri-arrow-up-s-line': 'ChevronUp',
  'ri-close-line': 'X',
  'ri-menu-line': 'Menu',

  // Actions
  'ri-add-line': 'Plus',
  'ri-information-line': 'Info',
  'ri-notification-3-line': 'Bell',
  'ri-send-plane-line': 'Send',

  // Payment
  'ri-wallet-line': 'Wallet',
  'ri-paypal-line': 'CreditCard', // PayPal icon not in Lucide, use CreditCard
  'ri-currency-line': 'Coins',

  // Status & Alerts
  'ri-error-warning-line': 'AlertTriangle',
  'ri-alert-line': 'AlertCircle',
  'ri-check-line': 'Check',
  'ri-close-circle-line': 'XCircle',
};

/**
 * Get Lucide icon name from RemixIcon class
 */
export function getLucideIcon(remixIconClass: string): string | null {
  return ICON_MAP[remixIconClass] || null;
}

/**
 * Icon size utilities
 */
export const ICON_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
} as const;
