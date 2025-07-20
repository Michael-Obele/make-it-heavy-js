import { orchestrate, getProgressStatus } from "./orchestrator";
import { runSimpleResearchWithDisplay } from "./simple-research";
import readline from "readline";
import { saveHeavyModeOutput } from "./utils/file-saver";
import config from "../config";
import {
  enhancedUpdateDisplay,
  enhancedStartupDisplay,
  displayFinalResults,
  startProgressMonitor,
} from "./utils/enhanced-cli-display";
import { logError, logInfo, statusIndicator } from "./utils/cli-styling";

async function runDirectQuery(query: string) {
  try {
    // Use simple, reliable research mode
    console.log("🔬 Using Reliable Research Mode");
    const result = await runSimpleResearchWithDisplay(query);

    // Save output
    try {
      await saveHeavyModeOutput(query, result);
      logInfo("Results saved to output directory");
    } catch (error) {
      logError(`Failed to save results: ${(error as Error).message}`);
    }

    return result;
  } catch (error) {
    console.log();
    logError(`Research failed: ${(error as Error).message}`);
    console.log("🔄 Trying fallback orchestration...");

    try {
      // Fallback to original orchestration if simple mode fails
      return await orchestrate(query);
    } catch (fallbackError) {
      logError(
        `All research methods failed: ${(fallbackError as Error).message}`,
      );
      throw error;
    }
  }
}

async function startCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let startTime: number | null = null;
  let running: boolean = false;
  let stopProgressMonitor: (() => void) | null = null;

  const modelFull = config.openrouter.model;
  const modelName = modelFull.includes("/")
    ? modelFull.split("/").pop()
    : modelFull;
  const modelParts = modelName?.split("-") || [];
  const cleanName =
    modelParts.length >= 3 ? modelParts.slice(0, 3).join("-") : modelName;
  const modelDisplay = (cleanName || "UNKNOWN").toUpperCase() + " HEAVY";

  // Enhanced startup display
  enhancedStartupDisplay(
    config.orchestrator.parallel_agents,
    config.openrouter.model,
    {
      "Task Timeout": `${config.orchestrator.task_timeout}s`,
      "API Key": config.openrouter.api_key ? "Configured" : "Missing",
    },
  );

  // Set up readline prompt
  rl.setPrompt("]> ");
  rl.prompt();

  rl.on("line", async (input) => {
    const trimmedInput = input.trim();

    // Handle exit commands
    if (["quit", "exit", "bye"].includes(trimmedInput.toLowerCase())) {
      if (stopProgressMonitor) stopProgressMonitor();
      console.log();
      console.log(statusIndicator("info", "Shutting down orchestrator..."));
      console.log(
        statusIndicator("success", "Goodbye! Thanks for using Make It Heavy!"),
      );
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
      logInfo(
        "Please enter a question or command, or type 'help' for assistance.",
      );
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
        modelDisplay,
      }),
      rl,
      { compactMode: false, showConfig: false },
    );

    try {
      // Use simple, reliable research mode
      console.log("🔬 Using Reliable Research Mode");
      const result = await runSimpleResearchWithDisplay(trimmedInput);
      running = false;

      if (stopProgressMonitor) {
        stopProgressMonitor();
        stopProgressMonitor = null;
      }

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
      logError(`Research failed: ${(error as Error).message}`);
      console.log();
      logInfo(
        "Please check your configuration and try again, or type 'help' for assistance.",
      );
    } finally {
      console.log();
      rl.prompt();
    }
  });

  rl.on("close", () => {
    if (stopProgressMonitor) stopProgressMonitor();
    console.log();
    console.log(
      statusIndicator(
        "success",
        "Session ended. Thank you for using Make It Heavy!",
      ),
    );
    process.exit(0);
  });

  // Handle process interruption
  process.on("SIGINT", () => {
    if (stopProgressMonitor) stopProgressMonitor();
    console.log();
    console.log(statusIndicator("info", "Shutting down gracefully..."));
    rl.close();
  });
}

// Display help information with enhanced styling
function displayHelp(): void {
  const { createHeader, textBox } = require("./utils/cli-styling");

  console.log();
  console.log(createHeader("Help & Commands", "Make It Heavy CLI Assistant"));
  console.log();

  const helpContent = [
    "🎯 Available Commands:",
    "",
    "  help                Show this help message",
    "  quit, exit, bye     Exit the application",
    "  <your question>     Start multi-agent analysis",
    "",
    "💡 Tips:",
    "",
    "  • Ask complex questions that benefit from multiple perspectives",
    "  • Be specific about what kind of analysis you need",
    "  • The system works best with research and analytical tasks",
    "",
    "⚙️ Current Configuration:",
    "",
    `  • Model: ${config.openrouter.model}`,
    `  • Parallel Agents: ${config.orchestrator.parallel_agents}`,
    `  • Task Timeout: ${config.orchestrator.task_timeout}s`,
    "",
    "🔗 Examples:",
    "",
    '  "Analyze the pros and cons of renewable energy"',
    '  "Compare different programming paradigms"',
    '  "Research the latest trends in AI development"',
  ].join("\n");

  console.log(
    textBox(helpContent, {
      title: "📖 Help Guide",
      color: "cyan",
      style: "round",
    }),
  );
  console.log();
}

// Check if command line arguments are provided
const args = process.argv.slice(2);
if (args.length > 0) {
  // Run with command line argument
  const query = args.join(" ");
  runDirectQuery(query)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error.message);
      process.exit(1);
    });
} else {
  // Run in interactive mode
  startCLI();
}
