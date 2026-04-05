/**
 * Weather Integration Service
 * Provides weather data for location-based forecasts
 */

// Types
export type WeatherCondition = 'clear' | 'cloudy' | 'partly_cloudy' | 'rain' | 'snow' | 'thunderstorm' | 'fog' | 'windy';
export type TemperatureUnit = 'fahrenheit' | 'celsius';

export interface WeatherData {
  location: {
    city: string;
    state?: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    condition: WeatherCondition;
    description: string;
    icon: string;
    uvIndex: number;
    visibility: number;
    pressure: number;
  };
  forecast: DailyForecast[];
  alerts: WeatherAlert[];
  lastUpdated: string;
}

export interface DailyForecast {
  date: string;
  dayOfWeek: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  description: string;
  icon: string;
  precipChance: number;
  humidity: number;
  windSpeed: number;
}

export interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'advisory';
  event: string;
  headline: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  startTime: string;
  endTime: string;
}

export interface WeatherWidgetConfig {
  location: string;
  unit: TemperatureUnit;
  showForecast: boolean;
  forecastDays: number;
  showAlerts: boolean;
  refreshInterval: number; // minutes
}

// Weather condition icons (emoji-based for simplicity)
const WEATHER_ICONS: Record<WeatherCondition, string> = {
  clear: '☀️',
  cloudy: '☁️',
  partly_cloudy: '⛅',
  rain: '🌧️',
  snow: '❄️',
  thunderstorm: '⛈️',
  fog: '🌫️',
  windy: '💨'
};

// Wind direction from degrees
export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Convert temperature
export function convertTemperature(temp: number, from: TemperatureUnit, to: TemperatureUnit): number {
  if (from === to) return temp;
  if (from === 'celsius' && to === 'fahrenheit') {
    return Math.round((temp * 9/5) + 32);
  }
  return Math.round((temp - 32) * 5/9);
}

// Format temperature for display
export function formatTemperature(temp: number, unit: TemperatureUnit): string {
  const symbol = unit === 'fahrenheit' ? '°F' : '°C';
  return `${Math.round(temp)}${symbol}`;
}

// Get weather icon
export function getWeatherIcon(condition: WeatherCondition): string {
  return WEATHER_ICONS[condition] || '🌡️';
}

// Determine condition from description
export function parseWeatherCondition(description: string): WeatherCondition {
  const desc = description.toLowerCase();
  if (desc.includes('thunder') || desc.includes('storm')) return 'thunderstorm';
  if (desc.includes('snow') || desc.includes('sleet') || desc.includes('ice')) return 'snow';
  if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) return 'rain';
  if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) return 'fog';
  if (desc.includes('wind')) return 'windy';
  if (desc.includes('cloud') && desc.includes('part')) return 'partly_cloudy';
  if (desc.includes('cloud') || desc.includes('overcast')) return 'cloudy';
  return 'clear';
}

// Generate mock weather data for testing
export function getMockWeatherData(city: string = 'New York'): WeatherData {
  const conditions: WeatherCondition[] = ['clear', 'cloudy', 'partly_cloudy', 'rain'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  const baseTemp = 50 + Math.floor(Math.random() * 40);

  const forecast: DailyForecast[] = [];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek: days[date.getDay()],
      high: baseTemp + Math.floor(Math.random() * 10),
      low: baseTemp - 10 + Math.floor(Math.random() * 5),
      condition: dayCondition,
      description: dayCondition.replace('_', ' '),
      icon: WEATHER_ICONS[dayCondition],
      precipChance: dayCondition === 'rain' ? 60 + Math.floor(Math.random() * 40) : Math.floor(Math.random() * 30),
      humidity: 40 + Math.floor(Math.random() * 40),
      windSpeed: 5 + Math.floor(Math.random() * 15)
    });
  }

  return {
    location: {
      city,
      state: 'NY',
      country: 'USA',
      lat: 40.7128,
      lon: -74.0060
    },
    current: {
      temperature: baseTemp,
      feelsLike: baseTemp - 3,
      humidity: 55,
      windSpeed: 12,
      windDirection: 'NW',
      condition: randomCondition,
      description: randomCondition.replace('_', ' '),
      icon: WEATHER_ICONS[randomCondition],
      uvIndex: 5,
      visibility: 10,
      pressure: 30.12
    },
    forecast,
    alerts: [],
    lastUpdated: new Date().toISOString()
  };
}

// Generate weather alert
export function createWeatherAlert(
  event: string,
  severity: WeatherAlert['severity'],
  headline: string,
  description: string,
  startTime: string,
  endTime: string
): WeatherAlert {
  return {
    id: `ALERT-${Date.now()}`,
    type: severity === 'extreme' || severity === 'severe' ? 'warning' : 
          severity === 'moderate' ? 'watch' : 'advisory',
    event,
    headline,
    description,
    severity,
    startTime,
    endTime
  };
}

// Get weather summary for dashboard
export function getWeatherSummary(data: WeatherData): {
  headline: string;
  details: string;
  alerts: number;
  icon: string;
} {
  const { current, alerts } = data;
  
  return {
    headline: `${formatTemperature(current.temperature, 'fahrenheit')} - ${current.description}`,
    details: `Feels like ${formatTemperature(current.feelsLike, 'fahrenheit')}. Humidity ${current.humidity}%. Wind ${current.windSpeed} mph ${current.windDirection}.`,
    alerts: alerts.length,
    icon: current.icon
  };
}

// Get outfit recommendation based on weather
export function getOutfitRecommendation(data: WeatherData): string {
  const { current } = data;
  const temp = current.temperature;
  const condition = current.condition;

  let recommendation = '';

  // Temperature-based
  if (temp < 32) {
    recommendation = 'Heavy winter coat, hat, gloves, and warm layers recommended.';
  } else if (temp < 50) {
    recommendation = 'Jacket or coat recommended. Consider layers.';
  } else if (temp < 65) {
    recommendation = 'Light jacket or sweater recommended.';
  } else if (temp < 80) {
    recommendation = 'Comfortable casual clothing. Light layers optional.';
  } else {
    recommendation = 'Light, breathable clothing recommended. Stay hydrated.';
  }

  // Condition-based additions
  if (condition === 'rain' || condition === 'thunderstorm') {
    recommendation += ' Bring an umbrella and waterproof footwear.';
  } else if (condition === 'snow') {
    recommendation += ' Waterproof boots and warm accessories essential.';
  } else if (current.uvIndex >= 6) {
    recommendation += ' Sunscreen and sunglasses recommended.';
  }

  return recommendation;
}

// Check if weather affects outdoor activities
export function checkOutdoorConditions(data: WeatherData): {
  suitable: boolean;
  reason?: string;
  recommendations: string[];
} {
  const { current, alerts } = data;
  const recommendations: string[] = [];
  
  // Check for severe alerts
  if (alerts.some(a => a.severity === 'extreme' || a.severity === 'severe')) {
    return {
      suitable: false,
      reason: 'Severe weather alert in effect',
      recommendations: ['Stay indoors', 'Monitor weather updates', 'Have emergency supplies ready']
    };
  }

  // Check conditions
  if (current.condition === 'thunderstorm') {
    return {
      suitable: false,
      reason: 'Thunderstorm conditions',
      recommendations: ['Avoid outdoor activities', 'Stay away from tall objects', 'Seek shelter']
    };
  }

  if (current.temperature > 100 || current.temperature < 20) {
    return {
      suitable: false,
      reason: current.temperature > 100 ? 'Extreme heat' : 'Extreme cold',
      recommendations: current.temperature > 100 
        ? ['Stay hydrated', 'Limit outdoor exposure', 'Seek air conditioning']
        : ['Limit outdoor exposure', 'Dress in layers', 'Watch for frostbite signs']
    };
  }

  // Suitable with recommendations
  if (current.condition === 'rain') {
    recommendations.push('Bring rain gear');
  }
  if (current.uvIndex >= 6) {
    recommendations.push('Apply sunscreen');
  }
  if (current.windSpeed > 20) {
    recommendations.push('Be aware of strong winds');
  }

  return {
    suitable: true,
    recommendations
  };
}

// Default widget config
export function getDefaultWidgetConfig(): WeatherWidgetConfig {
  return {
    location: 'auto', // Use geolocation
    unit: 'fahrenheit',
    showForecast: true,
    forecastDays: 5,
    showAlerts: true,
    refreshInterval: 30
  };
}
