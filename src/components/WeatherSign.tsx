import React from 'react';
import { motion } from 'motion/react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  Snowflake,
  CloudLightning,
  CloudFog,
  Moon,
  RefreshCw,
} from 'lucide-react';
import { WeatherCity, LiveWeatherData } from '../utils/weather';
import { sound } from '../utils/sound';

interface Props {
  city: WeatherCity;
  weather: LiveWeatherData | null;
  isLoading: boolean;
  onClick: () => void;
}

export const WeatherSign: React.FC<Props> = ({
  city,
  weather,
  isLoading,
  onClick,
}) => {
  // Render corresponding weather icon according to online condition
  const renderWeatherIcon = () => {
    if (!weather) {
      return <Sun className="w-4 h-4 text-amber-300 animate-spin" />;
    }

    const { conditionKey, isDay } = weather;

    switch (conditionKey) {
      case 'sunny':
        return isDay ? (
          <Sun className="w-4 h-4 text-amber-300 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
        ) : (
          <Moon className="w-4 h-4 text-cyan-200 filter drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
        );
      case 'partly_cloudy':
        return isDay ? (
          <CloudSun className="w-4 h-4 text-amber-200" />
        ) : (
          <Cloud className="w-4 h-4 text-cyan-200/80" />
        );
      case 'cloudy':
        return <Cloud className="w-4 h-4 text-slate-300" />;
      case 'rain':
        return (
          <CloudRain className="w-4 h-4 text-sky-400 filter drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]" />
        );
      case 'snow':
        return (
          <Snowflake className="w-4 h-4 text-cyan-200 filter drop-shadow-[0_0_8px_rgba(165,243,252,0.8)] animate-pulse" />
        );
      case 'thunderstorm':
        return (
          <CloudLightning className="w-4 h-4 text-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
        );
      case 'fog':
        return <CloudFog className="w-4 h-4 text-slate-300/80" />;
      default:
        return <Sun className="w-4 h-4 text-amber-300" />;
    }
  };

  const conditionText = weather ? weather.conditionName : 'Online Syncing...';

  const tooltipText = weather
    ? `${city.name} (${city.country}): ${weather.tempC}°C · ${conditionText} · Tap to change city`
    : `${city.name}: Fetching live weather...`;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={() => {
        sound.playGlassTap(1250, 0.04, 0.12);
        onClick();
      }}
      className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.07] hover:bg-white/[0.14] active:bg-white/[0.18] border border-white/10 hover:border-white/20 backdrop-blur-xl transition-all cursor-pointer group shadow-sm select-none"
      title={tooltipText}
    >
      {/* Weather Icon (နေပူ၊ မိုးရွာ၊ နှင်းကျ စသည်) */}
      <div className="flex items-center justify-center shrink-0">
        {renderWeatherIcon()}
      </div>

      {/* Temperature & Live Indicator */}
      {weather && (
        <span className="text-[11px] font-mono font-medium text-white/90 group-hover:text-cyan-200 transition-colors">
          {weather.tempC}°
        </span>
      )}

      {/* Subtle Sync Spin on Refresh */}
      {isLoading && (
        <RefreshCw className="w-2.5 h-2.5 text-cyan-300 animate-spin shrink-0 opacity-80" />
      )}
    </motion.button>
  );
};
