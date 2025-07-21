#!/usr/bin/env bun
/**
 * Make It Heavy JS - Multi-Agent Orchestrator
 * A clean, simple implementation inspired by the Python version
 *
 * Usage:
 *   bun run dev                    # Interactive mode
 *   bun run dev "your question"    # Direct query
 *   bun run debug "your question"  # Debug mode
 */

import { main } from "./cli";

// Handle process termination gracefully
process.on("SIGINT", () => {
  console.log("\n\nShutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\nShutting down gracefully...");
  process.exit(0);
});

// Start the CLI
main().catch((error) => {
  console.error("Fatal error:", error.message);
  if (process.env.DEBUG === "true" || process.argv.includes("--debug")) {
    console.error("Stack trace:", error.stack);
  }
  process.exit(1);
});
