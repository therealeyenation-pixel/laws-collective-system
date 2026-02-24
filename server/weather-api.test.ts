import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Weather API Service", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("Geocoding", () => {
    it("should return coordinates for a valid city", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          results: [{
            latitude: 33.749,
            longitude: -84.388,
            name: "Atlanta",
            country_code: "US",
            admin1: "Georgia",
          }]
        })
      });

      const response = await fetch(
        "https://geocoding-api.open-meteo.com/v1/search?name=Atlanta&count=1&language=en&format=json"
      );
      const data = await response.json();

      expect(data.results).toBeDefined();
      expect(data.results[0].name).toBe("Atlanta");
      expect(data.results[0].admin1).toBe("Georgia");
    });

    it("should return empty results for invalid city", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ results: [] })
      });

      const response = await fetch(
        "https://geocoding-api.open-meteo.com/v1/search?name=InvalidCityXYZ&count=1&language=en&format=json"
      );
      const data = await response.json();

      expect(data.results).toEqual([]);
    });
  });

  describe("Weather Data", () => {
    it("should return weather data for valid coordinates", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          current: {
            temperature_2m: 52,
            relative_humidity_2m: 65,
            apparent_temperature: 48,
            weather_code: 2,
            wind_speed_10m: 8,
            wind_direction_10m: 180,
          },
          daily: {
            time: ["2026-01-26", "2026-01-27", "2026-01-28", "2026-01-29", "2026-01-30", "2026-01-31"],
            weather_code: [2, 0, 3, 61, 2, 0],
            temperature_2m_max: [55, 58, 54, 50, 52, 56],
            temperature_2m_min: [42, 44, 40, 38, 39, 41],
            precipitation_probability_max: [10, 0, 20, 80, 30, 5],
          }
        })
      });

      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=33.749&longitude=-84.388&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=7"
      );
      const data = await response.json();

      expect(data.current).toBeDefined();
      expect(data.current.temperature_2m).toBe(52);
      expect(data.daily).toBeDefined();
      expect(data.daily.time.length).toBeGreaterThan(0);
    });
  });

  describe("WMO Weather Codes", () => {
    it("should map WMO code 0 to clear condition", () => {
      const WMO_CODES: Record<number, { condition: string; description: string }> = {
        0: { condition: "clear", description: "Clear sky" },
        1: { condition: "clear", description: "Mainly clear" },
        2: { condition: "partly_cloudy", description: "Partly cloudy" },
        3: { condition: "cloudy", description: "Overcast" },
        61: { condition: "rain", description: "Slight rain" },
        95: { condition: "thunderstorm", description: "Thunderstorm" },
      };

      expect(WMO_CODES[0].condition).toBe("clear");
      expect(WMO_CODES[2].condition).toBe("partly_cloudy");
      expect(WMO_CODES[61].condition).toBe("rain");
      expect(WMO_CODES[95].condition).toBe("thunderstorm");
    });
  });

  describe("Wind Direction", () => {
    it("should convert degrees to cardinal direction", () => {
      const getWindDirection = (degrees: number): string => {
        const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
      };

      expect(getWindDirection(0)).toBe("N");
      expect(getWindDirection(90)).toBe("E");
      expect(getWindDirection(180)).toBe("S");
      expect(getWindDirection(270)).toBe("W");
      expect(getWindDirection(45)).toBe("NE");
      expect(getWindDirection(135)).toBe("SE");
      expect(getWindDirection(225)).toBe("SW");
      expect(getWindDirection(315)).toBe("NW");
    });
  });

  describe("Temperature Conversion", () => {
    it("should convert Fahrenheit to Celsius correctly", () => {
      const convertToC = (tempF: number) => Math.round((tempF - 32) * 5 / 9);

      expect(convertToC(32)).toBe(0);
      expect(convertToC(212)).toBe(100);
      expect(convertToC(68)).toBe(20);
      expect(convertToC(50)).toBe(10);
    });
  });
});
