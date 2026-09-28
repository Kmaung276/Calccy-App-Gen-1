import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AuroraTheme, VaporDensity } from '../types';

interface Props {
  theme: AuroraTheme;
  vaporDensity: VaporDensity;
  enableWipeEffect: boolean;
}

export const FrostedVaporBackground: React.FC<Props> = ({
  theme,
  vaporDensity,
  enableWipeEffect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isWiping, setIsWiping] = useState(false);
  const [wipedPercent, setWipedPercent] = useState(0);

  // Setup canvas for interactive steam condensation wiping
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      renderSteamLayer(ctx, rect.width, rect.height);
    };

    const renderSteamLayer = (c: CanvasRenderingContext2D, width: number, height: number) => {
      c.globalCompositeOperation = 'source-over';
      c.clearRect(0, 0, width, height);

      // Vapor mist base
      const opacity =
        vaporDensity === 'dense'
          ? 0.52
          : vaporDensity === 'misty'
          ? 0.38
          : vaporDensity === 'droplets'
          ? 0.32
          : 0.18;

      c.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      c.fillRect(0, 0, width, height);

      // Random micro-droplets
      if (vaporDensity === 'dense' || vaporDensity === 'droplets' || vaporDensity === 'misty') {
        const dropletCount = vaporDensity === 'droplets' ? 140 : 60;
        for (let i = 0; i < dropletCount; i++) {
          const x = (Math.sin(i * 997.3) * 0.5 + 0.5) * width;
          const y = (Math.cos(i * 331.7) * 0.5 + 0.5) * height;
          const r = ((i % 5) + 1.5);

          // Droplet highlight
          const grad = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 0.5, x, y, r);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
          grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');

          c.beginPath();
          c.arc(x, y, r, 0, Math.PI * 2);
          c.fillStyle = grad;
          c.fill();
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [vaporDensity]);

  // Handle wiping away fog on drag/touch
  const wipeAt = useCallback(
    (clientX: number, clientY: number) => {
      if (!enableWipeEffect) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Erase steam where finger / cursor wiped
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';

      const radius = 28;
      const grad = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.5)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      setWipedPercent((prev) => Math.min(prev + 1, 100));
    },
    [enableWipeEffect]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsWiping(true);
    wipeAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isWiping) return;
    wipeAt(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsWiping(false);
  };

  const resetMist = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, rect.width, rect.height);
    const opacity =
      vaporDensity === 'dense' ? 0.52 : vaporDensity === 'misty' ? 0.38 : 0.2;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fillRect(0, 0, rect.width, rect.height);
    setWipedPercent(0);
  };

  // Color schemes for background aurora seen through frosted glass
  const getAuroraGradients = () => {
    switch (theme) {
      case 'white_metallic':
      case 'liquid_silver':
      default:
        return (
          <>
            {/* Luminous Liquid Platinum / White Metallic Flare (Top-Left) */}
            <div className="absolute -top-28 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-white/60 via-slate-100/35 to-zinc-300/10 blur-3xl opacity-90 animate-pulse duration-7000" />

            {/* Specular Silver Metallic Reflection (Center-Right) */}
            <div
              className="absolute top-1/4 -right-24 w-88 h-88 rounded-full blur-3xl opacity-80 animate-pulse duration-10000"
              style={{
                background:
                  'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.55) 0%, rgba(241,245,249,0.3) 45%, rgba(148,163,184,0.08) 75%, transparent 100%)',
              }}
            />

            {/* Brushed Liquid Silver Light Ribbon (Mid-Left) */}
            <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-gradient-to-tr from-white/45 via-slate-200/25 to-transparent blur-3xl opacity-75" />

            {/* Bottom Metallic Crystal Frost Reflection (Full Edge-to-Edge) */}
            <div className="absolute -bottom-10 inset-x-0 h-72 bg-gradient-to-t from-white/45 via-slate-100/30 to-transparent blur-3xl opacity-90" />
          </>
        );
      case 'sunset_aurora':
        return (
          <>
            <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-rose-500 via-pink-600 to-amber-400 blur-3xl opacity-70 animate-pulse duration-7000" />
            <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 blur-3xl opacity-70 animate-pulse duration-10000" />
            <div className="absolute -bottom-10 inset-x-0 h-72 bg-gradient-to-t from-blue-600/70 via-indigo-600/60 to-purple-800/40 blur-3xl opacity-80" />
          </>
        );
      case 'deep_ocean':
        return (
          <>
            <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-cyan-400 via-teal-500 to-blue-600 blur-3xl opacity-65 animate-pulse duration-7000" />
            <div className="absolute top-1/3 -right-24 w-88 h-88 rounded-full bg-gradient-to-br from-blue-700 via-indigo-600 to-teal-400 blur-3xl opacity-70" />
            <div className="absolute -bottom-10 inset-x-0 h-72 bg-gradient-to-t from-sky-500/70 via-blue-800/60 to-indigo-900/40 blur-3xl opacity-80" />
          </>
        );
      case 'neon_bloom':
        return (
          <>
            <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-fuchsia-600 via-rose-500 to-amber-300 blur-3xl opacity-75" />
            <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-violet-600 via-purple-700 to-cyan-400 blur-3xl opacity-70" />
            <div className="absolute -bottom-10 inset-x-0 h-72 bg-gradient-to-t from-pink-500/70 via-indigo-600/60 to-purple-900/40 blur-3xl opacity-80" />
          </>
        );
      case 'frosted_emerald':
        return (
          <>
            <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-600 blur-3xl opacity-65" />
            <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-teal-700 via-emerald-600 to-lime-400 blur-3xl opacity-60" />
            <div className="absolute -bottom-10 inset-x-0 h-72 bg-gradient-to-t from-cyan-500/70 via-teal-700/60 to-emerald-900/40 blur-3xl opacity-80" />
          </>
        );
      case 'midnight_purple':
        return (
          <>
            <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-pink-500 blur-3xl opacity-75" />
            <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-blue-600 via-violet-800 to-fuchsia-600 blur-3xl opacity-70" />
            <div className="absolute -bottom-10 inset-x-0 h-72 bg-gradient-to-t from-indigo-800/80 via-purple-700/70 to-sky-600/40 blur-3xl opacity-80" />
          </>
        );
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Underlying Sleek White Metallic Canvas */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background:
            theme === 'white_metallic' || theme === 'liquid_silver'
              ? 'linear-gradient(175deg, #181d24 0%, #0f1318 45%, #151a22 100%)'
              : 'rgba(2, 6, 23, 0.92)',
        }}
      />

      {/* 1b. Metallic Brushed Specular Sheen Layer (Crystal Clear White Metallic) */}
      {(theme === 'white_metallic' || theme === 'liquid_silver') && (
        <div
          className="absolute inset-0 pointer-events-none opacity-45"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 28%, rgba(255,255,255,0.18) 52%, rgba(255,255,255,0.02) 75%, rgba(255,255,255,0.2) 100%)',
          }}
        />
      )}

      {/* 2. Fluid Glowing Aurora Orbs shining through the glass */}
      <div className="absolute inset-0 overflow-hidden">
        {getAuroraGradients()}
      </div>

      {/* 3. Frosted Glass Layer with High Backdrop Blur & Crystal Brightness */}
      <div
        className="absolute inset-0 backdrop-blur-2xl bg-white/[0.06]"
        style={{
          backdropFilter: 'blur(36px) brightness(112%) contrast(104%)',
          WebkitBackdropFilter: 'blur(36px) brightness(112%) contrast(104%)',
        }}
      />

      {/* 4. Fine condensation noise / vapor shimmer */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />

      {/* 5. Interactive Steam / Vapor Condensation Canvas with Wipe / Defrost effect */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full mix-blend-screen ${
          enableWipeEffect ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Wipe feedback indicator */}
      {enableWipeEffect && wipedPercent > 10 && (
        <button
          onClick={resetMist}
          className="absolute top-16 right-4 z-20 pointer-events-auto text-[11px] px-2.5 py-1 rounded-full bg-white/20 text-white/90 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all active:scale-95 shadow-lg"
          title="Re-frost Steam & Water Mist"
        >
          Re-mist Glass ↺
        </button>
      )}
    </div>
  );
};
