import pc from 'picocolors';

export interface ColorUtils {
  success: (text: string) => string;
  error: (text: string) => string;
  warning: (text: string) => string;
  info: (text: string) => string;
  highlight: (text: string) => string;
  dim: (text: string) => string;
  bold: (text: string) => string;
}

export const colors: ColorUtils = {
  success: (text: string) => pc.green(`✅ ${text}`),
  error: (text: string) => pc.red(`❌ ${text}`),
  warning: (text: string) => pc.yellow(`⚠️  ${text}`),
  info: (text: string) => pc.cyan(`ℹ️  ${text}`),
  highlight: (text: string) => pc.bold(pc.yellow(text)),
  dim: (text: string) => pc.dim(text),
  bold: (text: string) => pc.bold(text),
};

// Environment-aware color function
export function safeColor(colorFn: (text: string) => string, text: string): string {
  // Respect NO_COLOR environment variable and TTY detection
  if (process.env.NO_COLOR || !process.stdout.isTTY) {
    return text;
  }
  return colorFn(text);
}

// Semantic logging functions
export function logSuccess(message: string): void {
  console.log(safeColor(colors.success, message));
}

export function logError(message: string): void {
  console.error(safeColor(colors.error, message));
}

export function logWarning(message: string): void {
  console.warn(safeColor(colors.warning, message));
}

export function logInfo(message: string): void {
  console.log(safeColor(colors.info, message));
}

// The semantic colors for consistent theming
export const semanticColors = {
  // Status colors
  success: pc.green,
  error: pc.red,
  warning: pc.yellow,
  info: pc.cyan,

  // UI element colors
  primary: pc.blue,
  secondary: pc.magenta,
  muted: pc.dim,
  highlight: pc.bold,

  // Data colors
  number: pc.cyan,
  string: pc.green,
  boolean: pc.yellow,
  null: pc.dim,
} as const;

export function applySemanticColor(
  type: keyof typeof semanticColors,
  text: string
): string {
  const colorFn = semanticColors[type];
  return safeColor(colorFn, text);
}

// Status indicators with consistent styling
export function statusIndicator(
  status: 'success' | 'error' | 'warning' | 'info' | 'loading',
  message: string
): string {
  const symbols = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    loading: '⏳',
  };

  const colorFunctions = {
    success: semanticColors.success,
    error: semanticColors.error,
    warning: semanticColors.warning,
    info: semanticColors.info,
    loading: semanticColors.info,
  };

  const symbol = symbols[status];
  const colorFn = colorFunctions[status];

  return `${safeColor(colorFn, symbol)} ${message}`;
}
