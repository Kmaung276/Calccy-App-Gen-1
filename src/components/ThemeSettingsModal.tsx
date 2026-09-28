import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  Hand,
  Globe,
  Palette,
  Search,
  Check,
  CloudFog,
  MapPin,
  Loader2,
} from 'lucide-react';
import { AuroraTheme, VaporDensity, ButtonSizingMode } from '../types';
import {
  SUPPORTED_LANGUAGES,
  LanguageNumeralSystem,
} from '../utils/languages';
import {
  WeatherCity,
  WORLD_WEATHER_CITIES,
  LiveWeatherData,
  searchGlobalCities,
} from '../utils/weather';
import { sound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sizingMode: ButtonSizingMode;
  onSizingModeChange: (mode: ButtonSizingMode) => void;
  vaporDensity: VaporDensity;
  onVaporDensityChange: (density: VaporDensity) => void;
  theme: AuroraTheme;
  onThemeChange: (theme: AuroraTheme) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  enableWipeEffect: boolean;
  onWipeToggle: () => void;
  selectedLanguage: LanguageNumeralSystem;
  onLanguageChange: (lang: LanguageNumeralSystem) => void;
  selectedCity: WeatherCity;
  onSelectCity: (city: WeatherCity) => void;
  weather: LiveWeatherData | null;
  initialTab?: 'language' | 'theme' | 'region';
}

export const ThemeSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sizingMode,
  onSizingModeChange,
  vaporDensity,
  onVaporDensityChange,
  theme,
  onThemeChange,
  soundEnabled,
  onSoundToggle,
  enableWipeEffect,
  onWipeToggle,
  selectedLanguage,
  onLanguageChange,
  selectedCity,
  onSelectCity,
  initialTab = 'theme',
}) => {
  const [activeTab, setActiveTab] = useState<'language' | 'theme' | 'region'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('All');
  const [cities, setCities] = useState<WeatherCity[]>(WORLD_WEATHER_CITIES);
  const [isSearching, setIsSearching] = useState(false);

  // Custom interactive scrollbar state
  const [thumbTop, setThumbTop] = useState<number>(0);
  const [thumbHeight, setThumbHeight] = useState<number>(44);
  const [isDraggingThumb, setIsDraggingThumb] = useState<boolean>(false);
  const cityListRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Update active tab when modal is opened with specific intent
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery('');
      setCities(WORLD_WEATHER_CITIES);
    }
  }, [isOpen, initialTab]);

  // Worldwide city search debounce
  useEffect(() => {
    if (activeTab !== 'region') return;

    let isSubscribed = true;
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setCities(WORLD_WEATHER_CITIES);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchGlobalCities(trimmed);
        if (isSubscribed) {
          setCities(results);
        }
      } catch {
        // Fallback
      } finally {
        if (isSubscribed) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [searchQuery, activeTab]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORTED_LANGUAGES;
    const q = searchQuery.toLowerCase().trim();
    return SUPPORTED_LANGUAGES.filter(
      (l) => l.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredCities = useMemo(() => {
    if (selectedRegionFilter === 'All') return cities;
    return cities.filter((c) => c.region === selectedRegionFilter);
  }, [cities, selectedRegionFilter]);

  // Dynamic Theme-matching Color Bar Style
  const themeScrollStyle = useMemo(() => {
    switch (theme) {
      case 'sunset_aurora':
        return {
          thumbGradient: 'bg-gradient-to-b from-amber-400 via-rose-500 to-indigo-500',
          glowShadow: 'shadow-[0_0_12px_rgba(244,63,94,0.7)]',
          accentBorder: 'border-rose-300/60',
        };
      case 'neon_bloom':
        return {
          thumbGradient: 'bg-gradient-to-b from-fuchsia-400 via-pink-500 to-cyan-400',
          glowShadow: 'shadow-[0_0_12px_rgba(236,72,153,0.7)]',
          accentBorder: 'border-fuchsia-300/60',
        };
      case 'deep_ocean':
        return {
          thumbGradient: 'bg-gradient-to-b from-cyan-300 via-blue-500 to-indigo-600',
          glowShadow: 'shadow-[0_0_12px_rgba(6,182,212,0.7)]',
          accentBorder: 'border-cyan-300/60',
        };
      case 'midnight_purple':
        return {
          thumbGradient: 'bg-gradient-to-b from-purple-300 via-indigo-500 to-violet-700',
          glowShadow: 'shadow-[0_0_12px_rgba(168,85,247,0.7)]',
          accentBorder: 'border-purple-300/60',
        };
      case 'frosted_emerald':
        return {
          thumbGradient: 'bg-gradient-to-b from-emerald-300 via-teal-500 to-cyan-700',
          glowShadow: 'shadow-[0_0_12px_rgba(16,185,129,0.7)]',
          accentBorder: 'border-emerald-300/60',
        };
      case 'liquid_silver':
        return {
          thumbGradient: 'bg-gradient-to-b from-white via-slate-300 to-slate-500',
          glowShadow: 'shadow-[0_0_12px_rgba(255,255,255,0.6)]',
          accentBorder: 'border-white/60',
        };
      case 'white_metallic':
        return {
          thumbGradient: 'bg-gradient-to-b from-white via-slate-200 to-slate-400',
          glowShadow: 'shadow-[0_0_12px_rgba(255,255,255,0.75)]',
          accentBorder: 'border-white/70',
        };
      default:
        return {
          thumbGradient: 'bg-gradient-to-b from-amber-400 via-rose-500 to-indigo-500',
          glowShadow: 'shadow-[0_0_12px_rgba(244,63,94,0.7)]',
          accentBorder: 'border-rose-300/60',
        };
    }
  }, [theme]);

  // Sync scrollbar position from list scroll
  const handleListScroll = useCallback(() => {
    if (!cityListRef.current || !trackRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = cityListRef.current;
    const trackHeight = trackRef.current.clientHeight;
    if (trackHeight <= 0) return;

    const maxScroll = scrollHeight - clientHeight;
    const calculatedHeight = Math.max(
      34,
      Math.min(trackHeight * 0.85, (clientHeight / Math.max(1, scrollHeight)) * trackHeight)
    );
    const availableTravel = trackHeight - calculatedHeight;

    const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
    const top = ratio * availableTravel;

    setThumbHeight(calculatedHeight);
    setThumbTop(top);
  }, []);

  // Update scrollbar dimensions when cities list or tab changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleListScroll();
    }, 60);
    return () => clearTimeout(timer);
  }, [filteredCities, activeTab, handleListScroll]);

  // Pointer drag on custom scrollbar
  const updateScrollFromPointer = useCallback(
    (clientY: number) => {
      if (!trackRef.current || !cityListRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const trackHeight = rect.height;
      const availableTravel = trackHeight - thumbHeight;
      if (availableTravel <= 0) return;

      const targetTop = clientY - rect.top - thumbHeight / 2;
      const clampedTop = Math.max(0, Math.min(availableTravel, targetTop));
      const ratio = clampedTop / availableTravel;

      const maxScroll = cityListRef.current.scrollHeight - cityListRef.current.clientHeight;
      cityListRef.current.scrollTop = ratio * maxScroll;
      setThumbTop(clampedTop);
    },
    [thumbHeight]
  );

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingThumb(true);
    sound.triggerHaptic(10);
    updateScrollFromPointer(e.clientY);
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingThumb) return;
    updateScrollFromPointer(e.clientY);
  };

  const handleTrackPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingThumb(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const THEMES: { id: AuroraTheme; name: string; gradient: string }[] = [
    {
      id: 'sunset_aurora',
      name: 'Sunset Aurora',
      gradient: 'from-orange-500 via-rose-500 to-indigo-600',
    },
    {
      id: 'neon_bloom',
      name: 'Neon Bloom',
      gradient: 'from-fuchsia-500 via-pink-500 to-cyan-400',
    },
    {
      id: 'deep_ocean',
      name: 'Deep Ocean',
      gradient: 'from-cyan-400 via-blue-600 to-indigo-900',
    },
    {
      id: 'midnight_purple',
      name: 'Midnight Purple',
      gradient: 'from-purple-500 via-indigo-600 to-slate-900',
    },
    {
      id: 'frosted_emerald',
      name: 'Frosted Emerald',
      gradient: 'from-emerald-400 via-teal-600 to-slate-900',
    },
    {
      id: 'liquid_silver',
      name: 'Liquid Silver',
      gradient: 'from-slate-200 via-slate-400 to-slate-700',
    },
    {
      id: 'white_metallic',
      name: 'White Metallic',
      gradient: 'from-white via-slate-100 to-slate-300',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-40 flex flex-col backdrop-blur-3xl bg-white/[0.08] dark:bg-black/[0.22] border border-white/20 text-white overflow-hidden rounded-[44px] shadow-2xl"
        >
          {/* Top Bar with Minimal Visual Segmented Switch */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10 bg-white/[0.02]">
            {/* Visual Segmented Control */}
            <div className="flex items-center p-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
              <button
                onClick={() => {
                  sound.playGlassTap(1100, 0.04, 0.1);
                  setActiveTab('language');
                  setSearchQuery('');
                }}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'language'
                    ? 'bg-white/30 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Language</span>
              </button>

              <button
                onClick={() => {
                  sound.playGlassTap(1200, 0.04, 0.1);
                  setActiveTab('theme');
                  setSearchQuery('');
                }}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'theme'
                    ? 'bg-white/30 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Theme</span>
              </button>

              {/* Region Tab */}
              <button
                onClick={() => {
                  sound.playGlassTap(1300, 0.04, 0.1);
                  setActiveTab('region');
                  setSearchQuery('');
                }}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'region'
                    ? 'bg-white/30 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-300" />
                <span>Region</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div
            className={`flex-1 flex flex-col ${
              activeTab === 'region' ? 'overflow-hidden p-4 space-y-2.5' : 'overflow-y-auto p-4 space-y-3'
            }`}
          >
            {activeTab === 'language' ? (
              /* TAB 1: Clean Country List */
              <div className="space-y-2.5">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search language..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors backdrop-blur-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {filteredCountries.map((lang) => {
                    const isSelected = selectedLanguage.id === lang.id;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => {
                          sound.playGlassTap(1300, 0.04, 0.12);
                          onLanguageChange(lang);
                        }}
                        className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer backdrop-blur-md select-none ${
                          isSelected
                            ? 'bg-white/25 border-white text-white shadow-md'
                            : 'bg-white/[0.06] border-white/10 text-white/70 hover:bg-white/[0.14] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base">{lang.flag}</span>
                          <span className="text-xs font-medium truncate">
                            {lang.name}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : activeTab === 'region' ? (
              /* TAB 3: World Region & Cities with Custom Translucent Glass & Theme Bar Scroll */
              <div className="flex-1 flex flex-col overflow-hidden space-y-2.5">
                {/* Search Bar */}
                <div className="relative shrink-0">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search any world city or country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition-colors backdrop-blur-md"
                  />
                  {isSearching && (
                    <Loader2 className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300 animate-spin" />
                  )}
                </div>

                {/* Region Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] shrink-0">
                  {['All', 'Asia', 'Europe', 'Americas', 'Middle East', 'Oceania', 'Africa'].map(
                    (reg) => (
                      <button
                        key={reg}
                        onClick={() => {
                          sound.playGlassTap(1050, 0.03, 0.08);
                          setSelectedRegionFilter(reg);
                        }}
                        className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                          selectedRegionFilter === reg
                            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 font-medium shadow-sm'
                            : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/60 border border-white/10'
                        }`}
                      >
                        {reg}
                      </button>
                    )
                  )}
                </div>

                {/* City List Container with Theme-adaptive Scrollbar */}
                <div className="flex-1 relative flex overflow-hidden gap-1.5 pt-0.5">
                  {/* Scrollable Cities List */}
                  <div
                    ref={cityListRef}
                    onScroll={handleListScroll}
                    className="flex-1 overflow-y-auto pr-0.5 space-y-1.5 scrollbar-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {filteredCities.length === 0 ? (
                      <div className="text-center py-8 text-white/40 text-xs">
                        No matching cities found in world database.
                      </div>
                    ) : (
                      filteredCities.map((city) => {
                        const isSelected =
                          selectedCity.name.toLowerCase() === city.name.toLowerCase() &&
                          selectedCity.country.toLowerCase() === city.country.toLowerCase();

                        return (
                          <button
                            key={city.id}
                            onClick={() => {
                              sound.playGlassTap(1350, 0.04, 0.14);
                              onSelectCity(city);
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer backdrop-blur-md select-none ${
                              isSelected
                                ? 'bg-cyan-500/20 border-cyan-400/50 text-white shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                                : 'bg-white/[0.05] border-white/10 text-white/80 hover:bg-white/[0.12] hover:text-white'
                            }`}
                          >
                            <div className="min-w-0 truncate">
                              <div className="text-xs font-medium text-white truncate">
                                {city.name}
                              </div>
                              <div className="text-[11px] text-white/45 truncate mt-0.5">
                                {city.country} : {city.region}
                              </div>
                            </div>

                            {isSelected && (
                              <Check className="w-4 h-4 text-cyan-300 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Translucent Frosted Glass Scrollbar Track + Dynamic Theme Bar ("မူလအကြည်ရောင်ပေါ် Theme အလိုက် auto လိုက်ဖတ်တဲ့ color တန်းနဲ့ scroll ရွေ့လို့ရအောင်") */}
                  <div
                    ref={trackRef}
                    onPointerDown={handleTrackPointerDown}
                    onPointerMove={handleTrackPointerMove}
                    onPointerUp={handleTrackPointerUp}
                    onPointerCancel={handleTrackPointerUp}
                    className="relative w-5 h-full flex items-center justify-center shrink-0 cursor-pointer select-none touch-none"
                    title="Drag or tap to scroll cities"
                  >
                    {/* Translucent Frosted Glass Track Background ("မူလအကြည်ရောင်") */}
                    <div className="w-1.5 h-full rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 backdrop-blur-md transition-colors" />

                    {/* Auto Theme-Adaptive Color Bar Thumb ("Theme အလိုက် auto လိုက်ဖတ်တဲ့ color တန်း") */}
                    <div
                      className={`absolute w-2.5 rounded-full border ${themeScrollStyle.thumbGradient} ${themeScrollStyle.glowShadow} ${themeScrollStyle.accentBorder} transition-all duration-75 ${
                        isDraggingThumb
                          ? 'w-3 scale-105 brightness-115 shadow-xl'
                          : 'hover:scale-105'
                      }`}
                      style={{
                        top: `${thumbTop}px`,
                        height: `${thumbHeight}px`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: Themes & Appearance */
              <div className="space-y-4">
                {/* 1. Theme Color Presets */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
                    Background Aurora Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map((t) => {
                      const isSelected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            sound.playGlassTap(1200, 0.04, 0.12);
                            onThemeChange(t.id);
                          }}
                          className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer backdrop-blur-md select-none ${
                            isSelected
                              ? 'bg-white/25 border-white text-white shadow-md'
                              : 'bg-white/[0.06] border-white/10 text-white/70 hover:bg-white/[0.14]'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full bg-gradient-to-tr ${t.gradient} shadow-inner shrink-0 border border-white/30`}
                          />
                          <span className="text-xs font-medium truncate">
                            {t.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Glass Button Sizing Mode */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
                    Glass Pebble Sizing
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['organic', 'droplet', 'classic'] as ButtonSizingMode[]).map(
                      (mode) => {
                        const isSelected = sizingMode === mode;
                        return (
                          <button
                            key={mode}
                            onClick={() => {
                              sound.playGlassTap(1150, 0.04, 0.1);
                              onSizingModeChange(mode);
                            }}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer backdrop-blur-md ${
                              isSelected
                                ? 'bg-white/25 border-white text-white shadow-md font-semibold'
                                : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/[0.14]'
                            }`}
                          >
                            <span className="text-xs capitalize">{mode}</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* 3. Water Vapor Mist Density */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                    <CloudFog className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Frosted Glass Vapor Mist</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['subtle', 'misty', 'dense', 'droplets'] as VaporDensity[]).map(
                      (density) => {
                        const isSelected = vaporDensity === density;
                        return (
                          <button
                            key={density}
                            onClick={() => {
                              sound.playGlassTap(1100, 0.04, 0.1);
                              onVaporDensityChange(density);
                            }}
                            className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer backdrop-blur-md ${
                              isSelected
                                ? 'bg-white/25 border-white text-white shadow-md font-semibold'
                                : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/[0.14]'
                            }`}
                          >
                            <span className="text-[11px] capitalize">{density}</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* 4. Interactive Tactile Toggles */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  {/* Finger Wipe Toggle */}
                  <button
                    onClick={onWipeToggle}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer backdrop-blur-md ${
                      enableWipeEffect
                        ? 'bg-white/25 border-white text-white shadow-md'
                        : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/[0.14]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Hand className="w-4 h-4 text-cyan-300" />
                      <span className="text-xs font-medium">Finger Wipe</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
                      {enableWipeEffect ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Glass Sound Toggle */}
                  <button
                    onClick={onSoundToggle}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer backdrop-blur-md ${
                      soundEnabled
                        ? 'bg-white/25 border-white text-white shadow-md'
                        : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/[0.14]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-emerald-300" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-white/40" />
                      )}
                      <span className="text-xs font-medium">Sound</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
                      {soundEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
