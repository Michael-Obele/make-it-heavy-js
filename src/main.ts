import { runAgent } from "./agent";
import readline from "readline";
import {
  logSuccess,
  logError,
  logInfo,
  statusIndicator,
  withSpinner,
} from "./utils/cli-styling";
import { createHeader, textBox, centerText } from "./utils/cli-styling";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Enhanced startup display
console.log(createHeader("🤖 Make It Heavy", "Single Agent Mode"));
console.log();
console.log(centerText("Intelligent AI Assistant with Web Search"));
console.log();

logInfo("Single agent mode initialized successfully!");
logInfo("Type 'help' for available commands");
logInfo("Type 'quit', 'exit', or 'bye' to exit");
console.log();

rl.setPrompt("]> ");
rl.prompt();

rl.on("line", async (input) => {
  const trimmedInput = input.trim();

  // Handle exit commands
  if (["quit", "exit", "bye"].includes(trimmedInput.toLowerCase())) {
    console.log();
    console.log(statusIndicator("info", "Shutting down agent..."));
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

  try {
    // Use spinner for agent thinking
    const response = await withSpinner(
      {
        text: "Agent analyzing and researching your question...",
        color: "cyan",
      },
      () => runAgent(trimmedInput),
    );

    console.log();
    logSuccess("Analysis complete!");
    console.log();

    // Display response in a nice format
    console.log("📝 Agent Response:");
    console.log("─".repeat(80));
    console.log(response);
    console.log("─".repeat(80));
    console.log();
  } catch (error) {
    console.log();
    logError(`Agent failed: ${(error as Error).message}`);
    console.log();
    logInfo("Please try again or check your configuration.");
  }

  rl.prompt(); // Display prompt again after response
});

// Display help information
function displayHelp(): void {
  console.log();
  console.log(createHeader("Help & Commands", "Single Agent Mode"));
  console.log();

  const helpContent = [
    "🎯 Available Commands:",
    "",
    "  help                Show this help message",
    "  quit, exit, bye     Exit the application",
    "  <your question>     Ask the AI agent anything",
    "",
    "💡 Features:",
    "",
    "  • Web search integration via DuckDuckGo",
    "  • Intelligent analysis and reasoning",
    "  • Real-time research capabilities",
    "  • Context-aware responses",
    "",
    "🔗 Example Questions:",
    "",
    '  "What are the latest developments in AI?"',
    '  "Explain quantum computing in simple terms"',
    '  "Find recent news about renewable energy"',
    '  "Compare Python vs JavaScript for beginners"',
  ].join("\n");

  console.log(
    textBox(helpContent, {
      title: "📖 Single Agent Guide",
      color: "blue",
      style: "round",
    }),
  );
  console.log();
}

// Handle process interruption
process.on("SIGINT", () => {
  console.log();
  console.log(statusIndicator("info", "Shutting down gracefully..."));
  rl.close();
});

rl.on("close", () => {
  console.log();
  console.log(
    statusIndicator(
      "success",
      "Session ended. Thank you for using Make It Heavy!",
    ),
  );
  process.exit(0);
});
