# 🎨 CLI Output Styling Guide for Bun.js with TypeScript

This guide provides comprehensive techniques for creating beautiful, professional command-line interfaces in Bun.js projects using TypeScript. We'll build a practical example: a CLI tool that fetches data from an API with proper loading states, error handling, and formatted output.

## Table of Contents

1. [Using Raw ANSI Escape Codes](#using-raw-ansi-escape-codes)
2. [Leveraging Modern Libraries](#leveraging-modern-libraries)
3. [Best Practices for CLI UI/UX](#best-practices-for-cli-uiux)
4. [Complete Example Implementation](#complete-example-implementation)

## Using Raw ANSI Escape Codes

ANSI escape codes are the foundation of terminal styling. They provide direct control over colors, text formatting, and cursor positioning.

### Basic ANSI Helper Functions

```typescript
// src/utils/ansi-helpers.ts

export interface AnsiColors {
  reset: string;
  bold: string;
  dim: string;
  underline: string;
  // Foreground colors
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  // Background colors
  bgRed: string;
  bgGreen: string;
  bgYellow: string;
  bgBlue: string;
}

export const ansi: AnsiColors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

// Helper functions for semantic messaging
export function success(message: string): string {
  return `${ansi.green}✅ ${message}${ansi.reset}`;
}

export function error(message: string): string {
  return `${ansi.red}❌ ${message}${ansi.reset}`;
}

export function warning(message: string): string {
  return `${ansi.yellow}⚠️  ${message}${ansi.reset}`;
}

export function info(message: string): string {
  return `${ansi.cyan}ℹ️  ${message}${ansi.reset}`;
}

export function highlight(text: string): string {
  return `${ansi.bold}${ansi.yellow}${text}${ansi.reset}`;
}

// Simple spinner using raw ANSI
export function createSpinner(message: string): () => void {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let currentFrame = 0;
  let isSpinning = true;

  const interval = setInterval(() => {
    if (!isSpinning) return;
    process.stdout.write(`\r${ansi.cyan}${frames[currentFrame]} ${message}${ansi.reset}`);
    currentFrame = (currentFrame + 1) % frames.length;
  }, 100);

  return () => {
    isSpinning = false;
    clearInterval(interval);
    process.stdout.write('\r\x1b[K'); // Clear the line
  };
}
```

### Basic Usage Example

```typescript
// Example usage with raw ANSI
import { success, error, warning, info, highlight, createSpinner } from './utils/ansi-helpers';

function demonstrateRawAnsi() {
  console.log(success('Operation completed successfully!'));
  console.log(error('Failed to connect to API'));
  console.log(warning('This is a deprecated feature'));
  console.log(info('Processing 1,234 records...'));
  console.log(`Welcome to ${highlight('Make It Heavy')} CLI!`);

  // Simple loading demonstration
  const stopSpinner = createSpinner('Fetching data from API...');
  setTimeout(() => {
    stopSpinner();
    console.log(success('Data fetched successfully!'));
  }, 3000);
}
```

## Leveraging Modern Libraries

While raw ANSI codes work, modern libraries provide better cross-platform support, more features, and cleaner APIs.

### 1. picocolors - Fast and Lightweight Text Styling

```bash
bun add picocolors
```

```typescript
// src/utils/colors.ts
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
```

### 2. ora - Elegant Loading Spinners

```bash
bun add ora
```

```typescript
// src/utils/spinner.ts
import ora, { Ora } from 'ora';

export interface SpinnerOptions {
  text: string;
  color?: 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray';
  spinner?: string;
}

export function createLoadingSpinner(options: SpinnerOptions): Ora {
  const spinner = ora({
    text: options.text,
    color: options.color || 'cyan',
    spinner: options.spinner || 'dots',
  });
  
  return spinner;
}

// Helper function for async operations with spinner
export async function withSpinner<T>(
  options: SpinnerOptions,
  operation: () => Promise<T>
): Promise<T> {
  const spinner = createLoadingSpinner(options);
  spinner.start();

  try {
    const result = await operation();
    spinner.succeed(`${options.text} - Completed!`);
    return result;
  } catch (error) {
    spinner.fail(`${options.text} - Failed!`);
    throw error;
  }
}

// Multi-step process spinner
export class ProcessSpinner {
  private spinner: Ora;
  private steps: string[];
  private currentStep: number = 0;

  constructor(steps: string[]) {
    this.steps = steps;
    this.spinner = ora();
  }

  start(): void {
    if (this.steps.length > 0) {
      this.spinner.start(this.steps[0]);
    }
  }

  nextStep(): void {
    this.currentStep++;
    if (this.currentStep < this.steps.length) {
      this.spinner.text = this.steps[this.currentStep];
    }
  }

  succeed(message?: string): void {
    this.spinner.succeed(message || 'Process completed successfully!');
  }

  fail(message?: string): void {
    this.spinner.fail(message || 'Process failed!');
  }

  stop(): void {
    this.spinner.stop();
  }
}
```

### 3. boxen - Beautiful Boxes and Panels

```bash
bun add boxen
```

```typescript
// src/utils/boxes.ts
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
```

### 4. cli-table3 - Professional Data Tables

```bash
bun add cli-table3
```

```typescript
// src/utils/tables.ts
import Table from 'cli-table3';
import pc from 'picocolors';

export interface TableColumn {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TableOptions {
  title?: string;
  columns: TableColumn[];
  data: Record<string, any>[];
  colorHeaders?: boolean;
  alternateRows?: boolean;
}

export function createTable(options: TableOptions): string {
  const { columns, data, colorHeaders = true, alternateRows = true } = options;

  const table = new Table({
    head: columns.map(col => colorHeaders ? pc.bold(pc.cyan(col.label)) : col.label),
    colWidths: columns.map(col => col.width),
    colAligns: columns.map(col => col.align || 'left'),
    style: {
      head: [],
      border: ['gray'],
    },
  });

  data.forEach((row, index) => {
    const tableRow = columns.map(col => {
      const value = String(row[col.key] || '');
      return alternateRows && index % 2 === 1 ? pc.dim(value) : value;
    });
    table.push(tableRow);
  });

  return table.toString();
}

// Specialized table for API responses
export function createApiResponseTable(data: any[]): string {
  if (!data || data.length === 0) {
    return pc.yellow('No data to display');
  }

  // Auto-detect columns from first item
  const firstItem = data[0];
  const columns: TableColumn[] = Object.keys(firstItem).map(key => ({
    key,
    label: key.toUpperCase(),
    width: Math.max(key.length + 2, 15),
  }));

  return createTable({
    columns,
    data,
    colorHeaders: true,
    alternateRows: true,
  });
}

// Summary table for statistics
export function createSummaryTable(stats: Record<string, string | number>): string {
  const table = new Table({
    style: {
      head: [],
      border: ['cyan'],
    },
  });

  Object.entries(stats).forEach(([key, value]) => {
    table.push([pc.bold(key), pc.green(String(value))]);
  });

  return table.toString();
}

// Progress table for multi-agent status
export function createProgressTable(agents: Array<{
  id: string;
  status: string;
  progress?: number;
  message?: string;
}>): string {
  const table = new Table({
    head: [
      pc.bold(pc.cyan('Agent')),
      pc.bold(pc.cyan('Status')),
      pc.bold(pc.cyan('Progress')),
      pc.bold(pc.cyan('Message'))
    ],
    colWidths: [10, 12, 12, 40],
    style: {
      head: [],
      border: ['gray'],
    },
  });

  agents.forEach(agent => {
    const statusColor = agent.status === 'COMPLETED' ? pc.green :
                       agent.status === 'FAILED' ? pc.red :
                       agent.status === 'PROCESSING' ? pc.yellow :
                       pc.dim;

    const progressBar = agent.progress !== undefined 
      ? `${'█'.repeat(Math.floor(agent.progress / 10))}${'░'.repeat(10 - Math.floor(agent.progress / 10))} ${agent.progress}%`
      : 'N/A';

    table.push([
      pc.bold(agent.id),
      statusColor(agent.status),
      pc.cyan(progressBar),
      pc.dim(agent.message || '')
    ]);
  });

  return table.toString();
}
```

## Best Practices for CLI UI/UX

### 1. Environment Awareness and Graceful Degradation

```typescript
// src/utils/environment.ts
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
    supportsUnicode: !process.env.ASCII_ONLY && process.env.LANG?.includes('UTF-8'),
    isInteractive: process.stdout.isTTY && process.stdin.isTTY,
    width: process.stdout.columns || 80,
    height: process.stdout.rows || 24,
  };
}

// Safe wrapper for styled output
export function renderForTerminal(
  styledContent: string,
  plainContent: string,
  capabilities: TerminalCapabilities = getTerminalCapabilities()
): string {
  if (!capabilities.supportsColor) {
    return plainContent;
  }
  return styledContent;
}

// Unicode-aware symbols
export function getSymbols(capabilities: TerminalCapabilities = getTerminalCapabilities()) {
  if (!capabilities.supportsUnicode) {
    return {
      success: '[OK]',
      error: '[ERR]',
      warning: '[WARN]',
      info: '[INFO]',
      loading: '...',
      arrow: '->',
      bullet: '*',
    };
  }

  return {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    loading: '⠋',
    arrow: '→',
    bullet: '•',
  };
}
```

### 2. Consistent Color Semantics

```typescript
// src/utils/semantic-colors.ts
import pc from 'picocolors';
import { getTerminalCapabilities, renderForTerminal } from './environment';

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
  const capabilities = getTerminalCapabilities();
  const colorFn = semanticColors[type];
  return renderForTerminal(colorFn(text), text, capabilities);
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

  const colors = {
    success: semanticColors.success,
    error: semanticColors.error,
    warning: semanticColors.warning,
    info: semanticColors.info,
    loading: semanticColors.info,
  };

  const symbol = symbols[status];
  const colorFn = colors[status];
  
  return `${colorFn(symbol)} ${message}`;
}
```

### 3. Responsive Layout Functions

```typescript
// src/utils/layout.ts
import { getTerminalCapabilities } from './environment';

export function centerText(text: string, width?: number): string {
  const termWidth = width || getTerminalCapabilities().width;
  const textLength = text.replace(/\x1b\[[0-9;]*m/g, '').length; // Remove ANSI codes for length calc
  const padding = Math.max(0, Math.floor((termWidth - textLength) / 2));
  return ' '.repeat(padding) + text;
}

export function wrapText(text: string, width?: number): string[] {
  const termWidth = width || getTerminalCapabilities().width - 4; // Leave some margin
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= termWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

export function createSeparator(char: string = '─', width?: number): string {
  const termWidth = width || getTerminalCapabilities().width;
  return char.repeat(termWidth);
}

export function createHeader(title: string, subtitle?: string): string {
  const capabilities = getTerminalCapabilities();
  const separator = createSeparator('=', capabilities.width);
  
  let header = separator + '\n';
  header += centerText(title.toUpperCase()) + '\n';
  
  if (subtitle) {
    header += centerText(subtitle) + '\n';
  }
  
  header += separator;
  return header;
}
```

## Complete Example Implementation

Here's a complete example that demonstrates all the concepts together:

```typescript
// src/example-cli.ts
import { withSpinner, ProcessSpinner } from './utils/spinner';
import { logSuccess, logError, logWarning, logInfo } from './utils/colors';
import { successBox, errorBox, resultsBox, configBox } from './utils/boxes';
import { createApiResponseTable, createSummaryTable } from './utils/tables';
import { statusIndicator } from './utils/semantic-colors';
import { createHeader } from './utils/layout';

interface ApiResponse {
  id: string;
  name: string;
  status: string;
  value: number;
}

// Mock API function
async function fetchApiData(): Promise<ApiResponse[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate occasional failures
  if (Math.random() < 0.1) {
    throw new Error('Network timeout - please try again');
  }

  return [
    { id: '001', name: 'Alpha Service', status: 'active', value: 142 },
    { id: '002', name: 'Beta Process', status: 'pending', value: 89 },
    { id: '003', name: 'Gamma Handler', status: 'active', value: 256 },
    { id: '004', name: 'Delta Monitor', status: 'inactive', value: 0 },
  ];
}

export async function runExampleCLI(): Promise<void> {
  try {
    // Display header
    console.log(createHeader('API Data Fetcher', 'Demonstration CLI Tool'));
    console.log();

    // Show configuration
    const config = {
      'API Endpoint': 'https://api.example.com/data',
      'Timeout': '30s',
      'Retry Attempts': '3',
      'Output Format': 'table',
    };
    console.log(configBox(config));
    console.log();

    // Phase 1: Initialization
    logInfo('Initializing API client...');
    await new Promise(resolve => setTimeout(resolve, 500));
    logSuccess('API client initialized successfully');
    console.log();

    // Phase 2: Multi-step process with spinner
    const processSpinner = new ProcessSpinner([
      'Connecting to API...',
      'Authenticating...',
      'Fetching data...',
      'Processing results...'
    ]);

    processSpinner.start();

    // Step 1: Connection
    await new Promise(resolve => setTimeout(resolve, 800));
    processSpinner.nextStep();

    // Step 2: Authentication  
    await new Promise(resolve => setTimeout(resolve, 600));
    processSpinner.nextStep();

    // Step 3: Data fetching
    let apiData: ApiResponse[];
    try {
      apiData = await fetchApiData();
      processSpinner.nextStep();
      
      // Step 4: Processing
      await new Promise(resolve => setTimeout(resolve, 400));
      processSpinner.succeed('All operations completed successfully!');
    } catch (error) {
      processSpinner.fail('Failed to fetch data from API');
      throw error;
    }

    console.log();

    // Display results in a beautiful table
    logSuccess(`Successfully fetched ${apiData.length} records`);
    console.log();

    const tableOutput = createApiResponseTable(apiData);
    console.log(resultsBox(tableOutput));

    // Display summary statistics
    const stats = {
      'Total Records': apiData.length,
      'Active Services': apiData.filter(item => item.status === 'active').length,
      'Pending Services': apiData.filter(item => item.status === 'pending').length,
      'Inactive Services': apiData.filter(item => item.status === 'inactive').length,
      'Total Value': apiData.reduce((sum, item) => sum + item.value, 0),
    };

    console.log('\n📈 Summary Statistics:');
    console.log(createSummaryTable(stats));

    // Final success message
    console.log();
    console.log(successBox(
      'Data fetching operation completed successfully!\nAll services have been analyzed and processed.',
      'Operation Complete'
    ));

  } catch (error) {
    console.log();
    console.log(errorBox(
      `Operation failed: ${(error as Error).message}\n\nPlease check your network connection and try again.`,
      'Error'
    ));
    
    logError('CLI operation terminated due to error');
    process.exit(1);
  }
}

// Alternative example using the simpler withSpinner utility
export async function simpleExample(): Promise<void> {
  console.log(createHeader('Simple Spinner Example'));
  console.log();

  try {
    const data = await withSpinner(
      { text: 'Fetching user data from API...', color: 'cyan' },
      () => fetchApiData()
    );

    console.log();
    logSuccess(`Successfully fetched ${data.length} records`);
    console.log(createApiResponseTable(data));

  } catch (error) {
    logError(`Failed to fetch data: ${(error as Error).message}`);
  }
}
```

### Integration Example

```typescript
// src/enhanced-cli.ts - Enhanced version of your existing CLI
import { createHeader, centerText } from './utils/layout';
import { successBox, configBox, errorBox } from './utils/boxes';
import { logInfo, logSuccess, logError } from './utils/colors';
import { createProgressTable } from './utils/tables';
import { ProcessSpinner } from './utils/spinner';
import { getTerminalCapabilities } from './utils/environment';

export function enhancedStartCLI(): void {
  const capabilities = getTerminalCapabilities();
  
  // Enhanced header display
  console.log(createHeader('Make It Heavy', 'Multi-Agent Orchestrator'));
  console.log();

  // Configuration display
  const configDisplay = {
    'Model': config.openrouter.model,
    'Parallel Agents': config.orchestrator.parallel_agents.toString(),
    'Max Iterations': config.agent.max_iterations.toString(),
    'Task Timeout': config.orchestrator.task_timeout.toString(),
  };
  
  console.log(configBox(configDisplay));
  console.log();

  logInfo('Orchestrator initialized successfully!');
  logInfo('Type your question or command to begin analysis');
  logInfo("Enter 'quit', 'exit', or 'bye' to exit");
  console.log();

  // Rest of your CLI logic...
}

export function enhancedUpdateDisplay(
  running: boolean,
  startTime: number | null,
  progress: AgentProgressStatus[],
  numAgents: number,
  modelDisplay: string
): void {
  const capabilities = getTerminalCapabilities();
  
  // Clear previous display
  if (capabilities.isInteractive) {
    console.clear();
  }

  // Show header
  console.log(centerText(`🤖 ${modelDisplay}`));
  console.log();

  // Show timing info
  const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
  const timeStr = formatTime(elapsed);
  const statusText = running ? '🟢 RUNNING' : '✅ COMPLETED';
  console.log(centerText(`${statusText} • ${timeStr}`));
  console.log();

  // Create agent progress data
  const agentData = progress.map((status, index) => ({
    id: `AGENT-${String(index + 1).padStart(2, '0')}`,
    status: status || 'QUEUED',
    progress: status === 'COMPLETED' ? 100 : 
             status === 'PROCESSING' ? Math.floor((Date.now() / 100) % 100) : 0,
    message: status === 'FAILED' ? 'Process failed' : 
             status === 'PROCESSING' ? 'Analyzing data...' : 
             status === 'COMPLETED' ? 'Analysis complete' : 'Waiting...'
  }));

  // Display progress table
  console.log(createProgressTable(agentData));
  console.log();

  if (!running && elapsed > 0) {
    logSuccess('All agents have completed their analysis!');
  }
}
```

## Summary

This guide provides you with:

1. **Raw ANSI Control**: Direct terminal control for maximum flexibility
2. **Modern Library Integration**: Professional tools for common CLI needs
3. **Environment Awareness**: Graceful degradation for different terminal capabilities
4. **Semantic Design**: Consistent color usage and meaningful visual hierarchy
5. **Responsive Layout**: Adaptive content that works across terminal sizes
6. **Complete Examples**: Real-world implementation patterns

### Key Takeaways:

- Always respect `NO_COLOR` environment variable and TTY detection
- Use semantic colors consistently (green=success, red=error, etc.)
- Provide both styled and plain text fallbacks
- Structure your CLI output with clear visual hierarchy
- Use loading indicators for any operation taking more than 200ms
- Display data in tables when dealing with structured information
- Wrap important information in boxes for emphasis

By following these patterns, you'll create CLI tools that are not only functional but also provide an excellent user experience across different terminal environments.