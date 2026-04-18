import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

// Open-Meteo WMO Weather interpretation codes
const getWeatherDescription = (code: number): string => {
  if (code === 0) return "Clear";
  if (code === 1) return "Mostly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Fog";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 56 && code <= 57) return "Freezing Drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 66 && code <= 67) return "Freezing Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code >= 85 && code <= 86) return "Snow Showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
};

const getWindDirection = (degrees: number): string => {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Geocode city name to lat/lon using Open-Meteo Geocoding API (free, no key)
const geocodeCity = async (city: string): Promise<{ lat: number; lon: number; name: string; country: string } | null> => {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.results || data.results.length === 0) return null;
    const result = data.results[0];
    return {
      lat: result.latitude,
      lon: result.longitude,
      name: result.name,
      country: result.country_code || result.country || "",
    };
  } catch (error) {
    console.error(`Geocoding error for ${city}:`, error);
    return null;
  }
};

// Fetch weather data from Open-Meteo API (free, no API key required)
const getWeatherData = async (lat: number, lon: number, locationName: string) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=6`
    );

    if (!response.ok) {
      console.warn(`Open-Meteo API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const current = data.current;
    const daily = data.daily;

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return {
      location: locationName,
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      condition: getWeatherDescription(current.weather_code),
      description: getWeatherDescription(current.weather_code).toLowerCase(),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: getWindDirection(current.wind_direction_10m || 0),
      lastUpdated: new Date().toISOString(),
      forecast: daily.time.slice(1, 6).map((date: string, i: number) => {
        const d = new Date(date + "T12:00:00");
        return {
          date,
          dayOfWeek: days[d.getDay()],
          high: Math.round(daily.temperature_2m_max[i + 1]),
          low: Math.round(daily.temperature_2m_min[i + 1]),
          condition: getWeatherDescription(daily.weather_code[i + 1]),
          description: getWeatherDescription(daily.weather_code[i + 1]).toLowerCase(),
          precipChance: daily.precipitation_probability_max[i + 1] || 0,
        };
      }),
    };
  } catch (error) {
    console.error(`Error fetching weather:`, error);
    return null;
  }
};

// Fallback mock data if API fails
const getMockWeatherData = (city: string) => {
  const weatherConditions = [
    { condition: "Partly Cloudy", description: "Partly cloudy skies", temp: 72, feelsLike: 70 },
    { condition: "Sunny", description: "Clear and sunny", temp: 75, feelsLike: 74 },
    { condition: "Cloudy", description: "Mostly cloudy", temp: 68, feelsLike: 66 },
    { condition: "Rain", description: "Light rain", temp: 65, feelsLike: 62 },
  ];

  const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

  return {
    location: city,
    temperature: randomWeather.temp,
    feelsLike: randomWeather.feelsLike,
    condition: randomWeather.condition,
    description: randomWeather.description,
    humidity: Math.floor(Math.random() * 40) + 40,
    windSpeed: Math.floor(Math.random() * 15) + 5,
    windDirection: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(Math.random() * 8)],
    lastUpdated: new Date().toISOString(),
    forecast: [
      { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], dayOfWeek: "Tomorrow", high: 75, low: 62, condition: "Sunny", description: "Sunny", precipChance: 0 },
      { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], dayOfWeek: "Day 3", high: 72, low: 60, condition: "Partly Cloudy", description: "Partly cloudy", precipChance: 10 },
      { date: new Date(Date.now() + 259200000).toISOString().split('T')[0], dayOfWeek: "Day 4", high: 68, low: 58, condition: "Cloudy", description: "Cloudy", precipChance: 30 },
      { date: new Date(Date.now() + 345600000).toISOString().split('T')[0], dayOfWeek: "Day 5", high: 70, low: 59, condition: "Rain", description: "Light rain", precipChance: 60 },
      { date: new Date(Date.now() + 432000000).toISOString().split('T')[0], dayOfWeek: "Day 6", high: 73, low: 61, condition: "Partly Cloudy", description: "Partly cloudy", precipChance: 20 },
    ],
  };
};

export const weatherApiRouter = router({
  getByCity: publicProcedure
    .input(z.object({ city: z.string().min(1).max(100) }))
    .query(async ({ input }) => {
      try {
        // Geocode city name to coordinates
        const geo = await geocodeCity(input.city);
        if (!geo) {
          console.warn(`Could not geocode city: ${input.city}, using mock data`);
          return getMockWeatherData(input.city);
        }

        // Fetch real weather data from Open-Meteo (free, no API key)
        const weather = await getWeatherData(geo.lat, geo.lon, `${geo.name}, ${geo.country}`);
        if (weather) return weather;

        console.warn(`Falling back to mock weather data for ${input.city}`);
        return getMockWeatherData(input.city);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        return getMockWeatherData(input.city);
      }
    }),

  getByCoordinates: publicProcedure
    .input(z.object({ lat: z.number(), lon: z.number() }))
    .query(async ({ input }) => {
      try {
        const weather = await getWeatherData(input.lat, input.lon, `Location (${input.lat.toFixed(2)}, ${input.lon.toFixed(2)})`);
        if (weather) return weather;

        return getMockWeatherData(`Location (${input.lat.toFixed(2)}, ${input.lon.toFixed(2)})`);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        return getMockWeatherData(`Location (${input.lat.toFixed(2)}, ${input.lon.toFixed(2)})`);
      }
    }),
});
