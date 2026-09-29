import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';
import { sound } from '../utils/sound';

interface Props {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isFlipped: boolean;
  onFlipToggle: () => void;
}

export const Card3DContainer: React.FC<Props> = ({
  frontContent,
  backContent,
  isFlipped,
  onFlipToggle,
}) => {
  // MotionValues for direct GPU-accelerated transform without triggering React re-renders on every frame
  const initialAngle = isFlipped ? 180 : 0;
  const rotateY = useMotionValue(initialAngle);
  const rotateX = useMotionValue(0);

  // References to keep state consistent across animations and gestures
  const cumulativeAngleRef = useRef(initialAngle);
  const isFlippedRef = useRef(isFlipped);
  isFlippedRef.current = isFlipped;

  const [isBack, setIsBack] = useState(isFlipped);
  const isBackRef = useRef(isFlipped);

  // Gesture tracking
  const isDraggingRef = useRef(false);
  const wasDraggingRef = useRef(false);
  const clearWasDraggingTimer = useRef<number | null>(null);

  const touchStartPos = useRef({
    x: 0,
    y: 0,
    time: 0,
    baseAngle: 0,
    hasDecidedGesture: false,
  });

  // Track live angle ONLY to flip the pointer-events & face visibility at 90° & 270°
  // This fires only 1-2 times per rotation, NOT 60-120 times per second!
  useEffect(() => {
    const unsub = rotateY.on('change', (latest) => {
      const normalized = ((Math.round(latest) % 360) + 360) % 360;
      const back = normalized > 88 && normalized < 272;
      if (back !== isBackRef.current) {
        isBackRef.current = back;
        setIsBack(back);
      }
    });
    return () => unsub();
  }, [rotateY]);

  // Sync external flip toggle (e.g. from top action bar button)
  useEffect(() => {
    const currentAngle = rotateY.get();
    const currentStep = Math.round(currentAngle / 180);
    const isCurrentlyOdd = Math.abs(currentStep % 2) === 1;

    if (isFlipped !== isCurrentlyOdd) {
      const targetStep = isFlipped
        ? (currentStep % 2 === 0 ? currentStep + 1 : currentStep)
        : (currentStep % 2 !== 0 ? currentStep + 1 : currentStep);
      const targetAngle = targetStep * 180;

      cumulativeAngleRef.current = targetAngle;
      animate(rotateY, targetAngle, {
        type: 'spring',
        stiffness: 260,
        damping: 26,
        mass: 0.6,
      });
      animate(rotateX, 0, { type: 'spring', stiffness: 300, damping: 26 });
    }
  }, [isFlipped, rotateY, rotateX]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (clearWasDraggingTimer.current) {
        window.clearTimeout(clearWasDraggingTimer.current);
      }
    };
  }, []);

  // -------------------------------------------------------------
  // MOBILE TOUCH GESTURE: Silky 360° Smooth Drag & Momentum Snap
  // -------------------------------------------------------------
  const handleTouchStart = (e: React.TouchEvent) => {
    const targetEl = e.target as HTMLElement;
    // Don't intercept text inputs / selects / sliders
    if (
      targetEl.tagName === 'INPUT' ||
      targetEl.tagName === 'SELECT' ||
      targetEl.tagName === 'TEXTAREA' ||
      targetEl.closest('.prevent-swipe')
    ) {
      return;
    }

    const touch = e.touches[0];
    touchStartPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      baseAngle: rotateY.get(),
      hasDecidedGesture: false,
    };
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPos.current.x;
    const deltaY = touch.clientY - touchStartPos.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Differentiate between button tap and horizontal 360 swipe
    if (!touchStartPos.current.hasDecidedGesture) {
      if (absX > 8 && absX > absY * 0.9) {
        touchStartPos.current.hasDecidedGesture = true;
        isDraggingRef.current = true;
        wasDraggingRef.current = true;
      } else if (absY > 12 && absY > absX * 1.2) {
        // Vertical scroll intent
        touchStartPos.current.hasDecidedGesture = true;
        isDraggingRef.current = false;
        return;
      }
    }

    if (isDraggingRef.current) {
      if (e.cancelable) {
        e.preventDefault(); // Stop mobile rubber-banding
      }

      // Smooth 1:1 direct finger tracking left and right across 360°
      const newAngle = touchStartPos.current.baseAngle + deltaX * 0.78;
      rotateY.set(newAngle);
      rotateX.set(Math.max(-8, Math.min(8, -deltaY * 0.08)));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) {
      // Was a tap, don't suppress clicks
      wasDraggingRef.current = false;
      return;
    }
    isDraggingRef.current = false;

    // Suppress child button clicks right after drag
    wasDraggingRef.current = true;
    if (clearWasDraggingTimer.current) window.clearTimeout(clearWasDraggingTimer.current);
    clearWasDraggingTimer.current = window.setTimeout(() => {
      wasDraggingRef.current = false;
    }, 220);

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartPos.current.x;
    const elapsed = Math.max(16, Date.now() - touchStartPos.current.time);
    const velocity = deltaX / elapsed; // px per ms

    // Natural momentum throw for continuous 360° rotation
    const momentumDegrees = velocity * 130;
    const settleTarget = rotateY.get() + momentumDegrees;

    // Snap cleanly to nearest 180° multiple
    const snappedAngle = Math.round(settleTarget / 180) * 180;
    cumulativeAngleRef.current = snappedAngle;

    // Smooth physics-based spring animation to snap angle
    animate(rotateY, snappedAngle, {
      type: 'spring',
      stiffness: 280,
      damping: 28,
      mass: 0.6,
      velocity: velocity * 20,
    });
    animate(rotateX, 0, {
      type: 'spring',
      stiffness: 300,
      damping: 26,
    });

    // Audio & haptic feedback on snap
    sound.triggerHaptic(12);
    sound.playGlassTap(1150, 0.04, 0.12);

    // Notify parent if face flipped
    const isNowOdd = Math.abs(Math.round(snappedAngle / 180) % 2) === 1;
    if (isNowOdd !== isFlippedRef.current) {
      onFlipToggle();
    }
  };

  // -------------------------------------------------------------
  // DESKTOP POINTER GESTURE (Mouse Drag left / right across 360°)
  // -------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return; // Handled by touch events

    const targetEl = e.target as HTMLElement;
    if (
      targetEl.tagName === 'INPUT' ||
      targetEl.tagName === 'SELECT' ||
      targetEl.tagName === 'TEXTAREA' ||
      targetEl.closest('.prevent-swipe')
    ) {
      return;
    }

    touchStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      baseAngle: rotateY.get(),
      hasDecidedGesture: false,
    };
    isDraggingRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    if (e.buttons !== 1) {
      if (isDraggingRef.current) {
        handlePointerUp(e);
      }
      return;
    }

    const deltaX = e.clientX - touchStartPos.current.x;
    const deltaY = e.clientY - touchStartPos.current.y;
    const absX = Math.abs(deltaX);

    if (!isDraggingRef.current && absX > 6) {
      isDraggingRef.current = true;
      wasDraggingRef.current = true;
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // ignore pointer capture error
      }
    }

    if (isDraggingRef.current) {
      const newAngle = touchStartPos.current.baseAngle + deltaX * 0.78;
      rotateY.set(newAngle);
      rotateX.set(Math.max(-8, Math.min(8, -deltaY * 0.08)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    if (!isDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    isDraggingRef.current = false;

    wasDraggingRef.current = true;
    if (clearWasDraggingTimer.current) window.clearTimeout(clearWasDraggingTimer.current);
    clearWasDraggingTimer.current = window.setTimeout(() => {
      wasDraggingRef.current = false;
    }, 220);

    const deltaX = e.clientX - touchStartPos.current.x;
    const elapsed = Math.max(16, Date.now() - touchStartPos.current.time);
    const velocity = deltaX / elapsed;

    const momentumDegrees = velocity * 130;
    const settleTarget = rotateY.get() + momentumDegrees;

    const snappedAngle = Math.round(settleTarget / 180) * 180;
    cumulativeAngleRef.current = snappedAngle;

    animate(rotateY, snappedAngle, {
      type: 'spring',
      stiffness: 280,
      damping: 28,
      mass: 0.6,
      velocity: velocity * 20,
    });
    animate(rotateX, 0, {
      type: 'spring',
      stiffness: 300,
      damping: 26,
    });

    sound.playGlassTap(1150, 0.04, 0.12);

    const isNowOdd = Math.abs(Math.round(snappedAngle / 180) % 2) === 1;
    if (isNowOdd !== isFlippedRef.current) {
      onFlipToggle();
    }
  };

  // Intercept and swallow button clicks if user just finished a 360° swipe
  const handleClickCapture = (e: React.MouseEvent) => {
    if (wasDraggingRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={handleClickCapture}
      className="relative w-full h-full flex-1 flex flex-col justify-between select-none touch-none"
    >
      <div
        className="relative w-full h-full flex-1 flex flex-col"
        style={{ perspective: 1200 }}
      >
        <motion.div
          style={{
            rotateY,
            rotateX,
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
          className="relative w-full h-full flex-1 flex flex-col"
        >
          {/* FRONT FACE: Calculator */}
          <div
            style={{
              transform: 'rotateY(0deg) translateZ(1px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: isBack ? 'none' : 'auto',
            }}
            className="w-full h-full flex-1 flex flex-col justify-between overflow-hidden"
          >
            {frontContent}
          </div>

          {/* BACK FACE: Stock Forecast & Pro Traders Card */}
          <div
            style={{
              transform: 'rotateY(180deg) translateZ(1px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: isBack ? 'auto' : 'none',
            }}
            className="absolute inset-0 w-full h-full flex flex-col justify-between overflow-hidden"
          >
            {backContent}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
