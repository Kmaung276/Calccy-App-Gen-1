import React from 'react';
import { GlassButton } from './GlassButton';
import { Operator, ButtonSizingMode } from '../types';
import { LanguageNumeralSystem, getLocalDigit } from '../utils/languages';

interface Props {
  displayValue: string;
  activeOperator: Operator;
  sizingMode: ButtonSizingMode;
  language: LanguageNumeralSystem;
  onDigit: (digit: string) => void;
  onOperator: (op: Operator) => void;
  onEqual: () => void;
  onClear: () => void;
  onToggleSign: () => void;
  onPercentage: () => void;
  onDecimal: () => void;
}

export const Keypad: React.FC<Props> = ({
  displayValue,
  activeOperator,
  sizingMode,
  language,
  onDigit,
  onOperator,
  onEqual,
  onClear,
  onToggleSign,
  onPercentage,
  onDecimal,
}) => {
  const isZero = displayValue === '0';
  const clearLabel = isZero ? 'AC' : 'C';

  const renderDigitButton = (
    digit: string,
    sizeFactor: number,
    organicRadius: string,
    isWide = false
  ) => {
    const isNonEnglish = language.id !== 'en';
    const mainLabel = getLocalDigit(digit, language);
    const subLabel = isNonEnglish ? digit : undefined;

    return (
      <GlassButton
        label={mainLabel}
        subLabel={subLabel}
        type="number"
        isWide={isWide}
        sizeFactor={sizeFactor}
        organicRadius={organicRadius}
        sizingMode={sizingMode}
        onClick={() => onDigit(digit)}
      />
    );
  };

  const decimalSeparatorLabel = language.decimalSeparator || '.';

  return (
    <div
      className="w-full flex-1 flex flex-col justify-evenly items-center gap-2 sm:gap-2.5 px-3 sm:px-4 pb-1 pt-1 touch-manipulation select-none"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Row 1: Actions & Division */}
      <div className="w-full flex-1 grid grid-cols-4 gap-2.5 sm:gap-3 items-center justify-items-center">
        <GlassButton
          label={clearLabel}
          type="action"
          sizeFactor={1.08}
          organicRadius="48% 52% 50% 50%"
          sizingMode={sizingMode}
          onClick={onClear}
        />
        <GlassButton
          label="±"
          type="action"
          sizeFactor={0.88}
          organicRadius="52% 48% 53% 47%"
          sizingMode={sizingMode}
          onClick={onToggleSign}
        />
        <GlassButton
          label="%"
          type="action"
          sizeFactor={0.94}
          organicRadius="50% 50% 48% 52%"
          sizingMode={sizingMode}
          onClick={onPercentage}
        />
        <GlassButton
          label="÷"
          type="operator"
          isActive={activeOperator === '÷'}
          sizeFactor={1.02}
          sizingMode={sizingMode}
          onClick={() => onOperator('÷')}
        />
      </div>

      {/* Row 2: 7, 8, 9, × */}
      <div className="w-full flex-1 grid grid-cols-4 gap-2.5 sm:gap-3 items-center justify-items-center">
        {renderDigitButton('7', 1.06, '52% 48% 49% 51%')}
        {renderDigitButton('8', 0.88, '50% 50% 52% 48%')}
        {renderDigitButton('9', 1.14, '47% 53% 51% 49%')}
        <GlassButton
          label="×"
          type="operator"
          isActive={activeOperator === '×'}
          sizeFactor={1.04}
          sizingMode={sizingMode}
          onClick={() => onOperator('×')}
        />
      </div>

      {/* Row 3: 4, 5, 6, − */}
      <div className="w-full flex-1 grid grid-cols-4 gap-2.5 sm:gap-3 items-center justify-items-center">
        {renderDigitButton('4', 0.92, '51% 49% 48% 52%')}
        {renderDigitButton('5', 1.18, '46% 54% 52% 48%')}
        {renderDigitButton('6', 0.90, '53% 47% 51% 49%')}
        <GlassButton
          label="−"
          type="operator"
          isActive={activeOperator === '-'}
          sizeFactor={0.98}
          sizingMode={sizingMode}
          onClick={() => onOperator('-')}
        />
      </div>

      {/* Row 4: 1, 2, 3, + */}
      <div className="w-full flex-1 grid grid-cols-4 gap-2.5 sm:gap-3 items-center justify-items-center">
        {renderDigitButton('1', 1.10, '49% 51% 53% 47%')}
        {renderDigitButton('2', 0.84, '50% 50% 50% 50%')}
        {renderDigitButton('3', 1.05, '48% 52% 49% 51%')}
        <GlassButton
          label="+"
          type="operator"
          isActive={activeOperator === '+'}
          sizeFactor={1.02}
          sizingMode={sizingMode}
          onClick={() => onOperator('+')}
        />
      </div>

      {/* Row 5: 0, ., = */}
      <div className="w-full flex-1 grid grid-cols-4 gap-2.5 sm:gap-3 items-center justify-items-center">
        <div className="col-span-2 flex items-center justify-center w-full">
          {renderDigitButton('0', 1.06, '38px 40px 38px 40px', true)}
        </div>
        <GlassButton
          label={decimalSeparatorLabel}
          type="number"
          sizeFactor={0.82}
          organicRadius="50%"
          sizingMode={sizingMode}
          onClick={onDecimal}
        />
        <GlassButton
          label="="
          type="operator"
          sizeFactor={1.12}
          organicRadius="48% 52% 51% 49%"
          sizingMode={sizingMode}
          onClick={onEqual}
        />
      </div>
    </div>
  );
};
