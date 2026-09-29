import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Globe } from 'lucide-react';
import { sound } from '../utils/sound';

export interface MarketItem {
  id: 'gold' | 'oil' | 'usd' | 'btc';
  name: string;
  symbol: string;
  price: number;
  changePercent: number;
  isPositive: boolean;
  prefix: string;
  sparkline: number[];
}

const DEFAULT_MARKET_DATA: MarketItem[] = [
  {
    id: 'gold',
    name: 'Gold',
    symbol: 'XAU',
    price: 2658.40,
    changePercent: 0.72,
    isPositive: true,
    prefix: '$',
    sparkline: [2630, 2638, 2635, 2648, 2642, 2652, 2658],
  },
  {
    id: 'oil',
    name: 'Oil',
    symbol: 'WTI',
    price: 71.45,
    changePercent: -0.45,
    isPositive: false,
    prefix: '$',
    sparkline: [73.2, 72.8, 72.4, 71.9, 72.2, 71.6, 71.45],
  },
  {
    id: 'usd',
    name: 'Dollar',
    symbol: 'DXY',
    price: 101.35,
    changePercent: 0.16,
    isPositive: true,
    prefix: '',
    sparkline: [100.9, 101.0, 101.1, 101.05, 101.2, 101.28, 101.35],
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 64820,
    changePercent: 2.65,
    isPositive: true,
    prefix: '$',
    sparkline: [62400, 63100, 62900, 63800, 63400, 64200, 64820],
  },
];

const INITIAL_HEADLINES: string[] = [
  'Gold rallies near record highs as central banks expand precious metal holdings',
  'Bitcoin surges past key levels driven by institutional spot exchange volume',
  'Global stock indices advance amid steady interest rate benchmarks',
  'Crude oil trading steadies following international energy supply revisions',
  'US Dollar Index holds firm at 101.4 as global commerce metrics balance',
  'IMF upgrades world economic development projection led by technological innovation',
  'Global semiconductor production expands to meet soaring artificial intelligence demand',
  'Clean energy and modern infrastructure investments accelerate worldwide',
];

interface Props {
  onSelectPrice?: (priceStr: string) => void;
}

export const WorldMarketTicker: React.FC<Props> = ({ onSelectPrice }) => {
  const [items, setItems] = useState<MarketItem[]>(DEFAULT_MARKET_DATA);
  const [headlines, setHeadlines] = useState<string[]>(INITIAL_HEADLINES);
  const isFetchingRef = useRef<boolean>(false);

  // 1. Live Market Online Fetcher (Gold, Oil, USD, BTC)
  const fetchLiveMarketOnline = async () => {
    if (isFetchingRef.current || !navigator.onLine) return;
    isFetchingRef.current = true;

    try {
      // First try our full-stack endpoint
      let handled = false;
      try {
        const apiRes = await fetch('/api/market-front', { signal: AbortSignal.timeout(4000) });
        if (apiRes.ok) {
          const mData = await apiRes.json();
          if (mData && mData.btc && mData.gold) {
            setItems((prev) =>
              prev.map((it) => {
                if (it.id === 'btc' && mData.btc.price) {
                  return {
                    ...it,
                    price: mData.btc.price,
                    changePercent: mData.btc.changePercent,
                    isPositive: mData.btc.isPositive,
                    sparkline: [...it.sparkline.slice(1), mData.btc.price],
                  };
                }
                if (it.id === 'gold' && mData.gold.price) {
                  return {
                    ...it,
                    price: mData.gold.price,
                    changePercent: mData.gold.changePercent,
                    isPositive: mData.gold.isPositive,
                    sparkline: [...it.sparkline.slice(1), mData.gold.price],
                  };
                }
                if (it.id === 'oil' && mData.oil.price) {
                  return {
                    ...it,
                    price: mData.oil.price,
                    changePercent: mData.oil.changePercent,
                    isPositive: mData.oil.isPositive,
                    sparkline: [...it.sparkline.slice(1), mData.oil.price],
                  };
                }
                if (it.id === 'usd' && mData.usd.price) {
                  return {
                    ...it,
                    price: mData.usd.price,
                    changePercent: mData.usd.changePercent,
                    isPositive: mData.usd.isPositive,
                    sparkline: [...it.sparkline.slice(1), mData.usd.price],
                  };
                }
                return it;
              })
            );
            handled = true;
          }
        }
      } catch {
        // proceed to direct client fallback
      }

      if (!handled) {
        // Direct Binance API fallback for BTC & Gold (PAXG)
        const [btcRes, paxgRes] = await Promise.allSettled([
          fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT', {
            signal: AbortSignal.timeout(3500),
          }),
          fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT', {
            signal: AbortSignal.timeout(3500),
          }),
        ]);

        let liveBtc: number | null = null;
        let liveBtcChg = 0;
        if (btcRes.status === 'fulfilled' && btcRes.value.ok) {
          const d = await btcRes.value.json();
          if (d.lastPrice) {
            liveBtc = Number(parseFloat(d.lastPrice).toFixed(0));
            liveBtcChg = Number(parseFloat(d.priceChangePercent).toFixed(2));
          }
        }

        let liveGold: number | null = null;
        let liveGoldChg = 0;
        if (paxgRes.status === 'fulfilled' && paxgRes.value.ok) {
          const d = await paxgRes.value.json();
          if (d.lastPrice) {
            liveGold = Number(parseFloat(d.lastPrice).toFixed(2));
            liveGoldChg = Number(parseFloat(d.priceChangePercent).toFixed(2));
          }
        }

        if (liveBtc !== null || liveGold !== null) {
          setItems((prev) =>
            prev.map((it) => {
              if (it.id === 'btc' && liveBtc !== null) {
                return {
                  ...it,
                  price: liveBtc,
                  changePercent: liveBtcChg,
                  isPositive: liveBtcChg >= 0,
                  sparkline: [...it.sparkline.slice(1), liveBtc],
                };
              }
              if (it.id === 'gold' && liveGold !== null) {
                return {
                  ...it,
                  price: liveGold,
                  changePercent: liveGoldChg,
                  isPositive: liveGoldChg >= 0,
                  sparkline: [...it.sparkline.slice(1), liveGold],
                };
              }
              return it;
            })
          );
        }
      }
    } catch {
      // Retain existing items
    } finally {
      isFetchingRef.current = false;
    }
  };

  // 2. Live World Breaking News Online Fetcher
  const fetchLiveNewsOnline = async () => {
    if (!navigator.onLine) return;
    try {
      const res = await fetch(
        'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/world/rss.xml',
        { signal: AbortSignal.timeout(4500) }
      );
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.items) && json.items.length > 0) {
          const fetchedTitles: string[] = json.items
            .map((item: { title: string }) => item.title?.trim())
            .filter((t: string) => Boolean(t && t.length > 10))
            .slice(0, 10);
          if (fetchedTitles.length >= 4) {
            setHeadlines(fetchedTitles);
          }
        }
      }
    } catch {
      // Retain existing headlines
    }
  };

  // Periodic online sync & micro-tick simulation
  useEffect(() => {
    fetchLiveMarketOnline();
    fetchLiveNewsOnline();

    // Online refresh interval (every 45 seconds)
    const onlineSyncTimer = setInterval(() => {
      fetchLiveMarketOnline();
      fetchLiveNewsOnline();
    }, 45000);

    // Micro-fluctuation realistic ticker (every 4 seconds)
    const tickerTimer = setInterval(() => {
      setItems((prev) =>
        prev.map((item) => {
          if (Math.random() > 0.45) return item;
          const delta = (Math.random() - 0.48) * 0.002;
          const newPrice = Number((item.price * (1 + delta)).toFixed(item.id === 'btc' ? 0 : 2));
          const newChange = Number((item.changePercent + delta * 20).toFixed(2));
          return {
            ...item,
            price: newPrice,
            changePercent: newChange,
            isPositive: newChange >= 0,
            sparkline: [...item.sparkline.slice(1), newPrice],
          };
        })
      );
    }, 4000);

    return () => {
      clearInterval(onlineSyncTimer);
      clearInterval(tickerTimer);
    };
  }, []);

  const handleItemClick = (item: MarketItem) => {
    sound.playGlassTap(1200, 0.04, 0.12);
    if (onSelectPrice) {
      onSelectPrice(String(item.price));
    }
  };

  // Mini Sparkline SVG Renderer
  const renderSparklineSvg = (data: number[], isPositive: boolean) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 56;
    const height = 18;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathData = `M ${points.join(' L ')}`;
    const strokeColor = isPositive ? '#34d399' : '#f87171';
    const gradientId = `spark-${isPositive ? 'up' : 'down'}`;

    return (
      <svg className="w-full h-4 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={`${pathData} L ${width},${height} L 0,${height} Z`} fill={`url(#${gradientId})`} />
        <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r="1.8"
            fill={strokeColor}
            className="animate-ping origin-center"
          />
        )}
      </svg>
    );
  };

  // Continuous repeating text for marquee crawl
  const marqueeText = headlines.join('   ✦   ');

  return (
    <div className="relative z-20 w-full px-2.5 pb-1.5 pt-0.5 select-none space-y-1 shrink-0">
      {/* ========================================================
          1. 4 WORLD MARKET ASSETS (GOLD, OIL, DOLLAR, BITCOIN)
          Pure transparent frosted glass - Frameless
         ======================================================== */}
      <div className="w-full grid grid-cols-4 gap-1.5 items-center">
        {items.map((item) => {
          const formattedPrice =
            item.id === 'btc'
              ? item.price.toLocaleString()
              : item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          return (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleItemClick(item)}
              title={`Click to calculate with ${item.name}: ${item.prefix}${formattedPrice}`}
              className="relative flex flex-col items-center justify-between py-0.5 px-1 rounded-xl bg-transparent hover:bg-white/[0.08] active:bg-white/[0.12] transition-all cursor-pointer group"
            >
              {/* Asset Name & 24h Change */}
              <div className="w-full flex items-center justify-between text-[10px] tracking-tight">
                <span className="font-semibold text-white/90 group-hover:text-cyan-300 transition-colors">
                  {item.name}
                </span>
                <span
                  className={`text-[9px] font-mono font-medium ${
                    item.isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {item.isPositive ? '+' : ''}
                  {item.changePercent}%
                </span>
              </div>

              {/* Sparkline Mini Graph */}
              <div className="w-full py-0.5 pointer-events-none">
                {renderSparklineSvg(item.sparkline, item.isPositive)}
              </div>

              {/* Live Price Display */}
              <div className="w-full text-center">
                <span className="text-[11px] font-mono font-light text-white tracking-tighter drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                  {item.prefix}{formattedPrice}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ========================================================
          2. WORLD BREAKING NEWS TICKER CRAWLER
          - Pure transparent frosted glass (NO red badge, NO red text)
          - Dark text scrolling right-to-left
         ======================================================== */}
      <div className="relative w-full h-5.5 rounded-full overflow-hidden flex items-center bg-white/[0.15] backdrop-blur-md border border-white/20 shadow-inner px-2.5 shrink-0">
        {/* Subtle Frosted Globe Icon (No red button) */}
        <div className="shrink-0 flex items-center gap-1 pr-2 text-slate-900/80">
          <Globe className="w-3 h-3 text-slate-950 animate-spin-slow" />
        </div>

        {/* Marquee Track: Smooth Continuous Horizontal Scroll Right-to-Left */}
        <div className="relative flex-1 h-full overflow-hidden flex items-center">
          <div className="inline-flex whitespace-nowrap animate-marquee items-center font-bold text-[10.5px] tracking-tight text-slate-950 font-sans selection:bg-cyan-500/30">
            <span className="mr-8">{marqueeText}</span>
            <span className="mr-8">✦   {marqueeText}</span>
          </div>
        </div>
      </div>

      {/* Developed By NextUint Team - On pure transparent backdrop with dark metallic styling */}
      <div className="w-full flex items-center justify-center pt-0.5 pb-0.5 shrink-0">
        <span
          className="text-[10px] font-semibold tracking-wider select-none text-slate-900"
          style={{
            background: 'linear-gradient(135deg, #090d16 0%, #475569 25%, #0f172a 50%, #64748b 75%, #020617 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 1px 1px rgba(255, 255, 255, 0.35)',
            letterSpacing: '0.06em',
          }}
        >
          Developed By NextUint Team
        </span>
      </div>
    </div>
  );
};
