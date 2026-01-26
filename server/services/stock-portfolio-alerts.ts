/**
 * Stock Portfolio Alerts Service
 * Handles stock watchlist, price tracking, and portfolio alerts
 */

// Types
export type AlertType = 'price_up' | 'price_down' | 'earnings' | 'dividend' | 'sec_filing' | 'analyst_rating' | 'volume_spike';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'triggered' | 'dismissed' | 'expired';

export interface StockWatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  companyName: string;
  shares?: number;
  costBasis?: number;
  addedAt: string;
  notes?: string;
}

export interface StockAlert {
  id: string;
  userId: string;
  symbol: string;
  alertType: AlertType;
  condition: {
    threshold?: number;
    percentChange?: number;
    targetDate?: string;
  };
  priority: AlertPriority;
  status: AlertStatus;
  message?: string;
  createdAt: string;
  triggeredAt?: string;
}

export interface StockPriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
}

export interface PortfolioSummary {
  userId: string;
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdings: Array<{
    symbol: string;
    companyName: string;
    shares: number;
    costBasis: number;
    currentPrice: number;
    currentValue: number;
    gainLoss: number;
    gainLossPercent: number;
  }>;
  lastUpdated: string;
}

// Create watchlist item
export function addToWatchlist(
  userId: string,
  symbol: string,
  companyName: string,
  shares?: number,
  costBasis?: number,
  notes?: string
): StockWatchlistItem {
  return {
    id: `WL-${userId}-${symbol}-${Date.now()}`,
    userId,
    symbol: symbol.toUpperCase(),
    companyName,
    shares,
    costBasis,
    addedAt: new Date().toISOString(),
    notes
  };
}

// Update watchlist item
export function updateWatchlistItem(
  item: StockWatchlistItem,
  updates: Partial<Pick<StockWatchlistItem, 'shares' | 'costBasis' | 'notes'>>
): StockWatchlistItem {
  return {
    ...item,
    ...updates
  };
}

// Create price alert
export function createPriceAlert(
  userId: string,
  symbol: string,
  alertType: AlertType,
  condition: StockAlert['condition'],
  priority: AlertPriority = 'medium'
): StockAlert {
  const messages: Record<AlertType, string> = {
    price_up: `${symbol} has risen above target price`,
    price_down: `${symbol} has fallen below target price`,
    earnings: `${symbol} earnings report is upcoming`,
    dividend: `${symbol} dividend date approaching`,
    sec_filing: `${symbol} has filed a new SEC document`,
    analyst_rating: `${symbol} analyst rating has changed`,
    volume_spike: `${symbol} is experiencing unusual volume`
  };

  return {
    id: `ALERT-${userId}-${symbol}-${Date.now()}`,
    userId,
    symbol: symbol.toUpperCase(),
    alertType,
    condition,
    priority,
    status: 'active',
    message: messages[alertType],
    createdAt: new Date().toISOString()
  };
}

// Check if alert should trigger
export function checkAlertCondition(
  alert: StockAlert,
  currentPrice: number,
  previousPrice: number
): boolean {
  if (alert.status !== 'active') return false;

  switch (alert.alertType) {
    case 'price_up':
      return alert.condition.threshold !== undefined && currentPrice >= alert.condition.threshold;
    case 'price_down':
      return alert.condition.threshold !== undefined && currentPrice <= alert.condition.threshold;
    case 'volume_spike':
      // Simplified - would need actual volume data
      return false;
    default:
      // Date-based alerts
      if (alert.condition.targetDate) {
        const target = new Date(alert.condition.targetDate);
        const now = new Date();
        const daysDiff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7; // Trigger 7 days before
      }
      return false;
  }
}

// Trigger an alert
export function triggerAlert(alert: StockAlert): StockAlert {
  return {
    ...alert,
    status: 'triggered',
    triggeredAt: new Date().toISOString()
  };
}

// Dismiss an alert
export function dismissAlert(alert: StockAlert): StockAlert {
  return {
    ...alert,
    status: 'dismissed'
  };
}

// Calculate portfolio summary
export function calculatePortfolioSummary(
  userId: string,
  watchlist: StockWatchlistItem[],
  prices: Map<string, number>
): PortfolioSummary {
  const holdings = watchlist
    .filter(item => item.shares && item.shares > 0)
    .map(item => {
      const currentPrice = prices.get(item.symbol) || 0;
      const currentValue = item.shares! * currentPrice;
      const costBasis = item.costBasis || 0;
      const totalCost = item.shares! * costBasis;
      const gainLoss = currentValue - totalCost;
      const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

      return {
        symbol: item.symbol,
        companyName: item.companyName,
        shares: item.shares!,
        costBasis,
        currentPrice,
        currentValue,
        gainLoss,
        gainLossPercent: Math.round(gainLossPercent * 100) / 100
      };
    });

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.shares * h.costBasis), 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  return {
    userId,
    totalValue: Math.round(totalValue * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    totalGainLoss: Math.round(totalGainLoss * 100) / 100,
    totalGainLossPercent: Math.round(totalGainLossPercent * 100) / 100,
    holdings,
    lastUpdated: new Date().toISOString()
  };
}

// Get significant price movements
export function getSignificantMovements(
  prices: StockPriceData[],
  threshold: number = 5
): Array<{
  symbol: string;
  changePercent: number;
  direction: 'up' | 'down';
  priority: AlertPriority;
}> {
  return prices
    .filter(p => Math.abs(p.changePercent) >= threshold)
    .map(p => ({
      symbol: p.symbol,
      changePercent: p.changePercent,
      direction: p.changePercent > 0 ? 'up' as const : 'down' as const,
      priority: Math.abs(p.changePercent) >= 10 ? 'critical' as AlertPriority :
                Math.abs(p.changePercent) >= 7 ? 'high' as AlertPriority :
                'medium' as AlertPriority
    }))
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
}

// Generate portfolio alerts
export function generatePortfolioAlerts(
  portfolio: PortfolioSummary,
  existingAlerts: StockAlert[]
): StockAlert[] {
  const newAlerts: StockAlert[] = [];
  const existingSymbols = new Set(existingAlerts.filter(a => a.status === 'active').map(a => a.symbol));

  portfolio.holdings.forEach(holding => {
    // Alert for significant gains
    if (holding.gainLossPercent >= 20 && !existingSymbols.has(holding.symbol)) {
      newAlerts.push(createPriceAlert(
        portfolio.userId,
        holding.symbol,
        'price_up',
        { percentChange: holding.gainLossPercent },
        'medium'
      ));
    }

    // Alert for significant losses
    if (holding.gainLossPercent <= -15 && !existingSymbols.has(holding.symbol)) {
      newAlerts.push(createPriceAlert(
        portfolio.userId,
        holding.symbol,
        'price_down',
        { percentChange: holding.gainLossPercent },
        'high'
      ));
    }
  });

  return newAlerts;
}

// Format price for display
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

// Format change for display
export function formatChange(change: number, changePercent: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${formatPrice(change)} (${sign}${changePercent.toFixed(2)}%)`;
}

// Generate stock ticker display
export function generateTickerDisplay(
  prices: StockPriceData[]
): Array<{
  symbol: string;
  price: string;
  change: string;
  direction: 'up' | 'down' | 'unchanged';
}> {
  return prices.map(p => ({
    symbol: p.symbol,
    price: formatPrice(p.price),
    change: formatChange(p.change, p.changePercent),
    direction: p.change > 0 ? 'up' : p.change < 0 ? 'down' : 'unchanged'
  }));
}

// Get alert summary
export function getAlertSummary(alerts: StockAlert[]): {
  total: number;
  active: number;
  triggered: number;
  byPriority: Record<AlertPriority, number>;
  byType: Record<AlertType, number>;
} {
  const active = alerts.filter(a => a.status === 'active').length;
  const triggered = alerts.filter(a => a.status === 'triggered').length;

  const byPriority: Record<AlertPriority, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0
  };

  const byType: Record<AlertType, number> = {
    price_up: 0,
    price_down: 0,
    earnings: 0,
    dividend: 0,
    sec_filing: 0,
    analyst_rating: 0,
    volume_spike: 0
  };

  alerts.forEach(alert => {
    byPriority[alert.priority]++;
    byType[alert.alertType]++;
  });

  return {
    total: alerts.length,
    active,
    triggered,
    byPriority,
    byType
  };
}

// Mock price data for testing
export function getMockPriceData(symbol: string): StockPriceData {
  const basePrice = 100 + Math.random() * 200;
  const change = (Math.random() - 0.5) * 10;
  const changePercent = (change / basePrice) * 100;

  return {
    symbol: symbol.toUpperCase(),
    price: Math.round(basePrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    volume: Math.floor(Math.random() * 10000000),
    high: Math.round((basePrice + Math.abs(change) * 1.5) * 100) / 100,
    low: Math.round((basePrice - Math.abs(change) * 1.5) * 100) / 100,
    open: Math.round((basePrice - change / 2) * 100) / 100,
    previousClose: Math.round((basePrice - change) * 100) / 100,
    timestamp: new Date().toISOString()
  };
}
