# 🚀 Make It heavy (JS)

## Table of Contents

- [🌟 Features](#features)
- [🚀 Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [🎯 Usage](#usage)
  - [Single Agent Mode](#single-agent-mode)
  - [Grok heavy Mode (Multi-Agent Orchestration)](#grok-heavy-mode-multi-agent-orchestration)
- [🏗️ Architecture](#architecture)
  - [Core Components](#core-components)
  - [Available Tools](#available-tools)
- [⚙️ Configuration](#configuration)
- [🙏 Acknowledgments](#acknowledgments)
- [📝 License](#license)

A TypeScript framework to emulate **Grok heavy** functionality using a powerful multi-agent system. Built on OpenRouter's API and Bun, Make It heavy delivers comprehensive, multi-perspective analysis through intelligent agent orchestration.

## 🌟 Features

- **🧠 Grok heavy Emulation**: Multi-agent system that delivers deep, comprehensive analysis like Grok heavy mode
- **🔀 Parallel Intelligence**: Deploy specialized agents simultaneously for maximum insight coverage
- **🎯 Dynamic Question Generation**: AI creates custom research questions tailored to each query
- **⚡ Built with Bun**: A fast, all-in-one JavaScript runtime
- **🛠️ Hot-Swappable Tools**: Automatically discovers and loads tools from the `tools/` directory
- **🔄 Intelligent Synthesis**: Combines multiple agent perspectives into unified, comprehensive answers
- **🎮 Single Agent Mode**: Run individual agents for simpler tasks with full tool access
- **🔒 Type-Safe Configuration**: Uses a TypeScript configuration file with Zod validation to ensure a robust and maintainable setup
- **🎨 Professional CLI**: Enhanced terminal interface with colors, spinners, progress bars, and interactive help
- **📊 Real-time Progress**: Visual progress tracking for multi-agent operations with detailed status tables
- **🌈 Environment Aware**: Graceful degradation in terminals without color support (respects NO_COLOR)
- **📱 Responsive Design**: Adapts to different terminal sizes and capabilities automatically

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/)
- OpenRouter API key

### Installation

1. **Clone and install dependencies:**

```bash
git clone <https://github.com/Doriandarko/make-it-heavy-js.git>
cd make-it-heavy-js
bun install
```

2. **Configure API key:**
   Create a `.env` file in the root of the project and add your OpenRouter API key:

```
OPENROUTER_API_KEY="YOUR_API_KEY"
```

You can copy the example file:

```bash
cp .env.example .env
```

## 🎯 Usage

### 🎨 Enhanced CLI Experience

Both modes now feature a professional terminal interface with:
- **Semantic colors** (green for success, red for errors, yellow for warnings, cyan for info)
- **Interactive spinners** and real-time progress tracking
- **Professional data tables** for displaying results and agent status  
- **Comprehensive help system** with examples and usage guidance
- **Graceful error handling** with actionable feedback

### Single Agent Mode

Run a single intelligent agent with enhanced CLI and full tool access:

```bash
bun run dev:single
# or directly: bun src/main.ts
```

**Features:**
- Interactive spinner during analysis
- Web search integration via DuckDuckGo
- Comprehensive help system with examples
- Professional result formatting

### Grok heavy Mode (Multi-Agent Orchestration)

Emulate Grok heavy's deep analysis with parallel intelligent agents:

```bash
bun run dev
# or directly: bun src/make-it-heavy.ts
```

**Features:**
- Real-time progress tracking for all agents
- Visual status tables with progress bars
- Configuration display and validation
- Enhanced result synthesis and display

## 🏗️ Architecture

### Core Components

- **Agent System (`src/agent.ts`)**: Core agent logic with tool access
- **Orchestrator (`src/orchestrator.ts`)**: Manages parallel agents and synthesizes results
- **Tool System (`tools/`)**: Auto-discovered tools with a standardized interface

### Available Tools

| Tool                 | Purpose                                  |
| -------------------- | ---------------------------------------- |
| `search_web`         | Web search with DuckDuckGo               |
| `browse_link`        | Browse a web page and return its content |
| `calculate`          | Safe mathematical calculations           |
| `read_file`          | Read file contents                       |
| `write_file`         | Create/overwrite files                   |
| `mark_task_complete` | Signal task completion                   |

## ⚙️ Configuration

Edit `config.ts` to customize behavior, including the model, number of parallel agents, and prompts.

## 🙏 Acknowledgments

This project was inspired by the original [Make It Heavy](https://github.com/Doriandarko/make-it-heavy) by Pietro Schirano.

## 📝 License

MIT License with Commercial Attribution Requirement. See [LICENSE](LICENSE) file for full details.

## How to Run

The `make-it-heavy` script can be executed using Bun. Ensure you have followed the [Quick Start](#quick-start) instructions to set up your environment and install dependencies.

To run the main orchestration script:

```bash
bun src/make-it-heavy.ts
```

To run a single agent:

```bash
bun src/main.ts
```

## Project Tools

The `tools/` directory contains various tools that the agents can use. These tools are automatically discovered and loaded by the system. Each tool is designed to perform a specific function, extending the capabilities of the agents.

The available tools include:

- `base.tool.ts`: Base class for all tools.
- `browse.tool.ts`: Tool for browsing web pages.
- `calculator.tool.ts`: Tool for performing mathematical calculations.
- `read_file.tool.ts`: Tool for reading file contents.
- `search.tool.ts`: Tool for performing web searches.
- `task_done.tool.ts`: Tool to signal task completion.
- `write_file.tool.ts`: Tool for writing to files.

## Adding New Tools

You can extend the functionality of the `make-it-heavy` system by adding new tools. Follow these steps to create and integrate a new tool:

1.  **Create a New Tool File**: In the `tools/` directory, create a new TypeScript file (e.g., `my_new_tool.tool.ts`).
2.  **Define the Tool Class**: Your tool must extend the `Tool` class from `base.tool.ts` and implement the `ToolInterface`.

    ```typescript
    import { Tool, ToolInterface } from "./base.tool";

    export class MyNewTool extends Tool implements ToolInterface {
      name: string = "my_new_tool";
      description: string = "A brief description of what your new tool does.";

      async call(input: string): Promise<string> {
        // Implement your tool's logic here
        console.log(`MyNewTool called with input: ${input}`);
        return `Result of MyNewTool for input: ${input}`;
      }
    }
    ```

3.  **Implement `call` Method**: The `call` method contains the core logic of your tool. It takes a string `input` and returns a `Promise<string>`.
4.  **Automatic Discovery**: The system automatically discovers and loads all `.tool.ts` files in the `tools/` directory, so no further configuration is needed.
5.  **Usage by Agents**: Once added, agents will be able to use your new tool by calling it by its `name` (e.g., `my_new_tool`). Ensure the description is clear so the agent knows when to use it.
