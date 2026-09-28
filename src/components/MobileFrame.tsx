import React from 'react';

interface Props {
  children: React.ReactNode;
  showPhoneFrame?: boolean;
  onToggleFrame?: () => void;
  onOpenFlutterCode?: () => void;
  onOpenHistory?: () => void;
  onOpenSettings?: () => void;
  onToggleScientific?: () => void;
  isScientificOpen?: boolean;
}

export const MobileFrame: React.FC<Props> = ({ children }) => {
  // Auto Match for Mobile, Tablet, iPad / Pad, and Desktop:
  // - Mobile (<640px): 100% full screen edge-to-edge, zero borders, zero black gaps
  // - Tablet & Pad (640px - 1024px): Proportional auto-expanding canvas (max-w-2xl) that fills viewport height
  // - Desktop: Balanced glass slate centered vertically, 100dvh auto-match
  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] sm:max-w-xl md:max-w-2xl lg:max-w-3xl sm:mx-auto flex flex-col justify-between rounded-none sm:rounded-[36px] md:rounded-[44px] overflow-hidden border-0 sm:border sm:border-white/20 bg-slate-950/85 sm:bg-slate-950/45 backdrop-blur-3xl shadow-none sm:shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_50px_rgba(6,182,212,0.15)] transition-all">
      <div
        className="relative w-full h-full flex-1 flex flex-col justify-between overflow-hidden"
        style={{ perspective: 1400 }}
      >
        {children}
      </div>
    </div>
  );
};
