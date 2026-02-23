import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

// Static fallback rates (updated periodically)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  MXN: 17.15,
  JMD: 155.50,
  TTD: 6.78,
  BBD: 2.00,
  XCD: 2.70,
  BSD: 1.00,
  NGN: 1550.00,
  GHS: 15.50,
  KES: 153.00,
  ZAR: 18.50,
  JPY: 149.50,
  CNY: 7.24,
  INR: 83.50,
  AUD: 1.53,
};

// Cache for exchange rates
let cachedRates: Record<string, number> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

async function fetchExchangeRates(): Promise<Record<string, number>> {
  // Check cache first
  if (cachedRates && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    // Use exchangerate-api.com free tier (no API key needed for basic rates)
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.rates) {
      // Filter to only our supported currencies
      const supportedCurrencies = Object.keys(FALLBACK_RATES);
      const filteredRates: Record<string, number> = {};
      
      for (const currency of supportedCurrencies) {
        if (data.rates[currency]) {
          filteredRates[currency] = data.rates[currency];
        } else {
          // Use fallback for currencies not in API
          filteredRates[currency] = FALLBACK_RATES[currency];
        }
      }
      
      // Update cache
      cachedRates = filteredRates;
      cacheTimestamp = Date.now();
      
      return filteredRates;
    }
    
    throw new Error("Invalid API response format");
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    // Return fallback rates on error
    return FALLBACK_RATES;
  }
}

export const exchangeRatesRouter = router({
  // Get all exchange rates
  getRates: publicProcedure.query(async () => {
    const rates = await fetchExchangeRates();
    const lastUpdated = cachedRates ? new Date(cacheTimestamp).toISOString() : new Date().toISOString();
    
    return {
      base: "USD",
      rates,
      lastUpdated,
      isLive: !!cachedRates,
    };
  }),

  // Convert amount between currencies
  convert: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        from: z.string(),
        to: z.string(),
      })
    )
    .query(async ({ input }) => {
      const rates = await fetchExchangeRates();
      
      const fromRate = rates[input.from] || 1;
      const toRate = rates[input.to] || 1;
      
      // Convert to USD first, then to target currency
      const usdAmount = input.amount / fromRate;
      const convertedAmount = usdAmount * toRate;
      
      return {
        originalAmount: input.amount,
        originalCurrency: input.from,
        convertedAmount: Math.round(convertedAmount * 100) / 100,
        targetCurrency: input.to,
        rate: toRate / fromRate,
        timestamp: new Date().toISOString(),
      };
    }),

  // Get rate for specific currency pair
  getRate: publicProcedure
    .input(
      z.object({
        from: z.string(),
        to: z.string(),
      })
    )
    .query(async ({ input }) => {
      const rates = await fetchExchangeRates();
      
      const fromRate = rates[input.from] || 1;
      const toRate = rates[input.to] || 1;
      
      return {
        from: input.from,
        to: input.to,
        rate: toRate / fromRate,
        inverseRate: fromRate / toRate,
        timestamp: new Date().toISOString(),
      };
    }),

  // Force refresh rates (admin only)
  refreshRates: publicProcedure.mutation(async () => {
    // Clear cache to force refresh
    cachedRates = null;
    cacheTimestamp = 0;
    
    const rates = await fetchExchangeRates();
    
    return {
      success: true,
      rates,
      timestamp: new Date().toISOString(),
    };
  }),
});
