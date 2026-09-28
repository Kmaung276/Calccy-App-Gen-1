import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, X, Clock, ArrowDownLeft } from 'lucide-react';
import { HistoryItem } from '../types';
import { formatDisplayValue } from '../utils/calculator';
import { LanguageNumeralSystem, localizeNumber } from '../utils/languages';
import { sound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  history: HistoryItem[];
  language: LanguageNumeralSystem;
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<Props> = ({
  isOpen,
  history,
  language,
  onClose,
  onSelect,
  onClear,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex flex-col backdrop-blur-3xl bg-white/[0.08] dark:bg-black/[0.22] border border-white/20 text-white overflow-hidden rounded-[44px] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-medium tracking-tight">Calculation History</h2>
            </div>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={() => {
                    sound.playClearSound();
                    onClear();
                  }}
                  className="p-2 rounded-full hover:bg-white/10 text-rose-400 transition-colors cursor-pointer"
                  title="Clear All History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-white/40">
                <Clock className="w-12 h-12 mb-3 stroke-[1.2]" />
                <p className="text-sm font-medium text-white/60">No history yet</p>
                <p className="text-xs text-white/40 mt-1">
                  New calculations will appear here automatically
                </p>
              </div>
            ) : (
              history.map((item) => {
                const formattedResult = formatDisplayValue(item.result);
                const localizedRes = localizeNumber(formattedResult, language);
                const localizedExpr = localizeNumber(item.expression, language);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      sound.playGlassTap(1000, 0.05, 0.15);
                      onSelect(item);
                    }}
                    className="group p-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 transition-all cursor-pointer flex flex-col gap-1 select-none"
                  >
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span className="font-mono">{localizedExpr}</span>
                      <ArrowDownLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                    </div>
                    <div className="text-right text-2xl font-light text-white tracking-tight">
                      = {localizedRes}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
