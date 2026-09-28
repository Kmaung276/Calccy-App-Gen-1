import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Clock,
  Globe,
  Calendar,
  Check,
  CheckCircle2,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { ClockRegion, WORLD_REGIONS } from './FramelessClock';
import { sound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion: ClockRegion;
  onSelectRegion: (region: ClockRegion) => void;
  is24Hour: boolean;
  onToggle24Hour: (is24: boolean) => void;
}

export const DateTimeRegionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedRegion,
  onSelectRegion,
  is24Hour,
  onToggle24Hour,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  // Format time and date according to selected timezone
  const getFormattedStrings = () => {
    try {
      const timeFmt = new Intl.DateTimeFormat('en-US', {
        timeZone: selectedRegion.timeZone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: !is24Hour,
      });

      const dateFmt = new Intl.DateTimeFormat('en-US', {
        timeZone: selectedRegion.timeZone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      return {
        timeString: timeFmt.format(currentTime),
        dateString: dateFmt.format(currentTime),
      };
    } catch {
      return {
        timeString: currentTime.toLocaleTimeString(),
        dateString: currentTime.toDateString(),
      };
    }
  };

  const { timeString, dateString } = getFormattedStrings();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-sm rounded-[32px] bg-slate-900/90 border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(6,182,212,0.15)] overflow-hidden p-5 space-y-4 text-white select-none backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Date, Time & Region</h3>
                <p className="text-[10px] text-white/50">World Clock & Local Timezone</p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playDeepThud(120, 0.05, 0.2);
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 text-white/60 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Live Time Display Card (Clean Frosted Glass) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/15 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-300 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {selectedRegion.flag} {selectedRegion.name} ({selectedRegion.city})
              </span>
            </div>

            <div className="font-mono text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]">
              {timeString}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/70">
              <Calendar className="w-3 h-3 text-amber-300" />
              <span>{dateString}</span>
            </div>

            <div className="text-[9.5px] font-mono text-cyan-400/80 pt-0.5">
              Standard Offset: {selectedRegion.utcOffsetStr}
            </div>
          </div>

          {/* 12-Hour / 24-Hour Switcher */}
          <div className="flex items-center justify-between px-1 py-1 rounded-xl bg-white/[0.05] text-xs">
            <span className="text-[11px] text-white/70 pl-2 font-medium">Time Format:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  sound.playDeepThud(140, 0.04, 0.2);
                  onToggle24Hour(false);
                }}
                className={`px-3 py-1 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer ${
                  !is24Hour
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                12-Hour (AM/PM)
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playDeepThud(140, 0.04, 0.2);
                  onToggle24Hour(true);
                }}
                className={`px-3 py-1 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer ${
                  is24Hour
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                24-Hour
              </button>
            </div>
          </div>

          {/* World Regions List (Clean & Simple / ရှင်းရှင်းလေးပုံ) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10.5px] text-white/60 font-medium px-1">
              <span>SELECT REGION & TIMEZONE</span>
              <span className="text-[9px] font-mono text-cyan-400">10 GLOBAL HUBS</span>
            </div>

            <div className="max-h-[200px] overflow-y-auto thin-glass-scrollbar space-y-1 pr-0.5">
              {WORLD_REGIONS.map((reg) => {
                const isSelected = selectedRegion.id === reg.id;

                return (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => {
                      sound.playDeepThud(150, 0.05, 0.24);
                      onSelectRegion(reg);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-cyan-500/20 border border-cyan-400/50 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] border border-transparent text-white/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg leading-none shrink-0">{reg.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <span className="truncate">{reg.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                        </div>
                        <div className="text-[9.5px] text-white/50 font-sans">
                          {reg.city} • <span className="font-mono text-cyan-300/80">{reg.utcOffsetStr}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-md bg-cyan-400/20 text-cyan-200 text-[9px] font-bold border border-cyan-400/30">
                          Active
                        </span>
                      ) : (
                        <span className="text-[9px] text-white/40 font-mono">Tap to apply</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={() => {
              sound.playDeepThud(160, 0.05, 0.25);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done & Apply Region</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
