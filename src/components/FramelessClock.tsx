import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Globe, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

export interface ClockRegion {
  id: string;
  name: string;
  city: string;
  flag: string;
  timeZone: string;
  utcOffsetStr: string;
}

export const WORLD_REGIONS: ClockRegion[] = [
  { id: 'mm', name: 'Myanmar (မြန်မာ)', city: 'Yangon', flag: '🇲🇲', timeZone: 'Asia/Yangon', utcOffsetStr: 'UTC+6:30' },
  { id: 'th', name: 'Thailand', city: 'Bangkok', flag: '🇹🇭', timeZone: 'Asia/Bangkok', utcOffsetStr: 'UTC+7:00' },
  { id: 'sg', name: 'Singapore', city: 'Singapore', flag: '🇸🇬', timeZone: 'Asia/Singapore', utcOffsetStr: 'UTC+8:00' },
  { id: 'jp', name: 'Japan', city: 'Tokyo', flag: '🇯🇵', timeZone: 'Asia/Tokyo', utcOffsetStr: 'UTC+9:00' },
  { id: 'ae', name: 'UAE', city: 'Dubai', flag: '🇦🇪', timeZone: 'Asia/Dubai', utcOffsetStr: 'UTC+4:00' },
  { id: 'uk', name: 'UK', city: 'London', flag: '🇬🇧', timeZone: 'Europe/London', utcOffsetStr: 'GMT / UTC+0' },
  { id: 'eu', name: 'Europe', city: 'Frankfurt', flag: '🇩🇪', timeZone: 'Europe/Berlin', utcOffsetStr: 'CET / UTC+1' },
  { id: 'ny', name: 'USA (Wall St)', city: 'New York', flag: '🇺🇸', timeZone: 'America/New_York', utcOffsetStr: 'EDT / UTC-4' },
  { id: 'ca', name: 'USA (Silicon Valley)', city: 'Los Angeles', flag: '🇺🇸', timeZone: 'America/Los_Angeles', utcOffsetStr: 'PDT / UTC-7' },
  { id: 'au', name: 'Australia', city: 'Sydney', flag: '🇦🇺', timeZone: 'Australia/Sydney', utcOffsetStr: 'AEST / UTC+10' },
];

interface Props {
  selectedRegion: ClockRegion;
  is24Hour?: boolean;
  onOpenModal: () => void;
  compact?: boolean;
}

export const FramelessClock: React.FC<Props> = ({
  selectedRegion,
  is24Hour = false,
  onOpenModal,
  compact = false,
}) => {
  const [time, setTime] = useState<Date>(new Date());

  // Live second-by-second precision tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute local time in the selected region's timezone
  const getZonedParts = () => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: selectedRegion.timeZone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: !is24Hour,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const parts = formatter.formatToParts(time);
      const getVal = (type: string) => parts.find((p) => p.type === type)?.value || '';

      const rawHourFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: selectedRegion.timeZone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      });
      const rawParts = rawHourFormatter.formatToParts(time);
      const rawHour = parseInt(rawParts.find((p) => p.type === 'hour')?.value || '0', 10);
      const minute = parseInt(rawParts.find((p) => p.type === 'minute')?.value || '0', 10);
      const second = parseInt(rawParts.find((p) => p.type === 'second')?.value || '0', 10);

      const dayPeriod = getVal('dayPeriod');
      const hourStr = is24Hour ? String(rawHour).padStart(2, '0') : getVal('hour');
      const minuteStr = String(minute).padStart(2, '0');
      const secondStr = String(second).padStart(2, '0');
      const dateStr = `${getVal('weekday')}, ${getVal('month')} ${getVal('day')}`;

      // Calculate smooth hand rotations (degrees)
      const secondDeg = second * 6;
      const minuteDeg = minute * 6 + second * 0.1;
      const hourDeg = (rawHour % 12) * 30 + minute * 0.5;

      return { hourStr, minuteStr, secondStr, dayPeriod, dateStr, hourDeg, minuteDeg, secondDeg };
    } catch {
      const s = time.getSeconds();
      const m = time.getMinutes();
      const h = time.getHours();
      return {
        hourStr: String(h),
        minuteStr: String(m).padStart(2, '0'),
        secondStr: String(s).padStart(2, '0'),
        dayPeriod: '',
        dateStr: 'Today',
        hourDeg: (h % 12) * 30 + m * 0.5,
        minuteDeg: m * 6,
        secondDeg: s * 6,
      };
    }
  };

  const { hourStr, minuteStr, secondStr, dayPeriod, dateStr, hourDeg, minuteDeg, secondDeg } =
    getZonedParts();

  const dialSize = compact ? 34 : 40;
  const radius = dialSize / 2;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        sound.playDeepThud(140, 0.05, 0.2);
        onOpenModal();
      }}
      className="group flex items-center gap-2.5 px-2.5 py-1 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-cyan-400/40 backdrop-blur-md transition-all cursor-pointer select-none text-left"
      title="Click to change Date, Time & Region"
    >
      {/* ========================================================
          FRAMELESS ANALOG CLOCK (ဘောင်မပါ နံပါတ်နှင့် လက်တံများ သီးသန့်)
         ======================================================== */}
      <div
        className="relative shrink-0 flex items-center justify-center pointer-events-none"
        style={{ width: `${dialSize}px`, height: `${dialSize}px` }}
      >
        {/* Floating Minimal Numerals: 12, 3, 6, 9 */}
        <span
          className="absolute top-0 text-[8px] font-bold font-mono text-cyan-200/90 leading-none -translate-y-0.5 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]"
        >
          12
        </span>
        <span
          className="absolute right-0 text-[8px] font-bold font-mono text-cyan-200/90 leading-none translate-x-0.5 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]"
        >
          3
        </span>
        <span
          className="absolute bottom-0 text-[8px] font-bold font-mono text-cyan-200/90 leading-none translate-y-0.5 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]"
        >
          6
        </span>
        <span
          className="absolute left-0 text-[8px] font-bold font-mono text-cyan-200/90 leading-none -translate-x-0.5 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]"
        >
          9
        </span>

        {/* Subtle floating dot ticks for remaining 8 hours */}
        {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => (
          <div
            key={deg}
            className="absolute w-full h-full flex items-start justify-center"
            style={{ transform: `rotate(${deg}deg)` }}
          >
            <div className="w-[1.5px] h-[1.5px] rounded-full bg-white/40 mt-[3px]" />
          </div>
        ))}

        {/* Hour Hand */}
        <div
          className="absolute w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${hourDeg}deg)` }}
        >
          <div
            className="w-[2.2px] bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.7)]"
            style={{
              height: `${radius * 0.52}px`,
              transform: `translateY(-${radius * 0.26}px)`,
            }}
          />
        </div>

        {/* Minute Hand */}
        <div
          className="absolute w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
          style={{ transform: `rotate(${minuteDeg}deg)` }}
        >
          <div
            className="w-[1.6px] bg-cyan-300 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.9)]"
            style={{
              height: `${radius * 0.74}px`,
              transform: `translateY(-${radius * 0.37}px)`,
            }}
          />
        </div>

        {/* Live Sweeping Second Hand */}
        <div
          className="absolute w-full h-full flex items-center justify-center"
          style={{ transform: `rotate(${secondDeg}deg)` }}
        >
          <div
            className="w-[1px] bg-rose-400 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.9)]"
            style={{
              height: `${radius * 0.88}px`,
              transform: `translateY(-${radius * 0.44}px)`,
            }}
          />
        </div>

        {/* Center Jewel Pivot Pin */}
        <div className="absolute w-[4px] h-[4px] rounded-full bg-cyan-300 ring-1 ring-white/80 shadow-[0_0_8px_rgba(6,182,212,1)]" />
      </div>

      {/* ========================================================
          DIGITAL TIME & REGION INFO (CLEAN, MINIMALIST)
         ======================================================== */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1 leading-none">
          <span className="font-mono text-[13px] font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
            {hourStr}:{minuteStr}
            <span className="text-white/40 text-[10px]">:{secondStr}</span>
          </span>
          {dayPeriod && (
            <span className="text-[9px] font-mono font-semibold text-cyan-300/90 ml-0.5">
              {dayPeriod}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-0.5 text-[9.5px] text-white/60 font-sans truncate">
          <span>{selectedRegion.flag}</span>
          <span className="font-medium text-white/80 truncate max-w-[85px]">
            {selectedRegion.city}
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[8.5px] font-mono text-cyan-400/80">{selectedRegion.utcOffsetStr.split(' ')[0]}</span>
        </div>
      </div>
    </motion.button>
  );
};
