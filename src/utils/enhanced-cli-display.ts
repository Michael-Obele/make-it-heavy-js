import { AgentProgressStatus } from "../orchestrator";
import * as readline from "readline";
import { logSuccess, logInfo, statusIndicator } from "./cli-styling/colors";
import {
  createProgressTable,
  createStatusTable,
  createSummaryTable,
} from "./cli-styling/tables";
import {
  createHeader,
  centerText,
  formatTime,
  createProgressBar,
  clearScreen,
  getTerminalCapabilities,
  createStatusLine,
} from "./cli-styling/layout";
import { configBox, statusBox, progressBox } from "./cli-styling/boxes";
import pc from "picocolors";

export interface EnhancedDisplayOptions {
  showHeader?: boolean;
  showConfig?: boolean;
  useColors?: boolean;
  compactMode?: boolean;
}

// Enhanced format time function with more detail
export function formatTimeDetailed(seconds: number): string {
  if (seconds < 1) {
    return `${Math.round(seconds * 1000)}ms`;
  } else if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
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

// Create agent progress data from status array
function createAgentProgressData(
  progress: AgentProgressStatus[],
  numAgents: number,
  startTime?: number,
): Array<{
  id: string;
  status: string;
  progress?: number;
  message?: string;
}> {
  const currentTime = Date.now();

  return Array.from({ length: numAgents }, (_, index) => {
    const status = progress[index] || "QUEUED";
    const agentId = `AGENT-${String(index + 1).padStart(2, "0")}`;

    let progressPercentage: number | undefined;
    let message = "";

    switch (status) {
      case "COMPLETED":
        progressPercentage = 100;
        message = "Analysis complete";
        break;
      case "FAILED":
        progressPercentage = 100;
        message = "Process failed - check logs";
        break;
      case "PROCESSING":
        // Simulate dynamic progress based on time
        progressPercentage = startTime
          ? Math.min(
              99,
              Math.floor(((currentTime - startTime) / 1000) * 10) % 100,
            )
          : Math.floor(Math.random() * 80) + 10;
        message = "Analyzing data...";
        break;
      case "QUEUED":
      default:
        progressPercentage = 0;
        message = "Waiting to start";
        break;
    }

    return {
      id: agentId,
      status,
      progress: progressPercentage,
      message,
    };
  });
}

// Calculate overall statistics
function calculateStats(progress: AgentProgressStatus[]): {
  completed: number;
  failed: number;
  processing: number;
  queued: number;
  total: number;
  completionRate: number;
} {
  const stats = {
    completed: 0,
    failed: 0,
    processing: 0,
    queued: 0,
    total: progress.length,
    completionRate: 0,
  };

  progress.forEach((status) => {
    switch (status) {
      case "COMPLETED":
        stats.completed++;
        break;
      case "FAILED":
        stats.failed++;
        break;
      case "PROCESSING":
        stats.processing++;
        break;
      case "QUEUED":
      default:
        stats.queued++;
        break;
    }
  });

  stats.completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return stats;
}

// Enhanced display function with rich formatting
export function enhancedUpdateDisplay(
  running: boolean,
  startTime: number | null,
  progress: AgentProgressStatus[],
  numAgents: number,
  modelDisplay: string,
  rl: readline.Interface,
  options: EnhancedDisplayOptions = {},
): void {
  const capabilities = getTerminalCapabilities();
  const {
    showHeader = true,
    showConfig = false,
    useColors = capabilities.supportsColor,
    compactMode = false,
  } = options;

  // Clear screen for interactive terminals
  if (capabilities.isInteractive && !compactMode) {
    clearScreen();
  } else if (compactMode) {
    // Move cursor up to overwrite previous output
    process.stdout.write("\x1b[10A");
  }

  // Calculate timing and stats
  const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
  const stats = calculateStats(progress);
  const agentData = createAgentProgressData(
    progress,
    numAgents,
    startTime ?? undefined,
  );

  // Header section
  if (showHeader) {
    if (compactMode) {
      console.log(centerText(`🤖 ${modelDisplay}`));
    } else {
      console.log(createHeader("Make It Heavy", "Multi-Agent Orchestrator"));
      console.log();
      console.log(centerText(`🤖 ${modelDisplay}`));
    }
    console.log();
  }

  // Status line
  const statusItems = [
    {
      label: "Status",
      value: running ? "RUNNING" : "COMPLETED",
      color: running ? pc.yellow : pc.green,
    },
    {
      label: "Time",
      value: formatTimeDetailed(elapsed),
      color: pc.cyan,
    },
    {
      label: "Progress",
      value: `${stats.completed}/${stats.total}`,
      color: pc.blue,
    },
  ];

  if (stats.failed > 0) {
    statusItems.push({
      label: "Failed",
      value: stats.failed.toString(),
      color: pc.red,
    });
  }

  console.log(createStatusLine(statusItems));
  console.log();

  // Progress overview
  if (!compactMode) {
    const progressBar = createProgressBar(
      stats.completed,
      stats.total,
      40,
      true,
    );
    console.log(
      progressBox(
        stats.completed,
        stats.total,
        `${stats.processing} agents processing, ${stats.queued} queued`,
      ),
    );
    console.log();
  }

  // Agent progress table
  if (compactMode) {
    // Compact view - just show summary
    const summaryData = {
      Completed: stats.completed,
      Processing: stats.processing,
      Failed: stats.failed,
      Queued: stats.queued,
      "Success Rate": `${stats.completionRate}%`,
    };
    console.log(createSummaryTable(summaryData));
  } else {
    // Full table view
    console.log("📋 Agent Status:");
    console.log(createProgressTable(agentData));
  }

  console.log();

  // Status indicators
  if (running) {
    console.log(
      statusIndicator("loading", "Multi-agent analysis in progress..."),
    );
  } else if (stats.failed > 0) {
    console.log(
      statusIndicator(
        "warning",
        `Analysis completed with ${stats.failed} failed agents`,
      ),
    );
  } else {
    console.log(
      statusIndicator("success", "All agents completed successfully!"),
    );
  }

  console.log();

  // Configuration display (optional)
  if (showConfig && !compactMode) {
    const configData = {
      Model: modelDisplay,
      Agents: numAgents.toString(),
      Elapsed: formatTimeDetailed(elapsed),
      Completion: `${stats.completionRate}%`,
    };
    console.log(configBox(configData));
    console.log();
  }

  // Final status when completed
  if (!running && elapsed > 0) {
    const finalStats = {
      "Total Execution Time": formatTimeDetailed(elapsed),
      "Successful Agents": stats.completed,
      "Failed Agents": stats.failed,
      "Success Rate": `${stats.completionRate}%`,
      "Average Time per Agent": `${formatTimeDetailed(elapsed / numAgents)}`,
    };

    if (!compactMode) {
      const statusDetails = Object.entries(finalStats).reduce(
        (acc, [key, value]) => {
          acc[key] = value.toString();
          return acc;
        },
        {} as Record<string, string>,
      );

      const overallStatus =
        stats.failed === 0
          ? "completed"
          : stats.completed === 0
            ? "failed"
            : "completed";

      console.log(statusBox(overallStatus, statusDetails));
      console.log();
    }

    logSuccess(`Orchestration completed in ${formatTimeDetailed(elapsed)}`);
  }

  // Restore cursor position for readline
  if (capabilities.isInteractive) {
    rl.prompt(true);
  }
}

// Enhanced startup display
export function enhancedStartupDisplay(
  numAgents: number,
  modelName: string,
  config?: Record<string, any>,
): void {
  clearScreen();

  console.log(
    createHeader("🚀 Make It Heavy", "Multi-Agent Orchestration System"),
  );
  console.log();

  // Welcome message
  console.log(centerText("Welcome to the enhanced CLI experience!"));
  console.log();

  // Configuration display
  const displayConfig = {
    Model: modelName,
    "Parallel Agents": numAgents.toString(),
    Status: "Ready",
    Mode: "Interactive",
    ...config,
  };

  console.log(configBox(displayConfig));
  console.log();

  // Instructions
  console.log("🎯 Instructions:");
  console.log("  • Enter your question or task to begin analysis");
  console.log('  • Type "quit", "exit", or "bye" to exit');
  console.log('  • Use "help" for additional commands');
  console.log();

  logInfo("System initialized successfully!");
  logInfo("All agents are ready and waiting for tasks");
  console.log();

  console.log("─".repeat(getTerminalCapabilities().width));
  console.log();
}

// Progress monitor for periodic updates
export function startProgressMonitor(
  getProgressFn: () => {
    running: boolean;
    startTime: number | null;
    progress: AgentProgressStatus[];
    numAgents: number;
    modelDisplay: string;
  },
  rl: readline.Interface,
  options: EnhancedDisplayOptions = {},
): () => void {
  const interval = setInterval(() => {
    const { running, startTime, progress, numAgents, modelDisplay } =
      getProgressFn();

    if (running) {
      enhancedUpdateDisplay(
        running,
        startTime,
        progress,
        numAgents,
        modelDisplay,
        rl,
        options,
      );
    } else {
      clearInterval(interval);
    }
  }, 250); // Update every 250ms for smooth animation

  return () => clearInterval(interval);
}

// Utility function for displaying results
export function displayFinalResults(
  query: string,
  result: string,
  stats: {
    executionTime: number;
    agentsUsed: number;
    successfulAgents: number;
    failedAgents: number;
  },
): void {
  console.log();
  console.log(createHeader("📊 Final Results", "Analysis Complete"));
  console.log();

  // Query info
  console.log("🔍 Query:");
  console.log(`  ${pc.dim(query)}`);
  console.log();

  // Results
  console.log("📝 Analysis Result:");
  console.log("─".repeat(getTerminalCapabilities().width));
  console.log(result);
  console.log("─".repeat(getTerminalCapabilities().width));
  console.log();

  // Statistics
  const summaryStats = {
    "Execution Time": formatTimeDetailed(stats.executionTime),
    "Agents Used": stats.agentsUsed.toString(),
    Successful: stats.successfulAgents.toString(),
    Failed: stats.failedAgents.toString(),
    "Success Rate": `${Math.round((stats.successfulAgents / stats.agentsUsed) * 100)}%`,
  };

  console.log("📈 Summary:");
  console.log(createSummaryTable(summaryStats));
  console.log();
}
