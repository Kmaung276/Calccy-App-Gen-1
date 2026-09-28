import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useSpring } from 'motion/react';
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
  // Store cumulative target angle so continuous 360° rotations don't jump
  const [cumulativeAngle, setCumulativeAngle] = useState(isFlipped ? 180 : 0);

  // Optimized spring physics for ultra-smooth 60/120Hz mobile & tablet paper flip
  const springRotateY = useSpring(isFlipped ? 180 : 0, {
    stiffness: 200,
    damping: 24,
    mass: 0.65,
  });
  const springRotateX = useSpring(0, { stiffness: 220, damping: 24 });

  const [currentY, setCurrentY] = useState(isFlipped ? 180 : 0);
  const isDraggingRef = useRef(false);
  const touchStartPos = useRef({
    x: 0,
    y: 0,
    time: 0,
    baseAngle: 0,
    isButtonTarget: false,
    hasDecidedGesture: false,
  });

  // Keep spring in sync when isFlipped is toggled externally
  useEffect(() => {
    const isCurrentlyOdd = Math.abs(Math.round(cumulativeAngle / 180) % 2) === 1;
    if (isFlipped !== isCurrentlyOdd) {
      const nextTarget = isFlipped
        ? Math.round((cumulativeAngle + 180) / 180) * 180
        : Math.round((cumulativeAngle - 180) / 180) * 180;
      setCumulativeAngle(nextTarget);
      springRotateY.set(nextTarget);
    }
    springRotateX.set(0);
  }, [isFlipped]);

  // Track live rotation angle for backface visibility & touch interaction
  useEffect(() => {
    const unsub = springRotateY.on('change', (latest) => {
      setCurrentY(latest);
    });
    return () => unsub();
  }, [springRotateY]);

  // Determine which face is currently visible (0°-90° & 270°-360° = Front, 90°-270° = Back)
  const normalizedAngle = ((Math.round(currentY) % 360) + 360) % 360;
  const isBack = normalizedAngle > 88 && normalizedAngle < 272;

  // -------------------------------------------------------------
  // MOBILE & TABLET TOUCH GESTURE: Silky 360° Drag & Snap
  // -------------------------------------------------------------
  const handleTouchStart = (e: React.TouchEvent) => {
    const targetEl = e.target as HTMLElement;
    if (
      targetEl.tagName === 'INPUT' ||
      targetEl.tagName === 'SELECT' ||
      targetEl.tagName === 'TEXTAREA' ||
      targetEl.closest('.prevent-swipe')
    ) {
      return;
    }

    const isButton = Boolean(targetEl.tagName === 'BUTTON' || targetEl.closest('button'));
    const touch = e.touches[0];

    touchStartPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      baseAngle: currentY,
      isButtonTarget: isButton,
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

    // If starting on a button, require higher threshold (36px) so button taps are never cancelled
    const threshold = touchStartPos.current.isButtonTarget ? 36 : 12;

    if (!touchStartPos.current.hasDecidedGesture) {
      if (absX > threshold && absX > absY * 1.3) {
        touchStartPos.current.hasDecidedGesture = true;
        isDraggingRef.current = true;
      } else if (absY > threshold && absY > absX) {
        // Clear vertical scroll intent, ignore horizontal 3D card rotation
        touchStartPos.current.hasDecidedGesture = true;
        isDraggingRef.current = false;
        return;
      }
    }

    if (isDraggingRef.current) {
      if (e.cancelable) {
        e.preventDefault(); // Stop mobile rubber-band page scrolling
      }

      // Smooth 1:1 rotation with natural finger tracking across 360°
      const newAngle = touchStartPos.current.baseAngle + deltaX * 0.85;
      springRotateY.set(newAngle);
      // Subtle vertical perspective tilt (-12° to +12°) for true 3D spatial feel
      springRotateX.set(Math.max(-12, Math.min(12, -deltaY * 0.16)));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartPos.current.x;
    const elapsed = Math.max(1, Date.now() - touchStartPos.current.time);
    const velocity = deltaX / elapsed;

    // Determine final settled angle based on position + flick momentum
    let settleTarget = currentY;
    if (Math.abs(velocity) > 0.4 && Math.abs(deltaX) > 24) {
      // Fast directional flick
      settleTarget = velocity > 0 ? currentY + 95 : currentY - 95;
    }

    // Snap cleanly to the nearest 180-degree face
    const snappedAngle = Math.round(settleTarget / 180) * 180;
    setCumulativeAngle(snappedAngle);
    springRotateY.set(snappedAngle);
    springRotateX.set(0);

    // Trigger haptic and sound
    sound.triggerHaptic(14);
    sound.playGlassTap(1150, 0.05, 0.14);

    // Check if face flipped
    const isNowOdd = Math.abs(Math.round(snappedAngle / 180) % 2) === 1;
    if (isNowOdd !== isFlipped) {
      onFlipToggle();
    }
  };

  // -------------------------------------------------------------
  // DESKTOP POINTER GESTURE (Mouse Drag Only, Ignore Touch Pointers)
  // -------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent) => {
    // Crucial: Ignore touch pointers so mobile/tablet touch handling is 100% clean
    if (e.pointerType === 'touch') return;

    const targetEl = e.target as HTMLElement;
    if (
      targetEl.tagName === 'BUTTON' ||
      targetEl.tagName === 'INPUT' ||
      targetEl.tagName === 'SELECT' ||
      targetEl.closest('button') ||
      targetEl.closest('.prevent-swipe')
    ) {
      return;
    }

    touchStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      baseAngle: currentY,
      isButtonTarget: false,
      hasDecidedGesture: true,
    };
    isDraggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - touchStartPos.current.x;
    const deltaY = e.clientY - touchStartPos.current.y;

    const newAngle = touchStartPos.current.baseAngle + deltaX * 0.85;
    springRotateY.set(newAngle);
    springRotateX.set(Math.max(-12, Math.min(12, -deltaY * 0.16)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const deltaX = e.clientX - touchStartPos.current.x;
    const elapsed = Math.max(1, Date.now() - touchStartPos.current.time);
    const velocity = deltaX / elapsed;

    let settleTarget = currentY;
    if (Math.abs(velocity) > 0.4 && Math.abs(deltaX) > 24) {
      settleTarget = velocity > 0 ? currentY + 95 : currentY - 95;
    }

    const snappedAngle = Math.round(settleTarget / 180) * 180;
    setCumulativeAngle(snappedAngle);
    springRotateY.set(snappedAngle);
    springRotateX.set(0);

    sound.playGlassTap(1150, 0.05, 0.14);

    const isNowOdd = Math.abs(Math.round(snappedAngle / 180) % 2) === 1;
    if (isNowOdd !== isFlipped) {
      onFlipToggle();
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
      className="relative w-full h-full flex-1 flex flex-col justify-between select-none touch-pan-y"
      style={{ touchAction: 'pan-y' }}
    >
      <div
        className="relative w-full h-full flex-1 flex flex-col"
        style={{ perspective: 1200 }}
      >
        <motion.div
          style={{
            rotateY: springRotateY,
            rotateX: springRotateX,
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
