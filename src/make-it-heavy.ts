import { orchestrate, getProgressStatus } from "./orchestrator";
import readline from "readline";
import { saveHeavyModeOutput } from "./utils/file-saver";
import config from "../config";
import { updateDisplay } from "./utils/cli-display";

async function startCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let startTime: number | null = null;
  let running: boolean = false;
  let progressInterval: NodeJS.Timeout | null = null;

  const modelFull = config.openrouter.model;
  const modelName = modelFull.includes("/")
    ? modelFull.split("/").pop()
    : modelFull;
  const modelParts = modelName?.split("-") || [];
  const cleanName =
    modelParts.length >= 3 ? modelParts.slice(0, 3).join("-") : modelName;
  const modelDisplay = (cleanName || "UNKNOWN").toUpperCase() + " HEAVY";

  function initialDisplay(): void {
    console.log("Multi-Agent Orchestrator");
    console.log(
      `Configured for ${config.orchestrator.parallel_agents} parallel agents`
    );
    console.log("Type 'quit', 'exit', or 'bye' to exit");
    console.log("-".repeat(50));
    console.log(`Using model: ${config.openrouter.model}`);
    console.log("Orchestrator initialized successfully!");
    console.log("Note: Make sure to set your OpenRouter API key in config.ts");
    console.log("-".repeat(50));

    rl.setPrompt("]> ");
    rl.prompt();
  }

  function callUpdateDisplay(): void {
    updateDisplay(
      running,
      startTime,
      Object.values(getProgressStatus()), // Corrected: passing AgentProgressStatus[]
      config.orchestrator.parallel_agents,
      modelDisplay,
      rl
    );
  }

  rl.on("line", async (input) => {
    if (["quit", "exit", "bye"].includes(input.toLowerCase())) {
      rl.close();
      return;
    }

    if (!input) {
      console.log("Please enter a question or command.");
      rl.prompt();
      return;
    }

    console.log("\nOrchestrator: Starting multi-agent analysis...");

    startTime = Date.now();
    running = true;
    progressInterval = setInterval(() => callUpdateDisplay(), 100);

    try {
      const result = await orchestrate(input);
      running = false;
      if (progressInterval) clearInterval(progressInterval);
      callUpdateDisplay();

      console.log("\n=".repeat(80));
      console.log("FINAL RESULTS");
      console.log("=".repeat(80));
      console.log();
      console.log(result);
      console.log();
      console.log("=".repeat(80));

      try {
        await saveHeavyModeOutput(input, result);
      } catch (error) {
        console.error("Error saving heavy mode output:", error);
      }
    } catch (error) {
      running = false;
      if (progressInterval) clearInterval(progressInterval);
      callUpdateDisplay();
      console.error(
        `\nError during orchestration: ${(error as Error).message}`
      );
      console.log("Please try again or type 'quit' to exit.");
    } finally {
      rl.prompt();
    }
  });

  rl.on("close", () => {
    console.log("Goodbye!");
    process.exit(0);
  });

  initialDisplay();
}

startCLI();
