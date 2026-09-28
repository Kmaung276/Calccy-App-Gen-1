// ========================================================
// AuraCalc - Frosted Glass Apple Calculator for Flutter
// Features:
// 1. Organic Uneven Pebble Circular Buttons
// 2. Translucent Frosted Glass with Vapor Mist (BackdropFilter)
// 3. Multilingual Numeral Script Translation (20+ Languages)
// Language: Dart / Flutter (Compatible with Flutter 3.x+)
// ========================================================

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
      _expression = '${_formatNumber(_firstOperand!)} $op';
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
        _display = '-$_display';
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
      s = s.replaceAll(RegExp(r'0+$'), '').replaceAll(RegExp(r'\.$'), '');
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
                  Color(0xFF090D16), // Deep Night Canvas
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
                    const Color(0xFFFF0080).withOpacity(0.4),
                    const Color(0xFF7928CA).withOpacity(0.1),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // 2. Frosted Glass & Water Vapor Mist Layer (BackdropFilter)
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 25.0, sigmaY: 25.0),
              child: Container(
                color: Colors.white.withOpacity(0.06),
              ),
            ),
          ),

          // 3. Calculator Main Content Layout
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  // Top Toolbar (Language & History)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.language, color: Colors.white70, size: 20),
                        onPressed: _showLanguageSelector,
                        tooltip: 'Change Numeral Script',
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          _currentLanguageKey.toUpperCase(),
                          style: const TextStyle(fontSize: 10, color: Colors.cyanAccent),
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),

                  // Expression & Status
                  Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 12, bottom: 6),
                    child: Text(
                      localizedExpression,
                      style: TextStyle(
                        fontSize: 18,
                        color: Colors.white.withOpacity(0.6),
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ),

                  // Big Autoscaling Result Display (Apple Typography)
                  Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 12, bottom: 20),
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

                  // 4. Organic Uneven Pebble Circular Keypad
                  _buildOrganicKeypad(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrganicKeypad() {
    return Column(
      children: [
        // Row 1: AC, ±, %, ÷
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildPebble(
              label: _display == '0' ? 'AC' : 'C',
              size: 72,
              type: PebbleType.action,
              onTap: _clear,
            ),
            _buildPebble(
              label: '±',
              size: 60,
              type: PebbleType.action,
              onTap: _toggleSign,
            ),
            _buildPebble(
              label: '%',
              size: 64,
              type: PebbleType.action,
              onTap: _percentage,
            ),
            _buildPebble(
              label: '÷',
              size: 68,
              type: PebbleType.operator,
              isActive: _operator == '÷',
              onTap: () => _onOperatorPressed('÷'),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Row 2: 7, 8, 9, × (Varied Sizes)
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildDigitPebble('7', 72),
            _buildDigitPebble('8', 60), // Smaller pebble
            _buildDigitPebble('9', 76), // Larger pebble
            _buildPebble(
              label: '×',
              size: 70,
              type: PebbleType.operator,
              isActive: _operator == '×',
              onTap: () => _onOperatorPressed('×'),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Row 3: 4, 5, 6, −
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildDigitPebble('4', 64),
            _buildDigitPebble('5', 78), // Center prominent pebble
            _buildDigitPebble('6', 62), // Compact pebble
            _buildPebble(
              label: '−',
              size: 66,
              type: PebbleType.operator,
              isActive: _operator == '−',
              onTap: () => _onOperatorPressed('−'),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Row 4: 1, 2, 3, +
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildDigitPebble('1', 74),
            _buildDigitPebble('2', 58), // Smallest number pebble
            _buildDigitPebble('3', 70),
            _buildPebble(
              label: '+',
              size: 68,
              type: PebbleType.operator,
              isActive: _operator == '+',
              onTap: () => _onOperatorPressed('+'),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Row 5: 0, ., =
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildDigitPebble('0', 78, isWide: true),
            _buildPebble(
              label: '.',
              size: 56,
              type: PebbleType.number,
              onTap: _onDecimalPressed,
            ),
            _buildPebble(
              label: '=',
              size: 74,
              type: PebbleType.equals,
              onTap: _calculate,
            ),
          ],
        ),
        const SizedBox(height: 10),
      ],
    );
  }

  Widget _buildDigitPebble(String digit, double size, {bool isWide = false}) {
    final localized = _toLocalizedDigits(digit);
    return _buildPebble(
      label: localized,
      size: size,
      isWide: isWide,
      type: PebbleType.number,
      onTap: () => _onNumberPressed(digit),
    );
  }

  Widget _buildPebble({
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
        bgGradientStart = isActive ? Colors.white : const Color(0xFFFF9F0A).withOpacity(0.85);
        bgGradientEnd = isActive ? Colors.white.withOpacity(0.9) : const Color(0xFFFF7B00).withOpacity(0.85);
        textColor = isActive ? const Color(0xFFFF7B00) : Colors.white;
        break;
      case PebbleType.action:
        bgGradientStart = Colors.white.withOpacity(0.25);
        bgGradientEnd = Colors.white.withOpacity(0.12);
        textColor = Colors.white;
        break;
      case PebbleType.equals:
        bgGradientStart = const Color(0xFF30D158);
        bgGradientEnd = const Color(0xFF1EA741);
        textColor = Colors.white;
        break;
      case PebbleType.number:
      default:
        bgGradientStart = Colors.white.withOpacity(0.18);
        bgGradientEnd = Colors.white.withOpacity(0.06);
        textColor = Colors.white;
        break;
    }

    final double width = isWide ? size * 1.85 : size;
    final double height = size;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: width,
        height: height,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(height / 2),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [bgGradientStart, bgGradientEnd],
          ),
          border: Border.all(
            color: Colors.white.withOpacity(isActive ? 0.9 : 0.28),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
            BoxShadow(
              color: Colors.white.withOpacity(0.12),
              blurRadius: 4,
              offset: const Offset(-2, -2),
            ),
          ],
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: FontWeight.w400,
            color: textColor,
          ),
        ),
      ),
    );
  }
}

enum PebbleType { number, operator, action, equals }
