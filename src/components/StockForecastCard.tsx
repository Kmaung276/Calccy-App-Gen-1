import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Rotate3d,
  TrendingUp,
  Search,
  Check,
  Calendar,
  Zap,
  Radio,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Flame,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Plus,
  RefreshCw,
  Calculator,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { sound } from '../utils/sound';

export interface StockItem {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  changePercent: number;
  isPositive: boolean;
  marketCap: string;
  sparkline: number[];
}

export interface TraderBreakingNews {
  id: string;
  traderName: string;
  title: string;
  firm: string;
  avatarText: string;
  avatarGradient: string;
  timeAgo: string;
  publishedDate: string; // Strictly within the past 7 days
  targetTicker: string;
  targetName: string;
  targetPrice: string;
  sentiment: 'BULLISH' | 'LONG VALUE' | 'STRATEGIC HEDGE' | 'EXPONENTIAL' | 'CAUTIONARY';
  sentimentColor: string;
  headline: string;
  fullDispatch: string;
}

// -------------------------------------------------------------
// COMPREHENSIVE STOCK MASTER DATABASE (40+ Global Equities)
// -------------------------------------------------------------
const MASTER_STOCK_LIST: StockItem[] = [
  // Mega Tech
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corp',
    sector: 'AI & Chips',
    price: 124.75,
    changePercent: 3.42,
    isPositive: true,
    marketCap: '$3.06T',
    sparkline: [119.5, 120.8, 121.4, 123.0, 122.6, 124.1, 124.75],
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc',
    sector: 'Consumer Tech',
    price: 227.40,
    changePercent: 1.15,
    isPositive: true,
    marketCap: '$3.45T',
    sparkline: [224.1, 225.0, 224.8, 226.2, 225.9, 226.8, 227.4],
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp',
    sector: 'Cloud & AI',
    price: 432.80,
    changePercent: 0.88,
    isPositive: true,
    marketCap: '$3.22T',
    sparkline: [428.0, 429.5, 431.0, 430.4, 431.8, 432.2, 432.8],
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc',
    sector: 'Internet & AI',
    price: 165.20,
    changePercent: -0.45,
    isPositive: false,
    marketCap: '$2.04T',
    sparkline: [167.0, 166.4, 166.8, 165.9, 166.1, 165.5, 165.2],
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc',
    sector: 'Cloud & Commerce',
    price: 188.90,
    changePercent: 1.62,
    isPositive: true,
    marketCap: '$1.97T',
    sparkline: [184.5, 185.8, 186.2, 187.0, 187.5, 188.1, 188.9],
  },
  {
    ticker: 'META',
    name: 'Meta Platforms',
    sector: 'Social & AI',
    price: 574.30,
    changePercent: 2.18,
    isPositive: true,
    marketCap: '$1.45T',
    sparkline: [558.0, 562.5, 565.0, 568.2, 571.0, 572.8, 574.3],
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc',
    sector: 'EV & Robotics',
    price: 254.20,
    changePercent: 4.85,
    isPositive: true,
    marketCap: '$812B',
    sparkline: [241.0, 243.5, 246.0, 249.2, 248.0, 252.1, 254.2],
  },
  {
    ticker: 'AVGO',
    name: 'Broadcom Inc',
    sector: 'Semiconductors',
    price: 172.50,
    changePercent: 1.94,
    isPositive: true,
    marketCap: '$803B',
    sparkline: [168.0, 169.2, 170.1, 169.8, 171.2, 171.8, 172.5],
  },
  {
    ticker: 'TSM',
    name: 'Taiwan Semi (ADR)',
    sector: 'Foundry & Chips',
    price: 178.60,
    changePercent: 2.45,
    isPositive: true,
    marketCap: '$926B',
    sparkline: [173.0, 174.5, 175.2, 176.8, 177.1, 177.9, 178.6],
  },
  {
    ticker: 'ASML',
    name: 'ASML Holding',
    sector: 'Lithography',
    price: 812.00,
    changePercent: -0.75,
    isPositive: false,
    marketCap: '$324B',
    sparkline: [824.0, 820.5, 818.2, 819.0, 815.4, 814.0, 812.0],
  },

  // AI & Semiconductor Leaders
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices',
    sector: 'Compute & GPUs',
    price: 156.30,
    changePercent: 2.80,
    isPositive: true,
    marketCap: '$253B',
    sparkline: [151.0, 152.4, 153.8, 154.2, 155.0, 155.8, 156.3],
  },
  {
    ticker: 'PLTR',
    name: 'Palantir Tech',
    sector: 'AI Software',
    price: 37.80,
    changePercent: 5.62,
    isPositive: true,
    marketCap: '$84B',
    sparkline: [35.2, 35.8, 36.4, 36.9, 37.1, 37.4, 37.8],
  },
  {
    ticker: 'QCOM',
    name: 'Qualcomm Inc',
    sector: 'Mobile & Edge AI',
    price: 168.90,
    changePercent: 1.10,
    isPositive: true,
    marketCap: '$188B',
    sparkline: [166.0, 167.2, 167.0, 168.1, 168.3, 168.5, 168.9],
  },
  {
    ticker: 'ARM',
    name: 'Arm Holdings',
    sector: 'Architecture IP',
    price: 142.10,
    changePercent: 3.15,
    isPositive: true,
    marketCap: '$147B',
    sparkline: [136.5, 138.0, 139.2, 140.4, 141.0, 141.6, 142.1],
  },
  {
    ticker: 'MU',
    name: 'Micron Tech',
    sector: 'HBM Memory',
    price: 104.50,
    changePercent: 2.30,
    isPositive: true,
    marketCap: '$116B',
    sparkline: [101.2, 102.0, 103.1, 102.8, 103.9, 104.1, 104.5],
  },
  {
    ticker: 'SMCI',
    name: 'Super Micro Computer',
    sector: 'Server Hardware',
    price: 45.20,
    changePercent: -1.85,
    isPositive: false,
    marketCap: '$26B',
    sparkline: [47.1, 46.5, 46.8, 45.9, 45.7, 45.5, 45.2],
  },
  {
    ticker: 'INTC',
    name: 'Intel Corp',
    sector: 'Semiconductors',
    price: 23.80,
    changePercent: 3.25,
    isPositive: true,
    marketCap: '$102B',
    sparkline: [22.4, 22.8, 23.0, 23.2, 23.4, 23.6, 23.8],
  },
  {
    ticker: 'AMAT',
    name: 'Applied Materials',
    sector: 'Chip Equipment',
    price: 198.40,
    changePercent: 1.55,
    isPositive: true,
    marketCap: '$164B',
    sparkline: [194.0, 195.2, 196.0, 196.8, 197.4, 197.8, 198.4],
  },

  // Global Titans & Blue Chips
  {
    ticker: 'BRK.B',
    name: 'Berkshire Hathaway',
    sector: 'Conglomerate',
    price: 456.20,
    changePercent: 0.62,
    isPositive: true,
    marketCap: '$985B',
    sparkline: [452.0, 453.5, 454.1, 455.0, 455.4, 455.8, 456.2],
  },
  {
    ticker: 'LLY',
    name: 'Eli Lilly and Co',
    sector: 'Biopharma',
    price: 928.40,
    changePercent: 1.84,
    isPositive: true,
    marketCap: '$882B',
    sparkline: [910.0, 915.2, 918.0, 922.4, 924.1, 926.8, 928.4],
  },
  {
    ticker: 'JPM',
    name: 'JPMorgan Chase',
    sector: 'Global Banking',
    price: 214.80,
    changePercent: 0.95,
    isPositive: true,
    marketCap: '$615B',
    sparkline: [211.5, 212.8, 213.2, 213.9, 214.1, 214.5, 214.8],
  },
  {
    ticker: 'V',
    name: 'Visa Inc',
    sector: 'Payments Network',
    price: 272.50,
    changePercent: -0.32,
    isPositive: false,
    marketCap: '$558B',
    sparkline: [274.0, 273.6, 273.9, 273.1, 272.8, 272.6, 272.5],
  },
  {
    ticker: 'WMT',
    name: 'Walmart Inc',
    sector: 'Consumer Retail',
    price: 80.40,
    changePercent: 0.78,
    isPositive: true,
    marketCap: '$647B',
    sparkline: [79.2, 79.8, 80.0, 80.1, 80.2, 80.3, 80.4],
  },
  {
    ticker: 'XOM',
    name: 'Exxon Mobil',
    sector: 'Energy & Oil',
    price: 116.30,
    changePercent: 1.25,
    isPositive: true,
    marketCap: '$462B',
    sparkline: [114.2, 114.8, 115.3, 115.7, 116.0, 116.1, 116.3],
  },
  {
    ticker: 'NVO',
    name: 'Novo Nordisk',
    sector: 'Healthcare',
    price: 122.90,
    changePercent: -0.65,
    isPositive: false,
    marketCap: '$548B',
    sparkline: [124.5, 123.8, 124.0, 123.4, 123.1, 123.0, 122.9],
  },
  {
    ticker: 'MA',
    name: 'Mastercard Inc',
    sector: 'Financial Tech',
    price: 489.10,
    changePercent: 0.42,
    isPositive: true,
    marketCap: '$455B',
    sparkline: [486.0, 487.2, 487.8, 488.2, 488.5, 488.8, 489.1],
  },
  {
    ticker: 'COST',
    name: 'Costco Wholesale',
    sector: 'Discount Retail',
    price: 894.50,
    changePercent: 1.12,
    isPositive: true,
    marketCap: '$396B',
    sparkline: [882.0, 886.5, 889.0, 891.2, 892.8, 893.6, 894.5],
  },
  {
    ticker: 'PG',
    name: 'Procter & Gamble',
    sector: 'Consumer Staples',
    price: 174.20,
    changePercent: 0.35,
    isPositive: true,
    marketCap: '$408B',
    sparkline: [173.0, 173.5, 173.8, 174.0, 174.1, 174.1, 174.2],
  },

  // High Growth & Momentum
  {
    ticker: 'COIN',
    name: 'Coinbase Global',
    sector: 'Crypto Infrastructure',
    price: 182.40,
    changePercent: 6.45,
    isPositive: true,
    marketCap: '$44B',
    sparkline: [170.0, 173.2, 176.0, 178.5, 180.2, 181.5, 182.4],
  },
  {
    ticker: 'MSTR',
    name: 'MicroStrategy',
    sector: 'Bitcoin Treasury',
    price: 154.60,
    changePercent: 7.82,
    isPositive: true,
    marketCap: '$28B',
    sparkline: [141.0, 145.2, 148.0, 151.2, 153.0, 153.8, 154.6],
  },
  {
    ticker: 'HOOD',
    name: 'Robinhood Markets',
    sector: 'Fintech Trading',
    price: 23.40,
    changePercent: 4.12,
    isPositive: true,
    marketCap: '$20B',
    sparkline: [22.1, 22.4, 22.8, 23.0, 23.1, 23.2, 23.4],
  },
  {
    ticker: 'UBER',
    name: 'Uber Technologies',
    sector: 'Mobility & Delivery',
    price: 76.50,
    changePercent: 2.15,
    isPositive: true,
    marketCap: '$159B',
    sparkline: [74.2, 74.8, 75.2, 75.8, 76.1, 76.3, 76.5],
  },
  {
    ticker: 'SPOT',
    name: 'Spotify Technology',
    sector: 'Digital Audio',
    price: 368.20,
    changePercent: 3.48,
    isPositive: true,
    marketCap: '$73B',
    sparkline: [352.0, 356.5, 360.2, 364.0, 366.1, 367.4, 368.2],
  },
  {
    ticker: 'CRWD',
    name: 'CrowdStrike Holdings',
    sector: 'Cybersecurity',
    price: 298.60,
    changePercent: 1.95,
    isPositive: true,
    marketCap: '$72B',
    sparkline: [291.0, 293.4, 295.0, 296.8, 297.2, 298.0, 298.6],
  },
  {
    ticker: 'SHOP',
    name: 'Shopify Inc',
    sector: 'E-Commerce SaaS',
    price: 81.30,
    changePercent: 2.85,
    isPositive: true,
    marketCap: '$104B',
    sparkline: [78.5, 79.2, 79.8, 80.4, 80.9, 81.1, 81.3],
  },
  {
    ticker: 'SNOW',
    name: 'Snowflake Inc',
    sector: 'Cloud Data Warehouse',
    price: 118.40,
    changePercent: -1.20,
    isPositive: false,
    marketCap: '$39B',
    sparkline: [121.0, 120.2, 120.5, 119.8, 119.1, 118.8, 118.4],
  },
  {
    ticker: 'NET',
    name: 'Cloudflare Inc',
    sector: 'Edge Cloud & Security',
    price: 82.50,
    changePercent: 2.70,
    isPositive: true,
    marketCap: '$28B',
    sparkline: [79.4, 80.1, 80.8, 81.2, 81.8, 82.1, 82.5],
  },
];

const DEFAULT_TRENDING_TICKERS = ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN', 'META', 'PLTR', 'AMD', 'MU', 'ARM'];
const DEFAULT_PINNED_TICKERS = ['NVDA', 'AAPL', 'TSLA', 'MSFT', 'PLTR', 'AMZN', 'META', 'GOOGL', 'COIN', 'ARM'];

const STOCK_CATEGORIES: Record<string, string[]> = {
  mega_tech: ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AVGO', 'TSM', 'ASML'],
  ai_chips: ['NVDA', 'TSM', 'AVGO', 'AMD', 'ASML', 'PLTR', 'QCOM', 'ARM', 'MU', 'SMCI'],
  global_titans: ['BRK.B', 'LLY', 'JPM', 'V', 'WMT', 'XOM', 'NVO', 'MA', 'COST', 'PG'],
  high_growth: ['PLTR', 'COIN', 'MSTR', 'HOOD', 'UBER', 'SPOT', 'CRWD', 'SHOP', 'ARM', 'SNOW'],
};

// -------------------------------------------------------------
// DYNAMIC LIVE TRADER BREAKING DISPATCHES (Strictly Past 7 Days)
// "forecast trader တွေလဲ တပတ်တွင်းက update news ကိုပဲ ယူပါ"
// -------------------------------------------------------------
const TRADER_DISPATCHES_THIS_WEEK: TraderBreakingNews[] = [
  {
    id: 'stanley_druckenmiller',
    traderName: 'Stanley Druckenmiller',
    title: 'Legendary Macro Fund Manager',
    firm: 'Duquesne Family Office (30-Yr 30% Avg Return)',
    avatarText: 'SD',
    avatarGradient: 'from-emerald-400 to-cyan-500',
    timeAgo: 'Today, 11:20 AM',
    publishedDate: 'This Week • Sep 27',
    targetTicker: 'NVDA',
    targetName: 'NVIDIA AI Blackwell',
    targetPrice: '$165+ Breakout Target',
    sentiment: 'BULLISH',
    sentimentColor: 'text-emerald-300 border-emerald-400/30 bg-emerald-950/30',
    headline: 'Blackwell GPU Volume Deliveries Accelerate Enterprise AI Wave',
    fullDispatch:
      '"Data center capex across sovereign nations and hyperscalers is not peaking—it is compounding. NVIDIA Blackwell platform ramp ensures multi-quarter margin defense and pricing power."',
  },
  {
    id: 'warren_buffett',
    traderName: 'Warren Buffett',
    title: 'Chairman & CEO',
    firm: 'Berkshire Hathaway (Oracle of Omaha)',
    avatarText: 'WB',
    avatarGradient: 'from-amber-400 to-yellow-600',
    timeAgo: 'Yesterday, 3:45 PM',
    publishedDate: 'This Week • Sep 26',
    targetTicker: 'AAPL',
    targetName: 'Apple Ecosystem Moat',
    targetPrice: '$260+ Valuation Support',
    sentiment: 'LONG VALUE',
    sentimentColor: 'text-cyan-300 border-cyan-400/30 bg-cyan-950/30',
    headline: 'Maintaining Defensive Cash Reserves While Holding Core Quality Moats',
    fullDispatch:
      '"Following interest rate policy pivots, patient capital triumphs. Apple remains an irreplaceable consumer habit with massive recurring cash generation. Cash reserves offer total optionality."',
  },
  {
    id: 'cathie_wood',
    traderName: 'Cathie Wood',
    title: 'Founder & Chief Investment Officer',
    firm: 'ARK Invest (Disruptive Innovation)',
    avatarText: 'CW',
    avatarGradient: 'from-rose-400 to-red-600',
    timeAgo: '2 days ago',
    publishedDate: 'This Week • Sep 25',
    targetTicker: 'TSLA',
    targetName: 'Tesla Autonomous Fleet',
    targetPrice: '$400+ Multi-Year Target',
    sentiment: 'EXPONENTIAL',
    sentimentColor: 'text-rose-300 border-rose-400/30 bg-rose-950/30',
    headline: 'Autonomous Mobility & Robotaxi Fleet Architecture Countdown',
    fullDispatch:
      '"Autonomous software platforms represent an $8–10 trillion revenue opportunity over the next decade. Real-world edge driving miles create an insurmountable barrier for traditional automakers."',
  },
  {
    id: 'ray_dalio',
    traderName: 'Ray Dalio',
    title: 'Founder & Co-CIO Mentor',
    firm: 'Bridgewater Associates (World’s Largest Hedge Fund)',
    avatarText: 'RD',
    avatarGradient: 'from-cyan-400 to-blue-600',
    timeAgo: '3 days ago',
    publishedDate: 'This Week • Sep 24',
    targetTicker: 'SPY / GLD',
    targetName: 'All-Weather Macro Basket',
    targetPrice: 'Balanced Secular Hedge',
    sentiment: 'STRATEGIC HEDGE',
    sentimentColor: 'text-amber-300 border-amber-400/30 bg-amber-950/30',
    headline: 'Global Sovereign Debt Expansions Demand Real Asset Diversification',
    fullDispatch:
      '"Sovereign central banks are accumulating hard assets at 50-year highs. Investors must hedge against monetary debasement by balancing secular tech productivity with gold and tangible reserves."',
  },
  {
    id: 'paul_tudor_jones',
    traderName: 'Paul Tudor Jones',
    title: 'Founder & Chief Investment Officer',
    firm: 'Tudor Investment Corp (Macro Legend)',
    avatarText: 'PTJ',
    avatarGradient: 'from-violet-400 to-purple-600',
    timeAgo: '4 days ago',
    publishedDate: 'This Week • Sep 23',
    targetTicker: 'TECH / COMMODITIES',
    targetName: 'Reflationary Asset Basket',
    targetPrice: 'Liquidity Expansion Bull',
    sentiment: 'BULLISH',
    sentimentColor: 'text-violet-300 border-violet-400/30 bg-violet-950/30',
    headline: 'Post-Rate Cut Liquidity Cycles Fuel Explosive Asset Reflation',
    fullDispatch:
      '"All macroeconomic signs indicate global reflation. When central banks ease while growth remains stable, owning scarce tech leaders alongside commodities is the highest-probability playbook."',
  },
  {
    id: 'michael_burry',
    traderName: 'Michael Burry',
    title: 'Founder & Portfolio Manager',
    firm: 'Scion Asset Management',
    avatarText: 'MB',
    avatarGradient: 'from-orange-400 to-red-500',
    timeAgo: '5 days ago',
    publishedDate: 'This Week • Sep 22',
    targetTicker: 'SEMI CAPEX',
    targetName: 'Hardware Cycle Scrutiny',
    targetPrice: 'Disciplined Valuation Focus',
    sentiment: 'CAUTIONARY',
    sentimentColor: 'text-orange-300 border-orange-400/30 bg-orange-950/30',
    headline: 'Scrutinizing Enterprise ROI Payback Timelines on High-Multiple Hardware',
    fullDispatch:
      '"Generative AI compute demand is real, but watching corporate capital return cycles is critical. Capital rotates away from pure speculative multiples into companies with immediate free cash flow."',
  },
  {
    id: 'bill_ackman',
    traderName: 'Bill Ackman',
    title: 'Chief Executive Officer',
    firm: 'Pershing Square Capital Management',
    avatarText: 'BA',
    avatarGradient: 'from-blue-400 to-indigo-600',
    timeAgo: '6 days ago',
    publishedDate: 'This Week • Sep 21',
    targetTicker: 'GOOGL',
    targetName: 'Alphabet AI Integration',
    targetPrice: '$210+ Long-Term Target',
    sentiment: 'LONG VALUE',
    sentimentColor: 'text-sky-300 border-sky-400/30 bg-sky-950/30',
    headline: 'Dominant Platform Businesses Compound With Generative Search Monetization',
    fullDispatch:
      '"World-class digital monopolies with zero balance sheet debt, massive enterprise search revenue, and deep proprietary AI models remain the most asymmetric risk-reward investments in the market."',
  },
];

interface Props {
  onFlipBack: () => void;
  onSelectPrice?: (priceStr: string) => void;
  onOpenSettings?: () => void;
}

export const StockForecastCard: React.FC<Props> = ({ onFlipBack, onSelectPrice, onOpenSettings }) => {
  // Live stocks master state
  const [stockList, setStockList] = useState<StockItem[]>(MASTER_STOCK_LIST);
  // Default active tab is "trending" (Top 10 Online Trending Stocks)
  const [activeTab, setActiveTab] = useState<string>('trending');
  const [trendingTickers, setTrendingTickers] = useState<string[]>(DEFAULT_TRENDING_TICKERS);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [lastActionToast, setLastActionToast] = useState<string | null>(null);

  // User Pinned / Ticked stocks for Dashboard
  const [pinnedTickers, setPinnedTickers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('auracalc_pinned_stocks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_PINNED_TICKERS;
  });

  // Dynamic Breaking News Cycle State (7-day dispatches)
  const [activeDispatchIdx, setActiveDispatchIdx] = useState<number>(0);
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);
  const [progressKey, setProgressKey] = useState<number>(0);
  const [isOnlineSyncing, setIsOnlineSyncing] = useState<boolean>(false);
  const isOnlineFetchingRef = useRef<boolean>(false);

  // Save pinned tickers
  useEffect(() => {
    try {
      localStorage.setItem('auracalc_pinned_stocks', JSON.stringify(pinnedTickers));
    } catch {
      // ignore
    }
  }, [pinnedTickers]);

  // Auto-advance breaking news dispatches
  useEffect(() => {
    if (!isAutoCycling) return;
    const interval = setInterval(() => {
      setActiveDispatchIdx((prev) => (prev + 1) % TRADER_DISPATCHES_THIS_WEEK.length);
      setProgressKey((k) => k + 1);
    }, 6500);

    return () => clearInterval(interval);
  }, [isAutoCycling]);

  // -------------------------------------------------------------
  // REAL-TIME ONLINE STOCK FETCHER (/api/stocks-trending & /api/stocks-quotes)
  // "stock price တွေက update မဖစ်နေဘူး live update ကို online info ကနေ update ဖစ်နေအောင်လုပ်ပါ"
  // -------------------------------------------------------------
  const fetchLiveStockOnline = async () => {
    if (isOnlineFetchingRef.current || !navigator.onLine) return;
    isOnlineFetchingRef.current = true;
    setIsOnlineSyncing(true);

    try {
      // 1. Fetch live trending stocks from online server
      const trendRes = await fetch('/api/stocks-trending', { signal: AbortSignal.timeout(5000) });
      if (trendRes.ok) {
        const tData = await trendRes.json();
        if (Array.isArray(tData.trending) && tData.trending.length > 0) {
          const quotes = tData.trending;
          const freshSymbols = quotes.map((q: any) => q.symbol);
          if (freshSymbols.length >= 5) {
            setTrendingTickers(freshSymbols);
          }

          // Update stockList with online quotes
          setStockList((prev) => {
            const quoteMap = new Map(quotes.map((q: any) => [q.symbol, q]));
            return prev.map((item) => {
              const liveQ: any = quoteMap.get(item.ticker);
              if (liveQ && liveQ.price) {
                return {
                  ...item,
                  price: liveQ.price,
                  changePercent: liveQ.changePercent,
                  isPositive: liveQ.isPositive,
                  sparkline: liveQ.sparkline?.length >= 3 ? liveQ.sparkline : item.sparkline,
                };
              }
              return item;
            });
          });
        }
      }

      // 2. Fetch live quotes for user's pinned tickers if needed
      const symbolsToQuote = pinnedTickers.slice(0, 15).join(',');
      if (symbolsToQuote) {
        const quoteRes = await fetch(`/api/stocks-quotes?symbols=${encodeURIComponent(symbolsToQuote)}`, {
          signal: AbortSignal.timeout(5000),
        });
        if (quoteRes.ok) {
          const qData = await quoteRes.json();
          if (Array.isArray(qData.quotes) && qData.quotes.length > 0) {
            const qMap = new Map(qData.quotes.map((q: any) => [q.symbol, q]));
            setStockList((prev) =>
              prev.map((item) => {
                const liveQ: any = qMap.get(item.ticker);
                if (liveQ && liveQ.price) {
                  return {
                    ...item,
                    price: liveQ.price,
                    changePercent: liveQ.changePercent,
                    isPositive: liveQ.isPositive,
                    sparkline: liveQ.sparkline?.length >= 3 ? liveQ.sparkline : item.sparkline,
                  };
                }
                return item;
              })
            );
          }
        }
      }
    } catch {
      // Retain existing items
    } finally {
      isOnlineFetchingRef.current = false;
      setIsOnlineSyncing(false);
    }
  };

  // Initial fetch and regular 15-second online sync
  useEffect(() => {
    fetchLiveStockOnline();
    const onlineTimer = setInterval(fetchLiveStockOnline, 15000);
    return () => clearInterval(onlineTimer);
  }, [pinnedTickers]);

  // Micro-fluctuation realistic live ticks in-between online fetches
  useEffect(() => {
    const microTimer = setInterval(() => {
      setStockList((prev) =>
        prev.map((item) => {
          if (Math.random() > 0.42) return item;
          const delta = (Math.random() - 0.48) * 0.0024;
          const newPrice = Number((item.price * (1 + delta)).toFixed(2));
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
    }, 3800);

    return () => clearInterval(microTimer);
  }, []);

  // -------------------------------------------------------------
  // TOGGLE STOCK IN DASHBOARD (TICK / UNTICK)
  // -------------------------------------------------------------
  const handleTogglePin = (ticker: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // prevent unwanted side effects
    }
    sound.playGlassTap(1250, 0.04, 0.15);

    setPinnedTickers((prev) => {
      const exists = prev.includes(ticker);
      const next = exists ? prev.filter((t) => t !== ticker) : [...prev, ticker];
      setLastActionToast(exists ? `Removed ${ticker} from Dashboard` : `✓ Added ${ticker} to Dashboard!`);
      setTimeout(() => setLastActionToast(null), 2500);
      return next;
    });
  };

  // Direct calculation selection
  const handleSelectPriceForCalc = (item: StockItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playGlassTap(1200, 0.04, 0.12);
    if (onSelectPrice) {
      onSelectPrice(String(item.price));
      onFlipBack();
    }
  };

  // -------------------------------------------------------------
  // DYNAMIC LETTER-BY-LETTER SEARCH & RELEVANCE SORTING
  // "ရိုက်ရှာတာနဲ့ စာလုံးအလိုက် sort ကျလာပီး ကိုကြည့်ချင်တာ tick လုပ် dashboard မှာ add ထားနိုင်အောင်လုပ်ပါ"
  // -------------------------------------------------------------
  const displayedStocks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // 1. In search mode, dynamically score and sort all matching stocks
    if (q) {
      const scored = stockList.map((item) => {
        const ticker = item.ticker.toLowerCase();
        const name = item.name.toLowerCase();
        let score = 0;

        if (ticker === q) {
          score += 1000;
        } else if (ticker.startsWith(q)) {
          score += 800 - ticker.length * 10;
        } else if (ticker.includes(q)) {
          score += 500;
        }

        if (name.startsWith(q)) {
          score += 400;
        } else if (name.split(' ').some((word) => word.startsWith(q))) {
          score += 350;
        } else if (name.includes(q)) {
          score += 200;
        }

        if (pinnedTickers.includes(item.ticker)) {
          score += 15;
        }

        return { item, score };
      });

      return scored
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.item);
    }

    // 2. Default Trending Top 10 tab
    if (activeTab === 'trending') {
      const trendSet = new Set(trendingTickers);
      const filtered = stockList.filter((s) => trendSet.has(s.ticker));
      return filtered.length >= 6 ? filtered.slice(0, 10) : stockList.slice(0, 10);
    }

    // 3. User's personal pinned Dashboard
    if (activeTab === 'my_dashboard') {
      const pinnedSet = new Set(pinnedTickers);
      return stockList.filter((s) => pinnedSet.has(s.ticker));
    }

    // 4. Category tabs
    const categoryTickers = STOCK_CATEGORIES[activeTab] || STOCK_CATEGORIES.mega_tech;
    const catSet = new Set(categoryTickers);
    return stockList.filter((s) => catSet.has(s.ticker));
  }, [stockList, activeTab, searchQuery, pinnedTickers, trendingTickers]);

  const currentDispatch = TRADER_DISPATCHES_THIS_WEEK[activeDispatchIdx];

  // Render Mini Sparkline SVG
  const renderMiniSparkline = (data: number[], isPositive: boolean) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 46;
    const height = 15;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 3) - 1.5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const strokeColor = isPositive ? '#34d399' : '#f87171';
    return (
      <svg className="w-11 h-3.5 overflow-visible shrink-0" viewBox={`0 0 ${width} ${height}`}>
        <path d={`M ${points.join(' L ')}`} fill="none" stroke={strokeColor} strokeWidth="1.3" strokeLinecap="round" />
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r="1.5"
            fill={strokeColor}
          />
        )}
      </svg>
    );
  };

  // Continuous trader breaking ticker text
  const traderTickerFeed = TRADER_DISPATCHES_THIS_WEEK.map(
    (t) => `⚡ ${t.traderName.toUpperCase()}: "${t.headline}"`
  ).join('   ✦   ');

  return (
    <div className="relative z-20 w-full h-full flex flex-col justify-between overflow-y-auto thin-glass-scrollbar select-none px-3 py-2 space-y-2.5">
      {/* ========================================================
          1. HEADER: CLEAN ICON-ONLY STATUS & NAVIGATION
         ======================================================== */}
      <div className="w-full flex items-center justify-between pb-0.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-300">
            <TrendingUp className="w-4 h-4" />
          </div>
          {/* Status Indicator Icon (Ping / Spin online indicator without text) */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.05] border border-white/10">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnlineSyncing ? 'bg-cyan-300 animate-spin' : 'bg-emerald-400 animate-ping'
              }`}
            />
            {isOnlineSyncing && <RefreshCw className="w-2.5 h-2.5 text-cyan-300 animate-spin" />}
          </div>
        </div>

        {/* Top Actions: Settings & 3D Flip Back to Calculator */}
        <div className="flex items-center gap-1.5">
          {onOpenSettings && (
            <button
              onClick={() => {
                sound.playGlassTap(1100, 0.04, 0.12);
                onOpenSettings();
              }}
              className="p-2 rounded-full bg-white/[0.07] hover:bg-white/[0.14] active:scale-95 text-white/70 hover:text-cyan-300 transition-all cursor-pointer"
              title="Theme & Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}

          {/* 3D Flip Back to Calculator (Icon only, text removed) */}
          <button
            onClick={() => {
              sound.playGlassTap(1100, 0.04, 0.12);
              onFlipBack();
            }}
            className="p-2 rounded-full bg-white/[0.07] hover:bg-white/[0.14] active:scale-95 text-cyan-300 hover:text-cyan-200 transition-all cursor-pointer"
            title="Calculator"
          >
            <Rotate3d className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================
          2. FILTER & SEARCH BAR (BUG-FREE SEARCH & DASHBOARD SELECTION)
         ======================================================== */}
      <div className="w-full space-y-1">
        <div className="flex items-center justify-between text-[10px] text-white/60 font-medium px-0.5">
          <span>SELECT WATCHLIST</span>
          <button
            onClick={() => {
              sound.playGlassTap(1100, 0.03, 0.1);
              setIsSearchActive(!isSearchActive);
              if (isSearchActive) setSearchQuery('');
            }}
            className={`flex items-center justify-center transition-colors cursor-pointer w-6 h-6 rounded-full ${
              isSearchActive
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-white/[0.06] hover:bg-white/[0.14] text-cyan-300'
            }`}
            title={isSearchActive ? 'Close Search' : 'Toggle Search'}
          >
            {isSearchActive ? (
              <X className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Action feedback toast */}
        <AnimatePresence>
          {lastActionToast && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="w-full py-0.5 px-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-medium text-cyan-200 text-center"
            >
              {lastActionToast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Search Mode with Clean Selection & Add */}
        {isSearchActive ? (
          <div className="relative w-full space-y-1.5 p-1 rounded-2xl bg-white/[0.04]">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type ticker e.g. 'A', 'NV', 'TS', 'M'..."
                className="w-full h-8 px-3 pr-8 rounded-full bg-white/[0.1] border border-cyan-400/40 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/60"
                autoFocus
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-white/50 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="w-3.5 h-3.5 text-white/50 absolute right-3 top-2.5 pointer-events-none" />
              )}
            </div>

            {/* Quick helper toolbar */}
            <div className="flex items-center justify-between text-[9.5px] px-1 text-white/70">
              <span>
                Found <strong className="text-cyan-300">{displayedStocks.length}</strong> matching stocks
              </span>
              <button
                onClick={() => {
                  sound.playGlassTap(1150, 0.03, 0.1);
                  setActiveTab('my_dashboard');
                  setIsSearchActive(false);
                  setSearchQuery('');
                }}
                className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 flex items-center gap-1 hover:bg-amber-400/30 transition-all"
              >
                <Star className="w-2.5 h-2.5 fill-amber-300" />
                <span>View Dashboard ({pinnedTickers.length})</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Filter Tabs Ribbon */
          <div className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {/* 1. Default 🔥 Live Trending Top 10 */}
            <button
              onClick={() => {
                sound.playGlassTap(1100, 0.03, 0.1);
                setActiveTab('trending');
              }}
              className={`px-3 py-1 rounded-full text-[10.5px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'trending'
                  ? 'bg-rose-500/25 text-rose-200 border border-rose-400/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/70'
              }`}
            >
              <Flame className="w-3 h-3 text-rose-400" />
              <span>Trending Top 10</span>
            </button>

            {/* 2. ⭐ My Dashboard */}
            <button
              onClick={() => {
                sound.playGlassTap(1100, 0.03, 0.1);
                setActiveTab('my_dashboard');
              }}
              className={`px-3 py-1 rounded-full text-[10.5px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'my_dashboard'
                  ? 'bg-amber-400/25 text-amber-200 border border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/70'
              }`}
            >
              <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>My Dashboard ({pinnedTickers.length})</span>
            </button>

            {[
              { key: 'mega_tech', label: '💻 Mega Tech' },
              { key: 'ai_chips', label: '⚡ AI & Chips' },
              { key: 'global_titans', label: '🌐 Blue Chips' },
              { key: 'high_growth', label: '🚀 Growth' },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  sound.playGlassTap(1100, 0.03, 0.1);
                  setActiveTab(cat.key);
                }}
                className={`px-3 py-1 rounded-full text-[10.5px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === cat.key
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          3. STOCKS DISPLAY (SEARCH RESULTS OR ACTIVE TAB)
          In Search Mode: Click Card to Add/Remove with NO accidental flips!
          In Tab Mode: Direct checkmark to toggle + click price to calculate
         ======================================================== */}
      {displayedStocks.length === 0 ? (
        <div className="w-full py-6 text-center text-xs text-white/60 space-y-2 rounded-2xl bg-white/[0.03]">
          <Star className="w-6 h-6 text-amber-400/60 mx-auto" />
          <p>No stocks ticked for My Dashboard yet.</p>
          <button
            onClick={() => {
              setActiveTab('trending');
            }}
            className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold"
          >
            Browse Trending Stocks
          </button>
        </div>
      ) : (
        <div
          className={`w-full grid grid-cols-2 gap-1.5 ${
            isSearchActive ? 'max-h-[220px] overflow-y-auto thin-glass-scrollbar pr-0.5' : ''
          }`}
        >
          {(isSearchActive ? displayedStocks : displayedStocks.slice(0, 10)).map((stock) => {
            const isPinned = pinnedTickers.includes(stock.ticker);

            return (
              <motion.div
                key={stock.ticker}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  // If searching, tapping card toggles Dashboard pin!
                  if (isSearchActive) {
                    handleTogglePin(stock.ticker, e);
                  } else {
                    handleSelectPriceForCalc(stock, e);
                  }
                }}
                className={`relative flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer group ${
                  isPinned
                    ? 'bg-cyan-950/35 border border-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                    : 'bg-white/[0.04] hover:bg-white/[0.09] active:bg-white/[0.14]'
                }`}
              >
                {/* Ticker, Name & Tick/Pin Button */}
                <div className="min-w-0 pr-1 flex items-center gap-1.5">
                  {/* Interactive Tick / Add Checkbox Button */}
                  <button
                    type="button"
                    onClick={(e) => handleTogglePin(stock.ticker, e)}
                    className={`w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      isPinned
                        ? 'bg-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.9)]'
                        : 'bg-white/10 hover:bg-white/20 text-white/40 border border-white/20'
                    }`}
                    title={isPinned ? 'Remove from My Dashboard' : 'Tick to add to My Dashboard'}
                  >
                    {isPinned ? (
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    ) : (
                      <Plus className="w-2.5 h-2.5 text-white/60 group-hover:text-white" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors font-mono">
                        {stock.ticker}
                      </span>
                      {stock.isPositive ? (
                        <ArrowUpRight className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                      ) : (
                        <ArrowDownRight className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[9px] text-white/50 truncate max-w-[55px] font-sans">
                      {stock.name}
                    </div>
                  </div>
                </div>

                {/* Sparkline & Live Price */}
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1">
                    {renderMiniSparkline(stock.sparkline, stock.isPositive)}
                  </div>
                  <div className="text-[11px] font-mono font-medium text-white tracking-tight">
                    ${stock.price.toFixed(2)}
                  </div>
                  <div
                    className={`text-[9px] font-mono font-semibold ${
                      stock.isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {stock.isPositive ? '+' : ''}
                    {stock.changePercent}%
                  </div>
                </div>

                {/* If searching, show explicit mini calculate icon */}
                {isSearchActive && (
                  <button
                    type="button"
                    onClick={(e) => handleSelectPriceForCalc(stock, e)}
                    className="absolute right-1 bottom-1 p-0.5 rounded bg-white/10 hover:bg-cyan-500/30 text-white/50 hover:text-cyan-200 text-[8px] transition-all"
                    title="Use in Calculator"
                  >
                    <Calculator className="w-2.5 h-2.5" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          4. PRO TRADERS LIVE DISPATCHES
         ======================================================== */}
      <div className="w-full pt-1 space-y-1.5">
        {/* Terminal Header with Controls (Text Pro Trader Wire and This Week removed) */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          </div>

          {/* Interactive Navigation Controls */}
          <div className="flex items-center gap-1 text-white/70">
            <button
              onClick={() => setIsAutoCycling(!isAutoCycling)}
              className="p-1 rounded-full hover:bg-white/10 text-[9px] transition-colors"
              title={isAutoCycling ? 'Pause Auto-cycle' : 'Resume Auto-cycle'}
            >
              {isAutoCycling ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
            </button>
            <button
              onClick={() => {
                sound.playGlassTap(1150, 0.03, 0.1);
                setActiveDispatchIdx(
                  (prev) => (prev - 1 + TRADER_DISPATCHES_THIS_WEEK.length) % TRADER_DISPATCHES_THIS_WEEK.length
                );
                setProgressKey((k) => k + 1);
              }}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              title="Previous Dispatch"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-[9px] font-mono text-white/50">
              {activeDispatchIdx + 1}/{TRADER_DISPATCHES_THIS_WEEK.length}
            </span>
            <button
              onClick={() => {
                sound.playGlassTap(1150, 0.03, 0.1);
                setActiveDispatchIdx((prev) => (prev + 1) % TRADER_DISPATCHES_THIS_WEEK.length);
                setProgressKey((k) => k + 1);
              }}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              title="Next Dispatch"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dynamic Breaking News Card (Pure Transparent Frosted Glass) */}
        <div
          onMouseEnter={() => setIsAutoCycling(false)}
          onMouseLeave={() => setIsAutoCycling(true)}
          className="relative w-full rounded-2xl bg-white/[0.05] backdrop-blur-xl p-3 space-y-2 overflow-hidden shadow-sm"
        >
          {/* Animated Countdown Progress Bar */}
          {isAutoCycling && (
            <motion.div
              key={progressKey}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 6.5, ease: 'linear' }}
              className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-400"
            />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentDispatch.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
              className="space-y-2 text-left"
            >
              {/* Top Meta: Trader Avatar, Name & Sentiment */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-tr ${currentDispatch.avatarGradient} p-[1px] shrink-0`}
                  >
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-xs text-white">
                      {currentDispatch.avatarText}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{currentDispatch.traderName}</span>
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    </div>
                    <div className="text-[9px] text-white/55 font-sans leading-tight">
                      {currentDispatch.firm}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${currentDispatch.sentimentColor}`}
                  >
                    {currentDispatch.sentiment}
                  </span>
                  <div className="text-[8.5px] text-white/40 font-mono mt-0.5 flex items-center justify-end">
                    <span>{currentDispatch.timeAgo}</span>
                  </div>
                </div>
              </div>

              {/* Target Asset & Projected Level */}
              <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-white/[0.04] text-xs">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] text-white/60">Target:</span>
                  <span className="font-mono font-bold text-cyan-200">
                    {currentDispatch.targetTicker}
                  </span>
                  <span className="text-[9px] text-white/50 truncate max-w-[90px]">
                    ({currentDispatch.targetName})
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-emerald-300 text-[10.5px]">
                    {currentDispatch.targetPrice}
                  </span>
                </div>
              </div>

              {/* Headline & Dispatch Statement */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-white tracking-tight flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{currentDispatch.headline}</span>
                </div>
                <div className="text-[10.5px] leading-relaxed text-white/80 italic font-sans pl-1.5 border-l border-cyan-400/50">
                  {currentDispatch.fullDispatch}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quick Trader Switcher Dots */}
        <div className="w-full flex items-center justify-center gap-1.5 py-0.5">
          {TRADER_DISPATCHES_THIS_WEEK.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => {
                sound.playGlassTap(1150, 0.03, 0.1);
                setActiveDispatchIdx(idx);
                setProgressKey((k) => k + 1);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeDispatchIdx === idx
                  ? 'w-5 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              title={`${t.traderName} - ${t.headline}`}
            />
          ))}
        </div>

        {/* Continuous Breaking News Crawler (This Week's Wire) */}
        <div className="relative w-full h-6 rounded-full overflow-hidden flex items-center bg-white/[0.08] backdrop-blur-md px-2.5">
          <div className="shrink-0 flex items-center gap-1 pr-2 text-cyan-300">
            <Radio className="w-3 h-3 animate-pulse text-red-400" />
          </div>
          <div className="relative flex-1 h-full overflow-hidden flex items-center">
            <div className="inline-flex whitespace-nowrap animate-marquee items-center font-bold text-[10.5px] tracking-tight text-white/90 font-sans">
              <span className="mr-8">{traderTickerFeed}</span>
              <span className="mr-8">✦   {traderTickerFeed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
