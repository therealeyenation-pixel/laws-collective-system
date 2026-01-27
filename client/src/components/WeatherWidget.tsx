import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  RefreshCw,
  CloudFog,
  CloudLightning,
} from "lucide-react";
import { toast } from "sonner";

interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  forecast: ForecastDay[];
  lastUpdated: string;
}

interface ForecastDay {
  date: string;
  dayOfWeek: string;
  high: number;
  low: number;
  condition: string;
  description: string;
  precipChance: number;
}

interface WeatherWidgetProps {
  className?: string;
  compact?: boolean;
}

// Weather condition to icon mapping
const getWeatherIcon = (condition: string) => {
  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes("thunder") || conditionLower.includes("lightning")) {
    return CloudLightning;
  }
  if (conditionLower.includes("rain") || conditionLower.includes("shower") || conditionLower.includes("drizzle")) {
    return CloudRain;
  }
  if (conditionLower.includes("snow") || conditionLower.includes("sleet")) {
    return CloudSnow;
  }
  if (conditionLower.includes("fog") || conditionLower.includes("mist")) {
    return CloudFog;
  }
  if (conditionLower.includes("cloud") || conditionLower.includes("overcast")) {
    return Cloud;
  }
  if (conditionLower.includes("partly") || conditionLower.includes("mostly")) {
    return CloudSun;
  }
  if (conditionLower.includes("clear") || conditionLower.includes("sunny")) {
    return Sun;
  }
  if (conditionLower.includes("wind")) {
    return Wind;
  }
  return CloudSun;
};

export function WeatherWidget({ className = "", compact = false }: WeatherWidgetProps) {
  // Get user preferences for weather location and unit
  const { data: preferences } = trpc.userPreferences.getPreferences.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });

  const userLocation = preferences?.weatherLocation || "Atlanta, GA";
  const temperatureUnit = preferences?.weatherUnit || "fahrenheit";

  // Fetch real weather data from API
  const { 
    data: weatherData, 
    isLoading, 
    error, 
    refetch 
  } = trpc.weatherApi.getByCity.useQuery(
    { city: userLocation },
    {
      staleTime: 15 * 60 * 1000, // Cache for 15 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    }
  );

  // Convert temperature based on user preference
  const convertTemp = useMemo(() => {
    return (tempF: number) => {
      if (temperatureUnit === "celsius") {
        return Math.round((tempF - 32) * 5 / 9);
      }
      return tempF;
    };
  }, [temperatureUnit]);

  const unitLabel = temperatureUnit === "celsius" ? "C" : "F";

  const handleRefresh = async () => {
    await refetch();
    toast.success("Weather updated");
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-20">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weatherData) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-20 text-muted-foreground">
            <Cloud className="w-6 h-6 mr-2" />
            <span className="text-sm">Weather unavailable</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const WeatherIcon = getWeatherIcon(weatherData.condition);

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-3">
            {/* Location */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{weatherData.location}</span>
            </div>
            {/* Temperature and condition */}
            <div className="flex items-center gap-3">
              <WeatherIcon className="w-10 h-10 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{convertTemp(weatherData.temperature)}°</span>
                  <span className="text-sm text-muted-foreground">{unitLabel}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{weatherData.description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* Header with location and refresh */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{weatherData.location}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Current weather */}
        <div className="flex items-center gap-4 mb-4">
          <WeatherIcon className="w-16 h-16 text-blue-500" />
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{convertTemp(weatherData.temperature)}°</span>
              <span className="text-lg text-muted-foreground">{unitLabel}</span>
            </div>
            <p className="text-muted-foreground">{weatherData.description}</p>
          </div>
        </div>

        {/* Weather details */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Thermometer className="w-4 h-4" />
            <span>Feels {convertTemp(weatherData.feelsLike)}°</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Droplets className="w-4 h-4" />
            <span>{weatherData.humidity}%</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Wind className="w-4 h-4" />
            <span>{weatherData.windSpeed} mph {weatherData.windDirection}</span>
          </div>
        </div>

        {/* 5-day forecast */}
        {weatherData.forecast && weatherData.forecast.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">5-Day Forecast</p>
            <div className="grid grid-cols-5 gap-2">
              {weatherData.forecast.slice(0, 5).map((day, index) => {
                const DayIcon = getWeatherIcon(day.condition);
                return (
                  <div key={index} className="text-center">
                    <p className="text-xs text-muted-foreground">{day.dayOfWeek.slice(0, 3)}</p>
                    <DayIcon className="w-6 h-6 mx-auto my-1 text-blue-400" />
                    <p className="text-xs">
                      <span className="font-medium">{convertTemp(day.high)}°</span>
                      <span className="text-muted-foreground"> / {convertTemp(day.low)}°</span>
                    </p>
                    {day.precipChance > 0 && (
                      <p className="text-xs text-blue-400">{day.precipChance}%</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WeatherWidget;
