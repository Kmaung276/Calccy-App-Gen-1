import React from 'react';
import { motion } from 'motion/react';
import { ButtonType, ButtonSizingMode } from '../types';
import { sound } from '../utils/sound';

interface Props {
  label: string;
  subLabel?: string;
  type: ButtonType;
  isActive?: boolean;
  isWide?: boolean;
  sizeFactor?: number;
  organicRadius?: string;
  sizingMode: ButtonSizingMode;
  onClick: () => void;
}

export const GlassButton: React.FC<Props> = ({
  label,
  subLabel,
  type,
  isActive = false,
  isWide = false,
  sizeFactor = 1.0,
  organicRadius,
  sizingMode,
  onClick,
}) => {
  const handleClick = () => {
    if (type === 'number') {
      sound.playNumberTap(label);
    } else if (type === 'operator') {
      sound.playOperatorTap();
    } else if (label === 'AC' || label === 'C') {
      sound.playClearSound();
    } else if (label === '=') {
      sound.playEqualsChime();
    } else {
      sound.playDeepThud(130, 0.065, 0.25);
    }
    onClick();
  };

  // Base dimension calibrated for comfortable touch & full-screen presence without cutting off World Breaking News
  const baseDim = 58; // px
  let computedWidth = baseDim;
  let computedHeight = baseDim;

  if (sizingMode === 'organic') {
    const factor = sizeFactor || 1.0;
    computedHeight = Math.round(baseDim * factor);
    computedWidth = isWide ? Math.round(baseDim * 2.25 * factor) : computedHeight;
  } else if (sizingMode === 'droplet') {
    const factor = (sizeFactor - 1) * 1.5 + 1;
    computedHeight = Math.round(baseDim * factor);
    computedWidth = isWide ? Math.round(baseDim * 2.2 * factor) : computedHeight;
  } else {
    computedHeight = baseDim;
    computedWidth = isWide ? baseDim * 2.25 : baseDim;
  }

  // Visual appearance styles: 3D Raised Convex Glass Pebbles (ကြွတက်နေသော ပုံစံ)
  let bgClasses =
    'bg-gradient-to-b from-white/[0.22] via-white/[0.14] to-white/[0.06] text-white hover:from-white/[0.28] hover:to-white/[0.10]';
  let textClasses = 'text-xl sm:text-2xl font-light tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]';
  let customBoxShadow =
    '0 12px 24px -4px rgba(0,0,0,0.7), 0 6px 12px -2px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.75), inset 0 -3px 4px rgba(0,0,0,0.4)';
  let borderTopColor = 'rgba(255, 255, 255, 0.75)';
  let borderBottomColor = 'rgba(0, 0, 0, 0.5)';

  if (type === 'operator') {
    if (isActive) {
      bgClasses = 'bg-gradient-to-b from-white to-slate-100 text-amber-600';
      textClasses = 'text-3xl font-medium text-amber-600 drop-shadow-none';
      customBoxShadow =
        '0 0 30px rgba(255,255,255,0.8), 0 8px 16px rgba(0,0,0,0.6), inset 0 2px 2px rgba(255,255,255,0.9), inset 0 -2px 3px rgba(0,0,0,0.2)';
      borderTopColor = 'rgba(255, 255, 255, 0.95)';
      borderBottomColor = 'rgba(245, 158, 11, 0.4)';
    } else {
      bgClasses =
        'bg-gradient-to-b from-amber-400/95 via-amber-500/90 to-amber-600/95 text-white hover:from-amber-300 hover:to-amber-500';
      textClasses = 'text-3xl font-light text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]';
      customBoxShadow =
        '0 12px 24px -3px rgba(245,158,11,0.5), 0 6px 12px -2px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.8), inset 0 -3px 4px rgba(180,83,9,0.7)';
      borderTopColor = 'rgba(254, 240, 138, 0.9)';
      borderBottomColor = 'rgba(146, 64, 14, 0.6)';
    }
  } else if (type === 'action') {
    bgClasses =
      'bg-gradient-to-b from-white/[0.38] via-white/[0.26] to-white/[0.14] text-white/95 hover:from-white/[0.45] hover:to-white/[0.22]';
    textClasses = 'text-xl sm:text-2xl font-medium text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]';
    customBoxShadow =
      '0 12px 24px -4px rgba(0,0,0,0.65), 0 6px 10px -2px rgba(0,0,0,0.45), inset 0 2.5px 2px rgba(255,255,255,0.85), inset 0 -3px 4px rgba(0,0,0,0.35)';
    borderTopColor = 'rgba(255, 255, 255, 0.85)';
    borderBottomColor = 'rgba(0, 0, 0, 0.4)';
  } else if (label === '=') {
    bgClasses =
      'bg-gradient-to-b from-emerald-400/95 via-emerald-500/90 to-teal-600/95 text-white hover:from-emerald-300 hover:to-teal-500';
    textClasses = 'text-3xl font-normal text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]';
    customBoxShadow =
      '0 12px 26px -3px rgba(16,185,129,0.55), 0 6px 12px -2px rgba(0,0,0,0.5), inset 0 2.5px 2px rgba(255,255,255,0.85), inset 0 -3px 4px rgba(6,95,70,0.7)';
    borderTopColor = 'rgba(167, 243, 208, 0.95)';
    borderBottomColor = 'rgba(6, 78, 59, 0.6)';
  }

  const customRadius = sizingMode === 'organic' && organicRadius ? organicRadius : '9999px';

  return (
    <div
      className={`flex items-center justify-center ${
        isWide ? 'w-full' : 'w-full h-full max-w-[70px] max-h-[70px]'
      }`}
    >
      <motion.button
        type="button"
        whileTap={{
          y: 3.5,
          scale: 0.94,
          rotate: sizingMode === 'organic' ? (sizeFactor > 1 ? 1.2 : -1.2) : 0,
        }}
        transition={{ type: 'spring', stiffness: 550, damping: 20 }}
        onClick={handleClick}
        style={{
          width: isWide ? '100%' : `${computedWidth}px`,
          height: `${computedHeight}px`,
          maxWidth: isWide ? '154px' : '70px',
          maxHeight: '70px',
          borderRadius: customRadius,
          boxShadow: customBoxShadow,
          borderTop: `1.8px solid ${borderTopColor}`,
          borderLeft: '1.2px solid rgba(255, 255, 255, 0.35)',
          borderRight: '1.2px solid rgba(255, 255, 255, 0.25)',
          borderBottom: `2.2px solid ${borderBottomColor}`,
          touchAction: 'manipulation',
        }}
        className={`relative flex items-center justify-center backdrop-blur-2xl transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 overflow-hidden touch-manipulation active:brightness-110 ${bgClasses}`}
      >
        {/* 3D Convex Curved Glass Light Reflection (Upper Dome) */}
        <span
          className="absolute inset-0 pointer-events-none opacity-85"
          style={{
            background:
              'radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.18) 45%, transparent 75%)',
            borderRadius: customRadius,
          }}
        />

        {/* Ambient Under-glow bevel */}
        <span
          className="absolute inset-0 pointer-events-none opacity-45"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 45%)',
            borderRadius: customRadius,
          }}
        />

        {/* Content text with embossed elevation */}
        <span className={`relative z-10 flex flex-col items-center justify-center ${textClasses}`}>
          <span className={subLabel ? 'leading-none -mb-0.5' : ''}>{label}</span>
          {subLabel && (
            <span className="text-[10px] font-normal opacity-60 tracking-wider">
              {subLabel}
            </span>
          )}
        </span>
      </motion.button>
    </div>
  );
};
