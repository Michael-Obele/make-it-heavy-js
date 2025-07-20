// Main color utilities and semantic helpers
export {
  colors,
  safeColor,
  logSuccess,
  logError,
  logWarning,
  logInfo,
  semanticColors,
  applySemanticColor,
  statusIndicator,
  type ColorUtils
} from './colors';

// Spinner and loading utilities
export {
  createLoadingSpinner,
  withSpinner,
  ProcessSpinner,
  startSpinner,
  createTimedSpinner,
  type SpinnerOptions
} from './spinner';

// Box and panel utilities
export {
  createBox,
  successBox,
  errorBox,
  warningBox,
  infoBox,
  resultsBox,
  configBox,
  headerBox,
  progressBox,
  statusBox,
  textBox,
  type BoxOptions
} from './boxes';

// Table formatting utilities
export {
  createTable,
  createApiResponseTable,
  createSummaryTable,
  createProgressTable,
  createConfigTable,
  createSimpleTable,
  createResultsTable,
  createStatusTable,
  type TableColumn,
  type TableOptions
} from './tables';

// Layout and terminal utilities
export {
  getTerminalCapabilities,
  renderForTerminal,
  getSymbols,
  centerText,
  wrapText,
  createSeparator,
  createHeader,
  leftAlign,
  rightAlign,
  createTwoColumnLayout,
  createProgressBar,
  createBanner,
  formatTime,
  createStatusLine,
  clearScreen,
  moveCursor,
  clearLine,
  hideCursor,
  showCursor,
  type TerminalCapabilities
} from './layout';

// Re-export picocolors for direct access if needed
export { default as pc } from 'picocolors';
