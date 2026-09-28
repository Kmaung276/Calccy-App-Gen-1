import { Operator } from '../types';

export function formatDisplayValue(val: string): string {
  if (val === 'Error' || val === 'NaN' || val === 'Infinity' || val === '-Infinity') {
    return 'Error';
  }

  // If ends with decimal dot, keep it
  if (val.endsWith('.')) {
    const intPart = val.slice(0, -1);
    return `${formatIntegerPart(intPart)}.`;
  }

  // If contains decimal point
  if (val.includes('.')) {
    const [intPart, decPart] = val.split('.');
    return `${formatIntegerPart(intPart)}.${decPart}`;
  }

  return formatIntegerPart(val);
}

function formatIntegerPart(intStr: string): string {
  const isNegative = intStr.startsWith('-');
  const raw = isNegative ? intStr.slice(1) : intStr;

  // Use scientific notation only for extremely huge numbers exceeding 12 digits
  if (raw.length > 12) {
    const num = Number(intStr);
    if (!isNaN(num) && (Math.abs(num) >= 1e12 || (Math.abs(num) > 0 && Math.abs(num) < 1e-6))) {
      return num.toExponential(4);
    }
  }

  const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return isNegative ? `-${formatted}` : formatted;
}

export function cleanFloat(num: number): number {
  if (isNaN(num) || !isFinite(num)) return NaN;
  // Eliminates binary IEEE-754 precision artifacts (e.g. 0.1 + 0.2 = 0.3)
  return parseFloat(Number(num.toPrecision(12)).toString());
}

export function evaluateExpression(prev: number, current: number, op: Operator): number {
  if (isNaN(prev) || isNaN(current)) throw new Error('Invalid number');
  switch (op) {
    case '+':
      return cleanFloat(prev + current);
    case '-':
      return cleanFloat(prev - current);
    case '×':
      return cleanFloat(prev * current);
    case '÷':
      if (current === 0) throw new Error('Divide by zero');
      return cleanFloat(prev / current);
    case '^':
      return cleanFloat(Math.pow(prev, current));
    default:
      return current;
  }
}

export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n) || n > 170) return NaN;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}
