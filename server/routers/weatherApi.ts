import { publicProcedure, router } from "@/server/_core/trpc";
import { z } from "zod";

// Mock weather data - in production, this would call a real weather API
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
    humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
    windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 mph
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
    .query(({ input }) => {
      try {
        const weatherData = getMockWeatherData(input.city);
        return weatherData;
      } catch (error) {
        console.error("Error fetching weather data:", error);
        throw new Error("Failed to fetch weather data");
      }
    }),

  getByCoordinates: publicProcedure
    .input(z.object({ lat: z.number(), lon: z.number() }))
    .query(({ input }) => {
      try {
        // For now, use a default city name
        const weatherData = getMockWeatherData(`Location (${input.lat}, ${input.lon})`);
        return weatherData;
      } catch (error) {
        console.error("Error fetching weather data:", error);
        throw new Error("Failed to fetch weather data");
      }
    }),
});
