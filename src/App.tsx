/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Sliders,
  Code2,
  FlaskConical,
  Smartphone,
  Maximize2,
  Volume2,
  VolumeX,
  Globe,
  NotebookTabs,
  Rotate3d,
} from 'lucide-react';
import { FrostedVaporBackground } from './components/FrostedVaporBackground';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { ScientificKeypad } from './components/ScientificKeypad';
import { HistoryDrawer } from './components/HistoryDrawer';
import { NotepadDrawer } from './components/NotepadDrawer';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';
import { FlutterCodeModal } from './components/FlutterCodeModal';
import { MobileFrame } from './components/MobileFrame';
import { Card3DContainer } from './components/Card3DContainer';
import { StockForecastCard } from './components/StockForecastCard';
import { WorldMarketTicker } from './components/WorldMarketTicker';
import { WeatherSign } from './components/WeatherSign';
import {
  WeatherCity,
  WORLD_WEATHER_CITIES,
  DEFAULT_WEATHER_CITY,
  LiveWeatherData,
  fetchLiveWeather,
} from './utils/weather';
import {
  Operator,
  HistoryItem,
  NoteEntry,
  ButtonSizingMode,
  VaporDensity,
  AuroraTheme,
} from './types';
import {
  SUPPORTED_LANGUAGES,
  LanguageNumeralSystem,
  getLanguageById,
} from './utils/languages';
import { evaluateExpression, cleanFloat, factorial } from './utils/calculator';
import { sound } from './utils/sound';

export default function App() {
  // Calculator Core State
  const [display, setDisplay] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [activeOperator, setActiveOperator] = useState<Operator>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState<boolean>(false);
  const [lastCalculation, setLastCalculation] = useState<string>('');

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('auracalc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Notepad Saved Drafts State
  const [notes, setNotes] = useState<NoteEntry[]>(() => {
    try {
      const saved = localStorage.getItem('auracalc_notes');
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  // 3D Paper Sheet Rotation State (180° flip)
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Multilingual Numeral System State
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageNumeralSystem>(() => {
    try {
      const savedLang = localStorage.getItem('auracalc_lang');
      return savedLang ? getLanguageById(savedLang) : SUPPORTED_LANGUAGES[0];
    } catch {
      return SUPPORTED_LANGUAGES[0];
    }
  });

  // UI Theme & Viewport State
  const [sizingMode, setSizingMode] = useState<ButtonSizingMode>(() => {
    try {
      const saved = localStorage.getItem('auracalc_sizing_mode');
      return (saved as ButtonSizingMode) || 'organic';
    } catch {
      return 'organic';
    }
  });

  const [vaporDensity, setVaporDensity] = useState<VaporDensity>(() => {
    try {
      const saved = localStorage.getItem('auracalc_vapor_density');
      return (saved as VaporDensity) || 'misty';
    } catch {
      return 'misty';
    }
  });

  const [auroraTheme, setAuroraTheme] = useState<AuroraTheme>(() => {
    try {
      const saved = localStorage.getItem('auracalc_theme');
      return (saved as AuroraTheme) || 'sunset_aurora';
    } catch {
      return 'sunset_aurora';
    }
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [enableWipeEffect, setEnableWipeEffect] = useState<boolean>(true);
  const [showPhoneFrame, setShowPhoneFrame] = useState<boolean>(true);
  const [showScientific, setShowScientific] = useState<boolean>(false);

  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isNotepadOpen, setIsNotepadOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'language' | 'theme' | 'region'>('theme');
  const [isFlutterModalOpen, setIsFlutterModalOpen] = useState<boolean>(false);

  // Selected Weather Region / City
  const [selectedCity, setSelectedCity] = useState<WeatherCity>(() => {
    try {
      const savedId = localStorage.getItem('auracalc_weather_city');
      if (savedId) {
        const found = WORLD_WEATHER_CITIES.find((c) => c.id === savedId);
        if (found) return found;
      }
    } catch {
      // Ignore
    }
    return DEFAULT_WEATHER_CITY;
  });

  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(() => {
    try {
      const saved = localStorage.getItem('auracalc_cached_weather');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return null;
  });

  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);

  // Periodic online live weather update (Initial load + every 15 min)
  useEffect(() => {
    let isMounted = true;

    const loadWeather = async () => {
      try {
        setIsWeatherLoading(true);
        const data = await fetchLiveWeather(selectedCity);
        if (isMounted) {
          setWeatherData(data);
          try {
            localStorage.setItem('auracalc_cached_weather', JSON.stringify(data));
          } catch {
            // Ignore
          }
        }
      } catch (err) {
        console.warn('Weather fetch warning:', err);
      } finally {
        if (isMounted) {
          setIsWeatherLoading(false);
        }
      }
    };

    loadWeather();
    // Auto-update every 15 minutes
    const timer = setInterval(loadWeather, 15 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [selectedCity]);

  // Persist selected city
  useEffect(() => {
    try {
      localStorage.setItem('auracalc_weather_city', selectedCity.id);
    } catch {
      // Ignore
    }
  }, [selectedCity]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('auracalc_history', JSON.stringify(history.slice(0, 30)));
    } catch {
      // Ignore
    }
  }, [history]);

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('auracalc_notes', JSON.stringify(notes.slice(0, 50)));
    } catch {
      // Ignore
    }
  }, [notes]);

  // Save language to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('auracalc_lang', selectedLanguage.id);
    } catch {
      // Ignore
    }
  }, [selectedLanguage]);

  // Save theme, vapor density & sizing to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('auracalc_theme', auroraTheme);
      localStorage.setItem('auracalc_vapor_density', vaporDensity);
      localStorage.setItem('auracalc_sizing_mode', sizingMode);
    } catch {
      // Ignore
    }
  }, [auroraTheme, vaporDensity, sizingMode]);

  // Sync sound settings
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // 3D Flip handlers
  const handleFlipToggle = useCallback(() => {
    sound.playGlassTap(1150, 0.04, 0.12);
    setIsFlipped((prev) => !prev);
  }, []);

  // Digit Input Handler
  const handleDigit = useCallback(
    (digit: string) => {
      setDisplay((prev) => {
        if (prev === '0' || shouldResetDisplay) {
          setShouldResetDisplay(false);
          return digit;
        }
        if (prev.replace(/[,-]/g, '').length >= 10) {
          return prev;
        }
        return prev + digit;
      });
    },
    [shouldResetDisplay]
  );

  // Decimal Dot Handler
  const handleDecimal = useCallback(() => {
    setDisplay((prev) => {
      if (shouldResetDisplay) {
        setShouldResetDisplay(false);
        return '0.';
      }
      if (!prev.includes('.')) {
        return prev + '.';
      }
      return prev;
    });
  }, [shouldResetDisplay]);

  // Operator Handler (+, -, ×, ÷)
  const handleOperator = useCallback(
    (op: Operator) => {
      const currentVal = parseFloat(display.replace(/,/g, ''));
      if (isNaN(currentVal)) return;

      if (firstOperand !== null && activeOperator !== null && !shouldResetDisplay) {
        try {
          const res = evaluateExpression(firstOperand, currentVal, activeOperator);
          setFirstOperand(res);
          setDisplay(String(res));
          setExpression(`${res} ${op}`);
          setLastCalculation(`${firstOperand} ${activeOperator} ${currentVal} = ${res}`);
        } catch {
          setDisplay('Error');
          setFirstOperand(null);
          setActiveOperator(null);
          return;
        }
      } else {
        setFirstOperand(currentVal);
        setExpression(`${currentVal} ${op}`);
      }

      setActiveOperator(op);
      setShouldResetDisplay(true);
    },
    [display, firstOperand, activeOperator, shouldResetDisplay]
  );

  // Equal Handler
  const handleEqual = useCallback(() => {
    if (firstOperand === null || activeOperator === null) return;
    const currentVal = parseFloat(display.replace(/,/g, ''));
    if (isNaN(currentVal)) return;

    try {
      const res = evaluateExpression(firstOperand, currentVal, activeOperator);
      const exprString = `${firstOperand} ${activeOperator} ${currentVal}`;
      const resString = String(res);

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        expression: exprString,
        result: resString,
        timestamp: Date.now(),
      };

      setHistory((prev) => [newItem, ...prev]);
      setLastCalculation(`${exprString} = ${resString}`);

      setDisplay(resString);
      setExpression('');
      setFirstOperand(res);
      setActiveOperator(null);
      setShouldResetDisplay(true);
    } catch {
      setDisplay('Error');
      setFirstOperand(null);
      setActiveOperator(null);
      setExpression('');
    }
  }, [firstOperand, activeOperator, display]);

  // Save current calculation to Notes (Draft)
  const handleSaveToNotes = useCallback(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    let calcText = '';
    let expr = expression;
    let res = display;

    if (lastCalculation && shouldResetDisplay) {
      calcText = lastCalculation;
      const parts = lastCalculation.split(' = ');
      expr = parts[0] || expression;
      res = parts[1] || display;
    } else if (expression) {
      calcText = `${expression} = ${display}`;
      res = display;
    } else {
      calcText = display;
      expr = display;
      res = display;
    }

    const newNote: NoteEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      title: `Draft #${notes.length + 1}`,
      expression: expr,
      result: res,
      fullCalculation: calcText,
      timestamp: Date.now(),
      dateStr,
      timeStr,
      content: '',
    };

    setNotes((prev) => [newNote, ...prev]);
  }, [display, expression, lastCalculation, shouldResetDisplay, notes.length]);

  // Clear Handler
  const handleClear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setFirstOperand(null);
    setActiveOperator(null);
    setShouldResetDisplay(false);
  }, []);

  // Backspace Handler
  const handleBackspace = useCallback(() => {
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  }, []);

  // Toggle Sign (±)
  const handleToggleSign = useCallback(() => {
    setDisplay((prev) => {
      if (prev === '0' || prev === 'Error') return prev;
      return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
    });
  }, []);

  // Percentage Handler (%)
  const handlePercentage = useCallback(() => {
    const current = parseFloat(display.replace(/,/g, ''));
    if (isNaN(current)) return;

    if (firstOperand !== null && activeOperator !== null) {
      const pctValue = cleanFloat((firstOperand * current) / 100);
      setDisplay(String(pctValue));
    } else {
      const res = cleanFloat(current / 100);
      setDisplay(String(res));
    }
  }, [display, firstOperand, activeOperator]);

  // Notepad Note Handlers
  const handleUpdateNote = (id: string, updates: Partial<NoteEntry>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDeleteMultipleNotes = (ids: string[]) => {
    const idSet = new Set(ids);
    setNotes((prev) => prev.filter((n) => !idSet.has(n.id)));
  };

  const handleClearAllNotes = () => {
    setNotes([]);
  };

  // Scientific Actions Handler
  const handleScientific = useCallback(
    (action: string) => {
      const current = parseFloat(display.replace(/,/g, ''));
      if (isNaN(current) && action !== 'pi' && action !== 'e' && action !== 'rand') return;

      switch (action) {
        case 'sqr':
          setDisplay(String(cleanFloat(current * current)));
          break;
        case 'cube':
          setDisplay(String(cleanFloat(current * current * current)));
          break;
        case '^':
          handleOperator('^');
          break;
        case 'sqrt':
          if (current < 0) setDisplay('Error');
          else setDisplay(String(cleanFloat(Math.sqrt(current))));
          break;
        case 'cbrt':
          setDisplay(String(cleanFloat(Math.cbrt(current))));
          break;
        case 'exp':
          setDisplay(String(cleanFloat(Math.exp(current))));
          break;
        case 'tenPow':
          setDisplay(String(cleanFloat(Math.pow(10, current))));
          break;
        case 'recip':
          if (current === 0) setDisplay('Error');
          else setDisplay(String(cleanFloat(1 / current)));
          break;
        case 'ln':
          if (current <= 0) setDisplay('Error');
          else setDisplay(String(cleanFloat(Math.log(current))));
          break;
        case 'log10':
          if (current <= 0) setDisplay('Error');
          else setDisplay(String(cleanFloat(Math.log10(current))));
          break;
        case 'fact':
          const f = factorial(current);
          setDisplay(isNaN(f) ? 'Error' : String(f));
          break;
        case 'sin':
          setDisplay(String(cleanFloat(Math.sin((current * Math.PI) / 180))));
          break;
        case 'cos':
          setDisplay(String(cleanFloat(Math.cos((current * Math.PI) / 180))));
          break;
        case 'tan':
          setDisplay(String(cleanFloat(Math.tan((current * Math.PI) / 180))));
          break;
        case 'pi':
          setDisplay(String(Math.PI));
          break;
        case 'e':
          setDisplay(String(Math.E));
          break;
        case 'rand':
          setDisplay(String(cleanFloat(Math.random())));
          break;
        default:
          break;
      }
      setShouldResetDisplay(true);
    },
    [display, handleOperator]
  );

  // Keyboard shortcut listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isFlutterModalOpen || isSettingsOpen || isNotepadOpen) return;

      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*' || e.key === 'x') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEqual();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === '%') {
        handlePercentage();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isFlutterModalOpen,
    isSettingsOpen,
    isNotepadOpen,
    handleDigit,
    handleDecimal,
    handleOperator,
    handleEqual,
    handleBackspace,
    handleClear,
    handlePercentage,
  ]);

  // FRONT CONTENT: Frosted Glass Apple Calculator
  const renderFrontCalculator = () => (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
      {/* Frosted Vapor & Fluid Aurora Glass Background */}
      <FrostedVaporBackground
        theme={auroraTheme}
        vaporDensity={vaporDensity}
        enableWipeEffect={enableWipeEffect}
      />

      {/* Top In-App Action Bar */}
      <div className="relative z-20 px-4 pt-3 pb-1 flex items-center justify-between text-white/70">
        {/* Left slot: History & Notepad beside each other (No notification dot) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playGlassTap(1000, 0.04, 0.12);
              setIsHistoryOpen(true);
            }}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="Calculation History"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Clean Notepad icon (No noti dot as requested) */}
          <button
            onClick={() => {
              sound.playGlassTap(1150, 0.04, 0.12);
              setIsNotepadOpen(true);
            }}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all cursor-pointer text-white/70 hover:text-cyan-300"
            title="Calculation Notes (Drafts)"
          >
            <NotebookTabs className="w-4 h-4" />
          </button>
        </div>

        {/* Center / Middle slot: LIVE WEATHER SIGN (နေပူ၊ မိုးရွာ၊ နှင်းကျ အခြေအနေ) */}
        <div className="flex-1 flex items-center justify-center px-1">
          <WeatherSign
            city={selectedCity}
            weather={weatherData}
            isLoading={isWeatherLoading}
            onClick={() => {
              setSettingsInitialTab('region');
              setIsSettingsOpen(true);
            }}
          />
        </div>

        {/* Right slot: 3D Flip, Scientific & Settings */}
        <div className="flex items-center gap-1">
          {/* Quick 3D Flip to Stock Forecast Screen */}
          <button
            onClick={handleFlipToggle}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 text-cyan-300 transition-all cursor-pointer"
            title="Flip to Top 10 Stocks & Pro Forecasts"
          >
            <Rotate3d className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowScientific(!showScientific)}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              showScientific ? 'bg-amber-400/20 text-amber-300' : 'hover:bg-white/10'
            }`}
            title="Scientific Mode"
          >
            <FlaskConical className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Big Number Autoscaling Display with Save Icon */}
      <Display
        value={display}
        expression={expression}
        language={selectedLanguage}
        onBackspace={handleBackspace}
        onClear={handleClear}
        onSaveToNotes={handleSaveToNotes}
      />

      {/* Expandable Scientific Keypad */}
      {showScientific && (
        <ScientificKeypad onScientificAction={handleScientific} />
      )}

      {/* Organic Uneven Circular Pebble Keypad */}
      <Keypad
        displayValue={display}
        activeOperator={activeOperator}
        sizingMode={sizingMode}
        language={selectedLanguage}
        onDigit={handleDigit}
        onOperator={handleOperator}
        onEqual={handleEqual}
        onClear={handleClear}
        onToggleSign={handleToggleSign}
        onPercentage={handlePercentage}
        onDecimal={handleDecimal}
      />

      {/* World Market Live Ticker (Gold, Oil, Dollar, Bitcoin with Sparkline Trend Graphs) */}
      <WorldMarketTicker
        onSelectPrice={(priceVal) => {
          setDisplay(priceVal);
          setShouldResetDisplay(true);
        }}
      />
    </div>
  );

  // BACK CONTENT: Real-time Top 10 Stocks & 5 Pro Trader Forecasts
  const renderBackStockForecast = () => (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
      {/* Sleek Frosted Vapor Glass Background synced with Calc Theme */}
      <FrostedVaporBackground
        theme={auroraTheme}
        vaporDensity={vaporDensity}
        enableWipeEffect={enableWipeEffect}
      />

      <StockForecastCard
        onFlipBack={handleFlipToggle}
        onSelectPrice={(priceVal) => {
          setDisplay(priceVal);
          setShouldResetDisplay(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-cyan-500/30">
      {/* 1. Global Navigation Top Bar */}
      <header className="relative z-40 w-full border-b border-white/10 bg-slate-950/60 backdrop-blur-xl px-4 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-violet-500 to-amber-300 p-[1.5px] flex items-center justify-center shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-slate-950/80 rounded-full flex items-center justify-center text-xs font-bold text-white">
              AC
            </div>
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-white block">
              AuraCalc
            </span>
          </div>
        </div>

        {/* Navigation Links & Toggles */}
        <nav className="hidden md:flex items-center gap-5 text-xs text-white/70">
          {/* 3D Paper Flip Toggle */}
          <button
            onClick={handleFlipToggle}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-cyan-300 font-medium px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20"
            title="Flip 3D Paper Screen"
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>{isFlipped ? 'Calculator' : 'Stock Forecast'}</span>
          </button>

          <button
            onClick={() => {
              setSettingsInitialTab('language');
              setIsSettingsOpen(true);
            }}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Language: {selectedLanguage.flag} {selectedLanguage.name}</span>
          </button>

          <button
            onClick={() => {
              setSettingsInitialTab('theme');
              setIsSettingsOpen(true);
            }}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Theme & Shape</span>
          </button>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          {/* Notepad button (clean, no noti badge as requested) */}
          <button
            onClick={() => {
              sound.playGlassTap(1100, 0.04, 0.12);
              setIsNotepadOpen(true);
            }}
            className="hover:text-white transition-all flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-full text-white/70"
            title="Open Calculation Notes"
          >
            <NotebookTabs className="w-3.5 h-3.5 text-cyan-400" />
            <span>Notes</span>
          </button>

          <button
            onClick={() => setShowScientific(!showScientific)}
            className={`transition-colors flex items-center gap-1.5 cursor-pointer ${
              showScientific ? 'text-amber-400 font-medium' : 'hover:text-white'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Scientific</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Toggle Glass Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-white/40" />
            )}
            <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>
        </nav>

        {/* Primary Action Button: Flutter Mobile Code Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFlutterModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-medium tracking-tight shadow-md shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Flutter Code (Dart)</span>
          </button>
        </div>
      </header>

      {/* 2. Main Calculator App Container with 3D Paper Sheet Capabilities */}
      <main className="flex-1 flex items-center justify-center p-0 sm:p-6 overflow-hidden w-full h-full">
        <MobileFrame
          showPhoneFrame={showPhoneFrame}
          onToggleFrame={() => setShowPhoneFrame(!showPhoneFrame)}
          onOpenFlutterCode={() => setIsFlutterModalOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleScientific={() => setShowScientific(!showScientific)}
          isScientificOpen={showScientific}
        >
          {/* 3D Paper Card Flip Container (Touch Swipe enabled) */}
          <Card3DContainer
            frontContent={renderFrontCalculator()}
            backContent={renderBackStockForecast()}
            isFlipped={isFlipped}
            onFlipToggle={handleFlipToggle}
          />

          {/* History Slide-down Drawer */}
          <HistoryDrawer
            isOpen={isHistoryOpen}
            history={history}
            language={selectedLanguage}
            onClose={() => setIsHistoryOpen(false)}
            onSelect={(item) => {
              setDisplay(item.result);
              setExpression('');
              setFirstOperand(parseFloat(item.result));
              setActiveOperator(null);
              setIsHistoryOpen(false);
            }}
            onClear={() => setHistory([])}
          />

          {/* Calculation Notepad Drawer */}
          <NotepadDrawer
            isOpen={isNotepadOpen}
            onClose={() => setIsNotepadOpen(false)}
            notes={notes}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onDeleteMultipleNotes={handleDeleteMultipleNotes}
            onClearAllNotes={handleClearAllNotes}
            onSelectResult={(result) => {
              setDisplay(result);
              setExpression('');
              setFirstOperand(parseFloat(result));
              setActiveOperator(null);
            }}
            language={selectedLanguage}
          />

          {/* Theme & Button Sizing Modal */}
          <ThemeSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            sizingMode={sizingMode}
            onSizingModeChange={setSizingMode}
            vaporDensity={vaporDensity}
            onVaporDensityChange={setVaporDensity}
            theme={auroraTheme}
            onThemeChange={setAuroraTheme}
            soundEnabled={soundEnabled}
            onSoundToggle={() => setSoundEnabled(!soundEnabled)}
            enableWipeEffect={enableWipeEffect}
            onWipeToggle={() => setEnableWipeEffect(!enableWipeEffect)}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            weather={weatherData}
            initialTab={settingsInitialTab}
          />
        </MobileFrame>
      </main>

      {/* 3. Flutter Source Code Modal */}
      <FlutterCodeModal
        isOpen={isFlutterModalOpen}
        onClose={() => setIsFlutterModalOpen(false)}
      />

      {/* 4. Subtle Clean English Footer */}
      <footer className="relative z-30 px-6 py-2.5 text-center text-xs text-white/40 flex items-center justify-center gap-4">
        <span>AuraCalc 3D Paper Sheet Edition</span>
        <span>·</span>
        <span>Life Mortality Counter</span>
        <span>·</span>
        <span>360° Rotatable Glass</span>
      </footer>
    </div>
  );
}
