export type Operator = '+' | '-' | '×' | '÷' | '^' | null;

export type ButtonType = 'number' | 'operator' | 'action' | 'scientific';

export type ButtonSizingMode = 'organic' | 'classic' | 'droplet';

export type VaporDensity = 'subtle' | 'misty' | 'dense' | 'droplets';

export type AuroraTheme = 'white_metallic' | 'liquid_silver' | 'sunset_aurora' | 'deep_ocean' | 'neon_bloom' | 'midnight_purple' | 'frosted_emerald';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface NoteEntry {
  id: string;
  title: string;
  expression: string;
  result: string;
  fullCalculation: string;
  timestamp: number;
  dateStr: string;
  timeStr: string;
  content?: string;
}

export interface PebbleConfig {
  key: string;
  label: string;
  type: ButtonType;
  sizeFactor: number;
  aspectRatio?: number;
  borderRadius?: string;
  colorVariant?: 'number' | 'operator' | 'action' | 'scientific' | 'equals';
}
