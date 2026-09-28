/**
 * World Weather & Regional Geo-coordinates Service
 * Fetches real-time live online meteorological data & global city search via Open-Meteo
 * Pure English typography, zero country codes/flags, clean and minimal
 */

export interface WeatherCity {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  timeZone: string;
  region: string;
}

export interface LiveWeatherData {
  tempC: number;
  weatherCode: number;
  isDay: boolean;
  conditionKey: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rain' | 'snow' | 'thunderstorm' | 'fog';
  conditionName: string;
  humidity?: number;
  windSpeed?: number;
  lastUpdated: number;
}

function getRegionFromTimezone(tz?: string, country?: string): string {
  if (tz) {
    if (tz.startsWith('Asia')) {
      const middleEastCountries = ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'];
      if (country && middleEastCountries.includes(country)) return 'Middle East';
      return 'Asia';
    }
    if (tz.startsWith('Europe')) return 'Europe';
    if (tz.startsWith('America')) return 'Americas';
    if (tz.startsWith('Africa')) return 'Africa';
    if (tz.startsWith('Australia') || tz.startsWith('Pacific')) return 'Oceania';
  }
  return 'World';
}

export const WORLD_WEATHER_CITIES: WeatherCity[] = [
  // Myanmar
  { id: 'yangon', name: 'Yangon', country: 'Myanmar', lat: 16.8661, lon: 96.1951, timeZone: 'Asia/Yangon', region: 'Asia' },
  { id: 'mandalay', name: 'Mandalay', country: 'Myanmar', lat: 21.975, lon: 96.0836, timeZone: 'Asia/Yangon', region: 'Asia' },
  { id: 'naypyidaw', name: 'Naypyidaw', country: 'Myanmar', lat: 19.7633, lon: 96.0785, timeZone: 'Asia/Yangon', region: 'Asia' },
  { id: 'taunggyi', name: 'Taunggyi', country: 'Myanmar', lat: 20.7833, lon: 97.0333, timeZone: 'Asia/Yangon', region: 'Asia' },
  { id: 'bago', name: 'Bago', country: 'Myanmar', lat: 17.3353, lon: 96.4815, timeZone: 'Asia/Yangon', region: 'Asia' },
  { id: 'mawlamyine', name: 'Mawlamyine', country: 'Myanmar', lat: 16.4914, lon: 97.6283, timeZone: 'Asia/Yangon', region: 'Asia' },
  { id: 'pyinoolwin', name: 'Pyin Oo Lwin', country: 'Myanmar', lat: 22.0333, lon: 96.4667, timeZone: 'Asia/Yangon', region: 'Asia' },

  // Asia
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, timeZone: 'Asia/Bangkok', region: 'Asia' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, timeZone: 'Asia/Singapore', region: 'Asia' },
  { id: 'kualalumpur', name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lon: 101.6869, timeZone: 'Asia/Kuala_Lumpur', region: 'Asia' },
  { id: 'jakarta', name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456, timeZone: 'Asia/Jakarta', region: 'Asia' },
  { id: 'hanoi', name: 'Hanoi', country: 'Vietnam', lat: 21.0285, lon: 105.8542, timeZone: 'Asia/Bangkok', region: 'Asia' },
  { id: 'manila', name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842, timeZone: 'Asia/Manila', region: 'Asia' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, timeZone: 'Asia/Tokyo', region: 'Asia' },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.978, timeZone: 'Asia/Seoul', region: 'Asia' },
  { id: 'beijing', name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074, timeZone: 'Asia/Shanghai', region: 'Asia' },
  { id: 'shanghai', name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737, timeZone: 'Asia/Shanghai', region: 'Asia' },
  { id: 'hongkong', name: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lon: 114.1694, timeZone: 'Asia/Hong_Kong', region: 'Asia' },
  { id: 'taipei', name: 'Taipei', country: 'Taiwan', lat: 25.033, lon: 121.5654, timeZone: 'Asia/Taipei', region: 'Asia' },
  { id: 'delhi', name: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.209, timeZone: 'Asia/Kolkata', region: 'Asia' },
  { id: 'mumbai', name: 'Mumbai', country: 'India', lat: 19.076, lon: 72.8777, timeZone: 'Asia/Kolkata', region: 'Asia' },

  // Middle East
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708, timeZone: 'Asia/Dubai', region: 'Middle East' },
  { id: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753, timeZone: 'Asia/Riyadh', region: 'Middle East' },
  { id: 'doha', name: 'Doha', country: 'Qatar', lat: 25.2854, lon: 51.531, timeZone: 'Asia/Qatar', region: 'Middle East' },

  // Europe
  { id: 'london', name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, timeZone: 'Europe/London', region: 'Europe' },
  { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, timeZone: 'Europe/Paris', region: 'Europe' },
  { id: 'berlin', name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.405, timeZone: 'Europe/Berlin', region: 'Europe' },
  { id: 'frankfurt', name: 'Frankfurt', country: 'Germany', lat: 50.1109, lon: 8.6821, timeZone: 'Europe/Berlin', region: 'Europe' },
  { id: 'rome', name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964, timeZone: 'Europe/Rome', region: 'Europe' },
  { id: 'madrid', name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038, timeZone: 'Europe/Madrid', region: 'Europe' },
  { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041, timeZone: 'Europe/Amsterdam', region: 'Europe' },
  { id: 'zurich', name: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417, timeZone: 'Europe/Zurich', region: 'Europe' },
  { id: 'vienna', name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738, timeZone: 'Europe/Vienna', region: 'Europe' },
  { id: 'stockholm', name: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686, timeZone: 'Europe/Stockholm', region: 'Europe' },
  { id: 'oslo', name: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522, timeZone: 'Europe/Oslo', region: 'Europe' },

  // Americas
  { id: 'newyork', name: 'New York', country: 'United States', lat: 40.7128, lon: -74.006, timeZone: 'America/New_York', region: 'Americas' },
  { id: 'losangeles', name: 'Los Angeles', country: 'United States', lat: 34.0522, lon: -118.2437, timeZone: 'America/Los_Angeles', region: 'Americas' },
  { id: 'sanfrancisco', name: 'San Francisco', country: 'United States', lat: 37.7749, lon: -122.4194, timeZone: 'America/Los_Angeles', region: 'Americas' },
  { id: 'chicago', name: 'Chicago', country: 'United States', lat: 41.8781, lon: -87.6298, timeZone: 'America/Chicago', region: 'Americas' },
  { id: 'toronto', name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, timeZone: 'America/Toronto', region: 'Americas' },
  { id: 'vancouver', name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207, timeZone: 'America/Vancouver', region: 'Americas' },
  { id: 'mexicocity', name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, timeZone: 'America/Mexico_City', region: 'Americas' },
  { id: 'saopaulo', name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, timeZone: 'America/Sao_Paulo', region: 'Americas' },
  { id: 'buenosaires', name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816, timeZone: 'America/Argentina/Buenos_Aires', region: 'Americas' },

  // Oceania
  { id: 'sydney', name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, timeZone: 'Australia/Sydney', region: 'Oceania' },
  { id: 'melbourne', name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631, timeZone: 'Australia/Melbourne', region: 'Oceania' },
  { id: 'auckland', name: 'Auckland', country: 'New Zealand', lat: -36.8485, lon: 174.7633, timeZone: 'Pacific/Auckland', region: 'Oceania' },

  // Africa
  { id: 'cairo', name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, timeZone: 'Africa/Cairo', region: 'Africa' },
  { id: 'capetown', name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241, timeZone: 'Africa/Johannesburg', region: 'Africa' },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219, timeZone: 'Africa/Nairobi', region: 'Africa' },
];

export const DEFAULT_WEATHER_CITY = WORLD_WEATHER_CITIES[0]; // Yangon

/**
 * Global Worldwide City Search
 * Searches both local database and live Open-Meteo Worldwide Geocoding API
 */
export async function searchGlobalCities(query: string): Promise<WeatherCity[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return WORLD_WEATHER_CITIES;
  }

  // 1. Instant local match
  const q = trimmed.toLowerCase();
  const localMatches = WORLD_WEATHER_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
  );

  // If query is short, return local matches
  if (trimmed.length < 2) {
    return localMatches;
  }

  // 2. Fetch worldwide cities from free Open-Meteo Geocoding API
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed
    )}&count=25&language=en&format=json`;

    const res = await fetch(url);
    if (!res.ok) return localMatches;

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return localMatches;
    }

    const fetchedCities: WeatherCity[] = data.results.map((r: {
      id?: number;
      name: string;
      country?: string;
      latitude: number;
      longitude: number;
      timezone?: string;
    }) => {
      const country = r.country || 'Unknown';
      const region = getRegionFromTimezone(r.timezone, country);
      return {
        id: `geo-${r.id || r.name}-${r.latitude.toFixed(2)}-${r.longitude.toFixed(2)}`,
        name: r.name,
        country,
        lat: r.latitude,
        lon: r.longitude,
        timeZone: r.timezone || 'auto',
        region,
      };
    });

    // Merge: unique by name + country
    const seen = new Set<string>();
    const merged: WeatherCity[] = [];

    for (const c of [...localMatches, ...fetchedCities]) {
      const key = `${c.name.toLowerCase()}-${c.country.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(c);
      }
    }

    return merged;
  } catch {
    return localMatches;
  }
}

/**
 * Interpret WMO Weather Code
 */
export function interpretWmoCode(
  code: number,
  isDay: boolean = true
): {
  conditionKey: LiveWeatherData['conditionKey'];
  conditionName: string;
} {
  if (code === 0) {
    return {
      conditionKey: 'sunny',
      conditionName: isDay ? 'Sunny' : 'Clear',
    };
  }
  if (code === 1 || code === 2) {
    return {
      conditionKey: 'partly_cloudy',
      conditionName: 'Partly Cloudy',
    };
  }
  if (code === 3) {
    return {
      conditionKey: 'cloudy',
      conditionName: 'Overcast',
    };
  }
  if (code === 45 || code === 48) {
    return {
      conditionKey: 'fog',
      conditionName: 'Foggy',
    };
  }
  if (code >= 51 && code <= 57) {
    return {
      conditionKey: 'rain',
      conditionName: 'Drizzle',
    };
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      conditionKey: 'rain',
      conditionName: 'Rain',
    };
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return {
      conditionKey: 'snow',
      conditionName: 'Snow',
    };
  }
  if (code >= 95) {
    return {
      conditionKey: 'thunderstorm',
      conditionName: 'Thunderstorm',
    };
  }

  return {
    conditionKey: 'sunny',
    conditionName: 'Clear',
  };
}

/**
 * Fetch Live Weather from Open-Meteo Free API
 */
export async function fetchLiveWeather(city: WeatherCity): Promise<LiveWeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,is_day,wind_speed_10m&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather fetch failed: ${res.status}`);
  }

  const data = await res.json();
  const current = data.current;
  const isDay = current.is_day === 1;
  const weatherCode = current.weather_code ?? 0;
  const { conditionKey, conditionName } = interpretWmoCode(weatherCode, isDay);

  return {
    tempC: Math.round(current.temperature_2m),
    weatherCode,
    isDay,
    conditionKey,
    conditionName,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    lastUpdated: Date.now(),
  };
}
