/**
 * Global Operations & Localization Service
 * 
 * Provides multi-language, multi-currency, and jurisdiction-aware operations
 * for the L.A.W.S. Collective global expansion.
 */

// ============================================================================
// SUPPORTED LANGUAGES
// ============================================================================

export const SUPPORTED_LANGUAGES = {
  en: { name: "English", nativeName: "English", rtl: false },
  es: { name: "Spanish", nativeName: "Español", rtl: false },
  fr: { name: "French", nativeName: "Français", rtl: false },
  pt: { name: "Portuguese", nativeName: "Português", rtl: false },
  de: { name: "German", nativeName: "Deutsch", rtl: false },
  zh: { name: "Chinese", nativeName: "中文", rtl: false },
  ja: { name: "Japanese", nativeName: "日本語", rtl: false },
  ko: { name: "Korean", nativeName: "한국어", rtl: false },
  ar: { name: "Arabic", nativeName: "العربية", rtl: true },
  hi: { name: "Hindi", nativeName: "हिन्दी", rtl: false },
  sw: { name: "Swahili", nativeName: "Kiswahili", rtl: false },
  yo: { name: "Yoruba", nativeName: "Yorùbá", rtl: false },
  ig: { name: "Igbo", nativeName: "Igbo", rtl: false },
  ha: { name: "Hausa", nativeName: "Hausa", rtl: false },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// ============================================================================
// FIAT CURRENCIES
// ============================================================================

export const FIAT_CURRENCIES = {
  USD: { name: "US Dollar", symbol: "$", decimals: 2 },
  EUR: { name: "Euro", symbol: "€", decimals: 2 },
  GBP: { name: "British Pound", symbol: "£", decimals: 2 },
  JPY: { name: "Japanese Yen", symbol: "¥", decimals: 0 },
  CNY: { name: "Chinese Yuan", symbol: "¥", decimals: 2 },
  CAD: { name: "Canadian Dollar", symbol: "C$", decimals: 2 },
  AUD: { name: "Australian Dollar", symbol: "A$", decimals: 2 },
  CHF: { name: "Swiss Franc", symbol: "CHF", decimals: 2 },
  NGN: { name: "Nigerian Naira", symbol: "₦", decimals: 2 },
  GHS: { name: "Ghanaian Cedi", symbol: "₵", decimals: 2 },
  KES: { name: "Kenyan Shilling", symbol: "KSh", decimals: 2 },
  ZAR: { name: "South African Rand", symbol: "R", decimals: 2 },
  BRL: { name: "Brazilian Real", symbol: "R$", decimals: 2 },
  MXN: { name: "Mexican Peso", symbol: "$", decimals: 2 },
  INR: { name: "Indian Rupee", symbol: "₹", decimals: 2 },
  AED: { name: "UAE Dirham", symbol: "د.إ", decimals: 2 },
  SAR: { name: "Saudi Riyal", symbol: "﷼", decimals: 2 },
} as const;

export type FiatCurrencyCode = keyof typeof FIAT_CURRENCIES;

// ============================================================================
// CRYPTOCURRENCY CONFIGURATIONS
// ============================================================================

export const CRYPTO_CURRENCIES = {
  BTC: { 
    name: "Bitcoin", 
    symbol: "₿", 
    decimals: 8,
    network: "bitcoin",
    type: "native"
  },
  ETH: { 
    name: "Ethereum", 
    symbol: "Ξ", 
    decimals: 18,
    network: "ethereum",
    type: "native"
  },
  SOL: { 
    name: "Solana", 
    symbol: "◎", 
    decimals: 9,
    network: "solana",
    type: "native"
  },
  USDC: { 
    name: "USD Coin", 
    symbol: "USDC", 
    decimals: 6,
    network: "ethereum",
    type: "stablecoin",
    peggedTo: "USD"
  },
  USDT: { 
    name: "Tether", 
    symbol: "₮", 
    decimals: 6,
    network: "ethereum",
    type: "stablecoin",
    peggedTo: "USD"
  },
  DAI: { 
    name: "Dai", 
    symbol: "DAI", 
    decimals: 18,
    network: "ethereum",
    type: "stablecoin",
    peggedTo: "USD"
  },
  MATIC: { 
    name: "Polygon", 
    symbol: "MATIC", 
    decimals: 18,
    network: "polygon",
    type: "native"
  },
  AVAX: { 
    name: "Avalanche", 
    symbol: "AVAX", 
    decimals: 18,
    network: "avalanche",
    type: "native"
  },
  DOT: { 
    name: "Polkadot", 
    symbol: "DOT", 
    decimals: 10,
    network: "polkadot",
    type: "native"
  },
  ADA: { 
    name: "Cardano", 
    symbol: "₳", 
    decimals: 6,
    network: "cardano",
    type: "native"
  },
  XRP: { 
    name: "Ripple", 
    symbol: "XRP", 
    decimals: 6,
    network: "ripple",
    type: "native"
  },
  XLM: { 
    name: "Stellar Lumens", 
    symbol: "XLM", 
    decimals: 7,
    network: "stellar",
    type: "native"
  },
  ATOM: { 
    name: "Cosmos", 
    symbol: "ATOM", 
    decimals: 6,
    network: "cosmos",
    type: "native"
  },
  LUV: { 
    name: "LuvToken", 
    symbol: "LUV", 
    decimals: 18,
    network: "luvchain",
    type: "native"
  },
} as const;

export type CryptoCurrencyCode = keyof typeof CRYPTO_CURRENCIES;

// ============================================================================
// TIMEZONE CONFIGURATIONS
// ============================================================================

export const TIMEZONES = [
  { id: "UTC", name: "Coordinated Universal Time", offset: 0 },
  { id: "America/New_York", name: "Eastern Time (US)", offset: -5 },
  { id: "America/Chicago", name: "Central Time (US)", offset: -6 },
  { id: "America/Denver", name: "Mountain Time (US)", offset: -7 },
  { id: "America/Los_Angeles", name: "Pacific Time (US)", offset: -8 },
  { id: "America/Anchorage", name: "Alaska Time", offset: -9 },
  { id: "Pacific/Honolulu", name: "Hawaii Time", offset: -10 },
  { id: "Europe/London", name: "British Time", offset: 0 },
  { id: "Europe/Paris", name: "Central European Time", offset: 1 },
  { id: "Europe/Berlin", name: "German Time", offset: 1 },
  { id: "Asia/Dubai", name: "Gulf Standard Time", offset: 4 },
  { id: "Asia/Shanghai", name: "China Standard Time", offset: 8 },
  { id: "Asia/Tokyo", name: "Japan Standard Time", offset: 9 },
  { id: "Asia/Seoul", name: "Korea Standard Time", offset: 9 },
  { id: "Australia/Sydney", name: "Australian Eastern Time", offset: 10 },
  { id: "Africa/Lagos", name: "West Africa Time", offset: 1 },
  { id: "Africa/Johannesburg", name: "South Africa Time", offset: 2 },
  { id: "Africa/Nairobi", name: "East Africa Time", offset: 3 },
] as const;

// ============================================================================
// JURISDICTION CONFIGURATIONS
// ============================================================================

export interface JurisdictionConfig {
  code: string;
  name: string;
  type: "country" | "state" | "territory";
  cryptoStatus: "legal" | "restricted" | "prohibited" | "unregulated";
  kycRequired: boolean;
  amlRequired: boolean;
  defaultCurrency: FiatCurrencyCode;
  defaultLanguage: LanguageCode;
  timezone: string;
}

export const JURISDICTIONS: Record<string, JurisdictionConfig> = {
  US: {
    code: "US",
    name: "United States",
    type: "country",
    cryptoStatus: "legal",
    kycRequired: true,
    amlRequired: true,
    defaultCurrency: "USD",
    defaultLanguage: "en",
    timezone: "America/New_York",
  },
  GB: {
    code: "GB",
    name: "United Kingdom",
    type: "country",
    cryptoStatus: "legal",
    kycRequired: true,
    amlRequired: true,
    defaultCurrency: "GBP",
    defaultLanguage: "en",
    timezone: "Europe/London",
  },
  NG: {
    code: "NG",
    name: "Nigeria",
    type: "country",
    cryptoStatus: "restricted",
    kycRequired: true,
    amlRequired: true,
    defaultCurrency: "NGN",
    defaultLanguage: "en",
    timezone: "Africa/Lagos",
  },
  GH: {
    code: "GH",
    name: "Ghana",
    type: "country",
    cryptoStatus: "unregulated",
    kycRequired: false,
    amlRequired: false,
    defaultCurrency: "GHS",
    defaultLanguage: "en",
    timezone: "Africa/Accra",
  },
  KE: {
    code: "KE",
    name: "Kenya",
    type: "country",
    cryptoStatus: "unregulated",
    kycRequired: false,
    amlRequired: false,
    defaultCurrency: "KES",
    defaultLanguage: "sw",
    timezone: "Africa/Nairobi",
  },
  ZA: {
    code: "ZA",
    name: "South Africa",
    type: "country",
    cryptoStatus: "legal",
    kycRequired: true,
    amlRequired: true,
    defaultCurrency: "ZAR",
    defaultLanguage: "en",
    timezone: "Africa/Johannesburg",
  },
  AE: {
    code: "AE",
    name: "United Arab Emirates",
    type: "country",
    cryptoStatus: "legal",
    kycRequired: true,
    amlRequired: true,
    defaultCurrency: "AED",
    defaultLanguage: "ar",
    timezone: "Asia/Dubai",
  },
  SG: {
    code: "SG",
    name: "Singapore",
    type: "country",
    cryptoStatus: "legal",
    kycRequired: true,
    amlRequired: true,
    defaultCurrency: "USD",
    defaultLanguage: "en",
    timezone: "Asia/Singapore",
  },
  CH: {
    code: "CH",
    name: "Switzerland",
    type: "country",
    cryptoStatus: "legal",
    kycRequired: true,
    amlRequired: true,
    defaultCurrency: "CHF",
    defaultLanguage: "de",
    timezone: "Europe/Zurich",
  },
};

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format currency amount based on locale and currency
 */
export function formatCurrency(
  amount: number,
  currency: FiatCurrencyCode | CryptoCurrencyCode,
  locale: string = "en-US"
): string {
  const isFiat = currency in FIAT_CURRENCIES;
  
  if (isFiat) {
    const config = FIAT_CURRENCIES[currency as FiatCurrencyCode];
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(amount);
  }
  
  const config = CRYPTO_CURRENCIES[currency as CryptoCurrencyCode];
  return `${amount.toFixed(Math.min(config.decimals, 8))} ${currency}`;
}

/**
 * Format date based on locale
 */
export function formatDate(
  date: Date,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(date);
}

/**
 * Format number based on locale
 */
export function formatNumber(
  value: number,
  locale: string = "en-US",
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Get jurisdiction configuration
 */
export function getJurisdiction(code: string): JurisdictionConfig | undefined {
  return JURISDICTIONS[code];
}

/**
 * Check if crypto is allowed in jurisdiction
 */
export function isCryptoAllowed(jurisdictionCode: string): boolean {
  const jurisdiction = JURISDICTIONS[jurisdictionCode];
  if (!jurisdiction) return false;
  return jurisdiction.cryptoStatus !== "prohibited";
}

/**
 * Get required compliance for jurisdiction
 */
export function getComplianceRequirements(jurisdictionCode: string): {
  kyc: boolean;
  aml: boolean;
} {
  const jurisdiction = JURISDICTIONS[jurisdictionCode];
  if (!jurisdiction) return { kyc: true, aml: true }; // Default to most restrictive
  return {
    kyc: jurisdiction.kycRequired,
    aml: jurisdiction.amlRequired,
  };
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES;
export type FiatCurrency = typeof FIAT_CURRENCIES;
export type CryptoCurrency = typeof CRYPTO_CURRENCIES;
