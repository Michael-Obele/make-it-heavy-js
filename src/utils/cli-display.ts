import { AgentProgressStatus } from "../orchestrator";
import * as readline from "readline";
import { ProgressBar } from "@opentf/cli-pbar";

const ORANGE = Bun.color(208);
const RED = Bun.color(91);
const RESET = Bun.color(0);

export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}S`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}M${secs}S`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}H${minutes}M`;
  }
}

let mainProgressBar: ProgressBar;
const agentProgressBars: any[] = []; // Use 'any' for now to bypass strict type checking for the Bar object
let totalLinesDisplayed = 0; // Tracks the total lines occupied by updateDisplay content (including progress bars)

export function updateDisplay(
  running: boolean,
  startTime: number | null,
  progress: AgentProgressStatus[],
  numAgents: number,
  modelDisplay: string,
  rl: readline.Interface
): void {
  if (!mainProgressBar) {
    mainProgressBar = new ProgressBar({
      width: 70,
    });
    mainProgressBar.start(); // Start the main progress bar

    for (let i = 0; i < numAgents; i++) {
      agentProgressBars[i] = mainProgressBar.add({
        total: 100,
        prefix: `AGENT ${String(i + 1).padStart(2, "0")}`,
      });
    }
  }

  for (let i = 0; i < numAgents; i++) {
    const status = progress[i] || "QUEUED";
    const agentBar = agentProgressBars[i];

    if (!agentBar) continue; // Should not happen if initialized correctly

    switch (status) {
      case "COMPLETED":
        agentBar.update({
          value: 100,
          color: ORANGE,
          prefix: `${ORANGE}●${RESET} AGENT ${String(i + 1).padStart(2, "0")}`,
        });
        break;
      case "FAILED":
        agentBar.update({
          value: 100,
          color: RED,
          prefix: `${RED}✗${RESET} AGENT ${String(i + 1).padStart(2, "0")}`,
        });
        break;
      case "PROCESSING":
        const processedLength = Math.floor((Date.now() / 100) % 100);
        agentBar.update({
          value: processedLength,
          color: ORANGE,
          prefix: `${ORANGE}●${RESET} AGENT ${String(i + 1).padStart(2, "0")}`,
        });
        break;
      case "QUEUED":
        agentBar.update({
          value: 0,
          color: RESET,
          prefix: `○ AGENT ${String(i + 1).padStart(2, "0")}`,
        });
        break;
    }
  }

  const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
  const timeStr = formatTime(elapsed);

  // Move cursor up by the total lines displayed in the previous update
  if (totalLinesDisplayed > 0) {
    readline.moveCursor(process.stdout, 0, -totalLinesDisplayed);
  }

  let currentLinesBeingDisplayed = 0;

  // Line 1: modelDisplay
  readline.clearLine(process.stdout, 0); // Clear current line
  readline.cursorTo(process.stdout, 0); // Move cursor to start of line
  process.stdout.write(modelDisplay + "\n");
  currentLinesBeingDisplayed++;

  // Line 2: Running/Completed status
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  if (running) {
    process.stdout.write(`● RUNNING • ${timeStr}\n`);
  } else {
    process.stdout.write(`● COMPLETED • ${timeStr}\n`);
  }
  currentLinesBeingDisplayed++;

  // Line 3: Empty line before progress bars
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write("\n");
  currentLinesBeingDisplayed++;

  // Progress bars (managed by library, take numAgents lines)
  // We assume the library writes these lines and positions the cursor after them.
  currentLinesBeingDisplayed += numAgents;

  // Line 4: Empty line after progress bars
  // This line needs to be cleared and written after the progress bars.
  // Since the progress bars were just updated, the cursor should be right after them.
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write("\n");
  currentLinesBeingDisplayed++;

  // Update the total lines displayed for the next iteration
  totalLinesDisplayed = currentLinesBeingDisplayed;

  // Ensure the cursor is at the bottom of the terminal for the readline prompt
  readline.cursorTo(process.stdout, 0, process.stdout.rows - 1);
  rl.prompt(true);

  if (!running && startTime !== null) {
    mainProgressBar.stop(); // Stop and clear the main progress bar and all agent bars
    // After stopping, the `numAgents` lines for the progress bars should be cleared by the library.
    // We only need to clear the other 4 lines that we manually managed.
    const linesToClearManually = 4; // modelDisplay, status, 2 empty lines

    // Move cursor up by the total lines that were manually managed
    // This assumes the cursor is currently after the last manually managed line.
    readline.moveCursor(process.stdout, 0, -linesToClearManually);
    for (let i = 0; i < linesToClearManually; i++) {
      readline.clearLine(process.stdout, 0);
      if (i < linesToClearManually - 1) {
        readline.moveCursor(process.stdout, 0, 1);
      }
    }
    // After clearing, move cursor back to the prompt line
    totalLinesDisplayed = 0; // Reset line count as display is cleared
    return;
  }

  // After clearing, move cursor back to the prompt line
  readline.cursorTo(process.stdout, 0, process.stdout.rows - 1);
  rl.prompt(true);
}
