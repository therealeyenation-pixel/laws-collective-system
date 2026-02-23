import { describe, it, expect } from 'vitest';
import {
  getWindDirection,
  convertTemperature,
  formatTemperature,
  getWeatherIcon,
  parseWeatherCondition,
  getMockWeatherData,
  createWeatherAlert,
  getWeatherSummary,
  getOutfitRecommendation,
  checkOutdoorConditions,
  getDefaultWidgetConfig
} from './services/weather-integration';

describe('Weather Integration Service', () => {
  describe('Wind Direction', () => {
    it('should return correct cardinal directions', () => {
      expect(getWindDirection(0)).toBe('N');
      expect(getWindDirection(90)).toBe('E');
      expect(getWindDirection(180)).toBe('S');
      expect(getWindDirection(270)).toBe('W');
    });

    it('should return correct intercardinal directions', () => {
      expect(getWindDirection(45)).toBe('NE');
      expect(getWindDirection(135)).toBe('SE');
      expect(getWindDirection(225)).toBe('SW');
      expect(getWindDirection(315)).toBe('NW');
    });
  });

  describe('Temperature Conversion', () => {
    it('should convert celsius to fahrenheit', () => {
      expect(convertTemperature(0, 'celsius', 'fahrenheit')).toBe(32);
      expect(convertTemperature(100, 'celsius', 'fahrenheit')).toBe(212);
      expect(convertTemperature(20, 'celsius', 'fahrenheit')).toBe(68);
    });

    it('should convert fahrenheit to celsius', () => {
      expect(convertTemperature(32, 'fahrenheit', 'celsius')).toBe(0);
      expect(convertTemperature(212, 'fahrenheit', 'celsius')).toBe(100);
      expect(convertTemperature(68, 'fahrenheit', 'celsius')).toBe(20);
    });

    it('should return same value for same unit', () => {
      expect(convertTemperature(75, 'fahrenheit', 'fahrenheit')).toBe(75);
      expect(convertTemperature(25, 'celsius', 'celsius')).toBe(25);
    });
  });

  describe('Temperature Formatting', () => {
    it('should format fahrenheit correctly', () => {
      expect(formatTemperature(72, 'fahrenheit')).toBe('72°F');
      expect(formatTemperature(32.6, 'fahrenheit')).toBe('33°F');
    });

    it('should format celsius correctly', () => {
      expect(formatTemperature(20, 'celsius')).toBe('20°C');
      expect(formatTemperature(0, 'celsius')).toBe('0°C');
    });
  });

  describe('Weather Icons', () => {
    it('should return correct icons', () => {
      expect(getWeatherIcon('clear')).toBe('☀️');
      expect(getWeatherIcon('rain')).toBe('🌧️');
      expect(getWeatherIcon('snow')).toBe('❄️');
      expect(getWeatherIcon('thunderstorm')).toBe('⛈️');
    });
  });

  describe('Parse Weather Condition', () => {
    it('should parse thunderstorm conditions', () => {
      expect(parseWeatherCondition('Thunderstorm')).toBe('thunderstorm');
      expect(parseWeatherCondition('Severe storm warning')).toBe('thunderstorm');
    });

    it('should parse precipitation conditions', () => {
      expect(parseWeatherCondition('Light rain')).toBe('rain');
      expect(parseWeatherCondition('Heavy snow')).toBe('snow');
      expect(parseWeatherCondition('Freezing drizzle')).toBe('rain');
    });

    it('should parse cloud conditions', () => {
      expect(parseWeatherCondition('Partly cloudy')).toBe('partly_cloudy');
      expect(parseWeatherCondition('Overcast')).toBe('cloudy');
      expect(parseWeatherCondition('Mostly cloudy')).toBe('cloudy');
    });

    it('should default to clear', () => {
      expect(parseWeatherCondition('Sunny')).toBe('clear');
      expect(parseWeatherCondition('Fair')).toBe('clear');
    });
  });

  describe('Mock Weather Data', () => {
    it('should generate valid weather data', () => {
      const data = getMockWeatherData('Chicago');
      
      expect(data.location.city).toBe('Chicago');
      expect(data.current.temperature).toBeGreaterThan(0);
      expect(data.forecast.length).toBe(7);
      expect(data.lastUpdated).toBeDefined();
    });

    it('should include 7-day forecast', () => {
      const data = getMockWeatherData();
      
      expect(data.forecast.length).toBe(7);
      data.forecast.forEach(day => {
        expect(day.date).toBeDefined();
        expect(day.dayOfWeek).toBeDefined();
        expect(day.high).toBeGreaterThanOrEqual(day.low);
      });
    });
  });

  describe('Weather Alerts', () => {
    it('should create weather alert', () => {
      const alert = createWeatherAlert(
        'Winter Storm',
        'severe',
        'Winter Storm Warning',
        'Heavy snow expected',
        '2025-01-26T12:00:00Z',
        '2025-01-27T12:00:00Z'
      );
      
      expect(alert.id).toContain('ALERT-');
      expect(alert.type).toBe('warning');
      expect(alert.severity).toBe('severe');
      expect(alert.event).toBe('Winter Storm');
    });

    it('should set correct alert type based on severity', () => {
      const extreme = createWeatherAlert('Tornado', 'extreme', '', '', '', '');
      const moderate = createWeatherAlert('Frost', 'moderate', '', '', '', '');
      const minor = createWeatherAlert('Wind', 'minor', '', '', '', '');
      
      expect(extreme.type).toBe('warning');
      expect(moderate.type).toBe('watch');
      expect(minor.type).toBe('advisory');
    });
  });

  describe('Weather Summary', () => {
    it('should generate weather summary', () => {
      const data = getMockWeatherData();
      const summary = getWeatherSummary(data);
      
      expect(summary.headline).toContain('°F');
      expect(summary.details).toContain('Feels like');
      expect(summary.icon).toBeDefined();
    });
  });

  describe('Outfit Recommendations', () => {
    it('should recommend heavy clothing for cold weather', () => {
      const data = getMockWeatherData();
      data.current.temperature = 25;
      
      const recommendation = getOutfitRecommendation(data);
      expect(recommendation.toLowerCase()).toContain('coat');
    });

    it('should recommend light clothing for hot weather', () => {
      const data = getMockWeatherData();
      data.current.temperature = 85;
      
      const recommendation = getOutfitRecommendation(data);
      expect(recommendation.toLowerCase()).toContain('light');
    });

    it('should recommend umbrella for rain', () => {
      const data = getMockWeatherData();
      data.current.condition = 'rain';
      
      const recommendation = getOutfitRecommendation(data);
      expect(recommendation.toLowerCase()).toContain('umbrella');
    });
  });

  describe('Outdoor Conditions', () => {
    it('should mark thunderstorm as unsuitable', () => {
      const data = getMockWeatherData();
      data.current.condition = 'thunderstorm';
      
      const result = checkOutdoorConditions(data);
      expect(result.suitable).toBe(false);
      expect(result.reason).toContain('Thunderstorm');
    });

    it('should mark extreme heat as unsuitable', () => {
      const data = getMockWeatherData();
      data.current.temperature = 105;
      
      const result = checkOutdoorConditions(data);
      expect(result.suitable).toBe(false);
      expect(result.reason).toContain('heat');
    });

    it('should mark normal conditions as suitable', () => {
      const data = getMockWeatherData();
      data.current.temperature = 72;
      data.current.condition = 'clear';
      data.alerts = [];
      
      const result = checkOutdoorConditions(data);
      expect(result.suitable).toBe(true);
    });

    it('should provide recommendations for rain', () => {
      const data = getMockWeatherData();
      data.current.temperature = 65;
      data.current.condition = 'rain';
      data.alerts = [];
      
      const result = checkOutdoorConditions(data);
      expect(result.suitable).toBe(true);
      expect(result.recommendations).toContain('Bring rain gear');
    });
  });

  describe('Widget Config', () => {
    it('should return default config', () => {
      const config = getDefaultWidgetConfig();
      
      expect(config.unit).toBe('fahrenheit');
      expect(config.showForecast).toBe(true);
      expect(config.forecastDays).toBe(5);
      expect(config.refreshInterval).toBe(30);
    });
  });
});
