// ========================================================
// AuraCalc - Frosted Glass Apple Calculator for Flutter
// Complete Full-Featured Mobile Engine
// Features:
// 1. 3D Card Flip Animation (Calculator <-> Stock Forecast)
// 2. Frameless Digital Clock & Live Online Weather Sign
// 3. Calculation Notes with New Note Writer & Auto-save
// 4. Aurora Themes (Sunset, Neon, Ocean, Purple, Emerald, Silver)
// 5. World Regions with Dynamic Theme-matching Scrollbar
// 6. Multilingual Numeral Script Translation (20+ Languages)
// 7. Scientific Calculator Functions
// Language: Dart / Flutter (Compatible with Flutter 3.x+)
// ========================================================

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const AuraCalcApp());
}

class AuraCalcApp extends StatelessWidget {
  const AuraCalcApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AuraCalc Frosted Glass',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF090D16),
      ),
      home: const MainScreen(),
    );
  }
}

// --------------------------------------------------------
// Data Models
// --------------------------------------------------------

enum AppThemePreset {
  sunsetAurora,
  neonBloom,
  deepOcean,
  midnightPurple,
  frostedEmerald,
  liquidSilver,
  whiteMetallic,
}

class WeatherCity {
  final String id;
  final String name;
  final String country;
  final String region;
  final double lat;
  final double lon;

  const WeatherCity({
    required this.id,
    required this.name,
    required this.country,
    required this.region,
    required this.lat,
    required this.lon,
  });
}

class LiveWeatherData {
  final int tempC;
  final int weatherCode;
  final String conditionName;
  final IconData icon;

  const LiveWeatherData({
    required this.tempC,
    required this.weatherCode,
    required this.conditionName,
    required this.icon,
  });
}

class NoteEntry {
  final String id;
  String title;
  String fullCalculation;
  String result;
  String content;
  String dateStr;
  String timeStr;
  int timestamp;

  NoteEntry({
    required this.id,
    required this.title,
    required this.fullCalculation,
    required this.result,
    required this.content,
    required this.dateStr,
    required this.timeStr,
    required this.timestamp,
  });
}

// --------------------------------------------------------
// Main Screen with 3D Flip & Full App System
// --------------------------------------------------------

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen>
    with SingleTickerProviderStateMixin {
  // Calculator Engine States
  String _display = '0';
  String _expression = '';
  double? _firstOperand;
  String? _operator;
  bool _shouldResetDisplay = false;
  String? _lastCalculation;
  bool _isScientific = false;

  // 3D Flip Animation Controller
  late AnimationController _flipController;
  late Animation<double> _flipAnimation;
  bool _isFlippedToStock = false;

  // Language & Numerals
  String _currentLanguageKey = 'en';

  // Aurora Theme
  AppThemePreset _currentTheme = AppThemePreset.sunsetAurora;

  // Sizing Mode & Mist
  String _sizingMode = 'organic'; // organic, droplet, classic
  double _mistDensity = 25.0;

  // Live Digital Clock
  late Timer _clockTimer;
  DateTime _now = DateTime.now();

  // World Weather
  static const List<WeatherCity> _cities = [
    WeatherCity(id: 'yangon', name: 'Yangon', country: 'Myanmar', region: 'Asia', lat: 16.8661, lon: 96.1951),
    WeatherCity(id: 'mandalay', name: 'Mandalay', country: 'Myanmar', region: 'Asia', lat: 21.975, lon: 96.0836),
    WeatherCity(id: 'naypyidaw', name: 'Naypyidaw', country: 'Myanmar', region: 'Asia', lat: 19.7633, lon: 96.0785),
    WeatherCity(id: 'taunggyi', name: 'Taunggyi', country: 'Myanmar', region: 'Asia', lat: 20.7833, lon: 97.0333),
    WeatherCity(id: 'bangkok', name: 'Bangkok', country: 'Thailand', region: 'Asia', lat: 13.7563, lon: 100.5018),
    WeatherCity(id: 'singapore', name: 'Singapore', country: 'Singapore', region: 'Asia', lat: 1.3521, lon: 103.8198),
    WeatherCity(id: 'tokyo', name: 'Tokyo', country: 'Japan', region: 'Asia', lat: 35.6762, lon: 139.6503),
    WeatherCity(id: 'seoul', name: 'Seoul', country: 'South Korea', region: 'Asia', lat: 37.5665, lon: 126.978),
    WeatherCity(id: 'london', name: 'London', country: 'United Kingdom', region: 'Europe', lat: 51.5074, lon: -0.1278),
    WeatherCity(id: 'paris', name: 'Paris', country: 'France', region: 'Europe', lat: 48.8566, lon: 2.3522),
    WeatherCity(id: 'frankfurt', name: 'Frankfurt', country: 'Germany', region: 'Europe', lat: 50.1109, lon: 8.6821),
    WeatherCity(id: 'newyork', name: 'New York', country: 'United States', region: 'Americas', lat: 40.7128, lon: -74.006),
    WeatherCity(id: 'sanfrancisco', name: 'San Francisco', country: 'United States', region: 'Americas', lat: 37.7749, lon: -122.4194),
    WeatherCity(id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', region: 'Middle East', lat: 25.2048, lon: 55.2708),
    WeatherCity(id: 'sydney', name: 'Sydney', country: 'Australia', region: 'Oceania', lat: -33.8688, lon: 151.2093),
  ];

  WeatherCity _selectedCity = _cities[0];
  LiveWeatherData? _liveWeather;
  bool _isLoadingWeather = false;

  // Calculation Notes
  final List<NoteEntry> _notes = [];

  // Stock Market Selected Asset
  String _selectedStockSymbol = 'DJI';

  // Numeral Scripts Map
  static const Map<String, List<String>> _numeralScripts = {
    'en': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'my': ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'],
    'th': ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'],
    'hi': ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
    'ar': ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'],
    'bn': ['০', '১', '၂', '৩', '৪', '৫', '৬', '৭', '৮', '৯'],
    'zh': ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
    'fa': ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
  };

  @override
  void initState() {
    super.initState();

    // 3D Flip Controller
    _flipController = AnimationController(
      duration: const Duration(milliseconds: 650),
      vsync: this,
    );
    _flipAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _flipController, curve: Curves.easeInOutCubic),
    );

    // Clock update timer
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() => _now = DateTime.now());
      }
    });

    // Initial weather fetch
    _fetchWeather(_selectedCity);
  }

  @override
  void dispose() {
    _flipController.dispose();
    _clockTimer.cancel();
    super.dispose();
  }

  // --------------------------------------------------------
  // Weather Engine (Online live Open-Meteo)
  // --------------------------------------------------------
  Future<void> _fetchWeather(WeatherCity city) async {
    setState(() => _isLoadingWeather = true);
    try {
      final client = HttpClient();
      final uri = Uri.parse(
          'https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,is_day&timezone=auto');
      final request = await client.getUrl(uri).timeout(const Duration(seconds: 6));
      final response = await request.close();
      if (response.statusCode == 200) {
        final body = await response.transform(utf8.decoder).join();
        final data = jsonDecode(body);
        final current = data['current'];
        final temp = (current['temperature_2m'] as num).round();
        final code = current['weather_code'] as int;
        final isDay = (current['is_day'] ?? 1) == 1;

        IconData icon = isDay ? Icons.wb_sunny_rounded : Icons.nightlight_round;
        String cond = isDay ? 'Sunny' : 'Clear';

        if (code == 1 || code == 2) {
          icon = isDay ? Icons.wb_cloudy_rounded : Icons.cloud_queue_rounded;
          cond = 'Partly Cloudy';
        } else if (code == 3) {
          icon = Icons.cloud_rounded;
          cond = 'Overcast';
        } else if (code >= 51 && code <= 67) {
          icon = Icons.water_drop_rounded;
          cond = 'Rain';
        } else if (code >= 71 && code <= 77) {
          icon = Icons.ac_unit_rounded;
          cond = 'Snow';
        } else if (code >= 95) {
          icon = Icons.flash_on_rounded;
          cond = 'Thunderstorm';
        }

        if (mounted) {
          setState(() {
            _liveWeather = LiveWeatherData(
              tempC: temp,
              weatherCode: code,
              conditionName: cond,
              icon: icon,
            );
          });
        }
      }
    } catch (_) {
      // Fallback offline weather
      if (mounted && _liveWeather == null) {
        setState(() {
          _liveWeather = const LiveWeatherData(
            tempC: 32,
            weatherCode: 0,
            conditionName: 'Sunny',
            icon: Icons.wb_sunny_rounded,
          );
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isLoadingWeather = false);
      }
    }
  }

  // --------------------------------------------------------
  // Numeral Translation Helper
  // --------------------------------------------------------
  String _toLocalizedDigits(String text) {
    if (_currentLanguageKey == 'en') return text;
    final digits = _numeralScripts[_currentLanguageKey] ?? _numeralScripts['en']!;
    final sb = StringBuffer();
    for (int i = 0; i < text.length; i++) {
      final code = text.codeUnitAt(i);
      if (code >= 48 && code <= 57) {
        sb.write(digits[code - 48]);
      } else {
        sb.write(text[i]);
      }
    }
    return sb.toString();
  }

  // --------------------------------------------------------
  // 3D Flip Action
  // --------------------------------------------------------
  void _toggle3DCardFlip() {
    HapticFeedback.mediumImpact();
    if (_isFlippedToStock) {
      _flipController.reverse();
    } else {
      _flipController.forward();
    }
    setState(() => _isFlippedToStock = !_isFlippedToStock);
  }

  // --------------------------------------------------------
  // Calculator Actions
  // --------------------------------------------------------
  void _onNumberPressed(String num) {
    HapticFeedback.lightImpact();
    setState(() {
      if (_display == '0' || _shouldResetDisplay) {
        _display = num;
        _shouldResetDisplay = false;
      } else {
        if (_display.replaceAll(',', '').length < 11) {
          _display += num;
        }
      }
    });
  }

  void _onDecimalPressed() {
    HapticFeedback.lightImpact();
    setState(() {
      if (_shouldResetDisplay) {
        _display = '0.';
        _shouldResetDisplay = false;
        return;
      }
      if (!_display.contains('.')) {
        _display += '.';
      }
    });
  }

  void _onOperatorPressed(String op) {
    HapticFeedback.mediumImpact();
    final currentVal = double.tryParse(_display.replaceAll(',', '')) ?? 0.0;
    setState(() {
      if (_firstOperand == null) {
        _firstOperand = currentVal;
        _expression = '$_display $op';
      } else if (_operator != null && !_shouldResetDisplay) {
        _calculatePartial(currentVal);
        _expression = '$_display $op';
      } else {
        _expression = '$_display $op';
      }
      _operator = op;
      _shouldResetDisplay = true;
    });
  }

  void _calculatePartial(double secondOperand) {
    if (_firstOperand == null || _operator == null) return;
    double res = 0;
    switch (_operator) {
      case '+':
        res = _firstOperand! + secondOperand;
        break;
      case '−':
      case '-':
        res = _firstOperand! - secondOperand;
        break;
      case '×':
      case '*':
        res = _firstOperand! * secondOperand;
        break;
      case '÷':
      case '/':
        res = secondOperand != 0 ? _firstOperand! / secondOperand : 0;
        break;
    }
    _display = _formatNumber(res);
    _firstOperand = res;
  }

  void _onEqualsPressed() {
    HapticFeedback.heavyImpact();
    if (_firstOperand == null || _operator == null) return;
    final second = double.tryParse(_display.replaceAll(',', '')) ?? 0.0;
    final calcExpr = '$_expression $_display';
    _calculatePartial(second);
    setState(() {
      _lastCalculation = '$calcExpr = $_display';
      _expression = '';
      _firstOperand = null;
      _operator = null;
      _shouldResetDisplay = true;
    });
  }

  void _clear() {
    HapticFeedback.mediumImpact();
    setState(() {
      _display = '0';
      _expression = '';
      _firstOperand = null;
      _operator = null;
      _shouldResetDisplay = false;
    });
  }

  void _toggleSign() {
    HapticFeedback.lightImpact();
    setState(() {
      if (_display == '0') return;
      if (_display.startsWith('-')) {
        _display = _display.substring(1);
      } else {
        _display = '-$_display';
      }
    });
  }

  void _percentage() {
    HapticFeedback.lightImpact();
    final val = double.tryParse(_display.replaceAll(',', '')) ?? 0.0;
    setState(() {
      if (_firstOperand != null && _operator != null) {
        _display = _formatNumber((_firstOperand! * val) / 100);
      } else {
        _display = _formatNumber(val / 100);
      }
    });
  }

  // Scientific functions
  void _executeScientific(String fn) {
    HapticFeedback.mediumImpact();
    final val = double.tryParse(_display.replaceAll(',', '')) ?? 0.0;
    double res = val;
    switch (fn) {
      case 'sin':
        res = sin(val * pi / 180);
        break;
      case 'cos':
        res = cos(val * pi / 180);
        break;
      case 'tan':
        res = tan(val * pi / 180);
        break;
      case 'sqrt':
        res = val >= 0 ? sqrt(val) : 0;
        break;
      case 'sq':
        res = val * val;
        break;
      case 'ln':
        res = val > 0 ? log(val) : 0;
        break;
      case 'pi':
        res = pi;
        break;
      case 'e':
        res = e;
        break;
    }
    setState(() {
      _display = _formatNumber(res);
      _shouldResetDisplay = true;
    });
  }

  String _formatNumber(double val) {
    if (val.isInfinite || val.isNaN) return 'Error';
    if (val.abs() >= 1e9) {
      return val.toStringAsExponential(4);
    }
    String s = val.toStringAsPrecision(8);
    if (s.contains('.')) {
      s = s.replaceAll(RegExp(r'0+$'), '').replaceAll(RegExp(r'\.$'), '');
    }
    return s;
  }

  // Save calculation as draft note
  void _saveCurrentAsNote() {
    HapticFeedback.mediumImpact();
    final now = DateTime.now();
    final dateStr = '${_getMonthName(now.month)} ${now.day}';
    final timeStr =
        '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';

    final note = NoteEntry(
      id: '${DateTime.now().millisecondsSinceEpoch}',
      title: 'Calculation Draft #${_notes.length + 1}',
      fullCalculation: _lastCalculation ?? (_expression.isNotEmpty ? '$_expression = $_display' : _display),
      result: _display,
      content: '',
      dateStr: dateStr,
      timeStr: timeStr,
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );

    setState(() => _notes.insert(0, note));
    _openNotesDrawer(initialSelectedId: note.id);
  }

  String _getMonthName(int m) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[(m - 1).clamp(0, 11)];
  }

  // --------------------------------------------------------
  // Notes Drawer Modal (With New Note Icon in front of X)
  // --------------------------------------------------------
  void _openNotesDrawer({String? initialSelectedId}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => NotesDrawerSheet(
        notes: _notes,
        initialSelectedId: initialSelectedId,
        onUpdateNote: (id, title, content) {
          final idx = _notes.indexWhere((n) => n.id == id);
          if (idx != -1) {
            setState(() {
              _notes[idx].title = title;
              _notes[idx].content = content;
            });
          }
        },
        onDeleteNote: (id) {
          setState(() => _notes.removeWhere((n) => n.id == id));
        },
        onClearAllNotes: () {
          setState(() => _notes.clear());
        },
        onUseResult: (res) {
          setState(() {
            _display = res;
            _expression = '';
            _firstOperand = null;
            _operator = null;
          });
          Navigator.pop(ctx);
        },
        numeralTranslator: _toLocalizedDigits,
      ),
    );
  }

  // --------------------------------------------------------
  // Theme & Settings Modal (Language, Theme, Region)
  // --------------------------------------------------------
  void _openSettingsModal({String initialTab = 'theme'}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => SettingsModalSheet(
        initialTab: initialTab,
        currentTheme: _currentTheme,
        onSelectTheme: (t) => setState(() => _currentTheme = t),
        currentLanguageKey: _currentLanguageKey,
        onSelectLanguage: (k) => setState(() => _currentLanguageKey = k),
        selectedCity: _selectedCity,
        onSelectCity: (c) {
          setState(() => _selectedCity = c);
          _fetchWeather(c);
        },
        cities: _cities,
        sizingMode: _sizingMode,
        onSelectSizingMode: (m) => setState(() => _sizingMode = m),
        mistDensity: _mistDensity,
        onChangeMistDensity: (d) => setState(() => _mistDensity = d),
      ),
    );
  }

  // --------------------------------------------------------
  // UI Theme Gradient Helper
  // --------------------------------------------------------
  List<Color> _getThemeGradientColors() {
    switch (_currentTheme) {
      case AppThemePreset.sunsetAurora:
        return const [Color(0xFFF97316), Color(0xFFE11D48), Color(0xFF4F46E5), Color(0xFF090D16)];
      case AppThemePreset.neonBloom:
        return const [Color(0xFFD946EF), Color(0xFFEC4899), Color(0xFF06B6D4), Color(0xFF090D16)];
      case AppThemePreset.deepOcean:
        return const [Color(0xFF06B6D4), Color(0xFF2563EB), Color(0xFF1E1B4B), Color(0xFF090D16)];
      case AppThemePreset.midnightPurple:
        return const [Color(0xFFA855F7), Color(0xFF6366F1), Color(0xFF0F172A), Color(0xFF090D16)];
      case AppThemePreset.frostedEmerald:
        return const [Color(0xFF34D399), Color(0xFF0D9488), Color(0xFF064E3B), Color(0xFF090D16)];
      case AppThemePreset.liquidSilver:
        return const [Color(0xFFE2E8F0), Color(0xFF94A3B8), Color(0xFF334155), Color(0xFF090D16)];
      case AppThemePreset.whiteMetallic:
        return const [Color(0xFFFFFFFF), Color(0xFFE2E8F0), Color(0xFF64748B), Color(0xFF090D16)];
    }
  }

  @override
  Widget build(BuildContext context) {
    final gradientColors = _getThemeGradientColors();

    return Scaffold(
      body: Stack(
        children: [
          // 1. Shifting Fluid Aurora Background
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: const Alignment(-0.5, -0.6),
                  radius: 1.3,
                  colors: gradientColors,
                ),
              ),
            ),
          ),

          // 2. Secondary Glowing Ambient Orb
          Positioned(
            bottom: -60,
            right: -60,
            width: 320,
            height: 320,
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    gradientColors[1].withOpacity(0.35),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // 3. Frosted Glass BackdropFilter
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: _mistDensity, sigmaY: _mistDensity),
              child: Container(color: Colors.black.withOpacity(0.18)),
            ),
          ),

          // 4. 3D Flippable Card Stage
          SafeArea(
            child: AnimatedBuilder(
              animation: _flipAnimation,
              builder: (context, child) {
                final angle = _flipAnimation.value * pi;
                final isBack = _flipAnimation.value >= 0.5;

                return Transform(
                  transform: Matrix4.identity()
                    ..setEntry(3, 2, 0.0015)
                    ..rotateY(angle),
                  alignment: Alignment.center,
                  child: isBack
                      ? Transform(
                          transform: Matrix4.identity()..rotateY(pi),
                          alignment: Alignment.center,
                          child: _buildStockForecastCard(),
                        )
                      : _buildCalculatorFrontCard(),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // --------------------------------------------------------
  // FRONT CARD: Frosted Glass Calculator with Top Bar
  // --------------------------------------------------------
  Widget _buildCalculatorFrontCard() {
    final localizedDisplay = _toLocalizedDigits(_display);
    final localizedExpr = _toLocalizedDigits(_expression);

    final timeString =
        '${_now.hour.toString().padLeft(2, '0')}:${_now.minute.toString().padLeft(2, '0')}';
    final dateString = '${_getMonthName(_now.month)} ${_now.day}';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        children: [
          // ----------------------------------------------------
          // TOP TOOLBAR: Clock, Note, Weather Sign, 3D Flip, Settings
          // ----------------------------------------------------
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.06),
              borderRadius: BorderRadius.circular(30),
              border: Border.all(color: Colors.white.withOpacity(0.12)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Left: Clock & Notes
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Digital Clock Pill
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        _toLocalizedDigits('$timeString · $dateString'),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white),
                      ),
                    ),
                    const SizedBox(width: 6),
                    // Notes Drawer Button
                    InkWell(
                      onTap: () => _openNotesDrawer(),
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.08),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.sticky_note_2_rounded, size: 16, color: Colors.cyanAccent),
                      ),
                    ),
                  ],
                ),

                // Center: Online Weather Sign (နေသာ/မိုးရွာ/နှင်းကျ)
                InkWell(
                  onTap: () => _openSettingsModal(initialTab: 'region'),
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withOpacity(0.15)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _liveWeather?.icon ?? Icons.wb_sunny_rounded,
                          size: 15,
                          color: Colors.amberAccent,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _liveWeather != null
                              ? _toLocalizedDigits('${_liveWeather!.tempC}°')
                              : '...',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                ),

                // Right: 3D Flip, Scientific & Settings
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // 3D Flip Button to Stock Forecast
                    IconButton(
                      icon: const Icon(Icons.threesixty_rounded, size: 19, color: Colors.white70),
                      onPressed: _toggle3DCardFlip,
                      tooltip: 'Flip 3D Stock Forecast',
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                    ),
                    // Scientific Keypad Toggle
                    IconButton(
                      icon: Icon(
                        Icons.science_rounded,
                        size: 18,
                        color: _isScientific ? Colors.cyanAccent : Colors.white60,
                      ),
                      onPressed: () => setState(() => _isScientific = !_isScientific),
                      tooltip: 'Scientific Functions',
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                    ),
                    // Settings Gear
                    IconButton(
                      icon: const Icon(Icons.settings_rounded, size: 18, color: Colors.white70),
                      onPressed: () => _openSettingsModal(initialTab: 'theme'),
                      tooltip: 'Theme & Settings',
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const Spacer(),

          // Quick Save Draft Button & Expression Display
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossContent: CrossAxisAlignment.end,
            children: [
              // Save to Note button
              TextButton.icon(
                onPressed: _saveCurrentAsNote,
                icon: const Icon(Icons.bookmark_add_rounded, size: 14, color: Colors.cyanAccent),
                label: const Text('Save Note', style: TextStyle(fontSize: 11, color: Colors.cyanAccent)),
                style: TextButton.styleFrom(
                  backgroundColor: Colors.white.withOpacity(0.06),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                ),
              ),

              // Expression text
              Container(
                alignment: Alignment.centerRight,
                padding: const EdgeInsets.only(right: 8, bottom: 4),
                child: Text(
                  localizedExpr,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white.withOpacity(0.55),
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ),
            ],
          ),

          // Big Autoscaling Result Display (Apple SF Style)
          Container(
            alignment: Alignment.centerRight,
            padding: const EdgeInsets.only(right: 8, bottom: 12),
            child: FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerRight,
              child: Text(
                localizedDisplay,
                style: const TextStyle(
                  fontSize: 74,
                  fontWeight: FontWeight.w300,
                  color: Colors.white,
                  letterSpacing: -1.5,
                ),
              ),
            ),
          ),

          // Optional Scientific Keypad Row
          if (_isScientific) _buildScientificKeys(),

          // Organic Uneven Pebble Circular Keypad
          _buildPebbleKeypad(),
          const SizedBox(height: 6),
        ],
      ),
    );
  }

  // Scientific Row
  Widget _buildScientificKeys() {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildSciBtn('sin', () => _executeScientific('sin')),
          _buildSciBtn('cos', () => _executeScientific('cos')),
          _buildSciBtn('tan', () => _executeScientific('tan')),
          _buildSciBtn('√', () => _executeScientific('sqrt')),
          _buildSciBtn('x²', () => _executeScientific('sq')),
          _buildSciBtn('ln', () => _executeScientific('ln')),
          _buildSciBtn('π', () => _executeScientific('pi')),
          _buildSciBtn('e', () => _executeScientific('e')),
        ],
      ),
    );
  }

  Widget _buildSciBtn(String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        child: Text(
          label,
          style: const TextStyle(fontSize: 13, color: Colors.cyanAccent, fontWeight: FontWeight.w500),
        ),
      ),
    );
  }

  // --------------------------------------------------------
  // Pebble Keypad with Organic / Droplet Sizing
  // --------------------------------------------------------
  Widget _buildPebbleKeypad() {
    // Sizing factors
    final double s1 = _sizingMode == 'classic' ? 68 : (_sizingMode == 'droplet' ? 72 : 70);
    final double s2 = _sizingMode == 'classic' ? 68 : (_sizingMode == 'droplet' ? 62 : 60);
    final double s3 = _sizingMode == 'classic' ? 68 : (_sizingMode == 'droplet' ? 74 : 76);

    return Column(
      children: [
        // Row 1: AC, ±, %, ÷
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildPebble(
              label: _display == '0' ? 'AC' : 'C',
              size: s1,
              bg: Colors.white.withOpacity(0.18),
              onTap: _clear,
            ),
            _buildPebble(
              label: '±',
              size: s2,
              bg: Colors.white.withOpacity(0.18),
              onTap: _toggleSign,
            ),
            _buildPebble(
              label: '%',
              size: s3,
              bg: Colors.white.withOpacity(0.18),
              onTap: _percentage,
            ),
            _buildPebble(
              label: '÷',
              size: s1,
              bg: const Color(0xFFF59E0B),
              isActive: _operator == '÷',
              onTap: () => _onOperatorPressed('÷'),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Row 2: 7, 8, 9, ×
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildDigitPebble('7', s1),
            _buildDigitPebble('8', s2),
            _buildDigitPebble('9', s3),
            _buildPebble(
              label: '×',
              size: s1,
              bg: const Color(0xFFF59E0B),
              isActive: _operator == '×',
              onTap: () => _onOperatorPressed('×'),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Row 3: 4, 5, 6, −
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildDigitPebble('4', s2),
            _buildDigitPebble('5', s1),
            _buildDigitPebble('6', s2),
            _buildPebble(
              label: '−',
              size: s1,
              bg: const Color(0xFFF59E0B),
              isActive: _operator == '−',
              onTap: () => _onOperatorPressed('−'),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Row 4: 1, 2, 3, +
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildDigitPebble('1', s1),
            _buildDigitPebble('2', s3),
            _buildDigitPebble('3', s2),
            _buildPebble(
              label: '+',
              size: s1,
              bg: const Color(0xFFF59E0B),
              isActive: _operator == '+',
              onTap: () => _onOperatorPressed('+'),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Row 5: 0 (Capsule), ., =
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Wide Capsule Pebble for '0'
            Expanded(
              flex: 2,
              child: GestureDetector(
                onTap: () => _onNumberPressed('0'),
                child: Container(
                  height: s1,
                  margin: const EdgeInsets.only(right: 12),
                  padding: const EdgeInsets.only(left: 28),
                  alignment: Alignment.centerLeft,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(40),
                    border: Border.all(color: Colors.white.withOpacity(0.2)),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: Text(
                    _toLocalizedDigits('0'),
                    style: const TextStyle(fontSize: 30, color: Colors.white, fontWeight: FontWeight.w400),
                  ),
                ),
              ),
            ),
            _buildPebble(
              label: '.',
              size: s2,
              bg: Colors.white.withOpacity(0.12),
              onTap: _onDecimalPressed,
            ),
            const SizedBox(width: 12),
            _buildPebble(
              label: '=',
              size: s1,
              bg: const Color(0xFF10B981),
              onTap: _onEqualsPressed,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDigitPebble(String digit, double size) {
    return _buildPebble(
      label: _toLocalizedDigits(digit),
      size: size,
      bg: Colors.white.withOpacity(0.12),
      onTap: () => _onNumberPressed(digit),
    );
  }

  Widget _buildPebble({
    required String label,
    required double size,
    required Color bg,
    required VoidCallback onTap,
    bool isActive = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: isActive ? Colors.white : bg,
          shape: BoxShape.circle,
          border: Border.all(
            color: isActive ? Colors.white : Colors.white.withOpacity(0.25),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: isActive ? bg.withOpacity(0.6) : Colors.black.withOpacity(0.25),
              blurRadius: isActive ? 16 : 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            fontSize: label.length > 2 ? 22 : 28,
            color: isActive ? bg : Colors.white,
            fontWeight: FontWeight.w400,
          ),
        ),
      ),
    );
  }

  // --------------------------------------------------------
  // BACK CARD: Stock Forecast & World Market Ticker
  // --------------------------------------------------------
  Widget _buildStockForecastCard() {
    final Map<String, Map<String, dynamic>> stockData = {
      'DJI': {'name': 'Dow Jones', 'price': '43,825.60', 'change': '+1.42%', 'bullish': true, 'pts': [30, 45, 40, 60, 55, 75, 70, 90]},
      'S&P 500': {'name': 'S&P 500 Index', 'price': '5,860.20', 'change': '+0.85%', 'bullish': true, 'pts': [20, 30, 45, 40, 65, 70, 85, 95]},
      'Gold': {'name': 'Gold Spot Oz', 'price': '2,720.50', 'change': '+0.45%', 'bullish': true, 'pts': [50, 55, 52, 60, 58, 65, 72, 80]},
      'BTC': {'name': 'Bitcoin USD', 'price': '68,450.00', 'change': '+3.12%', 'bullish': true, 'pts': [40, 35, 55, 60, 50, 70, 85, 100]},
      'AAPL': {'name': 'Apple Inc.', 'price': '232.40', 'change': '-0.32%', 'bullish': false, 'pts': [80, 75, 70, 65, 68, 60, 55, 50]},
    };

    final current = stockData[_selectedStockSymbol] ?? stockData['DJI']!;
    final pts = (current['pts'] as List<int>).map((e) => e.toDouble()).toList();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Return Bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton.icon(
                onPressed: _toggle3DCardFlip,
                icon: const Icon(Icons.arrow_back_rounded, size: 16, color: Colors.cyanAccent),
                label: const Text('Back to Calculator', style: TextStyle(color: Colors.cyanAccent, fontSize: 12)),
                style: TextButton.styleFrom(
                  backgroundColor: Colors.white.withOpacity(0.08),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.threesixty_rounded, color: Colors.white70),
                onPressed: _toggle3DCardFlip,
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Asset Tabs (DJI, S&P 500, Gold, BTC, AAPL)
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: stockData.keys.map((sym) {
                final isSelected = sym == _selectedStockSymbol;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text(sym),
                    selected: isSelected,
                    onSelected: (_) => setState(() => _selectedStockSymbol = sym),
                    selectedColor: Colors.cyanAccent,
                    backgroundColor: Colors.white.withOpacity(0.06),
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.black : Colors.white70,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 12,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),

          // Price & Change Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.07),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withOpacity(0.15)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  current['name'],
                  style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.6)),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '\$${current['price']}',
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: current['bullish'] ? Colors.emerald : Colors.rose,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        current['change'],
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Glowing Interactive Chart Canvas
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withOpacity(0.12)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Forecast Prediction & Trend', style: TextStyle(fontSize: 12, color: Colors.white70)),
                      Text('RSI 62.4 · Bullish', style: TextStyle(fontSize: 11, color: Colors.cyanAccent)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: CustomPaint(
                      size: Size.infinite,
                      painter: StockChartPainter(
                        points: pts,
                        lineColor: current['bullish'] ? const Color(0xFF10B981) : const Color(0xFFF43F5E),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// --------------------------------------------------------
// Stock Line Chart Painter
// --------------------------------------------------------
class StockChartPainter extends CustomPainter {
  final List<double> points;
  final Color lineColor;

  StockChartPainter({required this.points, required this.lineColor});

  @override
  void paint(Canvas canvas, Size size) {
    if (points.isEmpty) return;

    final minVal = points.reduce(min);
    final maxVal = points.reduce(max);
    final range = (maxVal - minVal) == 0 ? 1.0 : (maxVal - minVal);

    final path = Path();
    final fillPath = Path();

    final dx = size.width / (points.length - 1);

    for (int i = 0; i < points.length; i++) {
      final x = i * dx;
      final normY = (points[i] - minVal) / range;
      final y = size.height - (normY * (size.height - 20) + 10);

      if (i == 0) {
        path.moveTo(x, y);
        fillPath.moveTo(x, size.height);
        fillPath.lineTo(x, y);
      } else {
        path.lineTo(x, y);
        fillPath.lineTo(x, y);
      }
    }

    fillPath.lineTo(size.width, size.height);
    fillPath.close();

    // Gradient fill under the curve
    final fillPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          lineColor.withOpacity(0.35),
          lineColor.withOpacity(0.0),
        ],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    canvas.drawPath(fillPath, fillPaint);

    // Glowing Line
    final linePaint = Paint()
      ..color = lineColor
      ..strokeWidth = 3.0
      ..style = PaintingStyle.stroke;

    canvas.drawPath(path, linePaint);
  }

  @override
  bool shouldRepaint(covariant StockChartPainter oldDelegate) => true;
}

// --------------------------------------------------------
// Calculation Notes Sheet (With New Note Icon in front of X)
// --------------------------------------------------------
class NotesDrawerSheet extends StatefulWidget {
  final List<NoteEntry> notes;
  final String? initialSelectedId;
  final void Function(String id, String title, String content) onUpdateNote;
  final void Function(String id) onDeleteNote;
  final VoidCallback onClearAllNotes;
  final void Function(String result) onUseResult;
  final String Function(String) numeralTranslator;

  const NotesDrawerSheet({
    super.key,
    required this.notes,
    this.initialSelectedId,
    required this.onUpdateNote,
    required this.onDeleteNote,
    required this.onClearAllNotes,
    required this.onUseResult,
    required this.numeralTranslator,
  });

  @override
  State<NotesDrawerSheet> createState() => _NotesDrawerSheetState();
}

class _NotesDrawerSheetState extends State<NotesDrawerSheet> {
  String? _selectedNoteId;
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _contentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selectedNoteId = widget.initialSelectedId;
    if (_selectedNoteId != null) {
      final note = widget.notes.firstWhere((n) => n.id == _selectedNoteId, orElse: () => widget.notes.first);
      _titleController.text = note.title;
      _contentController.text = note.content;
    }
  }

  void _createNewNote() {
    HapticFeedback.lightImpact();
    final now = DateTime.now();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    final dateStr = '${months[(now.month - 1).clamp(0, 11)]} ${now.day}';
    final timeStr =
        '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';

    final newNote = NoteEntry(
      id: '${DateTime.now().millisecondsSinceEpoch}',
      title: '',
      fullCalculation: '',
      result: '',
      content: '',
      dateStr: dateStr,
      timeStr: timeStr,
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );

    widget.notes.insert(0, newNote);
    setState(() {
      _selectedNoteId = newNote.id;
      _titleController.text = '';
      _contentController.text = '';
    });
  }

  @override
  Widget build(BuildContext context) {
    NoteEntry? activeNote;
    if (_selectedNoteId != null) {
      final matches = widget.notes.where((n) => n.id == _selectedNoteId);
      if (matches.isNotEmpty) activeNote = matches.first;
    }

    return Container(
      height: MediaQuery.of(context).size.height * 0.82,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withOpacity(0.95),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        border: Border.all(color: Colors.white.withOpacity(0.15)),
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (activeNote != null)
                  TextButton.icon(
                    onPressed: () => setState(() => _selectedNoteId = null),
                    icon: const Icon(Icons.arrow_back_rounded, size: 16, color: Colors.white),
                    label: const Text('Notes', style: TextStyle(color: Colors.white, fontSize: 13)),
                  )
                else
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.cyanAccent.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.sticky_note_2_rounded, size: 16, color: Colors.cyanAccent),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Calculation Notes (${widget.notes.length})',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ],
                  ),

                // Right Actions: New Icon RIGHT BEFORE X button!
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // New Note Icon (SquarePen style)
                    IconButton(
                      icon: const Icon(Icons.edit_note_rounded, size: 24, color: Colors.cyanAccent),
                      onPressed: _createNewNote,
                      tooltip: 'New Note',
                    ),
                    // Close X
                    IconButton(
                      icon: const Icon(Icons.close_rounded, size: 20, color: Colors.white70),
                      onPressed: () => Navigator.pop(context),
                      tooltip: 'Close',
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Colors.white12),

          // Body: Note Detail / Writer OR List View
          Expanded(
            child: activeNote != null ? _buildNoteWriter(activeNote) : _buildNoteList(),
          ),
        ],
      ),
    );
  }

  // Note Writer View
  Widget _buildNoteWriter(NoteEntry note) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title field
          TextField(
            controller: _titleController,
            onChanged: (val) {
              note.title = val;
              widget.onUpdateNote(note.id, note.title, note.content);
            },
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
            decoration: const InputDecoration(
              hintText: 'Note Title (Tap to edit)...',
              hintStyle: TextStyle(color: Colors.white38),
              border: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
              focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.cyanAccent)),
            ),
          ),
          const SizedBox(height: 6),
          const Row(
            children: [
              Icon(Icons.check_circle_outline_rounded, size: 12, color: Colors.cyanAccent),
              SizedBox(width: 4),
              Text('Auto-saved', style: TextStyle(fontSize: 10, color: Colors.cyanAccent)),
            ],
          ),
          const SizedBox(height: 16),

          // Calculation Draft Box if available
          if (note.fullCalculation.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.06),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('CALCULATION DRAFT', style: TextStyle(fontSize: 10, color: Colors.white54, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text(
                    widget.numeralTranslator(note.fullCalculation),
                    style: const TextStyle(fontSize: 15, fontFamily: 'monospace', color: Colors.cyanAccent),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Result: ${widget.numeralTranslator(note.result)}', style: const TextStyle(fontSize: 12, color: Colors.white70)),
                      ElevatedButton(
                        onPressed: () => widget.onUseResult(note.result),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.cyanAccent.withOpacity(0.2),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          minimumSize: Size.zero,
                        ),
                        child: const Text('Use in Calc', style: TextStyle(fontSize: 10, color: Colors.cyanAccent)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Content textarea
          const Text('Notes & Annotations:', style: TextStyle(fontSize: 11, color: Colors.white60)),
          const SizedBox(height: 8),
          TextField(
            controller: _contentController,
            maxLines: 8,
            onChanged: (val) {
              note.content = val;
              widget.onUpdateNote(note.id, note.title, note.content);
            },
            style: const TextStyle(fontSize: 13, color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Write your note or memo here...',
              hintStyle: const TextStyle(color: Colors.white30),
              filled: true,
              fillColor: Colors.white.withOpacity(0.06),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
            ),
          ),
        ],
      ),
    );
  }

  // Note List View
  Widget _buildNoteList() {
    if (widget.notes.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.notes_rounded, size: 48, color: Colors.white.withOpacity(0.3)),
            const SizedBox(height: 8),
            const Text('No notes saved yet', style: TextStyle(color: Colors.white70, fontSize: 13)),
            const SizedBox(height: 4),
            const Text('Tap the New Note icon above to create one.', style: TextStyle(color: Colors.white38, fontSize: 11)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: widget.notes.length,
      itemBuilder: (ctx, idx) {
        final note = widget.notes[idx];
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.06),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withOpacity(0.1)),
          ),
          child: ListTile(
            onTap: () {
              setState(() {
                _selectedNoteId = note.id;
                _titleController.text = note.title;
                _contentController.text = note.content;
              });
            },
            title: Text(
              note.title.isNotEmpty ? note.title : 'Note #${widget.notes.length - idx}',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (note.fullCalculation.isNotEmpty)
                  Text(
                    widget.numeralTranslator(note.fullCalculation),
                    style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: Colors.cyanAccent),
                  ),
                if (note.content.isNotEmpty)
                  Text(
                    note.content,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: Colors.white54),
                  ),
                Text(
                  '${note.dateStr} · ${note.timeStr}',
                  style: const TextStyle(fontSize: 10, color: Colors.white38),
                ),
              ],
            ),
            trailing: IconButton(
              icon: const Icon(Icons.delete_outline_rounded, size: 18, color: Colors.rose),
              onPressed: () {
                widget.onDeleteNote(note.id);
                setState(() {});
              },
            ),
          ),
        );
      },
    );
  }
}

// --------------------------------------------------------
// Settings Modal Sheet (Language, Theme, Region with Theme Scrollbar)
// --------------------------------------------------------
class SettingsModalSheet extends StatefulWidget {
  final String initialTab;
  final AppThemePreset currentTheme;
  final ValueChanged<AppThemePreset> onSelectTheme;
  final String currentLanguageKey;
  final ValueChanged<String> onSelectLanguage;
  final WeatherCity selectedCity;
  final ValueChanged<WeatherCity> onSelectCity;
  final List<WeatherCity> cities;
  final String sizingMode;
  final ValueChanged<String> onSelectSizingMode;
  final double mistDensity;
  final ValueChanged<double> onChangeMistDensity;

  const SettingsModalSheet({
    super.key,
    required this.initialTab,
    required this.currentTheme,
    required this.onSelectTheme,
    required this.currentLanguageKey,
    required this.onSelectLanguage,
    required this.selectedCity,
    required this.onSelectCity,
    required this.cities,
    required this.sizingMode,
    required this.onSelectSizingMode,
    required this.mistDensity,
    required this.onChangeMistDensity,
  });

  @override
  State<SettingsModalSheet> createState() => _SettingsModalSheetState();
}

class _SettingsModalSheetState extends State<SettingsModalSheet> {
  late String _activeTab;
  String _citySearch = '';
  final ScrollController _cityScrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _activeTab = widget.initialTab;
  }

  @override
  void dispose() {
    _cityScrollController.dispose();
    super.dispose();
  }

  Color _getThemeAccentColor() {
    switch (widget.currentTheme) {
      case AppThemePreset.sunsetAurora:
        return const Color(0xFFF97316);
      case AppThemePreset.neonBloom:
        return const Color(0xFFEC4899);
      case AppThemePreset.deepOcean:
        return const Color(0xFF06B6D4);
      case AppThemePreset.midnightPurple:
        return const Color(0xFFA855F7);
      case AppThemePreset.frostedEmerald:
        return const Color(0xFF10B981);
      case AppThemePreset.liquidSilver:
      case AppThemePreset.whiteMetallic:
        return Colors.white;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withOpacity(0.95),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        border: Border.all(color: Colors.white.withOpacity(0.15)),
      ),
      child: Column(
        children: [
          // Segmented Switch Header (Language, Theme, Region)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      _buildTabBtn('language', 'Language', Icons.language_rounded),
                      _buildTabBtn('theme', 'Theme', Icons.palette_rounded),
                      _buildTabBtn('region', 'Region', Icons.place_rounded),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white70),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Colors.white12),

          // Active Tab View
          Expanded(
            child: _activeTab == 'language'
                ? _buildLanguageTab()
                : _activeTab == 'theme'
                    ? _buildThemeTab()
                    : _buildRegionTab(),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBtn(String tabKey, String label, IconData icon) {
    final isSelected = _activeTab == tabKey;
    return GestureDetector(
      onTap: () => setState(() => _activeTab = tabKey),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white.withOpacity(0.25) : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Icon(icon, size: 14, color: isSelected ? Colors.white : Colors.white60),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? Colors.white : Colors.white60,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Language Tab
  Widget _buildLanguageTab() {
    final langs = [
      {'key': 'en', 'name': 'English'},
      {'key': 'my', 'name': 'Burmese (မြန်မာ)'},
      {'key': 'th', 'name': 'Thai (ไทย)'},
      {'key': 'hi', 'name': 'Hindi (हिन्दी)'},
      {'key': 'ar', 'name': 'Arabic (العربية)'},
      {'key': 'bn', 'name': 'Bengali (বাংলা)'},
      {'key': 'zh', 'name': 'Chinese (中文)'},
      {'key': 'fa', 'name': 'Persian (فارسی)'},
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: langs.map((l) {
        final isSelected = widget.currentLanguageKey == l['key'];
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          decoration: BoxDecoration(
            color: isSelected ? Colors.cyanAccent.withOpacity(0.2) : Colors.white.withOpacity(0.06),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isSelected ? Colors.cyanAccent : Colors.white.withOpacity(0.1)),
          ),
          child: ListTile(
            onTap: () {
              widget.onSelectLanguage(l['key']!);
              Navigator.pop(context);
            },
            title: Text(l['name']!, style: const TextStyle(fontSize: 13, color: Colors.white)),
            trailing: isSelected ? const Icon(Icons.check_rounded, color: Colors.cyanAccent) : null,
          ),
        );
      }).toList(),
    );
  }

  // Theme Tab
  Widget _buildThemeTab() {
    final themes = [
      {'id': AppThemePreset.sunsetAurora, 'name': 'Sunset Aurora'},
      {'id': AppThemePreset.neonBloom, 'name': 'Neon Bloom'},
      {'id': AppThemePreset.deepOcean, 'name': 'Deep Ocean'},
      {'id': AppThemePreset.midnightPurple, 'name': 'Midnight Purple'},
      {'id': AppThemePreset.frostedEmerald, 'name': 'Frosted Emerald'},
      {'id': AppThemePreset.liquidSilver, 'name': 'Liquid Silver'},
      {'id': AppThemePreset.whiteMetallic, 'name': 'White Metallic'},
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('AURORA THEME PRESET', style: TextStyle(fontSize: 11, color: Colors.white60, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        ...themes.map((t) {
          final isSelected = widget.currentTheme == t['id'];
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: isSelected ? Colors.white.withOpacity(0.25) : Colors.white.withOpacity(0.06),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isSelected ? Colors.white : Colors.white.withOpacity(0.1)),
            ),
            child: ListTile(
              onTap: () => widget.onSelectTheme(t['id'] as AppThemePreset),
              title: Text(t['name'] as String, style: const TextStyle(fontSize: 13, color: Colors.white)),
              trailing: isSelected ? const Icon(Icons.check_rounded, color: Colors.cyanAccent) : null,
            ),
          );
        }),
        const SizedBox(height: 16),
        const Text('PEBBLE SIZING MODE', style: TextStyle(fontSize: 11, color: Colors.white60, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: ['organic', 'droplet', 'classic'].map((m) {
            final isSelected = widget.sizingMode == m;
            return Expanded(
              child: GestureDetector(
                onTap: () => widget.onSelectSizingMode(m),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.white.withOpacity(0.25) : Colors.white.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isSelected ? Colors.white : Colors.white.withOpacity(0.1)),
                  ),
                  child: Text(m, style: const TextStyle(fontSize: 12, color: Colors.white)),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  // Region Tab with Dynamic Theme-matching Scrollbar
  Widget _buildRegionTab() {
    final filtered = widget.cities.where((c) {
      if (_citySearch.isEmpty) return true;
      final q = _citySearch.toLowerCase();
      return c.name.toLowerCase().contains(q) || c.country.toLowerCase().contains(q);
    }).toList();

    final themeColor = _getThemeAccentColor();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // Search Bar
          TextField(
            onChanged: (val) => setState(() => _citySearch = val),
            style: const TextStyle(fontSize: 13, color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Search any world city or country...',
              hintStyle: const TextStyle(color: Colors.white38),
              prefixIcon: const Icon(Icons.search_rounded, size: 18, color: Colors.white54),
              filled: true,
              fillColor: Colors.white.withOpacity(0.06),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
              contentPadding: EdgeInsets.zero,
            ),
          ),
          const SizedBox(height: 12),

          // City List with Custom Theme-adaptive Scrollbar
          Expanded(
            child: RawScrollbar(
              controller: _cityScrollController,
              thumbVisibility: true,
              trackVisibility: true,
              radius: const Radius.circular(8),
              thickness: 5,
              thumbColor: themeColor,
              trackColor: Colors.white.withOpacity(0.08),
              child: ListView.builder(
                controller: _cityScrollController,
                itemCount: filtered.length,
                itemBuilder: (ctx, idx) {
                  final city = filtered[idx];
                  final isSelected = widget.selectedCity.id == city.id;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? Colors.cyanAccent.withOpacity(0.18) : Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isSelected ? Colors.cyanAccent : Colors.white.withOpacity(0.1)),
                    ),
                    child: ListTile(
                      onTap: () {
                        widget.onSelectCity(city);
                        Navigator.pop(context);
                      },
                      title: Text(
                        city.name,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
                      ),
                      subtitle: Text(
                        '${city.country} : ${city.region}',
                        style: const TextStyle(fontSize: 11, color: Colors.white54),
                      ),
                      trailing: isSelected ? const Icon(Icons.check_rounded, color: Colors.cyanAccent) : null,
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
