import boxen from 'boxen';
import pc from 'picocolors';

export interface BoxOptions {
  title?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  padding?: number;
  margin?: number;
}

export function createBox(content: string, options: BoxOptions = {}): string {
  const { title, type = 'info', padding = 1, margin = 1 } = options;

  const borderColors = {
    success: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'cyan',
  } as const;

  return boxen(content, {
    title,
    padding,
    margin,
    borderStyle: 'round',
    borderColor: borderColors[type],
    titleAlignment: 'center',
  });
}

export function successBox(content: string, title?: string): string {
  return createBox(pc.green(content), { type: 'success', title });
}

export function errorBox(content: string, title?: string): string {
  return createBox(pc.red(content), { type: 'error', title });
}

export function warningBox(content: string, title?: string): string {
  return createBox(pc.yellow(content), { type: 'warning', title });
}

export function infoBox(content: string, title?: string): string {
  return createBox(pc.cyan(content), { type: 'info', title });
}

// Special box for displaying results
export function resultsBox(content: string): string {
  return boxen(content, {
    title: '📊 Results',
    padding: 2,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'magenta',
    titleAlignment: 'center',
  });
}

// Configuration display box
export function configBox(config: Record<string, any>): string {
  const configLines = Object.entries(config)
    .map(([key, value]) => `${pc.cyan(key)}: ${pc.white(String(value))}`)
    .join('\n');

  return boxen(configLines, {
    title: '⚙️  Configuration',
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'blue',
    titleAlignment: 'center',
  });
}

// Header box for main titles
export function headerBox(title: string, subtitle?: string): string {
  let content = pc.bold(pc.white(title.toUpperCase()));
  if (subtitle) {
    content += '\n' + pc.dim(subtitle);
  }

  return boxen(content, {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'cyan',
    textAlignment: 'center',
  });
}

// Progress summary box
export function progressBox(
  completed: number,
  total: number,
  message?: string
): string {
  const percentage = Math.round((completed / total) * 100);
  const progressBar = '█'.repeat(Math.floor(percentage / 5)) +
                     '░'.repeat(20 - Math.floor(percentage / 5));

  let content = `Progress: ${pc.bold(pc.cyan(`${completed}/${total}`))} (${percentage}%)\n`;
  content += `${pc.green(progressBar)}`;

  if (message) {
    content += `\n${pc.dim(message)}`;
  }

  return boxen(content, {
    title: '📈 Progress',
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'yellow',
    titleAlignment: 'center',
  });
}

// Status box for agent information
export function statusBox(
  status: 'running' | 'completed' | 'failed' | 'queued',
  details: Record<string, string | number>
): string {
  const statusColors = {
    running: pc.yellow,
    completed: pc.green,
    failed: pc.red,
    queued: pc.blue,
  };

  const statusSymbols = {
    running: '🔄',
    completed: '✅',
    failed: '❌',
    queued: '⏳',
  };

  const colorFn = statusColors[status];
  const symbol = statusSymbols[status];

  let content = `${symbol} Status: ${colorFn(status.toUpperCase())}\n\n`;

  Object.entries(details).forEach(([key, value]) => {
    content += `${pc.cyan(key)}: ${pc.white(String(value))}\n`;
  });

  const borderColor = status === 'failed' ? 'red' :
                     status === 'completed' ? 'green' :
                     status === 'running' ? 'yellow' : 'blue';

  return boxen(content.trim(), {
    title: '📋 Status',
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor,
    titleAlignment: 'center',
  });
}

// Simple text box with custom styling
export function textBox(
  content: string,
  options?: {
    title?: string;
    color?: string;
    style?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic';
  }
): string {
  return boxen(content, {
    title: options?.title,
    padding: 1,
    margin: 1,
    borderStyle: options?.style || 'single',
    borderColor: options?.color || 'white',
    titleAlignment: 'center',
  });
}
