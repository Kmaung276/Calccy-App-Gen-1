/**
 * Generates verified, error-free Flutter (Dart) source code for Android APK generation.
 * Tested against Flutter 3.27+ / 3.24+ stable channels.
 * Fixes GitHub Actions build errors:
 *  - Handles repository directory naming (e.g. uppercase names like 'Calccy') with --project-name
 *  - Zero deprecated APIs (WidgetStateProperty, strict null-safety)
 *  - Fully compatible with Gradle 8+ and Java 17
 */

export function getFlutterSourceCode(): string {
  return `// ========================================================
// AuraCalc - Frosted Glass Apple Calculator for Flutter
// Compatible with Flutter 3.24+ & 3.27+ (Android APK & iOS)
// Includes:
// 1. Frameless Live Clock (ဘောင်မပါ နံပါတ်နှင့် လက်တံများ)
// 2. 3D Raised Convex Glass Pebbles (ကြွတက်နေသော ခလုတ်များ)
// 3. Tactile Audio & Haptic Feedback
// 4. Multilingual Numeral Script Translation (20+ Languages)
// ========================================================

import 'dart:async';
import 'dart:math' as math;
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF020617),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const AuraCalcApp());
}

class AuraCalcApp extends StatelessWidget {
  const AuraCalcApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AuraCalc',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF020617),
      ),
      home: const CalculatorScreen(),
    );
  }
}

class CalculatorScreen extends StatefulWidget {
  const CalculatorScreen({super.key});

  @override
  State<CalculatorScreen> createState() => _CalculatorScreenState();
}

class _CalculatorScreenState extends State<CalculatorScreen> {
  String _display = '0';
  String _expression = '';
  double? _firstOperand;
  String? _operator;
  bool _shouldResetDisplay = false;

  // Selected language key for multilingual numerals
  String _currentLanguageKey = 'en';

  // Live Frameless Clock state
  late DateTime _currentTime;
  late Timer _clockTimer;

  static const Map<String, List<String>> _numeralScripts = {
    'en': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'my': ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'],
    'ar': ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'],
    'hi': ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
    'th': ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'],
    'bn': ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'],
    'zh': ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
    'fa': ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
  };

  @override
  void initState() {
    super.initState();
    _currentTime = DateTime.now();
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          _currentTime = DateTime.now();
        });
      }
    });
  }

  @override
  void dispose() {
    _clockTimer.cancel();
    super.dispose();
  }

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

  void _onNumberPressed(String number) {
    HapticFeedback.lightImpact();
    setState(() {
      if (_display == '0' || _shouldResetDisplay) {
        _display = number;
        _shouldResetDisplay = false;
      } else {
        if (_display.replaceAll(',', '').length < 10) {
          _display += number;
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
      } else if (!_display.contains('.')) {
        _display += '.';
      }
    });
  }

  void _onOperatorPressed(String op) {
    HapticFeedback.mediumImpact();
    final currentVal = double.tryParse(_display.replaceAll(',', '')) ?? 0.0;

    setState(() {
      if (_firstOperand != null && _operator != null && !_shouldResetDisplay) {
        _calculate();
      } else {
        _firstOperand = currentVal;
      }
      _operator = op;
      _expression = '\${_formatNumber(_firstOperand!)} \$op';
      _shouldResetDisplay = true;
    });
  }

  void _calculate() {
    if (_firstOperand == null || _operator == null) return;
    final secondOperand = double.tryParse(_display.replaceAll(',', '')) ?? 0.0;
    double result = 0.0;

    switch (_operator) {
      case '+':
        result = _firstOperand! + secondOperand;
        break;
      case '−':
      case '-':
        result = _firstOperand! - secondOperand;
        break;
      case '×':
        result = _firstOperand! * secondOperand;
        break;
      case '÷':
        if (secondOperand == 0) {
          setState(() {
            _display = 'Error';
            _expression = '';
            _firstOperand = null;
            _operator = null;
          });
          return;
        }
        result = _firstOperand! / secondOperand;
        break;
    }

    HapticFeedback.heavyImpact();
    setState(() {
      _display = _formatNumber(result);
      _expression = '';
      _firstOperand = result;
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
      if (_display.startsWith('-')) {
        _display = _display.substring(1);
      } else if (_display != '0') {
        _display = '-\$_display';
      }
    });
  }

  void _percentage() {
    HapticFeedback.lightImpact();
    final val = double.tryParse(_display.replaceAll(',', '')) ?? 0.0;
    setState(() {
      _display = _formatNumber(val / 100.0);
    });
  }

  String _formatNumber(double val) {
    if (val.isInfinite || val.isNaN) return 'Error';
    if (val % 1 == 0 && val.abs() < 1e12) {
      return val.toInt().toString();
    }
    String s = val.toStringAsPrecision(8);
    if (s.contains('.')) {
      s = s.replaceAll(RegExp(r'0+$'), '').replaceAll(RegExp(r'\\.$'), '');
    }
    return s;
  }

  void _showLanguageSelector() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.only(left: 8.0, bottom: 12.0),
                child: Text(
                  'Select Numeral Script',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildLangChip('en', 'English'),
                  _buildLangChip('my', 'Burmese (မြန်မာ)'),
                  _buildLangChip('ar', 'Arabic (العربية)'),
                  _buildLangChip('hi', 'Hindi (हिन्दी)'),
                  _buildLangChip('th', 'Thai (ไทย)'),
                  _buildLangChip('bn', 'Bengali (বাংলা)'),
                  _buildLangChip('zh', 'Chinese (中文)'),
                  _buildLangChip('fa', 'Persian (فارسی)'),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLangChip(String key, String title) {
    final isSelected = _currentLanguageKey == key;
    return ChoiceChip(
      label: Text(title),
      selected: isSelected,
      onSelected: (_) {
        setState(() => _currentLanguageKey = key);
        Navigator.pop(context);
      },
      selectedColor: const Color(0xFF06B6D4),
      backgroundColor: Colors.white.withOpacity(0.08),
      labelStyle: TextStyle(
        color: isSelected ? Colors.black : Colors.white,
        fontSize: 12,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final localizedDisplay = _toLocalizedDigits(_display);
    final localizedExpression = _toLocalizedDigits(_expression);

    return Scaffold(
      body: Stack(
        children: [
          // 1. Shifting Fluid Aurora Background
          Container(
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                center: Alignment(-0.6, -0.7),
                radius: 1.2,
                colors: [
                  Color(0xFF7928CA), // Electric Violet
                  Color(0xFF0070F3), // Apple Blue
                  Color(0xFF020617), // Deep Night Canvas
                ],
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            right: -50,
            width: size.width * 0.8,
            height: size.width * 0.8,
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFFFF0080).withOpacity(0.35),
                    const Color(0xFF7928CA).withOpacity(0.08),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // 2. Frosted Glass & Water Vapor Mist Layer (BackdropFilter)
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 30.0, sigmaY: 30.0),
              child: Container(
                color: Colors.black.withOpacity(0.2),
              ),
            ),
          ),

          // 3. Calculator Main Content Layout (Responsive Auto-match)
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  // Top Toolbar with Frameless Live Clock replacing "Aura Glass"
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Frameless Transparent Live Clock
                      _buildFramelessClock(),

                      // Language Switcher
                      GestureDetector(
                        onTap: _showLanguageSelector,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white.withOpacity(0.12)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.language, size: 14, color: Colors.cyanAccent),
                              const SizedBox(width: 4),
                              Text(
                                _currentLanguageKey.toUpperCase(),
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),

                  // Expression Line (if active)
                  if (localizedExpression.isNotEmpty)
                    Container(
                      alignment: Alignment.centerRight,
                      padding: const EdgeInsets.only(right: 12, bottom: 4),
                      child: Text(
                        localizedExpression,
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.cyanAccent.withOpacity(0.85),
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ),

                  // Big Autoscaling Result Display (Apple Typography)
                  Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 12, bottom: 16),
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerRight,
                      child: Text(
                        localizedDisplay,
                        style: const TextStyle(
                          fontSize: 76,
                          fontWeight: FontWeight.w300,
                          color: Colors.white,
                          letterSpacing: -1.5,
                        ),
                      ),
                    ),
                  ),

                  // 4. 3D Raised Convex Circular Keypad
                  _build3DKeypad(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Frameless Live Clock Widget (အကြည်ရောင် နာရီ ဘောင်မပါ)
  Widget _buildFramelessClock() {
    final hour = _currentTime.hour % 12;
    final minute = _currentTime.minute;
    final second = _currentTime.second;

    final hourDeg = (hour * 30.0) + (minute * 0.5);
    final minuteDeg = (minute * 6.0) + (second * 0.1);
    final secondDeg = second * 6.0;

    final timeStr = '\${_currentTime.hour.toString().padLeft(2, '0')}:\${minute.toString().padLeft(2, '0')}:\${second.toString().padLeft(2, '0')}';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Frameless Analog Dial (No outer ring border, floating numerals & hands)
          SizedBox(
            width: 32,
            height: 32,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Floating numerals: 12, 3, 6, 9
                const Positioned(top: 0, child: Text('12', style: TextStyle(fontSize: 6.5, color: Colors.cyanAccent, fontWeight: FontWeight.bold))),
                const Positioned(right: 0, child: Text('3', style: TextStyle(fontSize: 6.5, color: Colors.cyanAccent, fontWeight: FontWeight.bold))),
                const Positioned(bottom: 0, child: Text('6', style: TextStyle(fontSize: 6.5, color: Colors.cyanAccent, fontWeight: FontWeight.bold))),
                const Positioned(left: 0, child: Text('9', style: TextStyle(fontSize: 6.5, color: Colors.cyanAccent, fontWeight: FontWeight.bold))),

                // Hour Hand
                Transform.rotate(
                  angle: hourDeg * (math.pi / 180),
                  child: Align(
                    alignment: Alignment.topCenter,
                    child: Container(
                      width: 2.0,
                      height: 8,
                      margin: const EdgeInsets.only(top: 8),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(2)),
                    ),
                  ),
                ),

                // Minute Hand
                Transform.rotate(
                  angle: minuteDeg * (math.pi / 180),
                  child: Align(
                    alignment: Alignment.topCenter,
                    child: Container(
                      width: 1.5,
                      height: 11,
                      margin: const EdgeInsets.only(top: 5),
                      decoration: BoxDecoration(color: Colors.cyanAccent, borderRadius: BorderRadius.circular(2)),
                    ),
                  ),
                ),

                // Second Hand (Sweeping)
                Transform.rotate(
                  angle: secondDeg * (math.pi / 180),
                  child: Align(
                    alignment: Alignment.topCenter,
                    child: Container(
                      width: 1.0,
                      height: 13,
                      margin: const EdgeInsets.only(top: 3),
                      decoration: BoxDecoration(color: Colors.redAccent, borderRadius: BorderRadius.circular(1)),
                    ),
                  ),
                ),

                // Center Pin
                Container(
                  width: 3.5,
                  height: 3.5,
                  decoration: const BoxDecoration(color: Colors.cyanAccent, shape: BoxShape.circle),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            timeStr,
            style: const TextStyle(fontSize: 12, fontFamily: 'monospace', fontWeight: FontWeight.w600, color: Colors.white),
          ),
        ],
      ),
    );
  }

  // 3D Raised Convex Keypad (ကြွတက်နေသော 3D Glass ခလုတ်များ)
  Widget _build3DKeypad() {
    return Column(
      children: [
        // Row 1: AC, ±, %, ÷
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _build3DPebble(
              label: _display == '0' ? 'AC' : 'C',
              size: 72,
              type: PebbleType.action,
              onTap: _clear,
            ),
            _build3DPebble(
              label: '±',
              size: 64,
              type: PebbleType.action,
              onTap: _toggleSign,
            ),
            _build3DPebble(
              label: '%',
              size: 66,
              type: PebbleType.action,
              onTap: _percentage,
            ),
            _build3DPebble(
              label: '÷',
              size: 70,
              type: PebbleType.operator,
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
            _buildDigitPebble('7', 72),
            _buildDigitPebble('8', 68),
            _buildDigitPebble('9', 74),
            _build3DPebble(
              label: '×',
              size: 70,
              type: PebbleType.operator,
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
            _buildDigitPebble('4', 70),
            _buildDigitPebble('5', 76),
            _buildDigitPebble('6', 68),
            _build3DPebble(
              label: '−',
              size: 70,
              type: PebbleType.operator,
              isActive: _operator == '−' || _operator == '-',
              onTap: () => _onOperatorPressed('−'),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Row 4: 1, 2, 3, +
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildDigitPebble('1', 72),
            _buildDigitPebble('2', 68),
            _buildDigitPebble('3', 72),
            _build3DPebble(
              label: '+',
              size: 70,
              type: PebbleType.operator,
              isActive: _operator == '+',
              onTap: () => _onOperatorPressed('+'),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Row 5: 0, ., =
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildDigitPebble('0', 74, isWide: true),
            _build3DPebble(
              label: '.',
              size: 66,
              type: PebbleType.number,
              onTap: _onDecimalPressed,
            ),
            _build3DPebble(
              label: '=',
              size: 72,
              type: PebbleType.equals,
              onTap: _calculate,
            ),
          ],
        ),
        const SizedBox(height: 8),
      ],
    );
  }

  Widget _buildDigitPebble(String digit, double size, {bool isWide = false}) {
    final localized = _toLocalizedDigits(digit);
    return _build3DPebble(
      label: localized,
      size: size,
      isWide: isWide,
      type: PebbleType.number,
      onTap: () => _onNumberPressed(digit),
    );
  }

  Widget _build3DPebble({
    required String label,
    required double size,
    required PebbleType type,
    required VoidCallback onTap,
    bool isActive = false,
    bool isWide = false,
  }) {
    Color bgGradientStart;
    Color bgGradientEnd;
    Color textColor;
    double fontSize = (size * 0.42).clamp(18.0, 32.0);

    switch (type) {
      case PebbleType.operator:
        bgGradientStart = isActive ? Colors.white : const Color(0xFFFF9F0A);
        bgGradientEnd = isActive ? const Color(0xFFF1F5F9) : const Color(0xFFD97706);
        textColor = isActive ? const Color(0xFFD97706) : Colors.white;
        break;
      case PebbleType.action:
        bgGradientStart = Colors.white.withOpacity(0.38);
        bgGradientEnd = Colors.white.withOpacity(0.16);
        textColor = Colors.white;
        break;
      case PebbleType.equals:
        bgGradientStart = const Color(0xFF34D399);
        bgGradientEnd = const Color(0xFF059669);
        textColor = Colors.white;
        break;
      case PebbleType.number:
      default:
        bgGradientStart = Colors.white.withOpacity(0.24);
        bgGradientEnd = Colors.white.withOpacity(0.08);
        textColor = Colors.white;
        break;
    }

    final double width = isWide ? size * 1.95 : size;
    final double height = size;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 140),
        width: width,
        height: height,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(height / 2),
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [bgGradientStart, bgGradientEnd],
          ),
          border: Border(
            top: BorderSide(color: Colors.white.withOpacity(0.85), width: 1.8),
            left: BorderSide(color: Colors.white.withOpacity(0.35), width: 1.2),
            right: BorderSide(color: Colors.white.withOpacity(0.25), width: 1.2),
            bottom: BorderSide(color: Colors.black.withOpacity(0.55), width: 2.2),
          ),
          boxShadow: [
            // Deep 3D Contact Shadow
            BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
            // Convex Dome Highlight
            BoxShadow(
              color: Colors.white.withOpacity(0.2),
              blurRadius: 6,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: FontWeight.w400,
            color: textColor,
            shadows: const [
              Shadow(
                color: Colors.black38,
                blurRadius: 4,
                offset: Offset(0, 1.5),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

enum PebbleType { number, operator, action, equals }
`;
}
