export interface TerminalCapabilities {
  supportsColor: boolean;
  supportsUnicode: boolean;
  isInteractive: boolean;
  width: number;
  height: number;
}

export function getTerminalCapabilities(): TerminalCapabilities {
  return {
    supportsColor: !process.env.NO_COLOR && process.stdout.isTTY,
    supportsUnicode:
      !process.env.ASCII_ONLY && (process.env.LANG?.includes("UTF-8") ?? false),
    isInteractive: process.stdout.isTTY && process.stdin.isTTY,
    width: process.stdout.columns || 80,
    height: process.stdout.rows || 24,
  };
}

// Safe wrapper for styled output
export function renderForTerminal(
  styledContent: string,
  plainContent: string,
  capabilities: TerminalCapabilities = getTerminalCapabilities(),
): string {
  if (!capabilities.supportsColor) {
    return plainContent;
  }
  return styledContent;
}

// Unicode-aware symbols
export function getSymbols(
  capabilities: TerminalCapabilities = getTerminalCapabilities(),
) {
  if (!capabilities.supportsUnicode) {
    return {
      success: "[OK]",
      error: "[ERR]",
      warning: "[WARN]",
      info: "[INFO]",
      loading: "...",
      arrow: "->",
      bullet: "*",
      progressFull: "#",
      progressEmpty: "-",
      checkmark: "v",
      cross: "x",
    };
  }

  return {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
    loading: "⠋",
    arrow: "→",
    bullet: "•",
    progressFull: "█",
    progressEmpty: "░",
    checkmark: "✓",
    cross: "✗",
  };
}

export function centerText(text: string, width?: number): string {
  const termWidth = width || getTerminalCapabilities().width;
  const textLength = text.replace(/\x1b\[[0-9;]*m/g, "").length; // Remove ANSI codes for length calc
  const padding = Math.max(0, Math.floor((termWidth - textLength) / 2));
  return " ".repeat(padding) + text;
}

export function wrapText(text: string, width?: number): string[] {
  const termWidth = width || getTerminalCapabilities().width - 4; // Leave some margin
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + word).length <= termWidth) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

export function createSeparator(char: string = "─", width?: number): string {
  const termWidth = width || getTerminalCapabilities().width;
  return char.repeat(termWidth);
}

export function createHeader(title: string, subtitle?: string): string {
  const capabilities = getTerminalCapabilities();
  const separator = createSeparator("=", capabilities.width);

  let header = separator + "\n";
  header += centerText(title.toUpperCase()) + "\n";

  if (subtitle) {
    header += centerText(subtitle) + "\n";
  }

  header += separator;
  return header;
}

// Left align text with padding
export function leftAlign(
  text: string,
  width?: number,
  paddingChar: string = " ",
): string {
  const termWidth = width || getTerminalCapabilities().width;
  const textLength = text.replace(/\x1b\[[0-9;]*m/g, "").length;
  const padding = Math.max(0, termWidth - textLength);
  return text + paddingChar.repeat(padding);
}

// Right align text with padding
export function rightAlign(
  text: string,
  width?: number,
  paddingChar: string = " ",
): string {
  const termWidth = width || getTerminalCapabilities().width;
  const textLength = text.replace(/\x1b\[[0-9;]*m/g, "").length;
  const padding = Math.max(0, termWidth - textLength);
  return paddingChar.repeat(padding) + text;
}

// Create a two-column layout
export function createTwoColumnLayout(
  leftContent: string,
  rightContent: string,
  width?: number,
  separator: string = " | ",
): string {
  const termWidth = width || getTerminalCapabilities().width;
  const separatorLength = separator.replace(/\x1b\[[0-9;]*m/g, "").length;
  const availableWidth = termWidth - separatorLength;
  const leftWidth = Math.floor(availableWidth / 2);
  const rightWidth = availableWidth - leftWidth;

  const leftPadded = leftAlign(leftContent, leftWidth);
  const rightPadded = rightAlign(rightContent, rightWidth);

  return leftPadded + separator + rightPadded;
}

// Create a progress bar
export function createProgressBar(
  current: number,
  total: number,
  width?: number,
  showPercentage: boolean = true,
): string {
  const termWidth = width || 40;
  const symbols = getSymbols();

  const percentage = Math.round((current / total) * 100);
  const progressLength = Math.floor((current / total) * termWidth);
  const emptyLength = termWidth - progressLength;

  const progressBar =
    symbols.progressFull.repeat(progressLength) +
    symbols.progressEmpty.repeat(emptyLength);

  if (showPercentage) {
    return `${progressBar} ${percentage}%`;
  }

  return progressBar;
}

// Create a simple banner
export function createBanner(
  text: string,
  style: "simple" | "double" | "thick" = "simple",
): string {
  const capabilities = getTerminalCapabilities();
  const width = capabilities.width;

  const chars = {
    simple: { horizontal: "─", vertical: "│", corners: ["┌", "┐", "└", "┘"] },
    double: { horizontal: "═", vertical: "║", corners: ["╔", "╗", "╚", "╝"] },
    thick: { horizontal: "━", vertical: "┃", corners: ["┏", "┓", "┗", "┛"] },
  };

  const { horizontal, vertical, corners } = chars[style];
  const [topLeft, topRight, bottomLeft, bottomRight] = corners;

  const horizontalLine = horizontal.repeat(width - 2);
  const centeredText = centerText(text, width - 2);

  return [
    topLeft + horizontalLine + topRight,
    vertical + centeredText + vertical,
    bottomLeft + horizontalLine + bottomRight,
  ].join("\n");
}

// Format elapsed time
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

// Create a status line with multiple pieces of info
export function createStatusLine(
  items: Array<{
    label: string;
    value: string;
    color?: (text: string) => string;
  }>,
  separator: string = " • ",
): string {
  return items
    .map((item) => {
      const formatted = `${item.label}: ${item.value}`;
      return item.color ? item.color(formatted) : formatted;
    })
    .join(separator);
}

// Clear the terminal screen
export function clearScreen(): void {
  const capabilities = getTerminalCapabilities();
  if (capabilities.isInteractive) {
    console.clear();
  }
}

// Move cursor to specific position
export function moveCursor(x: number, y: number): string {
  return `\x1b[${y};${x}H`;
}

// Clear current line
export function clearLine(): string {
  return "\x1b[2K\r";
}

// Hide/show cursor
export function hideCursor(): string {
  return "\x1b[?25l";
}

export function showCursor(): string {
  return "\x1b[?25h";
}
