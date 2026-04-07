/**
 * Multi-language Support & Localization
 * Comprehensive i18n and localization system
 */

interface Translation {
  key: string;
  language: string;
  value: string;
  context?: string;
  pluralForms?: Record<string, string>;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  default: boolean;
  direction: "ltr" | "rtl";
  dateFormat: string;
  timeFormat: string;
  currencyCode: string;
}

interface LocalizationConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  fallbackLanguage: string;
  dateLocale: string;
  numberLocale: string;
}

class LocalizationService {
  private translations: Map<string, Translation> = new Map();
  private languages: Map<string, Language> = new Map();
  private config: LocalizationConfig;
  private translationCache: Map<string, Map<string, string>> = new Map();

  constructor() {
    this.config = {
      defaultLanguage: "en",
      supportedLanguages: ["en", "es", "fr", "de", "zh", "ja", "ar"],
      fallbackLanguage: "en",
      dateLocale: "en-US",
      numberLocale: "en-US",
    };

    this.initializeLanguages();
  }

  /**
   * Initialize supported languages
   */
  private initializeLanguages(): void {
    const languages: Language[] = [
      {
        code: "en",
        name: "English",
        nativeName: "English",
        enabled: true,
        default: true,
        direction: "ltr",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "HH:mm:ss",
        currencyCode: "USD",
      },
      {
        code: "es",
        name: "Spanish",
        nativeName: "Español",
        enabled: true,
        default: false,
        direction: "ltr",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "HH:mm:ss",
        currencyCode: "EUR",
      },
      {
        code: "fr",
        name: "French",
        nativeName: "Français",
        enabled: true,
        default: false,
        direction: "ltr",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "HH:mm:ss",
        currencyCode: "EUR",
      },
      {
        code: "de",
        name: "German",
        nativeName: "Deutsch",
        enabled: true,
        default: false,
        direction: "ltr",
        dateFormat: "DD.MM.YYYY",
        timeFormat: "HH:mm:ss",
        currencyCode: "EUR",
      },
      {
        code: "zh",
        name: "Chinese",
        nativeName: "中文",
        enabled: true,
        default: false,
        direction: "ltr",
        dateFormat: "YYYY/MM/DD",
        timeFormat: "HH:mm:ss",
        currencyCode: "CNY",
      },
      {
        code: "ja",
        name: "Japanese",
        nativeName: "日本語",
        enabled: true,
        default: false,
        direction: "ltr",
        dateFormat: "YYYY/MM/DD",
        timeFormat: "HH:mm:ss",
        currencyCode: "JPY",
      },
      {
        code: "ar",
        name: "Arabic",
        nativeName: "العربية",
        enabled: true,
        default: false,
        direction: "rtl",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "HH:mm:ss",
        currencyCode: "AED",
      },
    ];

    for (const lang of languages) {
      this.languages.set(lang.code, lang);
    }
  }

  /**
   * Add translation
   */
  addTranslation(translation: Translation): void {
    const key = `${translation.language}:${translation.key}`;
    this.translations.set(key, translation);

    // Invalidate cache
    this.translationCache.delete(translation.language);
  }

  /**
   * Add multiple translations
   */
  addTranslations(translations: Translation[]): void {
    for (const translation of translations) {
      this.addTranslation(translation);
    }
  }

  /**
   * Get translation
   */
  getTranslation(key: string, language: string, context?: string): string {
    const cacheKey = `${language}:${key}`;

    // Check cache
    if (this.translationCache.has(language)) {
      const langCache = this.translationCache.get(language)!;
      if (langCache.has(cacheKey)) {
        return langCache.get(cacheKey)!;
      }
    }

    // Try to find translation
    let translation = this.translations.get(cacheKey);

    if (!translation && context) {
      const contextKey = `${language}:${key}:${context}`;
      translation = this.translations.get(contextKey);
    }

    // Fallback to default language
    if (!translation && language !== this.config.defaultLanguage) {
      const fallbackKey = `${this.config.defaultLanguage}:${key}`;
      translation = this.translations.get(fallbackKey);
    }

    const value = translation?.value || key;

    // Cache result
    if (!this.translationCache.has(language)) {
      this.translationCache.set(language, new Map());
    }

    this.translationCache.get(language)!.set(cacheKey, value);

    return value;
  }

  /**
   * Translate with parameters
   */
  t(key: string, language: string, params?: Record<string, string>): string {
    let value = this.getTranslation(key, language);

    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(`{{${paramKey}}}`, paramValue);
      }
    }

    return value;
  }

  /**
   * Get language
   */
  getLanguage(code: string): Language | null {
    return this.languages.get(code) || null;
  }

  /**
   * Get all languages
   */
  getAllLanguages(): Language[] {
    return Array.from(this.languages.values());
  }

  /**
   * Get enabled languages
   */
  getEnabledLanguages(): Language[] {
    return Array.from(this.languages.values()).filter((l) => l.enabled);
  }

  /**
   * Enable language
   */
  enableLanguage(code: string): Language | null {
    const lang = this.languages.get(code);
    if (lang) {
      lang.enabled = true;
    }
    return lang;
  }

  /**
   * Disable language
   */
  disableLanguage(code: string): Language | null {
    const lang = this.languages.get(code);
    if (lang && !lang.default) {
      lang.enabled = false;
    }
    return lang;
  }

  /**
   * Format date
   */
  formatDate(date: Date, language: string): string {
    const lang = this.languages.get(language);
    if (!lang) return date.toISOString();

    return new Intl.DateTimeFormat(lang.code).format(date);
  }

  /**
   * Format number
   */
  formatNumber(number: number, language: string): string {
    const lang = this.languages.get(language);
    if (!lang) return number.toString();

    return new Intl.NumberFormat(lang.code).format(number);
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, language: string): string {
    const lang = this.languages.get(language);
    if (!lang) return `$${amount}`;

    return new Intl.NumberFormat(lang.code, {
      style: "currency",
      currency: lang.currencyCode,
    }).format(amount);
  }

  /**
   * Get text direction
   */
  getTextDirection(language: string): "ltr" | "rtl" {
    const lang = this.languages.get(language);
    return lang?.direction || "ltr";
  }

  /**
   * Get localization config
   */
  getConfig(): LocalizationConfig {
    return this.config;
  }

  /**
   * Update config
   */
  updateConfig(updates: Partial<LocalizationConfig>): void {
    this.config = { ...this.config, ...updates };
    this.translationCache.clear();
  }

  /**
   * Get translation statistics
   */
  getStats(): {
    totalLanguages: number;
    enabledLanguages: number;
    totalTranslations: number;
    translationsPerLanguage: Record<string, number>;
  } {
    const translationsPerLanguage: Record<string, number> = {};

    for (const [key] of this.translations) {
      const [language] = key.split(":");
      translationsPerLanguage[language] = (translationsPerLanguage[language] || 0) + 1;
    }

    return {
      totalLanguages: this.languages.size,
      enabledLanguages: Array.from(this.languages.values()).filter((l) => l.enabled).length,
      totalTranslations: this.translations.size,
      translationsPerLanguage,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.translations.clear();
    this.translationCache.clear();
  }
}

export const localizationService = new LocalizationService();
