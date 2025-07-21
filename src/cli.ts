import readline from "readline";
import { TaskOrchestrator } from "./orchestrator-clean";
import config from "../config";

export class OrchestratorCLI {
  private orchestrator: TaskOrchestrator;
  private startTime: number | null = null;
  private running = false;
  private modelDisplay: string;

  constructor() {
    this.orchestrator = new TaskOrchestrator();

    // Extract model name for display
    const modelFull = config.openrouter.model;
    let modelName = modelFull;
    if (modelFull.includes("/")) {
      modelName = modelFull.split("/").pop() || modelFull;
    }
    modelName = modelName.toUpperCase().replace(/[_-]/g, "-");
    this.modelDisplay = `MAKE IT HEAVY • ${modelName}`;
  }

  private clearScreen(): void {
    // Use proper terminal clearing to prevent flickering
    process.stdout.write("\x1b[2J\x1b[0f");
  }

  private formatTime(seconds: number): string {
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

  private createProgressBar(status: string): string {
    // ANSI color codes
    const ORANGE = "\x1b[38;5;208m";
    const RED = "\x1b[91m";
    const RESET = "\x1b[0m";

    switch (status) {
      case "QUEUED":
        return "○ " + "·".repeat(70);
      case "INITIALIZING":
        return `${ORANGE}◐${RESET} ` + "·".repeat(70);
      case "PROCESSING":
        return (
          `${ORANGE}●${RESET} ` +
          `${ORANGE}:${RESET}`.repeat(10) +
          "·".repeat(60)
        );
      case "COMPLETED":
        return `${ORANGE}●${RESET} ` + `${ORANGE}:${RESET}`.repeat(70);
      case "FAILED":
        return `${RED}✗${RESET} ` + `${RED}×${RESET}`.repeat(70);
      default:
        return `${ORANGE}◐${RESET} ` + "·".repeat(70);
    }
  }

  private updateDisplay(): void {
    if (!this.running) {
      return;
    }

    // Calculate elapsed time
    const elapsed = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
    const timeStr = this.formatTime(elapsed);

    // Get current progress
    const progress = this.orchestrator.getProgressStatus();

    // Clear screen properly
    this.clearScreen();

    // Header with dynamic model name
    console.log(this.modelDisplay);
    if (this.running) {
      console.log(`● RUNNING • ${timeStr}`);
    } else {
      console.log(`● COMPLETED • ${timeStr}`);
    }
    console.log();

    // Agent status lines
    for (let i = 0; i < this.orchestrator.getNumAgents(); i++) {
      const status = progress[i] || "QUEUED";
      const progressBar = this.createProgressBar(status);
      const agentNum = (i + 1).toString().padStart(2, "0");
      console.log(`AGENT ${agentNum}  ${progressBar}`);
    }

    console.log();
    // Ensure output is written immediately
    process.stdout.write("");
  }

  private async progressMonitor(): Promise<void> {
    while (this.running) {
      this.updateDisplay();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Update every 1 second
    }
  }

  public async runTask(userInput: string): Promise<string | null> {
    this.startTime = Date.now();
    this.running = true;

    // Start progress monitoring in background
    const progressPromise = this.progressMonitor();

    try {
      // Run the orchestrator
      const result = await this.orchestrator.orchestrate(userInput);

      // Stop progress monitoring
      this.running = false;

      // Final display update
      this.updateDisplay();

      // Show results
      console.log("=".repeat(80));
      console.log("FINAL RESULTS");
      console.log("=".repeat(80));
      console.log();
      console.log(result);
      console.log();
      console.log("=".repeat(80));

      return result;
    } catch (error) {
      this.running = false;
      this.updateDisplay();
      console.log(`\nError during orchestration: ${(error as Error).message}`);
      return null;
    } finally {
      // Ensure progress monitoring stops
      this.running = false;
      await progressPromise;
    }
  }

  public async interactiveMode(): Promise<void> {
    console.log("Multi-Agent Orchestrator");
    console.log(
      `Configured for ${this.orchestrator.getNumAgents()} parallel agents`,
    );
    console.log("Type 'quit', 'exit', or 'bye' to exit");
    console.log("-".repeat(50));

    try {
      // Validate API key
      if (
        !config.openrouter.api_key ||
        config.openrouter.api_key === "YOUR KEY"
      ) {
        console.log("❌ ERROR: OpenRouter API key not configured!");
        console.log("Make sure you have:");
        console.log(
          "1. Set your OpenRouter API key as OPENROUTER_API_KEY environment variable, or",
        );
        console.log("2. Updated the api_key in config.ts");
        console.log("3. Get your API key from: https://openrouter.ai/keys");
        return;
      }

      console.log(`Using model: ${config.openrouter.model}`);
      console.log("Orchestrator initialized successfully!");
      console.log("-".repeat(50));
    } catch (error) {
      console.log(`Error initializing orchestrator: ${error}`);
      console.log("Make sure you have:");
      console.log("1. Set your OpenRouter API key properly");
      console.log("2. Installed all dependencies with: bun install");
      return;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    while (true) {
      try {
        const userInput = await new Promise<string>((resolve) => {
          rl.question("\nUser: ", resolve);
        });

        const trimmedInput = userInput.trim();

        if (
          trimmedInput.toLowerCase() === "quit" ||
          trimmedInput.toLowerCase() === "exit" ||
          trimmedInput.toLowerCase() === "bye"
        ) {
          console.log("Goodbye!");
          break;
        }

        if (
          trimmedInput.toLowerCase() === "help" ||
          trimmedInput === "--help" ||
          trimmedInput === "-h"
        ) {
          displayHelp();
          continue;
        }

        if (!trimmedInput) {
          console.log("Please enter a question or command.");
          continue;
        }

        console.log("\nOrchestrator: Starting multi-agent analysis...");
        console.log();

        // Run task with live progress
        const result = await this.runTask(trimmedInput);

        if (result === null) {
          console.log("Task failed. Please try again.");
        }
      } catch (error) {
        if (error instanceof Error && error.message === "interrupted") {
          console.log("\n\nExiting...");
          break;
        }
        console.log(`Error: ${error}`);
        console.log("Please try again or type 'quit' to exit.");
      }
    }

    rl.close();
  }
}

function displayHelp(): void {
  console.log("Multi-Agent Orchestrator");
  console.log("Type 'quit', 'exit', or 'bye' to exit");
  console.log("-".repeat(50));
  console.log();
  console.log("🎯 Available Commands:");
  console.log();
  console.log("  help, --help, -h    Show this help message");
  console.log("  quit, exit, bye     Exit the application");
  console.log("  <your question>     Start multi-agent analysis");
  console.log();
  console.log("💡 Tips:");
  console.log();
  console.log(
    "  • Ask complex questions that benefit from multiple perspectives",
  );
  console.log("  • Be specific about what kind of analysis you need");
  console.log("  • The system works best with research and analytical tasks");
  console.log();
  console.log("⚙️ Current Configuration:");
  console.log();
  console.log(`  • Model: ${config.openrouter.model}`);
  console.log(`  • Parallel Agents: ${config.orchestrator.parallel_agents}`);
  console.log(`  • Task Timeout: ${config.orchestrator.task_timeout}s`);
  console.log();
  console.log("🔗 Examples:");
  console.log();
  console.log('  "Analyze the pros and cons of renewable energy"');
  console.log('  "Compare different programming paradigms"');
  console.log('  "Research the latest trends in AI development"');
  console.log();
  console.log("🐛 Debug Mode:");
  console.log();
  console.log("  Run with DEBUG=true or --debug for detailed logging");
  console.log();
}

export async function main(): Promise<void> {
  const cli = new OrchestratorCLI();

  // Check if we have command line arguments
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // Check for help commands
    if (args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
      displayHelp();
      return;
    }

    // Direct query mode
    const query = args.join(" ");

    // Validate API key before running
    if (
      !config.openrouter.api_key ||
      config.openrouter.api_key === "YOUR KEY"
    ) {
      console.log("❌ ERROR: OpenRouter API key not configured!");
      console.log("Set your API key: export OPENROUTER_API_KEY=your_key_here");
      console.log("Get your API key from: https://openrouter.ai/keys");
      process.exit(1);
    }

    console.log("Multi-Agent Orchestrator");
    console.log(
      `Configured for ${cli["orchestrator"].getNumAgents()} parallel agents`,
    );
    console.log("-".repeat(50));
    console.log();

    const result = await cli.runTask(query);
    if (result === null) {
      process.exit(1);
    }
    process.exit(0);
  } else {
    // Interactive mode
    await cli.interactiveMode();
  }
}
