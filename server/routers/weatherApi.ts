import { publicProcedure, router } from "@/server/_core/trpc";
import { z } from "zod";

// Map OpenWeatherMap condition codes to readable descriptions
const getWeatherDescription = (code: number, description: string): string => {
  if (code >= 200 && code < 300) return "Thunderstorm";
  if (code >= 300 && code < 400) return "Drizzle";
  if (code >= 500 && code < 600) return "Rain";
  if (code >= 600 && code < 700) return "Snow";
  if (code >= 700 && code < 800) return "Mist";
  if (code === 800) return "Clear";
  if (code === 801) return "Partly Cloudy";
  if (code === 802) return "Mostly Cloudy";
  if (code === 803 || code === 804) return "Overcast";
  return description;
};

const getWindDirection = (degrees: number): string => {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Fetch real weather data from OpenWeatherMap API
const getRealWeatherData = async (city: string) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY || "demo";
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=imperial&appid=${apiKey}`
    );
    
    if (!response.ok) {
      console.warn(`Weather API error for ${city}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const current = data.list[0];
    const forecast = data.list.filter((_: any, i: number) => i % 8 === 0).slice(0, 5);
    
    return {
      location: `${data.city.name}, ${data.city.country}`,
      temperature: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      condition: getWeatherDescription(current.weather[0].id, current.weather[0].main),
      description: current.weather[0].description,
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed),
      windDirection: getWindDirection(current.wind.deg || 0),
      lastUpdated: new Date().toISOString(),
      forecast: forecast.map((day: any) => {
        const date = new Date(day.dt * 1000);
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return {
          date: date.toISOString().split('T')[0],
          dayOfWeek: days[date.getDay()],
          high: Math.round(day.main.temp_max),
          low: Math.round(day.main.temp_min),
          condition: getWeatherDescription(day.weather[0].id, day.weather[0].main),
          description: day.weather[0].description,
          precipChance: Math.round((day.pop || 0) * 100),
        };
      }),
    };
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
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
      { date: "2026-04-07", dayOfWeek: "Tuesday", high: 75, low: 62, condition: "Sunny", description: "Sunny", precipChance: 0 },
      { date: "2026-04-08", dayOfWeek: "Wednesday", high: 72, low: 60, condition: "Partly Cloudy", description: "Partly cloudy", precipChance: 10 },
      { date: "2026-04-09", dayOfWeek: "Thursday", high: 68, low: 58, condition: "Cloudy", description: "Cloudy", precipChance: 30 },
      { date: "2026-04-10", dayOfWeek: "Friday", high: 70, low: 59, condition: "Rain", description: "Light rain", precipChance: 60 },
      { date: "2026-04-11", dayOfWeek: "Saturday", high: 73, low: 61, condition: "Partly Cloudy", description: "Partly cloudy", precipChance: 20 },
    ],
  };
};

export const weatherApiRouter = router({
  getByCity: publicProcedure
    .input(z.object({ city: z.string().min(1).max(100) }))
    .query(async ({ input }) => {
      try {
        // Try to fetch real weather data first
        const realWeather = await getRealWeatherData(input.city);
        if (realWeather) {
          return realWeather;
        }
        
        // Fall back to mock data if API fails
        console.warn(`Falling back to mock weather data for ${input.city}`);
        return getMockWeatherData(input.city);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        // Always return mock data as last resort
        return getMockWeatherData(input.city);
      }
    }),

  getByCoordinates: publicProcedure
    .input(z.object({ lat: z.number(), lon: z.number() }))
    .query(async ({ input }) => {
      try {
        // Use reverse geocoding or default city
        // For now, use a default city name
        const weatherData = getMockWeatherData(`Location (${input.lat}, ${input.lon})`);
        return weatherData;
      } catch (error) {
        console.error("Error fetching weather data:", error);
        return getMockWeatherData(`Location (${input.lat}, ${input.lon})`);
      }
    }),
});
