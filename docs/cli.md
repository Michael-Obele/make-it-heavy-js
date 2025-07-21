# 🖥️ CLI Documentation

This document merges all CLI-related features, styling guidelines, and improvement notes for the Make It Heavy JS platform.

---

## Table of Contents

- [Overview](#overview)
- [CLI Features](#cli-features)
- [Styling Guide](#styling-guide)
- [Recent Improvements](#recent-improvements)
- [Usage Examples](#usage-examples)
- [References](#references)

---

## Overview

The Make It Heavy JS CLI provides a professional, interactive terminal experience for deep research and multi-agent orchestration. It is designed for clarity, usability, and real-time feedback.

---

## CLI Features

- **Semantic Colors:**
  - Success (green), errors (red), warnings (yellow), info (cyan)
- **Interactive Elements:**
  - Spinners, progress bars, status tables
- **Help System:**
  - Comprehensive guidance with examples
- **Real-time Updates:**
  - Live progress tracking for complex operations
- **Agent Status Display:**
  - Shows QUEUED, PROCESSING, COMPLETED, FAILED for each agent
- **Multi-Agent Coordination:**
  - Parallel and sequential agent orchestration

---

## Styling Guide

- **Color Usage:**
  - Use semantic colors for status and feedback.
  - Avoid excessive color; prioritize clarity.
- **Progress Bars:**
  - Show percentage, completed/total, and agent status.
  - Update in real-time as agents progress.
- **Tables:**
  - Use for displaying agent status, results, and summaries.
  - Align columns for readability.
- **Spinners & Loaders:**
  - Indicate background processing.
  - Replace with status or results when complete.
- **Formatting:**
  - Use bold for headings, monospace for code/commands.
  - Separate sections with clear dividers.
- **Error & Warning Messages:**
  - Use red/yellow with clear, actionable text.
  - Display at the top or in context with affected agent/task.

---

## Recent Improvements

- **Progress Tracking:**
  - Agent statuses now update in real-time.
- **Research Focus:**
  - Streamlined toolset for research tasks only.
- **Output Formatting:**
  - Improved clarity and professionalism of terminal output.
  - Enhanced status tables and progress bars.
- **Task Classification:**
  - CLI now prioritizes research queries and displays relevant tools.
- **Structured Output Saving:**
  - The CLI now automatically saves all outputs to markdown files in a structured directory format: `output/<YYYY-MM-DD>/<prompt_name>.md`. This provides a clear and organized way to review past CLI executions and their generated content.

---

## Usage Examples

```bash
# Run deep research with progress tracking
bun run dev -- "Analyze the future of WebAssembly in web development"

# Show agent status and progress
bun run dev -- "Provide comprehensive analysis of Kubernetes security best practices"

# Access help and CLI guidance
bun run dev --help
```

---

## References

- For full platform capabilities, see [docs/platform.md](./platform.md)
- For configuration options, see [config.ts](../config.ts)
- For changelog and updates, see [docs/changelog.md](./changelog.md) (if available)

---

**The CLI is designed to provide a seamless, informative, and professional experience for all research tasks. For feedback or suggestions, please contribute via GitHub.**
