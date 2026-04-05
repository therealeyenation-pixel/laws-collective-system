/**
 * Weather API Service
 * Uses Open-Meteo API (free, no API key required)
 * https://open-meteo.com/
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

// Weather condition mapping from WMO codes
const WMO_CODES: Record<number, { condition: string; description: string }> = {
  0: { condition: "clear", description: "Clear sky" },
  1: { condition: "clear", description: "Mainly clear" },
  2: { condition: "partly_cloudy", description: "Partly cloudy" },
  3: { condition: "cloudy", description: "Overcast" },
  45: { condition: "fog", description: "Fog" },
  48: { condition: "fog", description: "Depositing rime fog" },
  51: { condition: "rain", description: "Light drizzle" },
  53: { condition: "rain", description: "Moderate drizzle" },
  55: { condition: "rain", description: "Dense drizzle" },
  56: { condition: "rain", description: "Light freezing drizzle" },
  57: { condition: "rain", description: "Dense freezing drizzle" },
  61: { condition: "rain", description: "Slight rain" },
  63: { condition: "rain", description: "Moderate rain" },
  65: { condition: "rain", description: "Heavy rain" },
  66: { condition: "rain", description: "Light freezing rain" },
  67: { condition: "rain", description: "Heavy freezing rain" },
  71: { condition: "snow", description: "Slight snow fall" },
  73: { condition: "snow", description: "Moderate snow fall" },
  75: { condition: "snow", description: "Heavy snow fall" },
  77: { condition: "snow", description: "Snow grains" },
  80: { condition: "rain", description: "Slight rain showers" },
  81: { condition: "rain", description: "Moderate rain showers" },
  82: { condition: "rain", description: "Violent rain showers" },
  85: { condition: "snow", description: "Slight snow showers" },
  86: { condition: "snow", description: "Heavy snow showers" },
  95: { condition: "thunderstorm", description: "Thunderstorm" },
  96: { condition: "thunderstorm", description: "Thunderstorm with slight hail" },
  99: { condition: "thunderstorm", description: "Thunderstorm with heavy hail" },
};

// Geocoding to get coordinates from city name
async function geocodeCity(city: string): Promise<{ lat: number; lon: number; name: string; country: string; state?: string } | null> {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.latitude,
        lon: result.longitude,
        name: result.name,
        country: result.country_code,
        state: result.admin1,
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Get weather data from Open-Meteo
async function fetchWeatherData(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=7`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Weather API error:", error);
    return null;
  }
}

// Get wind direction from degrees
function getWindDirection(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Get day of week
function getDayOfWeek(dateStr: string): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const date = new Date(dateStr);
  return days[date.getDay()];
}

export const weatherApiRouter = router({
  // Get current weather by city name
  getByCity: publicProcedure
    .input(z.object({
      city: z.string().min(1),
    }))
    .query(async ({ input }) => {
      const location = await geocodeCity(input.city);
      if (!location) {
        throw new Error("City not found");
      }

      const weatherData = await fetchWeatherData(location.lat, location.lon);
      if (!weatherData) {
        throw new Error("Unable to fetch weather data");
      }

      const current = weatherData.current;
      const weatherCode = current.weather_code;
      const weatherInfo = WMO_CODES[weatherCode] || { condition: "clear", description: "Unknown" };

      // Format forecast
      const forecast = weatherData.daily.time.slice(1, 6).map((date: string, i: number) => ({
        date,
        dayOfWeek: getDayOfWeek(date),
        high: Math.round(weatherData.daily.temperature_2m_max[i + 1]),
        low: Math.round(weatherData.daily.temperature_2m_min[i + 1]),
        condition: WMO_CODES[weatherData.daily.weather_code[i + 1]]?.condition || "clear",
        description: WMO_CODES[weatherData.daily.weather_code[i + 1]]?.description || "Unknown",
        precipChance: weatherData.daily.precipitation_probability_max[i + 1] || 0,
      }));

      return {
        location: location.state 
          ? `${location.name}, ${location.state}`
          : `${location.name}, ${location.country}`,
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        windDirection: getWindDirection(current.wind_direction_10m),
        condition: weatherInfo.condition,
        description: weatherInfo.description,
        forecast,
        lastUpdated: new Date().toISOString(),
      };
    }),

  // Get weather by coordinates
  getByCoordinates: publicProcedure
    .input(z.object({
      lat: z.number(),
      lon: z.number(),
    }))
    .query(async ({ input }) => {
      const weatherData = await fetchWeatherData(input.lat, input.lon);
      if (!weatherData) {
        throw new Error("Unable to fetch weather data");
      }

      const current = weatherData.current;
      const weatherCode = current.weather_code;
      const weatherInfo = WMO_CODES[weatherCode] || { condition: "clear", description: "Unknown" };

      // Reverse geocode to get location name
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${input.lat}&longitude=${input.lon}&count=1`
      );
      let locationName = `${input.lat.toFixed(2)}, ${input.lon.toFixed(2)}`;
      
      // Try reverse geocoding with nominatim
      try {
        const reverseResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${input.lat}&lon=${input.lon}&format=json`
        );
        const reverseData = await reverseResponse.json();
        if (reverseData.address) {
          const addr = reverseData.address;
          locationName = addr.city || addr.town || addr.village || addr.county || locationName;
          if (addr.state) locationName += `, ${addr.state}`;
        }
      } catch (e) {
        // Use coordinates as fallback
      }

      // Format forecast
      const forecast = weatherData.daily.time.slice(1, 6).map((date: string, i: number) => ({
        date,
        dayOfWeek: getDayOfWeek(date),
        high: Math.round(weatherData.daily.temperature_2m_max[i + 1]),
        low: Math.round(weatherData.daily.temperature_2m_min[i + 1]),
        condition: WMO_CODES[weatherData.daily.weather_code[i + 1]]?.condition || "clear",
        description: WMO_CODES[weatherData.daily.weather_code[i + 1]]?.description || "Unknown",
        precipChance: weatherData.daily.precipitation_probability_max[i + 1] || 0,
      }));

      return {
        location: locationName,
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        windDirection: getWindDirection(current.wind_direction_10m),
        condition: weatherInfo.condition,
        description: weatherInfo.description,
        forecast,
        lastUpdated: new Date().toISOString(),
      };
    }),
});

export type WeatherApiRouter = typeof weatherApiRouter;
