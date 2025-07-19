import { orchestrate } from "./orchestrator";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Multi-Agent Orchestrator");
console.log("Type 'quit', 'exit', or 'bye' to exit");
console.log("-".repeat(50));

rl.on("line", async (input) => {
  if (["quit", "exit", "bye"].includes(input.toLowerCase())) {
    rl.close();
    return;
  }

  console.log("\nOrchestrator: Starting multi-agent analysis...");
  const result = await orchestrate(input);
  console.log("\nFINAL RESULTS");
  console.log("=".repeat(80));
  console.log(result);
  console.log("=".repeat(80));
});
