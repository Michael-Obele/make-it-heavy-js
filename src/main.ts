import { runAgent } from "./agent";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("OpenRouter Agent with DuckDuckGo Search");
console.log("Type 'quit', 'exit', or 'bye' to exit");
console.log("-".repeat(50));

rl.setPrompt("]> ");
rl.prompt();

rl.on("line", async (input) => {
  if (["quit", "exit", "bye"].includes(input.toLowerCase())) {
    rl.close();
    return;
  }

  console.log("Agent: Thinking...");
  const response = await runAgent(input);
  console.log(`Agent: ${response}`);
  rl.prompt(); // Display prompt again after response
});
