import { orchestrate, getProgressStatus } from "./orchestrator";
import readline from "readline";
import { saveHeavyModeOutput } from "./utils/file-saver";
import config from "../config";
import {
  enhancedUpdateDisplay,
  enhancedStartupDisplay,
  displayFinalResults,
  startProgressMonitor
} from "./utils/enhanced-cli-display";
import { logError, logInfo, statusIndicator } from "./utils/cli-styling";

// Enhanced version of the CLI using the new styling utilities
async function startEnhancedCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let startTime: number | null = null;
  let running: boolean = false;
  let stopProgressMonitor: (() => void) | null = null;

  // Process model name for display
  const modelFull = config.openrouter.model;
  const modelName = modelFull.includes("/")
    ? modelFull.split("/").pop()
    : modelFull;
  const modelParts = modelName?.split("-") || [];
  const cleanName =
    modelParts.length >= 3 ? modelParts.slice(0, 3).join("-") : modelName;
  const modelDisplay = (cleanName || "UNKNOWN").toUpperCase() + " HEAVY";

  // Enhanced startup display
  enhancedStartupDisplay(config.orchestrator.parallel_agents, config.openrouter.model, {
    "Task Timeout": `${config.orchestrator.task_timeout}s`,
    "API Key": config.openrouter.api_key ? "Configured" : "Missing",
  });

  // Set up readline prompt
  rl.setPrompt("]> ");
  rl.prompt();

  rl.on("line", async (input) => {
    const trimmedInput = input.trim();

    // Handle exit commands
    if (["quit", "exit", "bye"].includes(trimmedInput.toLowerCase())) {
      if (stopProgressMonitor) stopProgressMonitor();
      console.log();
      console.log(statusIndicator('info', 'Shutting down orchestrator...'));
      console.log(statusIndicator('success', 'Goodbye! Thanks for using Make It Heavy!'));
      rl.close();
      return;
    }

    // Handle help command
    if (trimmedInput.toLowerCase() === "help") {
      displayHelp();
      rl.prompt();
      return;
    }

    // Handle empty input
    if (!trimmedInput) {
      logInfo("Please enter a question or command, or type 'help' for assistance.");
      rl.prompt();
      return;
    }

    // Start orchestration
    console.log();
    logInfo("Starting multi-agent analysis...");
    console.log();

    startTime = Date.now();
    running = true;

    // Start enhanced progress monitoring
    stopProgressMonitor = startProgressMonitor(
      () => ({
        running,
        startTime,
        progress: Object.values(getProgressStatus()),
        numAgents: config.orchestrator.parallel_agents,
        modelDisplay
      }),
      rl,
      { compactMode: false, showConfig: false }
    );

    try {
      const result = await orchestrate(trimmedInput);
      running = false;

      if (stopProgressMonitor) {
        stopProgressMonitor();
        stopProgressMonitor = null;
      }

      // Calculate final statistics
      const executionTime = startTime ? (Date.now() - startTime) / 1000 : 0;
      const progressStatuses = Object.values(getProgressStatus());
      const successfulAgents = progressStatuses.filter(s => s === 'COMPLETED').length;
      const failedAgents = progressStatuses.filter(s => s === 'FAILED').length;

      // Display enhanced final results
      displayFinalResults(trimmedInput, result, {
        executionTime,
        agentsUsed: config.orchestrator.parallel_agents,
        successfulAgents,
        failedAgents
      });

      // Save output
      try {
        await saveHeavyModeOutput(trimmedInput, result);
        logInfo("Results saved to output directory");
      } catch (error) {
        logError(`Failed to save results: ${(error as Error).message}`);
      }

    } catch (error) {
      running = false;
      if (stopProgressMonitor) {
        stopProgressMonitor();
        stopProgressMonitor = null;
      }

      console.log();
      logError(`Orchestration failed: ${(error as Error).message}`);
      console.log();
      logInfo("Please check your configuration and try again, or type 'help' for assistance.");
    } finally {
      console.log();
      rl.prompt();
    }
  });

  rl.on("close", () => {
    if (stopProgressMonitor) stopProgressMonitor();
    console.log();
    console.log(statusIndicator('success', 'Session ended. Thank you for using Make It Heavy!'));
    process.exit(0);
  });

  // Handle process interruption
  process.on('SIGINT', () => {
    if (stopProgressMonitor) stopProgressMonitor();
    console.log();
    console.log(statusIndicator('info', 'Shutting down gracefully...'));
    rl.close();
  });
}

// Display help information with enhanced styling
function displayHelp(): void {
  const { createHeader, textBox } = require('./utils/cli-styling');

  console.log();
  console.log(createHeader('Help & Commands', 'Make It Heavy CLI Assistant'));
  console.log();

  const helpContent = [
    '🎯 Available Commands:',
    '',
    '  help                Show this help message',
    '  quit, exit, bye     Exit the application',
    '  <your question>     Start multi-agent analysis',
    '',
    '💡 Tips:',
    '',
    '  • Ask complex questions that benefit from multiple perspectives',
    '  • Be specific about what kind of analysis you need',
    '  • The system works best with research and analytical tasks',
    '',
    '⚙️ Current Configuration:',
    '',
    `  • Model: ${config.openrouter.model}`,
    `  • Parallel Agents: ${config.orchestrator.parallel_agents}`,
    `  • Task Timeout: ${config.orchestrator.task_timeout}s`,
    '',
    '🔗 Examples:',
    '',
    '  "Analyze the pros and cons of renewable energy"',
    '  "Compare different programming paradigms"',
    '  "Research the latest trends in AI development"'
  ].join('\n');

  console.log(textBox(helpContent, {
    title: '📖 Help Guide',
    color: 'cyan',
    style: 'round'
  }));
  console.log();
}

// Simple mode version with minimal styling
async function startSimpleCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Make It Heavy - Simple Mode");
  console.log(`Using ${config.orchestrator.parallel_agents} parallel agents`);
  console.log("Type 'quit' to exit");
  console.log("-".repeat(50));

  rl.setPrompt("]> ");
  rl.prompt();

  rl.on("line", async (input) => {
    if (["quit", "exit", "bye"].includes(input.toLowerCase())) {
      rl.close();
      return;
    }

    if (!input.trim()) {
      console.log("Please enter a question.");
      rl.prompt();
      return;
    }

    console.log("\nStarting analysis...");

    try {
      const result = await orchestrate(input);

      console.log("\n" + "=".repeat(80));
      console.log("RESULTS");
      console.log("=".repeat(80));
      console.log(result);
      console.log("=".repeat(80));

      try {
        await saveHeavyModeOutput(input, result);
      } catch (error) {
        console.error("Error saving output:", error);
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    } finally {
      rl.prompt();
    }
  });

  rl.on("close", () => {
    console.log("Goodbye!");
    process.exit(0);
  });
}

// Main entry point
async function main() {
  const args = process.argv.slice(2);
  const useSimpleMode = args.includes('--simple') || args.includes('-s');
  const useEnhancedMode = args.includes('--enhanced') || args.includes('-e');

  if (useSimpleMode) {
    await startSimpleCLI();
  } else if (useEnhancedMode || !process.env.NO_COLOR) {
    // Use enhanced mode by default if colors are supported
    await startEnhancedCLI();
  } else {
    // Fallback to simple mode in no-color environments
    await startSimpleCLI();
  }
}

// Export functions for use in other modules
export {
  startEnhancedCLI,
  startSimpleCLI,
  displayHelp,
  main as startIntegratedCLI
};

// Auto-start if this file is run directly
if (import.meta.main) {
  main().catch(error => {
    console.error('Failed to start CLI:', error);
    process.exit(1);
  });
}
