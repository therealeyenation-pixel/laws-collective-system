import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

// NWS API is free and doesn't require an API key
const NWS_API_BASE = "https://api.weather.gov";

interface NWSAlert {
  id: string;
  areaDesc: string;
  headline: string;
  description: string;
  instruction: string | null;
  severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
  certainty: "Observed" | "Likely" | "Possible" | "Unlikely" | "Unknown";
  urgency: "Immediate" | "Expected" | "Future" | "Past" | "Unknown";
  event: string;
  effective: string;
  expires: string;
  senderName: string;
}

interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  instruction: string | null;
  severity: "extreme" | "severe" | "moderate" | "minor";
  type: string;
  area: string;
  effective: Date;
  expires: Date;
  source: string;
}

// Map state abbreviations to NWS zone codes (simplified)
const stateToZone: Record<string, string> = {
  "GA": "GAZ",
  "NY": "NYZ",
  "CA": "CAZ",
  "TX": "TXZ",
  "FL": "FLZ",
  "IL": "ILZ",
  "PA": "PAZ",
  "OH": "OHZ",
  "NC": "NCZ",
  "MI": "MIZ",
};

async function getCoordinatesFromLocation(location: string): Promise<{ lat: number; lon: number } | null> {
  // Simple geocoding using Open-Meteo's geocoding API
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
      };
    }
  } catch (error) {
    console.error("[WeatherAlerts] Geocoding error:", error);
  }
  return null;
}

async function getPointInfo(lat: number, lon: number): Promise<{ forecastZone: string; county: string } | null> {
  try {
    const response = await fetch(`${NWS_API_BASE}/points/${lat.toFixed(4)},${lon.toFixed(4)}`, {
      headers: {
        "User-Agent": "(LuvOnPurpose, contact@luvonpurpose.com)",
        "Accept": "application/geo+json",
      },
    });
    
    if (!response.ok) {
      console.error("[WeatherAlerts] NWS point lookup failed:", response.status);
      return null;
    }
    
    const data = await response.json();
    return {
      forecastZone: data.properties?.forecastZone?.split("/").pop() || "",
      county: data.properties?.county?.split("/").pop() || "",
    };
  } catch (error) {
    console.error("[WeatherAlerts] Point info error:", error);
    return null;
  }
}

async function fetchAlertsByZone(zoneId: string): Promise<NWSAlert[]> {
  try {
    const response = await fetch(`${NWS_API_BASE}/alerts/active/zone/${zoneId}`, {
      headers: {
        "User-Agent": "(LuvOnPurpose, contact@luvonpurpose.com)",
        "Accept": "application/geo+json",
      },
    });
    
    if (!response.ok) {
      console.error("[WeatherAlerts] NWS alerts fetch failed:", response.status);
      return [];
    }
    
    const data = await response.json();
    return (data.features || []).map((f: any) => f.properties as NWSAlert);
  } catch (error) {
    console.error("[WeatherAlerts] Fetch alerts error:", error);
    return [];
  }
}

function mapSeverity(nwsSeverity: string): "extreme" | "severe" | "moderate" | "minor" {
  switch (nwsSeverity) {
    case "Extreme": return "extreme";
    case "Severe": return "severe";
    case "Moderate": return "moderate";
    default: return "minor";
  }
}

function transformAlert(nwsAlert: NWSAlert): WeatherAlert {
  return {
    id: nwsAlert.id,
    title: nwsAlert.headline || nwsAlert.event,
    description: nwsAlert.description,
    instruction: nwsAlert.instruction,
    severity: mapSeverity(nwsAlert.severity),
    type: nwsAlert.event,
    area: nwsAlert.areaDesc,
    effective: new Date(nwsAlert.effective),
    expires: new Date(nwsAlert.expires),
    source: nwsAlert.senderName,
  };
}

export const weatherAlertsRouter = router({
  // Get active weather alerts for a location
  getAlerts: publicProcedure
    .input(z.object({
      location: z.string().optional().default("Atlanta, GA"),
    }))
    .query(async ({ input }) => {
      const coords = await getCoordinatesFromLocation(input.location);
      if (!coords) {
        return { alerts: [], location: input.location, error: "Could not geocode location" };
      }
      
      const pointInfo = await getPointInfo(coords.lat, coords.lon);
      if (!pointInfo) {
        return { alerts: [], location: input.location, error: "Location not in NWS coverage area" };
      }
      
      const nwsAlerts = await fetchAlertsByZone(pointInfo.forecastZone);
      const alerts = nwsAlerts.map(transformAlert);
      
      // Sort by severity (extreme first) then by effective date
      alerts.sort((a, b) => {
        const severityOrder = { extreme: 0, severe: 1, moderate: 2, minor: 3 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return new Date(b.effective).getTime() - new Date(a.effective).getTime();
      });
      
      return {
        alerts,
        location: input.location,
        coordinates: coords,
        zone: pointInfo.forecastZone,
        lastUpdated: new Date(),
      };
    }),

  // Get alerts by state (for broader coverage)
  getAlertsByState: publicProcedure
    .input(z.object({
      state: z.string().length(2),
    }))
    .query(async ({ input }) => {
      try {
        const response = await fetch(`${NWS_API_BASE}/alerts/active?area=${input.state}`, {
          headers: {
            "User-Agent": "(LuvOnPurpose, contact@luvonpurpose.com)",
            "Accept": "application/geo+json",
          },
        });
        
        if (!response.ok) {
          return { alerts: [], state: input.state, error: "Failed to fetch state alerts" };
        }
        
        const data = await response.json();
        const nwsAlerts = (data.features || []).map((f: any) => f.properties as NWSAlert);
        const alerts = nwsAlerts.map(transformAlert);
        
        // Sort by severity
        alerts.sort((a, b) => {
          const severityOrder = { extreme: 0, severe: 1, moderate: 2, minor: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        });
        
        return {
          alerts,
          state: input.state,
          count: alerts.length,
          lastUpdated: new Date(),
        };
      } catch (error) {
        console.error("[WeatherAlerts] State alerts error:", error);
        return { alerts: [], state: input.state, error: "Network error" };
      }
    }),

  // Get alert types summary (for dashboard widgets)
  getAlertSummary: publicProcedure
    .input(z.object({
      location: z.string().optional().default("Atlanta, GA"),
    }))
    .query(async ({ input }) => {
      const coords = await getCoordinatesFromLocation(input.location);
      if (!coords) {
        return { 
          hasAlerts: false, 
          count: 0, 
          highestSeverity: null,
          types: [],
        };
      }
      
      const pointInfo = await getPointInfo(coords.lat, coords.lon);
      if (!pointInfo) {
        return { 
          hasAlerts: false, 
          count: 0, 
          highestSeverity: null,
          types: [],
        };
      }
      
      const nwsAlerts = await fetchAlertsByZone(pointInfo.forecastZone);
      const alerts = nwsAlerts.map(transformAlert);
      
      if (alerts.length === 0) {
        return {
          hasAlerts: false,
          count: 0,
          highestSeverity: null,
          types: [],
        };
      }
      
      const severityOrder = { extreme: 0, severe: 1, moderate: 2, minor: 3 };
      const highestSeverity = alerts.reduce((highest, alert) => {
        return severityOrder[alert.severity] < severityOrder[highest] ? alert.severity : highest;
      }, "minor" as "extreme" | "severe" | "moderate" | "minor");
      
      const types = [...new Set(alerts.map(a => a.type))];
      
      return {
        hasAlerts: true,
        count: alerts.length,
        highestSeverity,
        types,
        location: input.location,
      };
    }),
});

export type WeatherAlertsRouter = typeof weatherAlertsRouter;
