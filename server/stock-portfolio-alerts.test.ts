import { describe, it, expect } from 'vitest';
import {
  addToWatchlist,
  updateWatchlistItem,
  createPriceAlert,
  checkAlertCondition,
  triggerAlert,
  dismissAlert,
  calculatePortfolioSummary,
  getSignificantMovements,
  generatePortfolioAlerts,
  formatPrice,
  formatChange,
  generateTickerDisplay,
  getAlertSummary,
  getMockPriceData
} from './services/stock-portfolio-alerts';

describe('Stock Portfolio Alerts Service', () => {
  describe('Watchlist Management', () => {
    it('should add item to watchlist', () => {
      const item = addToWatchlist('user1', 'AAPL', 'Apple Inc.', 100, 150.00, 'Long term hold');
      
      expect(item.id).toContain('WL-user1-AAPL');
      expect(item.symbol).toBe('AAPL');
      expect(item.companyName).toBe('Apple Inc.');
      expect(item.shares).toBe(100);
      expect(item.costBasis).toBe(150.00);
      expect(item.notes).toBe('Long term hold');
    });

    it('should uppercase symbol', () => {
      const item = addToWatchlist('user1', 'msft', 'Microsoft Corp.');
      expect(item.symbol).toBe('MSFT');
    });

    it('should update watchlist item', () => {
      const item = addToWatchlist('user1', 'AAPL', 'Apple Inc.', 100, 150.00);
      const updated = updateWatchlistItem(item, { shares: 150, costBasis: 145.00 });
      
      expect(updated.shares).toBe(150);
      expect(updated.costBasis).toBe(145.00);
      expect(updated.symbol).toBe('AAPL');
    });
  });

  describe('Alert Management', () => {
    it('should create price alert', () => {
      const alert = createPriceAlert('user1', 'AAPL', 'price_up', { threshold: 200 }, 'high');
      
      expect(alert.id).toContain('ALERT-user1-AAPL');
      expect(alert.symbol).toBe('AAPL');
      expect(alert.alertType).toBe('price_up');
      expect(alert.condition.threshold).toBe(200);
      expect(alert.priority).toBe('high');
      expect(alert.status).toBe('active');
    });

    it('should check price up condition', () => {
      const alert = createPriceAlert('user1', 'AAPL', 'price_up', { threshold: 200 });
      
      expect(checkAlertCondition(alert, 199, 195)).toBe(false);
      expect(checkAlertCondition(alert, 200, 195)).toBe(true);
      expect(checkAlertCondition(alert, 210, 195)).toBe(true);
    });

    it('should check price down condition', () => {
      const alert = createPriceAlert('user1', 'AAPL', 'price_down', { threshold: 150 });
      
      expect(checkAlertCondition(alert, 160, 165)).toBe(false);
      expect(checkAlertCondition(alert, 150, 155)).toBe(true);
      expect(checkAlertCondition(alert, 140, 145)).toBe(true);
    });

    it('should trigger alert', () => {
      const alert = createPriceAlert('user1', 'AAPL', 'price_up', { threshold: 200 });
      const triggered = triggerAlert(alert);
      
      expect(triggered.status).toBe('triggered');
      expect(triggered.triggeredAt).toBeDefined();
    });

    it('should dismiss alert', () => {
      const alert = createPriceAlert('user1', 'AAPL', 'price_up', { threshold: 200 });
      const dismissed = dismissAlert(alert);
      
      expect(dismissed.status).toBe('dismissed');
    });

    it('should not trigger already triggered alerts', () => {
      const alert = createPriceAlert('user1', 'AAPL', 'price_up', { threshold: 200 });
      const triggered = triggerAlert(alert);
      
      expect(checkAlertCondition(triggered, 250, 200)).toBe(false);
    });
  });

  describe('Portfolio Calculations', () => {
    it('should calculate portfolio summary', () => {
      const watchlist = [
        addToWatchlist('user1', 'AAPL', 'Apple Inc.', 100, 150),
        addToWatchlist('user1', 'MSFT', 'Microsoft Corp.', 50, 300)
      ];
      
      const prices = new Map([
        ['AAPL', 175],
        ['MSFT', 350]
      ]);
      
      const summary = calculatePortfolioSummary('user1', watchlist, prices);
      
      expect(summary.userId).toBe('user1');
      expect(summary.holdings.length).toBe(2);
      
      const appleHolding = summary.holdings.find(h => h.symbol === 'AAPL');
      expect(appleHolding?.currentValue).toBe(17500);
      expect(appleHolding?.gainLoss).toBe(2500);
      
      expect(summary.totalValue).toBe(35000); // 17500 + 17500
      expect(summary.totalCost).toBe(30000); // 15000 + 15000
      expect(summary.totalGainLoss).toBe(5000);
    });

    it('should handle watchlist items without shares', () => {
      const watchlist = [
        addToWatchlist('user1', 'AAPL', 'Apple Inc.'), // No shares
        addToWatchlist('user1', 'MSFT', 'Microsoft Corp.', 50, 300)
      ];
      
      const prices = new Map([
        ['AAPL', 175],
        ['MSFT', 350]
      ]);
      
      const summary = calculatePortfolioSummary('user1', watchlist, prices);
      
      expect(summary.holdings.length).toBe(1);
      expect(summary.holdings[0].symbol).toBe('MSFT');
    });
  });

  describe('Significant Movements', () => {
    it('should identify significant price movements', () => {
      const prices = [
        { symbol: 'AAPL', price: 175, change: 10, changePercent: 6, volume: 1000000, high: 180, low: 165, open: 165, previousClose: 165, timestamp: new Date().toISOString() },
        { symbol: 'MSFT', price: 350, change: 2, changePercent: 0.5, volume: 500000, high: 352, low: 348, open: 348, previousClose: 348, timestamp: new Date().toISOString() },
        { symbol: 'TSLA', price: 250, change: -30, changePercent: -10.7, volume: 2000000, high: 280, low: 245, open: 280, previousClose: 280, timestamp: new Date().toISOString() }
      ];
      
      const movements = getSignificantMovements(prices, 5);
      
      expect(movements.length).toBe(2);
      expect(movements[0].symbol).toBe('TSLA');
      expect(movements[0].direction).toBe('down');
      expect(movements[0].priority).toBe('critical');
      expect(movements[1].symbol).toBe('AAPL');
      expect(movements[1].direction).toBe('up');
    });
  });

  describe('Formatting', () => {
    it('should format price correctly', () => {
      expect(formatPrice(1234.56)).toBe('$1,234.56');
      expect(formatPrice(0.99)).toBe('$0.99');
    });

    it('should format change correctly', () => {
      expect(formatChange(5.25, 2.5)).toBe('+$5.25 (+2.50%)');
      expect(formatChange(-3.50, -1.75)).toBe('-$3.50 (-1.75%)');
    });

    it('should generate ticker display', () => {
      const prices = [
        { symbol: 'AAPL', price: 175.50, change: 2.50, changePercent: 1.45, volume: 1000000, high: 177, low: 173, open: 173, previousClose: 173, timestamp: new Date().toISOString() }
      ];
      
      const display = generateTickerDisplay(prices);
      
      expect(display[0].symbol).toBe('AAPL');
      expect(display[0].price).toBe('$175.50');
      expect(display[0].direction).toBe('up');
    });
  });

  describe('Alert Summary', () => {
    it('should generate alert summary', () => {
      const alerts = [
        createPriceAlert('user1', 'AAPL', 'price_up', { threshold: 200 }, 'high'),
        createPriceAlert('user1', 'MSFT', 'price_down', { threshold: 300 }, 'medium'),
        createPriceAlert('user1', 'TSLA', 'earnings', { targetDate: '2025-02-01' }, 'low')
      ];
      
      const summary = getAlertSummary(alerts);
      
      expect(summary.total).toBe(3);
      expect(summary.active).toBe(3);
      expect(summary.triggered).toBe(0);
      expect(summary.byPriority.high).toBe(1);
      expect(summary.byPriority.medium).toBe(1);
      expect(summary.byType.price_up).toBe(1);
      expect(summary.byType.earnings).toBe(1);
    });
  });

  describe('Mock Data', () => {
    it('should generate mock price data', () => {
      const data = getMockPriceData('AAPL');
      
      expect(data.symbol).toBe('AAPL');
      expect(data.price).toBeGreaterThan(0);
      expect(data.volume).toBeGreaterThan(0);
      expect(data.timestamp).toBeDefined();
    });
  });
});
