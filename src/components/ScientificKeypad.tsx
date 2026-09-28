import React from 'react';
import { motion } from 'motion/react';
import { sound } from '../utils/sound';

interface Props {
  onScientificAction: (action: string) => void;
}

export const ScientificKeypad: React.FC<Props> = ({ onScientificAction }) => {
  const sciButtons = [
    { label: '(', action: '(' },
    { label: ')', action: ')' },
    { label: 'x²', action: 'sqr' },
    { label: 'x³', action: 'cube' },
    { label: 'xʸ', action: '^' },
    { label: 'eˣ', action: 'exp' },
    { label: '10ˣ', action: 'tenPow' },
    { label: '1/x', action: 'recip' },
    { label: '√x', action: 'sqrt' },
    { label: '³√x', action: 'cbrt' },
    { label: 'ln', action: 'ln' },
    { label: 'log₁₀', action: 'log10' },
    { label: 'x!', action: 'fact' },
    { label: 'sin', action: 'sin' },
    { label: 'cos', action: 'cos' },
    { label: 'tan', action: 'tan' },
    { label: 'e', action: 'e' },
    { label: 'π', action: 'pi' },
    { label: 'Rand', action: 'rand' },
    { label: 'DEG', action: 'deg' },
  ];

  const handlePress = (action: string) => {
    sound.playGlassTap(1100, 0.04, 0.12);
    onScientificAction(action);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full px-3 pb-3 overflow-hidden"
    >
      <div className="grid grid-cols-5 gap-1.5 p-2 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/15">
        {sciButtons.map((btn) => (
          <button
            key={btn.action}
            onClick={() => handlePress(btn.action)}
            className="h-10 text-xs font-normal text-white/90 bg-white/[0.12] hover:bg-white/[0.24] active:scale-95 border border-white/20 rounded-xl transition-all cursor-pointer flex items-center justify-center select-none touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
