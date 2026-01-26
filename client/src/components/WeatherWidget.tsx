import { useState, useEffect, useMemo } from "react";
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
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: ForecastDay[];
}

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
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
  if (conditionLower.includes("rain") || conditionLower.includes("shower")) {
    return CloudRain;
  }
  if (conditionLower.includes("snow") || conditionLower.includes("sleet")) {
    return CloudSnow;
  }
  if (conditionLower.includes("fog") || conditionLower.includes("mist")) {
    return CloudFog;
  }
  if (conditionLower.includes("cloud") && conditionLower.includes("sun")) {
    return CloudSun;
  }
  if (conditionLower.includes("cloud") || conditionLower.includes("overcast")) {
    return Cloud;
  }
  return Sun;
};

// Mock weather data - in production, this would come from an API
const mockWeatherData: WeatherData = {
  location: "Atlanta, GA",
  temperature: 52,
  feelsLike: 48,
  condition: "Partly Cloudy",
  humidity: 65,
  windSpeed: 8,
  icon: "partly-cloudy",
  forecast: [
    { day: "Today", high: 55, low: 42, condition: "Partly Cloudy" },
    { day: "Sat", high: 58, low: 44, condition: "Sunny" },
    { day: "Sun", high: 54, low: 40, condition: "Cloudy" },
    { day: "Mon", high: 50, low: 38, condition: "Rain" },
    { day: "Tue", high: 52, low: 39, condition: "Partly Cloudy" },
  ],
};

export function WeatherWidget({ className = "", compact = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user preferences for weather location and unit
  const { data: preferences } = trpc.userPreferences.getPreferences.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });

  const userLocation = preferences?.weatherLocation || "Atlanta, GA";
  const temperatureUnit = preferences?.weatherUnit || "fahrenheit";

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

  useEffect(() => {
    // Simulate API call
    const fetchWeather = async () => {
      setLoading(true);
      try {
        // In production, this would be a real API call
        // const response = await fetch(`/api/weather?location=${userLocation}`);
        // const data = await response.json();
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Update mock data with user's location
        setWeather({
          ...mockWeatherData,
          location: userLocation,
        });
        setError(null);
      } catch (err) {
        setError("Unable to load weather data");
        toast.error("Failed to load weather data");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [userLocation]);

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setWeather(mockWeatherData);
    setLoading(false);
    toast.success("Weather updated");
  };

  if (loading) {
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

  if (error || !weather) {
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

  const WeatherIcon = getWeatherIcon(weather.condition);

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WeatherIcon className="w-8 h-8 text-blue-500" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold">{convertTemp(weather.temperature)}°</span>
                  <span className="text-sm text-muted-foreground">{unitLabel}</span>
                </div>
                <p className="text-xs text-muted-foreground">{weather.condition}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{weather.location}</span>
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
            <span>{weather.location}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Current weather */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <WeatherIcon className="w-12 h-12 text-blue-500" />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{convertTemp(weather.temperature)}</span>
                <span className="text-xl text-muted-foreground">°{unitLabel}</span>
              </div>
              <p className="text-sm text-muted-foreground">{weather.condition}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Thermometer className="w-4 h-4" />
              <span>Feels like {convertTemp(weather.feelsLike)}°{unitLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Droplets className="w-4 h-4" />
              <span>{weather.humidity}% humidity</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wind className="w-4 h-4" />
              <span>{weather.windSpeed} mph</span>
            </div>
          </div>
        </div>

        {/* 5-day forecast */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-5 gap-2">
            {weather.forecast.map((day, index) => {
              const DayIcon = getWeatherIcon(day.condition);
              return (
                <div key={index} className="text-center">
                  <p className="text-xs font-medium mb-1">{day.day}</p>
                  <DayIcon className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs">
                    <span className="font-medium">{convertTemp(day.high)}°</span>
                    <span className="text-muted-foreground"> / {convertTemp(day.low)}°</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WeatherWidget;
