/**
 * World Countries & Numeral Systems
 * Clean country list without sample text
 */

export interface LanguageNumeralSystem {
  id: string;
  name: string;
  flag: string;
  digits: [string, string, string, string, string, string, string, string, string, string]; // 0-9
  decimalSeparator?: string;
  thousandSeparator?: string;
}

export const SUPPORTED_LANGUAGES: LanguageNumeralSystem[] = [
  {
    id: 'en',
    name: 'Global / English',
    flag: '🌐',
    digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'my',
    name: 'Myanmar',
    flag: '🇲🇲',
    digits: ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'th',
    name: 'Thailand',
    flag: '🇹🇭',
    digits: ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '၈', '๙'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'jp',
    name: 'Japan',
    flag: '🇯🇵',
    digits: ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'cn',
    name: 'China',
    flag: '🇨🇳',
    digits: ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'kr',
    name: 'South Korea',
    flag: '🇰🇷',
    digits: ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'sa',
    name: 'Saudi Arabia / Arab',
    flag: '🇸🇦',
    digits: ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'],
    decimalSeparator: '٫',
    thousandSeparator: '٬',
  },
  {
    id: 'ir',
    name: 'Iran (Persian)',
    flag: '🇮🇷',
    digits: ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
    decimalSeparator: '٫',
    thousandSeparator: '٬',
  },
  {
    id: 'in-hi',
    name: 'India (Hindi)',
    flag: '🇮🇳',
    digits: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'bd',
    name: 'Bangladesh',
    flag: '🇧🇩',
    digits: ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'kh',
    name: 'Cambodia',
    flag: '🇰🇭',
    digits: ['០', '១', '២', '៣', '၄', '၅', '៦', '៧', '៨', '៩'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'la',
    name: 'Laos',
    flag: '🇱🇦',
    digits: ['໐', '໑', '໒', '໓', '໔', '໕', '໖', '໗', '໘', '໙'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'pk',
    name: 'Pakistan (Urdu)',
    flag: '🇵🇰',
    digits: ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
    decimalSeparator: '٫',
    thousandSeparator: '٬',
  },
  {
    id: 'tib',
    name: 'Tibet / Bhutan',
    flag: '🏔️',
    digits: ['༠', '༡', '༢', '༣', '༤', '༥', '༦', '༧', '༨', '༩'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'in-ta',
    name: 'India (Tamil)',
    flag: '🇮🇳',
    digits: ['௦', '௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'in-te',
    name: 'India (Telugu)',
    flag: '🇮🇳',
    digits: ['౦', '౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'in-kn',
    name: 'India (Kannada)',
    flag: '🇮🇳',
    digits: ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'in-ml',
    name: 'India (Malayalam)',
    flag: '🇮🇳',
    digits: ['൦', '൧', '൨', '൩', '൪', '൫', '൬', '൭', '൮', '൯'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'in-gu',
    name: 'India (Gujarati)',
    flag: '🇮🇳',
    digits: ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'in-pa',
    name: 'India (Punjabi)',
    flag: '🇮🇳',
    digits: ['੦', '੧', '੨', '੩', '੪', '੫', '੬', '੭', '੮', '੯'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'in-or',
    name: 'India (Odia)',
    flag: '🇮🇳',
    digits: ['୦', '୧', '୨', '୩', '၄', '၅', '୬', '୭', '୮', '୯'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
  {
    id: 'cn-fin',
    name: 'China (Financial)',
    flag: '🏦',
    digits: ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'],
    decimalSeparator: '.',
    thousandSeparator: ',',
  },
];

export function getLanguageById(id: string): LanguageNumeralSystem {
  return SUPPORTED_LANGUAGES.find((lang) => lang.id === id) || SUPPORTED_LANGUAGES[0];
}

/**
 * Converts formatted numeric string to target country's digits
 */
export function localizeNumber(
  text: string,
  lang: LanguageNumeralSystem
): string {
  if (!text) return '';
  if (lang.id === 'en') return text;

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char >= '0' && char <= '9') {
      const digitIndex = parseInt(char, 10);
      result += lang.digits[digitIndex];
    } else if (char === '.' && lang.decimalSeparator) {
      result += lang.decimalSeparator;
    } else if (char === ',' && lang.thousandSeparator) {
      result += lang.thousandSeparator;
    } else {
      result += char;
    }
  }
  return result;
}

export function getLocalDigit(digitChar: string, lang: LanguageNumeralSystem): string {
  const num = parseInt(digitChar, 10);
  if (!isNaN(num) && num >= 0 && num <= 9) {
    return lang.digits[num];
  }
  return digitChar;
}
