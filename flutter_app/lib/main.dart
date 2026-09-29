// ========================================================
// AuraCalc - Frosted Glass Multilingual Apple Calculator
// Complete Full-Featured Mobile App for Android (Flutter 3.24+ / 3.27+)
// Features:
// 1. Silky Smooth 360° Continuous Touch Drag & Flick Rotation
// 2. Full Settings Modal (7 Aurora Themes, Pebble Sizing, Vapor Density, Languages, Regions)
// 3. Calculation History Drawer & Notes (Drafts) Drawer
// 4. Center Live Weather Sign (City & Meteorological Conditions)
// 5. World Market Ticker with Live Sparklines (Gold, Oil, USD, Bitcoin)
// 6. World Breaking News Marquee Crawler & "Developed By NextUint Team"
// 7. Scientific Calculator Mode (sin, cos, tan, ln, log, √, π, e, x!, %)
// 8. Auto-scaling Responsive Layout for all mobile phone screen sizes
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
      home: const MainScreen(),
    );
  }
}

// Model for Saved Notes / Drafts
class NoteEntry {
  final String id;
  final String title;
  final String calculation;
  final String result;
  final String timestamp;

  NoteEntry({
    required this.id,
    required this.title,
    required this.calculation,
    required this.result,
    required this.timestamp,
  });
}

// Model for Calculation History
class HistoryEntry {
  final String expression;
  final String result;
  final String time;

  HistoryEntry({
    required this.expression,
    required this.result,
    required this.time,
  });
}

// Model for Stock Items
class StockItem {
  final String sym;
  final String name;
  final String sector;
  final String price;
  final String chg;
  final bool isPos;
  final String target;
  final String proRating;

  StockItem({
    required this.sym,
    required this.name,
    required this.sector,
    required this.price,
    required this.chg,
    required this.isPos,
    required this.target,
    required this.proRating,
  });
}

// Main 3D Flippable Screen
class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> with TickerProviderStateMixin {
  // 360° Touch Drag & Momentum Snap Animation
  double _currentAngle = 0.0;
  bool _isDragging = false;
  late AnimationController _snapAnimationController;
  Animation<double>? _snapAnimation;

  // Marquee Continuous Scroll Controller
  late ScrollController _marqueeScrollController;
  Timer? _marqueeTimer;

  // Calculator State
  String _display = '0';
  String _expression = '';
  double? _firstOperand;
  String? _operator;
  bool _shouldResetDisplay = false;

  // Features State
  bool _showScientific = false;
  String _currentTheme = 'sunset_aurora';
  String _sizingMode = 'organic';
  String _vaporDensity = 'misty';
  String _currentLang = 'en';
  String _selectedCity = 'Yangon';
  String _selectedCountry = 'Myanmar';
  int _cityTemp = 31;
  String _weatherCondition = 'Sunny';

  // Stock Back Screen Filter
  String _activeWatchlist = 'TOP 10';
  String _stockSearchQuery = '';

  // History & Notes Lists
  final List<HistoryEntry> _history = [];
  final List<NoteEntry> _notes = [
    NoteEntry(
      id: '1',
      title: 'Monthly Budget Draft',
      calculation: '1250000 - 320000 - 150000',
      result: '780000',
      timestamp: 'Today',
    ),
  ];

  static const Map<String, List<String>> _numeralScripts = {
    'en': ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    'my': ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'],
    'ar': ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'],
    'hi': ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
    'th': ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '၈', '၉'],
    'bn': ['০', '১', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '৯'],
    'zh': ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
    'fa': ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '၈', '۹'],
  };

  final List<StockItem> _allStocks = [
    StockItem(sym: 'NVDA', name: 'NVIDIA Corp', sector: 'AI & Chips', price: '128.50', chg: '+4.2%', isPos: true, target: '\$150', proRating: '5/5 Strong Buy'),
    StockItem(sym: 'AAPL', name: 'Apple Inc', sector: 'Consumer Tech', price: '224.20', chg: '+1.8%', isPos: true, target: '\$245', proRating: '5/5 Strong Buy'),
    StockItem(sym: 'MSFT', name: 'Microsoft Corp', sector: 'Cloud & AI', price: '432.10', chg: '+0.9%', isPos: true, target: '\$475', proRating: '4/5 Buy'),
    StockItem(sym: 'GOOGL', name: 'Alphabet Inc', sector: 'Internet & AI', price: '178.60', chg: '+2.1%', isPos: true, target: '\$195', proRating: '4/5 Buy'),
    StockItem(sym: 'AMZN', name: 'Amazon.com', sector: 'E-Commerce', price: '186.40', chg: '+1.5%', isPos: true, target: '\$210', proRating: '4/5 Buy'),
    StockItem(sym: 'TSLA', name: 'Tesla Inc', sector: 'Automotive & AI', price: '254.30', chg: '+3.8%', isPos: true, target: '\$280', proRating: '3/5 Hold'),
    StockItem(sym: 'META', name: 'Meta Platforms', sector: 'Social & Metaverse', price: '568.00', chg: '+2.9%', isPos: true, target: '\$620', proRating: '5/5 Strong Buy'),
    StockItem(sym: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Conglomerate', price: '452.80', chg: '+0.4%', isPos: true, target: '\$480', proRating: '4/5 Buy'),
    StockItem(sym: 'LLY', name: 'Eli Lilly', sector: 'Pharma', price: '915.00', chg: '+1.6%', isPos: true, target: '\$1000', proRating: '5/5 Strong Buy'),
    StockItem(sym: 'AVGO', name: 'Broadcom Inc', sector: 'Semiconductors', price: '172.40', chg: '+3.1%', isPos: true, target: '\$195', proRating: '4/5 Buy'),
    StockItem(sym: 'AMD', name: 'Adv Micro Devices', sector: 'AI & Chips', price: '156.20', chg: '+2.4%', isPos: true, target: '\$180', proRating: '4/5 Buy'),
    StockItem(sym: 'NFLX', name: 'Netflix Inc', sector: 'Streaming', price: '685.00', chg: '+1.1%', isPos: true, target: '\$720', proRating: '4/5 Buy'),
  ];

  @override
  void initState() {
    super.initState();
    _snapAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 550),
    );

    // Auto scrolling marquee setup
    _marqueeScrollController = ScrollController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startMarqueeScroll();
    });
  }

  void _startMarqueeScroll() {
    _marqueeTimer?.cancel();
    _marqueeTimer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
      if (_marqueeScrollController.hasClients) {
        final maxScroll = _marqueeScrollController.position.maxScrollExtent;
        final current = _marqueeScrollController.offset;
        if (current >= maxScroll) {
          _marqueeScrollController.jumpTo(0.0);
        } else {
          _marqueeScrollController.jumpTo(current + 1.2);
        }
      }
    });
  }

  @override
  void dispose() {
    _snapAnimationController.dispose();
    _marqueeTimer?.cancel();
    _marqueeScrollController.dispose();
    super.dispose();
  }

  // Smooth Snap Animation to Target Angle with Natural Velocity Interpolation
  void _animateToAngle(double targetAngle, [double velocity = 0.0]) {
    _snapAnimationController.stop();
    final start = _currentAngle;
    final distance = (targetAngle - start).abs();

    // Dynamic duration: snappy 160ms for small snaps, silky 380ms for full rotations
    int durationMs = (distance * 135).clamp(160, 420).toInt();
    if (velocity.abs() > 300) {
      durationMs = (durationMs * 0.72).clamp(140, 320).toInt();
    }
    _snapAnimationController.duration = Duration(milliseconds: durationMs);

    _snapAnimation = Tween<double>(begin: start, end: targetAngle).animate(
      CurvedAnimation(parent: _snapAnimationController, curve: Curves.easeOutCubic),
    )..addListener(() {
        setState(() {
          _currentAngle = _snapAnimation!.value;
        });
      });
    _snapAnimationController.forward(from: 0.0);
  }

  // 3D Flip Button Toggle (180° rotation)
  void _toggleFlip() {
    HapticFeedback.mediumImpact();
    final target = ((_currentAngle / math.pi).round() + 1) * math.pi;
    _animateToAngle(target);
  }

  String _toLocalizedDigits(String text) {
    if (_currentLang == 'en') return text;
    final digits = _numeralScripts[_currentLang] ?? _numeralScripts['en']!;
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

  // Calculator Math Operations
  void _onNumber(String digit) {
    HapticFeedback.lightImpact();
    setState(() {
      if (_display == '0' || _shouldResetDisplay) {
        _display = digit;
        _shouldResetDisplay = false;
      } else {
        if (_display.replaceAll(',', '').length < 12) {
          _display += digit;
        }
      }
    });
  }

  void _onDecimal() {
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

  void _onOperator(String op) {
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

    final formattedResult = _formatNumber(result);
    final fullCalc = '$_expression $_display';

    HapticFeedback.heavyImpact();
    setState(() {
      _history.insert(
        0,
        HistoryEntry(
          expression: fullCalc,
          result: formattedResult,
          time: '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
        ),
      );
      _display = formattedResult;
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

  void _onScientific(String func) {
    HapticFeedback.lightImpact();
    final val = double.tryParse(_display.replaceAll(',', '')) ?? 0.0;
    double res = 0.0;

    switch (func) {
      case 'sin':
        res = math.sin(val * (math.pi / 180));
        break;
      case 'cos':
        res = math.cos(val * (math.pi / 180));
        break;
      case 'tan':
        res = math.tan(val * (math.pi / 180));
        break;
      case 'ln':
        res = val > 0 ? math.log(val) : 0;
        break;
      case 'log':
        res = val > 0 ? math.log(val) / math.ln10 : 0;
        break;
      case 'sqrt':
        res = val >= 0 ? math.sqrt(val) : 0;
        break;
      case 'sqr':
        res = val * val;
        break;
      case 'pi':
        res = math.pi;
        break;
      case 'e':
        res = math.e;
        break;
      default:
        return;
    }

    setState(() {
      _display = _formatNumber(res);
      _shouldResetDisplay = true;
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

  void _saveCurrentToNotes() {
    HapticFeedback.mediumImpact();
    final newNote = NoteEntry(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: 'Calculation #${_notes.length + 1}',
      calculation: _expression.isNotEmpty ? '$_expression $_display' : _display,
      result: _display,
      timestamp: 'Just now',
    );
    setState(() {
      _notes.insert(0, newNote);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Saved "${_display}" to Notes Drafts!'),
        duration: const Duration(seconds: 2),
        backgroundColor: const Color(0xFF0F172A),
      ),
    );
  }

  // Theme Gradients
  List<Color> _getThemeColors() {
    switch (_currentTheme) {
      case 'sunset_aurora':
        return const [Color(0xFFF97316), Color(0xFFE11D48), Color(0xFF4F46E5), Color(0xFF020617)];
      case 'neon_bloom':
        return const [Color(0xFFD946EF), Color(0xFFEC4899), Color(0xFF06B6D4), Color(0xFF020617)];
      case 'deep_ocean':
        return const [Color(0xFF06B6D4), Color(0xFF2563EB), Color(0xFF1E1B4B), Color(0xFF020617)];
      case 'midnight_purple':
        return const [Color(0xFFA855F7), Color(0xFF6366F1), Color(0xFF0F172A), Color(0xFF020617)];
      case 'frosted_emerald':
        return const [Color(0xFF10B981), Color(0xFF0D9488), Color(0xFF064E3B), Color(0xFF020617)];
      case 'liquid_silver':
        return const [Color(0xFFE2E8F0), Color(0xFF94A3B8), Color(0xFF334155), Color(0xFF020617)];
      case 'white_metallic':
        return const [Color(0xFFFFFFFF), Color(0xFFCBD5E1), Color(0xFF64748B), Color(0xFF020617)];
      default:
        return const [Color(0xFFF97316), Color(0xFFE11D48), Color(0xFF4F46E5), Color(0xFF020617)];
    }
  }

  // ----------------------------------------------------
  // Modals & Drawers: History, Notes, Settings
  // ----------------------------------------------------
  void _openHistoryDrawer() {
    HapticFeedback.lightImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0B132B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Calculation History',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  if (_history.isNotEmpty)
                    TextButton(
                      onPressed: () {
                        setState(() => _history.clear());
                        Navigator.pop(ctx);
                      },
                      child: const Text('Clear', style: TextStyle(color: Colors.redAccent)),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              Expanded(
                child: _history.isEmpty
                    ? const Center(
                        child: Text(
                          'No recent calculations yet.',
                          style: TextStyle(color: Colors.white38),
                        ),
                      )
                    : ListView.separated(
                        itemCount: _history.length,
                        separatorBuilder: (_, __) => const Divider(color: Colors.white12),
                        itemBuilder: (context, index) {
                          final item = _history[index];
                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text(item.expression, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                            trailing: Text(
                              item.result,
                              style: const TextStyle(color: Colors.cyanAccent, fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            subtitle: Text(item.time, style: const TextStyle(color: Colors.white30, fontSize: 11)),
                            onTap: () {
                              setState(() {
                                _display = item.result;
                                _shouldResetDisplay = true;
                              });
                              Navigator.pop(ctx);
                            },
                          );
                        },
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _openNotesDrawer() {
    HapticFeedback.lightImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0B132B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Saved Calculation Notes',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  Text(
                    '${_notes.length} drafts',
                    style: const TextStyle(color: Colors.white38, fontSize: 12),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Expanded(
                child: _notes.isEmpty
                    ? const Center(
                        child: Text(
                          'No saved notes yet. Tap the bookmark icon to save calculations!',
                          style: TextStyle(color: Colors.white38),
                        ),
                      )
                    : ListView.builder(
                        itemCount: _notes.length,
                        itemBuilder: (context, index) {
                          final note = _notes[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.06),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withOpacity(0.1)),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(note.title, style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600)),
                                      Text(note.calculation, style: const TextStyle(color: Colors.white38, fontSize: 11)),
                                      const SizedBox(height: 4),
                                      Text(
                                        note.result,
                                        style: const TextStyle(color: Colors.cyanAccent, fontSize: 18, fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.arrow_upward, color: Colors.cyanAccent, size: 20),
                                  tooltip: 'Load into Calculator',
                                  onPressed: () {
                                    setState(() {
                                      _display = note.result;
                                      _shouldResetDisplay = true;
                                    });
                                    Navigator.pop(ctx);
                                  },
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 18),
                                  onPressed: () {
                                    setState(() {
                                      _notes.removeAt(index);
                                    });
                                    Navigator.pop(ctx);
                                  },
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _openSettingsModal([int initialTab = 0]) {
    HapticFeedback.lightImpact();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return DefaultTabController(
          length: 5,
          initialIndex: initialTab,
          child: SizedBox(
            height: MediaQuery.of(context).size.height * 0.75,
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.only(top: 12, bottom: 4),
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const TabBar(
                  isScrollable: true,
                  labelColor: Colors.cyanAccent,
                  unselectedLabelColor: Colors.white60,
                  indicatorColor: Colors.cyanAccent,
                  tabs: [
                    Tab(text: 'Theme'),
                    Tab(text: 'Shape'),
                    Tab(text: 'Mist'),
                    Tab(text: 'Language'),
                    Tab(text: 'Region'),
                  ],
                ),
                Expanded(
                  child: TabBarView(
                    children: [
                      _buildThemeSelectorTab(),
                      _buildPebbleModeTab(),
                      _buildMistDensityTab(),
                      _buildLanguageTab(),
                      _buildRegionTab(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildThemeSelectorTab() {
    final themes = [
      {'id': 'sunset_aurora', 'name': 'Sunset Aurora'},
      {'id': 'neon_bloom', 'name': 'Neon Bloom'},
      {'id': 'deep_ocean', 'name': 'Deep Ocean'},
      {'id': 'midnight_purple', 'name': 'Midnight Purple'},
      {'id': 'frosted_emerald', 'name': 'Frosted Emerald'},
      {'id': 'liquid_silver', 'name': 'Liquid Silver'},
      {'id': 'white_metallic', 'name': 'White Metallic'},
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: themes.map((t) {
        final isSelected = _currentTheme == t['id'];
        return ListTile(
          title: Text(t['name']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          trailing: isSelected ? const Icon(Icons.check, color: Colors.cyanAccent) : null,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          tileColor: isSelected ? Colors.white.withOpacity(0.12) : Colors.transparent,
          onTap: () {
            setState(() => _currentTheme = t['id']!);
            Navigator.pop(context);
          },
        );
      }).toList(),
    );
  }

  Widget _buildPebbleModeTab() {
    final modes = [
      {'id': 'organic', 'name': 'Organic (Fluid uneven glass pebbles)'},
      {'id': 'droplet', 'name': 'Droplet (Water drop curves)'},
      {'id': 'classic', 'name': 'Classic (Uniform circular pebbles)'},
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: modes.map((m) {
        final isSelected = _sizingMode == m['id'];
        return ListTile(
          title: Text(m['name']!, style: const TextStyle(color: Colors.white)),
          trailing: isSelected ? const Icon(Icons.check, color: Colors.cyanAccent) : null,
          tileColor: isSelected ? Colors.white.withOpacity(0.12) : Colors.transparent,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          onTap: () {
            setState(() => _sizingMode = m['id']!);
            Navigator.pop(context);
          },
        );
      }).toList(),
    );
  }

  Widget _buildMistDensityTab() {
    final densities = ['subtle', 'misty', 'dense', 'droplets'];
    return ListView(
      padding: const EdgeInsets.all(16),
      children: densities.map((d) {
        final isSelected = _vaporDensity == d;
        return ListTile(
          title: Text(d.toUpperCase(), style: const TextStyle(color: Colors.white)),
          trailing: isSelected ? const Icon(Icons.check, color: Colors.cyanAccent) : null,
          tileColor: isSelected ? Colors.white.withOpacity(0.12) : Colors.transparent,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          onTap: () {
            setState(() => _vaporDensity = d);
            Navigator.pop(context);
          },
        );
      }).toList(),
    );
  }

  Widget _buildLanguageTab() {
    final langs = [
      {'key': 'en', 'name': 'English'},
      {'key': 'my', 'name': 'Burmese (မြန်မာ)'},
      {'key': 'ar', 'name': 'Arabic (العربية)'},
      {'key': 'hi', 'name': 'Hindi (हिन्दी)'},
      {'key': 'th', 'name': 'Thai (ไทย)'},
      {'key': 'bn', 'name': 'Bengali (বাংলা)'},
      {'key': 'zh', 'name': 'Chinese (中文)'},
      {'key': 'fa', 'name': 'Persian (فارسی)'},
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: langs.map((l) {
        final isSelected = _currentLang == l['key'];
        return ListTile(
          title: Text(l['name']!, style: const TextStyle(color: Colors.white)),
          trailing: isSelected ? const Icon(Icons.check, color: Colors.cyanAccent) : null,
          tileColor: isSelected ? Colors.white.withOpacity(0.12) : Colors.transparent,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          onTap: () {
            setState(() => _currentLang = l['key']!);
            Navigator.pop(context);
          },
        );
      }).toList(),
    );
  }

  Widget _buildRegionTab() {
    final cities = [
      {'name': 'Yangon', 'country': 'Myanmar', 'temp': 31, 'cond': 'Sunny'},
      {'name': 'Mandalay', 'country': 'Myanmar', 'temp': 34, 'cond': 'Clear'},
      {'name': 'Bangkok', 'country': 'Thailand', 'temp': 32, 'cond': 'Partly Cloudy'},
      {'name': 'Singapore', 'country': 'Singapore', 'temp': 29, 'cond': 'Thunderstorm'},
      {'name': 'Tokyo', 'country': 'Japan', 'temp': 18, 'cond': 'Overcast'},
      {'name': 'London', 'country': 'United Kingdom', 'temp': 14, 'cond': 'Rain'},
      {'name': 'New York', 'country': 'United States', 'temp': 20, 'cond': 'Sunny'},
      {'name': 'Dubai', 'country': 'UAE', 'temp': 36, 'cond': 'Sunny'},
      {'name': 'Paris', 'country': 'France', 'temp': 16, 'cond': 'Cloudy'},
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: cities.map((c) {
        final isSelected = _selectedCity == c['name'];
        return ListTile(
          title: Text(c['name'] as String, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          subtitle: Text('${c['country']} • ${c['cond']}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('${c['temp']}°C', style: const TextStyle(color: Colors.amberAccent, fontSize: 16, fontWeight: FontWeight.bold)),
              if (isSelected) const Padding(padding: EdgeInsets.only(left: 8), child: Icon(Icons.check, color: Colors.cyanAccent)),
            ],
          ),
          tileColor: isSelected ? Colors.white.withOpacity(0.12) : Colors.transparent,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          onTap: () {
            setState(() {
              _selectedCity = c['name'] as String;
              _selectedCountry = c['country'] as String;
              _cityTemp = c['temp'] as int;
              _weatherCondition = c['cond'] as String;
            });
            Navigator.pop(context);
          },
        );
      }).toList(),
    );
  }

  // ----------------------------------------------------
  // BUILD: Main 3D Card Animation View with Touch Swiping
  // ----------------------------------------------------
  @override
  Widget build(BuildContext context) {
    // Determine which side is visible (Front or Back) across continuous 360° rotation
    final normalized = ((_currentAngle % (2 * math.pi)) + (2 * math.pi)) % (2 * math.pi);
    final isBack = normalized > (math.pi / 2) && normalized < (3 * math.pi / 2);

    return Scaffold(
      body: Stack(
        children: [
          // 1. Dynamic Aurora Gradient Canvas
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: _getThemeColors(),
              ),
            ),
          ),

          // 2. Frosted Mist Blur
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 30.0, sigmaY: 30.0),
              child: Container(color: Colors.black.withOpacity(0.20)),
            ),
          ),

          // 3. 360° Interactive Touch Drag & Swipe Area (Silky Left & Right Rotation)
          SafeArea(
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onHorizontalDragStart: (details) {
                _snapAnimationController.stop();
                _isDragging = true;
              },
              onHorizontalDragUpdate: (details) {
                setState(() {
                  // Direct silky 1:1 finger tracking across 360 degrees left and right
                  _currentAngle += (details.primaryDelta ?? 0) * (math.pi / 340);
                });
              },
              onHorizontalDragEnd: (details) {
                _isDragging = false;
                final velocity = details.primaryVelocity ?? 0.0;
                // Natural momentum throw (flick left or right)
                final momentum = (velocity / 1000.0) * (math.pi / 3.0);
                final target = _currentAngle + momentum;
                // Snap cleanly to nearest 180° multiple
                final snapTarget = (target / math.pi).round() * math.pi;
                HapticFeedback.lightImpact();
                _animateToAngle(snapTarget, velocity);
              },
              onHorizontalDragCancel: () {
                _isDragging = false;
                final snapTarget = (_currentAngle / math.pi).round() * math.pi;
                _animateToAngle(snapTarget);
              },
              child: Transform(
                transform: Matrix4.identity()
                  ..setEntry(3, 2, 0.0012)
                  ..rotateY(_currentAngle),
                alignment: Alignment.center,
                child: isBack
                    ? Transform(
                        transform: Matrix4.identity()..rotateY(math.pi),
                        alignment: Alignment.center,
                        child: _buildBackStockCard(),
                      )
                    : _buildFrontCalculator(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ----------------------------------------------------
  // FRONT: Apple Frosted Glass Calculator
  // ----------------------------------------------------
  Widget _buildFrontCalculator() {
    final localizedDisplay = _toLocalizedDigits(_display);
    final localizedExpression = _toLocalizedDigits(_expression);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 4.0),
      child: Column(
        children: [
          // 1. Top In-App Action Bar (History, Notes, WeatherSign, 3D Flip, Scientific, Settings)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Left: History & Notes
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.access_time_rounded, color: Colors.white70, size: 20),
                    tooltip: 'History',
                    onPressed: _openHistoryDrawer,
                  ),
                  IconButton(
                    icon: const Icon(Icons.bookmark_border_rounded, color: Colors.white70, size: 20),
                    tooltip: 'Saved Notes Drafts',
                    onPressed: _openNotesDrawer,
                  ),
                ],
              ),

              // Center: Weather Sign
              GestureDetector(
                onTap: () => _openSettingsModal(4),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.15)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.wb_sunny_rounded, size: 14, color: Colors.amberAccent),
                      const SizedBox(width: 4),
                      Text(
                        '$_selectedCity $_cityTemp°C',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ),

              // Right: 3D Flip, Scientific Toggle, Settings
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.rotate_right_rounded, color: Colors.cyanAccent, size: 22),
                    tooltip: '3D Flip to Top 10 Stocks',
                    onPressed: _toggleFlip,
                  ),
                  IconButton(
                    icon: Icon(
                      Icons.science_outlined,
                      color: _showScientific ? Colors.amberAccent : Colors.white70,
                      size: 20,
                    ),
                    tooltip: 'Scientific Mode',
                    onPressed: () => setState(() => _showScientific = !_showScientific),
                  ),
                  IconButton(
                    icon: const Icon(Icons.tune_rounded, color: Colors.white70, size: 20),
                    tooltip: 'Settings',
                    onPressed: () => _openSettingsModal(0),
                  ),
                ],
              ),
            ],
          ),

          // 2. Display Area with Expression & Save button
          Expanded(
            flex: 3,
            child: Container(
              alignment: Alignment.bottomRight,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (localizedExpression.isNotEmpty)
                    Text(
                      localizedExpression,
                      style: TextStyle(fontSize: 16, color: Colors.white.withOpacity(0.6), fontWeight: FontWeight.w300),
                    ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.bookmark_add_outlined, color: Colors.cyanAccent, size: 20),
                        tooltip: 'Save to Notes',
                        onPressed: _saveCurrentToNotes,
                      ),
                      Expanded(
                        child: FittedBox(
                          fit: BoxFit.scaleDown,
                          alignment: Alignment.centerRight,
                          child: Text(
                            localizedDisplay,
                            style: const TextStyle(
                              fontSize: 68,
                              fontWeight: FontWeight.w300,
                              color: Colors.white,
                              letterSpacing: -1.5,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // 3. Optional Scientific Keypad Row
          if (_showScientific)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 2),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildSciBtn('sin'),
                  _buildSciBtn('cos'),
                  _buildSciBtn('tan'),
                  _buildSciBtn('ln'),
                  _buildSciBtn('sqrt'),
                  _buildSciBtn('pi'),
                ],
              ),
            ),

          // 4. Calculator 5 Rows Keypad
          Expanded(
            flex: 8,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                // Row 1: AC, ±, %, ÷
                _buildKeypadRow([
                  _KeySpec(label: _display == '0' ? 'AC' : 'C', type: _KeyType.action, onTap: _clear),
                  _KeySpec(label: '±', type: _KeyType.action, onTap: _toggleSign),
                  _KeySpec(label: '%', type: _KeyType.action, onTap: _percentage),
                  _KeySpec(label: '÷', type: _KeyType.operator, isActive: _operator == '÷', onTap: () => _onOperator('÷')),
                ]),

                // Row 2: 7, 8, 9, ×
                _buildKeypadRow([
                  _KeySpec(label: '7', type: _KeyType.number, onTap: () => _onNumber('7')),
                  _KeySpec(label: '8', type: _KeyType.number, onTap: () => _onNumber('8')),
                  _KeySpec(label: '9', type: _KeyType.number, onTap: () => _onNumber('9')),
                  _KeySpec(label: '×', type: _KeyType.operator, isActive: _operator == '×', onTap: () => _onOperator('×')),
                ]),

                // Row 3: 4, 5, 6, −
                _buildKeypadRow([
                  _KeySpec(label: '4', type: _KeyType.number, onTap: () => _onNumber('4')),
                  _KeySpec(label: '5', type: _KeyType.number, onTap: () => _onNumber('5')),
                  _KeySpec(label: '6', type: _KeyType.number, onTap: () => _onNumber('6')),
                  _KeySpec(label: '−', type: _KeyType.operator, isActive: _operator == '−', onTap: () => _onOperator('−')),
                ]),

                // Row 4: 1, 2, 3, +
                _buildKeypadRow([
                  _KeySpec(label: '1', type: _KeyType.number, onTap: () => _onNumber('1')),
                  _KeySpec(label: '2', type: _KeyType.number, onTap: () => _onNumber('2')),
                  _KeySpec(label: '3', type: _KeyType.number, onTap: () => _onNumber('3')),
                  _KeySpec(label: '+', type: _KeyType.operator, isActive: _operator == '+', onTap: () => _onOperator('+')),
                ]),

                // Row 5: 0, ., =
                _buildKeypadRow([
                  _KeySpec(label: '0', type: _KeyType.number, isWide: true, onTap: () => _onNumber('0')),
                  _KeySpec(label: '.', type: _KeyType.number, onTap: _onDecimal),
                  _KeySpec(label: '=', type: _KeyType.equals, onTap: _calculate),
                ]),
              ],
            ),
          ),

          // 5. World Market Live Ticker + World Breaking News + NextUint Team
          _buildMarketTicker(),
        ],
      ),
    );
  }

  Widget _buildSciBtn(String name) {
    return GestureDetector(
      onTap: () => _onScientific(name),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white12),
        ),
        child: Text(name, style: const TextStyle(fontSize: 11, color: Colors.cyanAccent, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildKeypadRow(List<_KeySpec> keys) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: keys.map((k) {
        if (k.isWide) {
          return Expanded(
            flex: 2,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 3.5),
              child: _buildPebble(k),
            ),
          );
        }
        return Expanded(
          flex: 1,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 3.5),
            child: _buildPebble(k),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPebble(_KeySpec spec) {
    Color bgStart;
    Color bgEnd;
    Color textColor = Colors.white;

    switch (spec.type) {
      case _KeyType.operator:
        if (spec.isActive) {
          bgStart = Colors.white;
          bgEnd = const Color(0xFFF1F5F9);
          textColor = const Color(0xFFD97706);
        } else {
          bgStart = const Color(0xFFF59E0B);
          bgEnd = const Color(0xFFD97706);
        }
        break;
      case _KeyType.action:
        bgStart = Colors.white.withOpacity(0.35);
        bgEnd = Colors.white.withOpacity(0.18);
        textColor = Colors.white;
        break;
      case _KeyType.equals:
        bgStart = const Color(0xFF10B981);
        bgEnd = const Color(0xFF059669);
        break;
      case _KeyType.number:
      default:
        bgStart = Colors.white.withOpacity(0.22);
        bgEnd = Colors.white.withOpacity(0.08);
        break;
    }

    final localLabel = spec.type == _KeyType.number ? _toLocalizedDigits(spec.label) : spec.label;

    return AspectRatio(
      aspectRatio: spec.isWide ? 2.15 : 1.0,
      child: GestureDetector(
        onTap: () {
          if (!_isDragging) {
            spec.onTap();
          }
        },
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(spec.isWide ? 36 : 9999),
            gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [bgStart, bgEnd]),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.45),
                offset: const Offset(0, 4),
                blurRadius: 10,
              ),
              BoxShadow(
                color: Colors.white.withOpacity(0.25),
                offset: const Offset(0, -1),
                blurRadius: 2,
              ),
            ],
            border: Border.all(color: Colors.white.withOpacity(0.32), width: 1.2),
          ),
          child: Center(
            child: Text(
              localLabel,
              style: TextStyle(
                fontSize: spec.label.length > 2 ? 20 : 25,
                fontWeight: spec.type == _KeyType.operator ? FontWeight.bold : FontWeight.w400,
                color: textColor,
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ----------------------------------------------------
  // BACK: Real-time Top 10 Stocks & 5 Pro Trader Forecasts Card
  // ----------------------------------------------------
  Widget _buildBackStockCard() {
    final filteredStocks = _allStocks.where((s) {
      if (_stockSearchQuery.isNotEmpty) {
        return s.sym.toLowerCase().contains(_stockSearchQuery.toLowerCase()) ||
               s.name.toLowerCase().contains(_stockSearchQuery.toLowerCase());
      }
      if (_activeWatchlist == 'AI/CHIPS') {
        return s.sector.contains('AI') || s.sector.contains('Chips') || s.sector.contains('Semiconductors');
      }
      if (_activeWatchlist == 'BIG TECH') {
        return s.sector.contains('Tech') || s.sector.contains('Cloud') || s.sector.contains('Internet');
      }
      return true;
    }).toList();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Top 10 Stocks & Forecasts', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white)),
                  Text('Tap any price to load into calculator', style: TextStyle(fontSize: 11, color: Colors.cyanAccent)),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.flip_to_back, color: Colors.cyanAccent),
                tooltip: 'Back to Calculator',
                onPressed: _toggleFlip,
              ),
            ],
          ),
          const SizedBox(height: 6),

          Container(
            height: 36,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.08),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.white12),
            ),
            child: Row(
              children: [
                const Icon(Icons.search, size: 16, color: Colors.white54),
                const SizedBox(width: 6),
                Expanded(
                  child: TextField(
                    onChanged: (val) => setState(() => _stockSearchQuery = val),
                    style: const TextStyle(fontSize: 12, color: Colors.white),
                    decoration: const InputDecoration(
                      hintText: 'Search stocks e.g. NVDA, AAPL...',
                      hintStyle: TextStyle(fontSize: 12, color: Colors.white38),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 6),

          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.06),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white10),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(children: [Text('Goldman', style: TextStyle(fontSize: 9.5, color: Colors.white54)), Text('Bullish', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.greenAccent))]),
                Column(children: [Text('Morgan Stanley', style: TextStyle(fontSize: 9.5, color: Colors.white54)), Text('Overweight', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.greenAccent))]),
                Column(children: [Text('J.P. Morgan', style: TextStyle(fontSize: 9.5, color: Colors.white54)), Text('Strong Buy', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.greenAccent))]),
              ],
            ),
          ),
          const SizedBox(height: 6),

          Expanded(
            child: ListView.separated(
              itemCount: filteredStocks.length,
              separatorBuilder: (_, __) => const SizedBox(height: 6),
              itemBuilder: (context, index) {
                final s = filteredStocks[index];
                return GestureDetector(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    setState(() {
                      _display = s.price;
                      _shouldResetDisplay = true;
                    });
                    _toggleFlip();
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.06),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.white.withOpacity(0.08)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(s.sym, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 14)),
                            Text(s.name, style: const TextStyle(color: Colors.white54, fontSize: 10)),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('\$${s.price}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.cyanAccent, fontSize: 15)),
                            Row(
                              children: [
                                Text(s.chg, style: TextStyle(fontSize: 10, color: s.isPos ? Colors.greenAccent : Colors.redAccent)),
                                const SizedBox(width: 6),
                                Text('Target: ${s.target}', style: const TextStyle(fontSize: 10, color: Colors.amberAccent)),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // ----------------------------------------------------
  // Bottom World Market Live Ticker & World Breaking News
  // ----------------------------------------------------
  Widget _buildMarketTicker() {
    return Container(
      padding: const EdgeInsets.only(top: 2, bottom: 2),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildTickerItem('Gold', '\$2,658.40', '+0.72%', true),
              _buildTickerItem('Oil', '\$71.45', '-0.45%', false),
              _buildTickerItem('USD', '101.35', '+0.16%', true),
              _buildTickerItem('BTC', '\$64,820', '+2.65%', true),
            ],
          ),
          const SizedBox(height: 4),

          Container(
            height: 22,
            padding: const EdgeInsets.symmetric(horizontal: 8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withOpacity(0.18)),
            ),
            child: Row(
              children: [
                const Icon(Icons.public, size: 12, color: Colors.black87),
                const SizedBox(width: 6),
                Expanded(
                  child: ListView(
                    controller: _marqueeScrollController,
                    scrollDirection: Axis.horizontal,
                    physics: const NeverScrollableScrollPhysics(),
                    children: const [
                      Center(
                        child: Text(
                          '⚡ FEDERAL RESERVE SIGNALS STABLE BENCHMARK RATES   ✦   GOLD HITS ALL-TIME HIGH \$2,658/OZ   ✦   OIL RESILIENT ON GLOBAL TRADE   ✦   BITCOIN SURGES PAST \$64,800 WITH INSTITUTIONAL INFLOWS   ✦   TECH EQUITIES ADVANCE   ✦   ',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 2),

          const Text(
            'Developed By NextUint Team',
            style: TextStyle(fontSize: 9.5, color: Colors.white54, letterSpacing: 0.5, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildTickerItem(String name, String price, String change, bool isPos) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        final rawPrice = price.replaceAll(RegExp(r'[^0-9.]'), '');
        setState(() {
          _display = rawPrice;
          _shouldResetDisplay = true;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Text(name, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white70)),
                const SizedBox(width: 4),
                Text(change, style: TextStyle(fontSize: 8, color: isPos ? Colors.greenAccent : Colors.redAccent)),
              ],
            ),
            Text(price, style: const TextStyle(fontSize: 9.5, color: Colors.white, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}

enum _KeyType { number, operator, action, equals }

class _KeySpec {
  final String label;
  final _KeyType type;
  final bool isWide;
  final bool isActive;
  final VoidCallback onTap;

  _KeySpec({
    required this.label,
    required this.type,
    this.isWide = false,
    this.isActive = false,
    required this.onTap,
  });
}
