import React, { useState } from 'react';
import { Copy, Check, Delete, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatDisplayValue } from '../utils/calculator';
import { LanguageNumeralSystem, localizeNumber } from '../utils/languages';
import { sound } from '../utils/sound';

interface Props {
  value: string;
  expression: string;
  language: LanguageNumeralSystem;
  onBackspace: () => void;
  onClear: () => void;
  onSaveToNotes?: () => void;
}

export const Display: React.FC<Props> = ({
  value,
  expression,
  language,
  onBackspace,
  onSaveToNotes,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const formattedValue = formatDisplayValue(value);
  const localizedDisplay = localizeNumber(formattedValue, language);
  const localizedExpression = expression ? localizeNumber(expression, language) : '';

  // Compute font size dynamically based on length
  const getFontSizeClass = (len: number) => {
    if (len > 12) return 'text-3xl sm:text-4xl';
    if (len > 9) return 'text-4xl sm:text-5xl';
    if (len > 7) return 'text-5xl sm:text-6xl';
    return 'text-6xl sm:text-7xl';
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      sound.playGlassTap(1400, 0.08, 0.2);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const handleSave = () => {
    if (onSaveToNotes) {
      sound.playEqualsChime();
      onSaveToNotes();
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }
  };

  return (
    <div className="relative w-full flex flex-col justify-end px-5 pt-6 pb-4 select-none">
      {/* Top Expression line */}
      <div className="flex items-center justify-between min-h-[28px] mb-1">
        <div className="flex items-center gap-1.5 text-xs text-white/50 tracking-wider font-light">
          {localizedExpression ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate max-w-[180px]">{localizedExpression}</span>
            </>
          ) : (
            <span className="h-4" />
          )}
        </div>

        {/* Quick Actions (Backspace, Copy, Save to Notes) */}
        <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
          {value !== '0' && (
            <button
              onClick={onBackspace}
              className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 text-white/80 transition-all cursor-pointer"
              title="Delete last digit (Backspace)"
            >
              <Delete className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 text-white/80 transition-all cursor-pointer"
            title="Copy value to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Small Save Icon next to Copy */}
          <button
            onClick={handleSave}
            className={`p-1.5 rounded-full active:scale-95 transition-all cursor-pointer ${
              saved
                ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                : 'hover:bg-white/10 text-white/80 hover:text-cyan-300'
            }`}
            title="Save calculation to Notes (Draft)"
          >
            {saved ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-cyan-300 animate-bounce" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Big Number Display (Click to copy) */}
      <div
        onClick={handleCopy}
        className="w-full flex items-end justify-end overflow-hidden cursor-pointer group"
        title="Click to copy result"
      >
        <span
          className={`font-light tracking-tight text-white tabular-nums transition-all duration-200 select-all ${getFontSizeClass(
            localizedDisplay.length
          )}`}
          style={{
            fontFamily: '"Outfit", -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            textShadow: '0 2px 20px rgba(255,255,255,0.18)',
          }}
        >
          {localizedDisplay}
        </span>
      </div>

      {/* Copy Toast */}
      {copied && (
        <div className="absolute top-2 right-6 px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[11px] font-medium backdrop-blur-md shadow-lg animate-fade-in">
          Copied to clipboard
        </div>
      )}
    </div>
  );
};
