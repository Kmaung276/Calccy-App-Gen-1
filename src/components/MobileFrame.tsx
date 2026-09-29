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
  // Pure Mobile View as Default:
  // - 100% full height edge-to-edge on mobile phones (zero scroll, zero black bars)
  // - Centered standard mobile phone width on desktop (max-w-[430px]) with full viewport height
  // - Calc screen and Stock Trader screen both expand to 100% full height on both sides
  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] sm:max-w-[430px] sm:mx-auto flex flex-col justify-between overflow-hidden border-0 bg-slate-950 transition-all">
      <div
        className="relative w-full h-full flex-1 flex flex-col justify-between overflow-hidden"
        style={{ perspective: 1400 }}
      >
        {children}
      </div>
    </div>
  );
};
